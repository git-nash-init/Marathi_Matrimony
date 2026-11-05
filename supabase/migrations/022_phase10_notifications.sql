-- 022: Phase 10. In-app and web push messages to groups of members, promotional opt-out, and
-- subscription expiry reminders. Email and SMS are not here: they need a provider and credentials.

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY,
  promotional boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notification_preferences FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.admin_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('announcement', 'promotional')),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  audience jsonb NOT NULL DEFAULT '{}',
  sent_count int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_broadcasts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_broadcasts FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.subscription_reminders (
  subscription_id uuid NOT NULL,
  days_before int NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (subscription_id, days_before)
);
ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.subscription_reminders FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_notification_preferences()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('promotional', COALESCE((SELECT promotional FROM public.notification_preferences WHERE user_id = auth.uid()), true));
$$;

CREATE OR REPLACE FUNCTION public.set_my_notification_preferences(p_promotional boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.notification_preferences (user_id, promotional) VALUES (auth.uid(), COALESCE(p_promotional, true))
  ON CONFLICT (user_id) DO UPDATE SET promotional = EXCLUDED.promotional, updated_at = now();
  RETURN true;
END;
$$;

-- Who a message reaches. Blocked accounts never receive anything, and anyone who opted out never
-- receives a promotional message, whatever the filters say.
CREATE OR REPLACE FUNCTION public.broadcast_recipients(p_kind text, p_audience jsonb)
RETURNS TABLE (user_id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.id
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE NOT EXISTS (SELECT 1 FROM public.account_blocks b WHERE b.user_id = u.id AND b.lifted_at IS NULL)
    AND (p_kind <> 'promotional' OR COALESCE((SELECT n.promotional FROM public.notification_preferences n WHERE n.user_id = u.id), true))
    AND (COALESCE(p_audience ->> 'gender', 'all') = 'all' OR p.gender::text = p_audience ->> 'gender')
    AND (COALESCE(p_audience ->> 'status', 'all') = 'all' OR p.profile_status::text = p_audience ->> 'status')
    AND (COALESCE(p_audience ->> 'verification', 'all') = 'all' OR p.verification_status::text = p_audience ->> 'verification')
    AND (COALESCE(p_audience ->> 'district', 'all') = 'all' OR p.district = p_audience ->> 'district')
    AND (COALESCE(p_audience ->> 'plan', 'all') = 'all'
         OR (p_audience ->> 'plan' = 'none' AND NOT EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.user_id = u.id AND s.status = 'active' AND s.end_date > now()))
         OR EXISTS (SELECT 1 FROM public.subscriptions s JOIN public.subscription_plans sp ON sp.id = s.plan_id
                    WHERE s.user_id = u.id AND s.status = 'active' AND s.end_date > now()
                      AND (p_audience ->> 'plan' = 'any' OR COALESCE(sp.tier, sp.slug) = p_audience ->> 'plan')));
$$;
REVOKE ALL ON FUNCTION public.broadcast_recipients(text, jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_count_recipients(p_kind text, p_audience jsonb)
RETURNS int LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin');
  RETURN (SELECT count(*) FROM public.broadcast_recipients(p_kind, COALESCE(p_audience, '{}'::jsonb)));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_send_broadcast(p_kind text, p_title text, p_message text, p_url text, p_audience jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin');
  v_title text := btrim(COALESCE(p_title, ''));
  v_message text := btrim(COALESCE(p_message, ''));
  v_url text := NULLIF(btrim(COALESCE(p_url, '')), '');
  v_aud jsonb := COALESCE(p_audience, '{}'::jsonb);
  v_type text;
  v_n int;
BEGIN
  IF p_kind NOT IN ('announcement', 'promotional') THEN RAISE EXCEPTION 'Unknown message type.' USING ERRCODE = '22023'; END IF;
  IF v_title = '' OR char_length(v_title) > 120 THEN RAISE EXCEPTION 'Please write a title of up to 120 characters.' USING ERRCODE = '22023'; END IF;
  IF v_message = '' OR char_length(v_message) > 1000 THEN RAISE EXCEPTION 'Please write a message of up to 1000 characters.' USING ERRCODE = '22023'; END IF;
  -- A page on this site only, so a message can never send members to an outside address.
  IF v_url IS NOT NULL AND v_url !~ '^/[a-zA-Z0-9/_?=&-]*$' THEN
    RAISE EXCEPTION 'The link must be a page on this site, starting with /.' USING ERRCODE = '22023';
  END IF;
  IF NOT public.rate_limit_hit('broadcast:' || v_admin::text, 10, interval '1 hour') THEN
    RAISE EXCEPTION 'Too many messages sent this hour. Please wait a while.' USING ERRCODE = '22023';
  END IF;

  v_type := CASE p_kind WHEN 'promotional' THEN 'promotion' ELSE 'announcement' END;
  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  SELECT r.user_id, v_type, v_title, v_message, v_url FROM public.broadcast_recipients(p_kind, v_aud) r;
  GET DIAGNOSTICS v_n = ROW_COUNT;

  INSERT INTO public.admin_broadcasts (kind, title, message, action_url, audience, sent_count, created_by)
  VALUES (p_kind, v_title, v_message, v_url, v_aud, v_n, v_admin);
  PERFORM public.admin_log('broadcast_sent', 'admin_broadcasts', p_kind, jsonb_build_object('title', v_title, 'audience', v_aud, 'recipients', v_n));
  RETURN jsonb_build_object('sent', v_n);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_broadcasts(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin');
  RETURN jsonb_build_object(
    'total', (SELECT count(*) FROM public.admin_broadcasts),
    'items', COALESCE((SELECT jsonb_agg(to_jsonb(b)) FROM (
      SELECT id, kind, title, message, action_url, audience, sent_count, created_at FROM public.admin_broadcasts
      ORDER BY created_at DESC LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100) OFFSET GREATEST(COALESCE(p_offset, 0), 0)) b), '[]'::jsonb));
END;
$$;

-- Runs daily. The reminders table means a re-run, or a day's overlap, never sends one twice.
CREATE OR REPLACE FUNCTION public.notify_expiring_subscriptions()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  v_row record;
  v_n int := 0;
  v_done int;
BEGIN
  FOR v_row IN
    SELECT s.id, s.user_id, d.days, sp.name
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    CROSS JOIN (VALUES (7), (1)) AS d(days)
    WHERE s.status = 'active'
      AND (s.end_date AT TIME ZONE 'Asia/Kolkata')::date = v_today + d.days
      AND NOT EXISTS (SELECT 1 FROM public.account_blocks b WHERE b.user_id = s.user_id AND b.lifted_at IS NULL)
  LOOP
    INSERT INTO public.subscription_reminders (subscription_id, days_before) VALUES (v_row.id, v_row.days)
    ON CONFLICT DO NOTHING;
    GET DIAGNOSTICS v_done = ROW_COUNT;
    CONTINUE WHEN v_done = 0;
    PERFORM public.notify_member(v_row.user_id, 'subscription_expiring',
      CASE v_row.days WHEN 1 THEN 'आपली योजना उद्या संपेल | Your plan ends tomorrow' ELSE 'आपली योजना ७ दिवसांत संपेल | Your plan ends in 7 days' END,
      v_row.name || ': सुविधा चालू ठेवण्यासाठी नूतनीकरण करा. | Renew to keep your benefits.', '/membership');
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END;
$$;
REVOKE ALL ON FUNCTION public.notify_expiring_subscriptions() FROM PUBLIC, anon, authenticated;

-- 09:00 India time.
SELECT cron.schedule('notify-expiring-subscriptions', '30 3 * * *', 'SELECT public.notify_expiring_subscriptions();');

REVOKE ALL ON FUNCTION public.get_my_notification_preferences(), public.set_my_notification_preferences(boolean),
  public.admin_count_recipients(text, jsonb), public.admin_send_broadcast(text, text, text, text, jsonb), public.admin_list_broadcasts(int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_notification_preferences(), public.set_my_notification_preferences(boolean),
  public.admin_count_recipients(text, jsonb), public.admin_send_broadcast(text, text, text, text, jsonb), public.admin_list_broadcasts(int, int) TO authenticated, service_role;
