-- 007_interests_rpc.sql
-- Interests are written only through RPCs (send / withdraw / respond) so quota and
-- ownership are enforced in the database. Notifications are created by the RPCs.

DROP TRIGGER IF EXISTS on_interest_created ON public.interests;

DROP POLICY IF EXISTS interests_insert_policy ON public.interests;
DROP POLICY IF EXISTS interests_update_policy ON public.interests;
REVOKE INSERT, UPDATE, DELETE ON public.interests FROM anon, authenticated;

-- Free users: 5 interests per IST calendar month. Paid plans: unlimited.
CREATE OR REPLACE FUNCTION public.send_interest(p_receiver uuid, p_message text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_existing public.interests%ROWTYPE;
  v_used int;
  v_receiver_user uuid;
  v_name text;
  v_code text;
BEGIN
  IF auth.uid() IS NULL OR v_me IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUTH_REQUIRED', 'error', 'Please log in and create your profile first.');
  END IF;
  IF v_me = p_receiver THEN
    RETURN jsonb_build_object('success', false, 'code', 'SELF', 'error', 'You cannot send interest to your own profile.');
  END IF;

  SELECT user_id INTO v_receiver_user FROM public.profiles WHERE id = p_receiver AND profile_status = 'approved';
  IF v_receiver_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'error', 'Profile not available.');
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_blocks
             WHERE (blocker_profile_id = v_me AND blocked_profile_id = p_receiver)
                OR (blocker_profile_id = p_receiver AND blocked_profile_id = v_me)) THEN
    RETURN jsonb_build_object('success', false, 'code', 'BLOCKED', 'error', 'Interest cannot be sent to this profile.');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('interest:' || v_me::text));

  SELECT * INTO v_existing FROM public.interests WHERE sender_profile_id = v_me AND receiver_profile_id = p_receiver;
  IF FOUND AND v_existing.status IN ('pending', 'accepted') THEN
    RETURN jsonb_build_object('success', true, 'already', true, 'status', v_existing.status);
  END IF;

  IF NOT public.has_feature('unlimited_interests') THEN
    SELECT count(*) INTO v_used FROM public.interests
      WHERE sender_profile_id = v_me AND sent_at >= public.ist_month_start();
    IF v_used >= 5 THEN
      RETURN jsonb_build_object('success', false, 'code', 'LIMIT_REACHED', 'limit', 5, 'used', v_used,
        'error', 'You have used all 5 free interests this month. Upgrade for unlimited interests.');
    END IF;
  END IF;

  INSERT INTO public.interests (sender_profile_id, receiver_profile_id, status, custom_message, sent_at)
  VALUES (v_me, p_receiver, 'pending', p_message, now())
  ON CONFLICT (sender_profile_id, receiver_profile_id)
  DO UPDATE SET status = 'pending', custom_message = EXCLUDED.custom_message, sent_at = now(), updated_at = now();

  SELECT first_name, profile_id INTO v_name, v_code FROM public.profiles WHERE id = v_me;
  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  VALUES (v_receiver_user, 'interest_received', 'New Interest Received',
          COALESCE(v_name, 'A member') || ' (' || COALESCE(v_code, 'Profile') || ') has expressed interest in your profile.',
          '/dashboard');

  RETURN jsonb_build_object('success', true, 'status', 'pending');
END;
$$;

-- Sender may withdraw a pending or accepted interest.
CREATE OR REPLACE FUNCTION public.withdraw_interest(p_receiver uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_row public.interests%ROWTYPE;
  v_receiver_user uuid;
  v_name text;
  v_code text;
BEGIN
  IF auth.uid() IS NULL OR v_me IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUTH_REQUIRED', 'error', 'Please log in.');
  END IF;

  UPDATE public.interests SET status = 'withdrawn', updated_at = now()
  WHERE sender_profile_id = v_me AND receiver_profile_id = p_receiver AND status IN ('pending', 'accepted')
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_WITHDRAWABLE', 'error', 'No active interest to withdraw.');
  END IF;

  SELECT user_id INTO v_receiver_user FROM public.profiles WHERE id = p_receiver;
  SELECT first_name, profile_id INTO v_name, v_code FROM public.profiles WHERE id = v_me;
  IF v_receiver_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (v_receiver_user, 'interest_withdrawn', 'Interest Withdrawn',
            COALESCE(v_name, 'A member') || ' (' || COALESCE(v_code, 'Profile') || ') has withdrawn their interest.',
            '/dashboard');
  END IF;

  RETURN jsonb_build_object('success', true, 'status', 'withdrawn');
END;
$$;

-- Receiver accepts or declines a pending interest.
CREATE OR REPLACE FUNCTION public.respond_to_interest(p_interest_id uuid, p_accept boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_row public.interests%ROWTYPE;
  v_sender_user uuid;
  v_name text;
  v_code text;
  v_status public.interest_status_type := CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END;
BEGIN
  IF auth.uid() IS NULL OR v_me IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUTH_REQUIRED', 'error', 'Please log in.');
  END IF;

  UPDATE public.interests SET status = v_status, updated_at = now()
  WHERE id = p_interest_id AND receiver_profile_id = v_me AND status = 'pending'
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_RESPONDABLE', 'error', 'This interest can no longer be answered.');
  END IF;

  SELECT user_id INTO v_sender_user FROM public.profiles WHERE id = v_row.sender_profile_id;
  SELECT first_name, profile_id INTO v_name, v_code FROM public.profiles WHERE id = v_me;
  IF v_sender_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url)
    VALUES (v_sender_user,
            CASE WHEN p_accept THEN 'interest_accepted' ELSE 'interest_declined' END,
            CASE WHEN p_accept THEN 'Interest Accepted' ELSE 'Interest Declined' END,
            COALESCE(v_name, 'A member') || ' (' || COALESCE(v_code, 'Profile') || ') has ' ||
              CASE WHEN p_accept THEN 'accepted' ELSE 'declined' END || ' your interest.',
            '/dashboard');
  END IF;

  RETURN jsonb_build_object('success', true, 'status', v_status);
END;
$$;

-- Sent / received interests with a profile summary (never exposes surname or contacts).
CREATE OR REPLACE FUNCTION public.get_my_interests(p_direction text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := public.get_my_profile_id();
BEGIN
  IF v_me IS NULL THEN RETURN '[]'::jsonb; END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(row_to_json(t) ORDER BY t.sent_at DESC) FROM (
      SELECT i.id, i.status, i.sent_at, i.updated_at,
             o.id AS profile_uuid, o.profile_id AS profile_code, o.first_name, o.age, o.city, o.occupation, o.avatar_url
      FROM public.interests i
      JOIN public.profiles o ON o.id = CASE WHEN p_direction = 'sent' THEN i.receiver_profile_id ELSE i.sender_profile_id END
      WHERE CASE WHEN p_direction = 'sent' THEN i.sender_profile_id = v_me
                 ELSE i.receiver_profile_id = v_me AND i.status <> 'withdrawn' END
    ) t
  ), '[]'::jsonb);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.send_interest(uuid, text), public.withdraw_interest(uuid),
  public.respond_to_interest(uuid, boolean), public.get_my_interests(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_interest(uuid, text), public.withdraw_interest(uuid),
  public.respond_to_interest(uuid, boolean), public.get_my_interests(text) TO authenticated;
