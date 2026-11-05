-- 021: Phase 9. Complaints and support. Builds on contact_inquiries rather than a second table.

ALTER TABLE public.contact_inquiries
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'contact' CHECK (category IN ('contact', 'complaint', 'feedback')),
  ADD COLUMN IF NOT EXISTS assigned_to uuid;
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_user ON public.contact_inquiries (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.contact_inquiries (id),
  sender text NOT NULL CHECK (sender IN ('admin', 'member')),
  sender_id uuid,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_inquiry ON public.ticket_messages (inquiry_id, created_at);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ticket_messages FROM PUBLIC, anon, authenticated;

-- The form used to send a status the table rejects, so every message failed. The server now owns these
-- fields. A blocked member can still reach us, which is the one thing they most need to do.
CREATE OR REPLACE FUNCTION public.set_inquiry_priority()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.status := 'PENDING';
  NEW.admin_notes := NULL;
  NEW.assigned_to := NULL;
  NEW.user_id := auth.uid();
  NEW.priority := false;
  IF auth.uid() IS NOT NULL AND NOT public.is_account_blocked() AND public.my_plan() = 'platinum' THEN
    NEW.priority := true;
  END IF;
  RETURN NEW;
END;
$$;

-- All staff changes go through logged functions. Only the roles handling support read the inbox.
ALTER POLICY contact_inquiries_admin_select ON public.contact_inquiries
  USING (public.my_admin_role() IN ('super_admin', 'admin', 'support'));
ALTER POLICY contact_inquiries_admin_update ON public.contact_inquiries USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.admin_list_tickets(
  p_status text DEFAULT 'open', p_category text DEFAULT NULL, p_search text DEFAULT NULL, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_q text := public.like_pattern(NULLIF(left(btrim(COALESCE(p_search, '')), 80), ''));
  v_cat text := NULLIF(NULLIF(p_category, ''), 'all');
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
  v_me uuid := auth.uid();
  v_result jsonb;
BEGIN
  PERFORM public.require_admin_role('admin', 'support');
  WITH f AS (
    SELECT c.*, CASE WHEN c.status IN ('PENDING', 'IN_PROGRESS') THEN 'open' ELSE lower(c.status) END AS tab
    FROM public.contact_inquiries c
    WHERE (v_cat IS NULL OR c.category = v_cat)
      AND (v_q IS NULL OR c.name ILIKE v_q OR c.email ILIKE v_q OR c.phone ILIKE v_q OR c.subject ILIKE v_q OR c.message ILIKE v_q)
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM f WHERE tab = p_status),
    'counts', COALESCE((SELECT jsonb_object_agg(c.tab, c.n) FROM (SELECT tab, count(*) AS n FROM f GROUP BY tab) c), '{}'::jsonb),
    'items', COALESCE((SELECT jsonb_agg(row_to_json(g)) FROM (
       SELECT f.id, f.name, f.email, f.phone, f.subject, f.message, f.status, f.category, f.priority, f.created_at, f.updated_at, f.user_id,
              f.assigned_to = v_me AS assigned_to_me, f.assigned_to IS NOT NULL AS assigned,
              (SELECT count(*) FROM public.ticket_messages m WHERE m.inquiry_id = f.id) AS replies
       FROM f WHERE tab = p_status
       ORDER BY f.priority DESC, CASE WHEN p_status = 'open' THEN f.created_at END ASC, f.created_at DESC
       LIMIT v_limit OFFSET GREATEST(COALESCE(p_offset, 0), 0)) g), '[]'::jsonb))
  INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_ticket(p_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.contact_inquiries%ROWTYPE;
BEGIN
  PERFORM public.require_admin_role('admin', 'support');
  SELECT * INTO v_row FROM public.contact_inquiries WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found.' USING ERRCODE = 'P0002'; END IF;
  RETURN to_jsonb(v_row) || jsonb_build_object(
    'assigned_to_me', v_row.assigned_to = auth.uid(),
    'messages', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', m.id, 'sender', m.sender, 'body', m.body, 'created_at', m.created_at) ORDER BY m.created_at)
                          FROM public.ticket_messages m WHERE m.inquiry_id = p_id), '[]'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reply_ticket(p_id uuid, p_body text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin', 'support');
  v_body text := btrim(COALESCE(p_body, ''));
  v_user uuid;
BEGIN
  IF v_body = '' OR char_length(v_body) > 4000 THEN RAISE EXCEPTION 'Please write a reply of up to 4000 characters.' USING ERRCODE = '22023'; END IF;
  SELECT user_id INTO v_user FROM public.contact_inquiries WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found.' USING ERRCODE = 'P0002'; END IF;
  INSERT INTO public.ticket_messages (inquiry_id, sender, sender_id, body) VALUES (p_id, 'admin', v_admin, v_body);
  UPDATE public.contact_inquiries SET status = CASE WHEN status = 'PENDING' THEN 'IN_PROGRESS' ELSE status END, updated_at = now() WHERE id = p_id;
  PERFORM public.admin_log('ticket_replied', 'contact_inquiries', p_id::text, '{}'::jsonb);
  IF v_user IS NOT NULL THEN
    PERFORM public.notify_member(v_user, 'support_reply', 'मदत केंद्राकडून उत्तर | A reply from our support team',
      left(v_body, 200), '/dashboard');
  END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_ticket(p_id uuid, p_status text DEFAULT NULL, p_assign text DEFAULT NULL, p_notes text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('admin', 'support');
BEGIN
  IF p_status IS NOT NULL AND p_status NOT IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'SPAM') THEN
    RAISE EXCEPTION 'Unknown status.' USING ERRCODE = '22023';
  END IF;
  IF p_assign IS NOT NULL AND p_assign NOT IN ('me', 'nobody') THEN
    RAISE EXCEPTION 'Unknown assignment.' USING ERRCODE = '22023';
  END IF;
  UPDATE public.contact_inquiries SET
    status = COALESCE(p_status, status),
    assigned_to = CASE p_assign WHEN 'me' THEN v_admin WHEN 'nobody' THEN NULL ELSE assigned_to END,
    admin_notes = COALESCE(p_notes, admin_notes),
    updated_at = now()
  WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found.' USING ERRCODE = 'P0002'; END IF;
  PERFORM public.admin_log('ticket_updated', 'contact_inquiries', p_id::text, jsonb_build_object('status', p_status, 'assign', p_assign));
  RETURN true;
END;
$$;

-- ─── Member side ────────────────────────────────────────────────────────────
-- Staff notes and assignment are left out: those are internal.
CREATE OR REPLACE FUNCTION public.get_my_tickets()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'id', c.id, 'subject', c.subject, 'message', c.message, 'status', c.status, 'category', c.category, 'created_at', c.created_at,
      'messages', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', m.id, 'sender', m.sender, 'body', m.body, 'created_at', m.created_at) ORDER BY m.created_at)
                            FROM public.ticket_messages m WHERE m.inquiry_id = c.id), '[]'::jsonb))
    ORDER BY c.created_at DESC), '[]'::jsonb)
  FROM public.contact_inquiries c
  WHERE c.user_id = auth.uid() AND auth.uid() IS NOT NULL AND c.status <> 'SPAM';
$$;

CREATE OR REPLACE FUNCTION public.reply_my_ticket(p_id uuid, p_body text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_body text := btrim(COALESCE(p_body, ''));
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Please log in.'); END IF;
  IF v_body = '' OR char_length(v_body) > 4000 THEN RETURN jsonb_build_object('success', false, 'error', 'Please write a message of up to 4000 characters.'); END IF;
  IF NOT public.rate_limit_hit('ticket_reply:' || auth.uid()::text, 20, interval '1 hour') THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have sent many messages. Please try again in an hour.');
  END IF;
  -- Someone else's request looks exactly like one that does not exist.
  IF NOT EXISTS (SELECT 1 FROM public.contact_inquiries WHERE id = p_id AND user_id = auth.uid() AND status <> 'SPAM') THEN
    RETURN jsonb_build_object('success', false, 'error', 'This request could not be found.');
  END IF;
  INSERT INTO public.ticket_messages (inquiry_id, sender, sender_id, body) VALUES (p_id, 'member', auth.uid(), v_body);
  -- A new message on a closed request opens it again, so it cannot be missed.
  UPDATE public.contact_inquiries SET status = 'IN_PROGRESS', updated_at = now() WHERE id = p_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_tickets(text, text, text, int, int), public.admin_get_ticket(uuid), public.admin_reply_ticket(uuid, text),
  public.admin_update_ticket(uuid, text, text, text), public.get_my_tickets(), public.reply_my_ticket(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_tickets(text, text, text, int, int), public.admin_get_ticket(uuid), public.admin_reply_ticket(uuid, text),
  public.admin_update_ticket(uuid, text, text, text), public.get_my_tickets(), public.reply_my_ticket(uuid, text) TO authenticated, service_role;

-- Also applied here: admin_dashboard_stats counts open_inquiries by the real status values
-- (PENDING and IN_PROGRESS). It had used lowercase values that never matched.
