-- 011: Close the admin RPC hole, protect surname/Aadhaar, make profile status server-owned,
-- and add diet/income to partner preferences.

-- ─── is_admin only answers for the caller (admins may ask about anyone) ─────
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p_user_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_user_id AND is_active)
     AND (p_user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active));
$$;

CREATE OR REPLACE FUNCTION public.require_admin()
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized. Admin privileges required.' USING ERRCODE = '42501';
  END IF;
  RETURN auth.uid();
END;
$$;

-- ─── Admin RPCs: the acting admin is auth.uid(), never a client-supplied id ──
DROP FUNCTION IF EXISTS public.admin_approve_profile(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.admin_reject_profile(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.admin_moderate_photo(uuid, uuid, text, text);
DROP FUNCTION IF EXISTS public.admin_resolve_report(uuid, uuid, text, text, text);
DROP FUNCTION IF EXISTS public.admin_toggle_user_suspension(uuid, uuid, boolean, text);

CREATE OR REPLACE FUNCTION public.admin_approve_profile(p_profile_id uuid, p_notes text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin();
BEGIN
  UPDATE public.profiles
  SET profile_status = 'approved', verification_status = 'verified', rejection_reason = NULL, updated_at = now()
  WHERE id = p_profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, 'admin', 'profile_approved', 'profiles', p_profile_id::text, jsonb_build_object('notes', p_notes));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_profile(p_profile_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin();
BEGIN
  UPDATE public.profiles
  SET profile_status = 'rejected', verification_status = 'rejected',
      rejection_reason = COALESCE(NULLIF(trim(p_reason), ''), 'Rejected by moderator'), updated_at = now()
  WHERE id = p_profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, 'admin', 'profile_rejected', 'profiles', p_profile_id::text, jsonb_build_object('reason', p_reason));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_batch_approve_pending()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin(); v_n integer;
BEGIN
  WITH done AS (
    UPDATE public.profiles
    SET profile_status = 'approved', verification_status = 'verified', rejection_reason = NULL, updated_at = now()
    WHERE profile_status = 'pending_approval' OR verification_status = 'pending'
    RETURNING id
  )
  SELECT count(*) INTO v_n FROM done;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, 'admin', 'profiles_batch_approved', 'profiles', 'pending_queue', jsonb_build_object('count', v_n));
  RETURN v_n;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_moderate_photo(p_photo_id uuid, p_status text, p_notes text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin();
BEGIN
  UPDATE public.profile_photos SET approval_status = p_status::photo_approval_type, updated_at = now()
  WHERE id = p_photo_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Photo not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, 'admin', 'photo_moderated', 'profile_photos', p_photo_id::text,
          jsonb_build_object('status', p_status, 'notes', p_notes));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_resolve_report(
  p_report_id uuid, p_status text, p_notes text DEFAULT NULL, p_action_taken text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin();
BEGIN
  UPDATE public.moderation_reports
  SET status = p_status,
      details = CASE WHEN p_notes IS NOT NULL THEN COALESCE(details, '') || ' [Admin Note: ' || p_notes || ']' ELSE details END
  WHERE id = p_report_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Report not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, 'admin', 'report_status_updated', 'moderation_reports', p_report_id::text,
          jsonb_build_object('status', p_status, 'notes', p_notes, 'action_taken', p_action_taken));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_toggle_user_suspension(p_profile_id uuid, p_suspend boolean, p_reason text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin();
BEGIN
  UPDATE public.profiles
  SET profile_status = CASE WHEN p_suspend THEN 'suspended' ELSE 'approved' END::profile_status_type, updated_at = now()
  WHERE id = p_profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, 'admin', CASE WHEN p_suspend THEN 'user_suspended' ELSE 'user_unsuspended' END,
          'profiles', p_profile_id::text, jsonb_build_object('reason', p_reason));
  RETURN true;
END;
$$;

-- Full rows (including surname/Aadhaar) for the verification queue.
CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC) FROM public.profiles p), '[]'::jsonb);
END;
$$;

-- ─── Conversations: caller is auth.uid() ─────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_or_create_conversation(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_target_profile_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me record; v_target record; v_p1 uuid; v_p2 uuid; v_conv uuid;
BEGIN
  SELECT id, user_id INTO v_me FROM public.profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Caller profile not found.'; END IF;
  IF v_me.id = p_target_profile_id THEN RAISE EXCEPTION 'Cannot create conversation with yourself.'; END IF;

  SELECT id, user_id INTO v_target FROM public.profiles WHERE id = p_target_profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Target member profile not found.'; END IF;

  IF EXISTS (SELECT 1 FROM public.user_blocks
             WHERE (blocker_profile_id = v_me.id AND blocked_profile_id = v_target.id)
                OR (blocker_profile_id = v_target.id AND blocked_profile_id = v_me.id)) THEN
    RAISE EXCEPTION 'Messaging is unavailable due to block settings.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.interests
                 WHERE status = 'accepted'
                   AND ((sender_profile_id = v_me.id AND receiver_profile_id = v_target.id)
                     OR (sender_profile_id = v_target.id AND receiver_profile_id = v_me.id))) THEN
    RAISE EXCEPTION 'A conversation can only be started after mutual interest is accepted.';
  END IF;

  v_p1 := LEAST(v_me.id, v_target.id);
  v_p2 := GREATEST(v_me.id, v_target.id);

  SELECT id INTO v_conv FROM public.conversations WHERE participant_one_id = v_p1 AND participant_two_id = v_p2;
  IF FOUND THEN RETURN v_conv; END IF;

  INSERT INTO public.conversations (participant_one_id, participant_two_id, status, last_message_text, last_message_at, created_at, updated_at)
  VALUES (v_p1, v_p2, 'active', 'Conversation started', now(), now(), now())
  RETURNING id INTO v_conv;

  INSERT INTO public.conversation_participants (conversation_id, user_id, profile_id, last_read_at)
  VALUES (v_conv, v_me.user_id, v_me.id, now()), (v_conv, v_target.user_id, v_target.id, now())
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  RETURN v_conv;
END;
$$;

-- ─── Audit log is written only by SECURITY DEFINER functions ─────────────────
DROP POLICY IF EXISTS audit_logs_insert_policy ON public.audit_logs;
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;

-- ─── Surname and Aadhaar: column-level read protection ───────────────────────
-- Clients read every profiles column except last_name and aadhaar_number. The owner reads
-- them through get_my_private_profile(), unlocked viewers through get_contact_if_unlocked(),
-- admins through admin_list_profiles(). NOTE: new profiles columns must be added to this grant.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, user_id, profile_id, first_name, gender, date_of_birth, age, marital_status, height, religion,
  community, sub_community, gothra, mother_tongue, languages_spoken, education, education_detail,
  occupation, employed_in, company, income, city, state, country, diet, smoking, drinking, about_me,
  profile_status, verification_status, profile_visibility, is_featured, featured_until, created_by,
  created_at, updated_at, college, additional_qualifications, work_location, family_type, family_status,
  father_occupation, mother_occupation, brothers_count, sisters_count, married_brothers_count,
  married_sisters_count, family_location, family_description, hobbies, lifestyle_interests,
  rejection_reason, completion_percentage, avatar_url, photos, photos_hidden, listing_priority, approved_at
) ON public.profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_private_profile()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('last_name', p.last_name, 'aadhaar_number', p.aadhaar_number)
  FROM public.profiles p WHERE p.user_id = auth.uid();
$$;

-- ─── Profile status / verification are server-owned ──────────────────────────
INSERT INTO public.platform_settings (key, value, description)
VALUES ('aadhaar_auto_approval', 'true'::jsonb,
        'Automatically approve and verify profiles submitted with a 12-digit Aadhaar number')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.aadhaar_auto_approval_enabled()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT value = 'true'::jsonb FROM public.platform_settings WHERE key = 'aadhaar_auto_approval'), false);
$$;

-- Members may only move their profile between draft and pending review. Approval comes from an
-- admin or the Aadhaar auto-approval setting; an approved profile stays live while it is edited.
CREATE OR REPLACE FUNCTION public.guard_profile_system_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_ins boolean := TG_OP = 'INSERT';
  v_aadhaar_same boolean;
BEGIN
  IF current_user IN ('authenticated', 'anon') AND NOT public.is_admin() THEN
    IF v_ins THEN
      NEW.listing_priority := 0; NEW.approved_at := NULL; NEW.is_featured := false;
      NEW.featured_until := NULL; NEW.rejection_reason := NULL;
    ELSE
      NEW.listing_priority := OLD.listing_priority; NEW.approved_at := OLD.approved_at;
      NEW.is_featured := OLD.is_featured; NEW.featured_until := OLD.featured_until;
      NEW.rejection_reason := OLD.rejection_reason;
    END IF;
    v_aadhaar_same := NOT v_ins AND NEW.aadhaar_number IS NOT DISTINCT FROM OLD.aadhaar_number;

    IF NEW.profile_status = 'approved'
       AND (v_ins OR OLD.profile_status IN ('draft', 'pending_approval', 'rejected'))
       AND regexp_replace(COALESCE(NEW.aadhaar_number, ''), '\s', '', 'g') ~ '^\d{12}$'
       AND public.aadhaar_auto_approval_enabled() THEN
      NEW.verification_status := 'verified';
    ELSE
      IF NOT v_ins AND OLD.profile_status = 'suspended' THEN
        NEW.profile_status := 'suspended';
      ELSIF NOT v_ins AND OLD.profile_status = 'approved' THEN
        NEW.profile_status := 'approved';
      ELSIF NOT v_ins AND OLD.profile_status = 'rejected' AND NEW.profile_status = 'draft' THEN
        NEW.profile_status := 'rejected';
      ELSIF NEW.profile_status NOT IN ('draft', 'pending_approval') THEN
        NEW.profile_status := 'pending_approval';
      END IF;

      IF v_aadhaar_same AND OLD.verification_status IN ('verified', 'rejected') THEN
        NEW.verification_status := OLD.verification_status;
      ELSIF NEW.verification_status NOT IN ('unverified', 'pending') THEN
        NEW.verification_status := 'pending';
      END IF;
    END IF;
  END IF;

  IF NEW.profile_status = 'approved' AND (TG_OP = 'INSERT' OR OLD.profile_status IS DISTINCT FROM 'approved') THEN
    NEW.approved_at := now();
  END IF;
  RETURN NEW;
END;
$$;

-- The trigger above owns status transitions, so the update policy only checks ownership
-- (the old WITH CHECK blocked the Aadhaar auto-approval path).
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ─── Partner preferences: diet + minimum income ──────────────────────────────
ALTER TABLE public.partner_preferences ADD COLUMN IF NOT EXISTS preferred_diet text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.partner_preferences ADD COLUMN IF NOT EXISTS min_income text;

-- '10_15_lakhs' → 10, 'below_3_lakhs' → 0, 'above_50_lakhs' → 50, 'not_disclosed' → NULL
CREATE OR REPLACE FUNCTION public.income_lakhs(p text)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN p IS NULL OR p IN ('', 'any', 'not_disclosed') THEN NULL
    WHEN p LIKE 'below%' THEN 0
    ELSE NULLIF(substring(p FROM '\d+'), '')::numeric
  END;
$$;

-- 0–100: how well profile t fits the preferences pp. Empty preference = no constraint.
CREATE OR REPLACE FUNCTION public.pref_score(pp public.partner_preferences, t public.profiles)
RETURNS numeric LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT
    (CASE WHEN t.age IS NULL OR t.age BETWEEN pp.min_age AND pp.max_age THEN 15 ELSE 0 END)
  + (CASE WHEN t.height IS NULL OR t.height BETWEEN pp.min_height AND pp.max_height THEN 10 ELSE 0 END)
  + (CASE WHEN COALESCE(cardinality(pp.preferred_marital_status), 0) = 0
            OR t.marital_status::text = ANY (pp.preferred_marital_status::text[]) THEN 10 ELSE 0 END)
  + (CASE WHEN COALESCE(cardinality(pp.preferred_education), 0) = 0
            OR lower(COALESCE(t.education, '')) = ANY (ARRAY(SELECT lower(x) FROM unnest(pp.preferred_education) x)) THEN 10 ELSE 0 END)
  + (CASE WHEN COALESCE(cardinality(pp.preferred_occupation), 0) = 0
            OR lower(COALESCE(t.occupation, '')) = ANY (ARRAY(SELECT lower(x) FROM unnest(pp.preferred_occupation) x)) THEN 10 ELSE 0 END)
  + (CASE WHEN COALESCE(cardinality(pp.preferred_cities), 0) = 0 AND COALESCE(cardinality(pp.preferred_states), 0) = 0 THEN 15
          WHEN lower(COALESCE(t.city, '')) = ANY (ARRAY(SELECT lower(x) FROM unnest(COALESCE(pp.preferred_cities, '{}')) x)) THEN 15
          WHEN lower(COALESCE(t.state, '')) = ANY (ARRAY(SELECT lower(x) FROM unnest(COALESCE(pp.preferred_states, '{}')) x)) THEN 10
          ELSE 0 END)
  + (CASE WHEN COALESCE(cardinality(pp.preferred_community), 0) = 0
            OR lower(COALESCE(t.community, '')) = ANY (ARRAY(SELECT lower(x) FROM unnest(pp.preferred_community) x)) THEN 10 ELSE 0 END)
  + (CASE WHEN COALESCE(cardinality(pp.preferred_religion), 0) = 0
            OR lower(COALESCE(t.religion, '')) = ANY (ARRAY(SELECT lower(x) FROM unnest(pp.preferred_religion) x)) THEN 5 ELSE 0 END)
  + (CASE WHEN COALESCE(cardinality(pp.preferred_diet), 0) = 0 OR t.diet IS NULL
            OR lower(t.diet) = ANY (ARRAY(SELECT lower(x) FROM unnest(pp.preferred_diet) x)) THEN 10 ELSE 0 END)
  + (CASE WHEN public.income_lakhs(pp.min_income) IS NULL OR public.income_lakhs(t.income) IS NULL
            OR public.income_lakhs(t.income) >= public.income_lakhs(pp.min_income) THEN 5 ELSE 0 END);
$$;

-- ─── Execute grants ──────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION
  public.require_admin(),
  public.admin_approve_profile(uuid, text),
  public.admin_reject_profile(uuid, text),
  public.admin_batch_approve_pending(),
  public.admin_moderate_photo(uuid, text, text),
  public.admin_resolve_report(uuid, text, text, text),
  public.admin_toggle_user_suspension(uuid, boolean, text),
  public.admin_list_profiles(),
  public.get_or_create_conversation(uuid),
  public.get_my_private_profile(),
  public.aadhaar_auto_approval_enabled(),
  public.guard_profile_system_columns()
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION
  public.admin_approve_profile(uuid, text),
  public.admin_reject_profile(uuid, text),
  public.admin_batch_approve_pending(),
  public.admin_moderate_photo(uuid, text, text),
  public.admin_resolve_report(uuid, text, text, text),
  public.admin_toggle_user_suspension(uuid, boolean, text),
  public.admin_list_profiles(),
  public.get_or_create_conversation(uuid),
  public.get_my_private_profile(),
  public.aadhaar_auto_approval_enabled()
TO authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_profile_system_columns() FROM authenticated;

-- ─── Older helpers that trusted p_user_id ────────────────────────────────────
-- (anon: auth.uid() IS NULL made `auth.uid() <> p_user_id` NULL, which skipped the ownership check)
CREATE OR REPLACE FUNCTION public.check_user_entitlement(p_user_id uuid, p_feature_key text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $function$
DECLARE v_sub RECORD; v_plan RECORD;
BEGIN
  IF auth.uid() IS NULL OR (p_user_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized.' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_sub FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active' AND end_date > now()
  ORDER BY end_date DESC LIMIT 1;
  IF v_sub IS NULL THEN
    SELECT * INTO v_plan FROM public.subscription_plans WHERE slug = 'free' LIMIT 1;
    IF v_plan IS NOT NULL THEN
      RETURN jsonb_build_object('has_subscription', false, 'plan_slug', 'free', 'limit', v_plan.features->p_feature_key, 'used', 0);
    END IF;
    RETURN jsonb_build_object('has_subscription', false, 'limit', 0, 'used', 0);
  END IF;
  SELECT * INTO v_plan FROM public.subscription_plans WHERE id = v_sub.plan_id;
  RETURN jsonb_build_object('has_subscription', true, 'subscription_id', v_sub.id, 'plan_slug', v_plan.slug,
    'limit', v_plan.features->p_feature_key, 'used', COALESCE(v_sub.feature_usage->p_feature_key, '0'::jsonb));
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_profile_complete(p_user_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $function$
DECLARE v_prof RECORD;
BEGIN
  IF auth.uid() IS NULL OR (p_user_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin()) THEN
    RETURN false;
  END IF;
  SELECT * INTO v_prof FROM public.profiles WHERE user_id = p_user_id;
  IF v_prof IS NULL THEN RETURN false; END IF;
  RETURN NOT (v_prof.date_of_birth IS NULL OR v_prof.height IS NULL OR v_prof.community IS NULL
    OR v_prof.education IS NULL OR v_prof.occupation IS NULL OR v_prof.city IS NULL
    OR v_prof.about_me IS NULL OR char_length(v_prof.about_me) < 20);
END;
$function$;

CREATE OR REPLACE FUNCTION public.submit_profile_for_approval(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE v_profile RECORD;
BEGIN
  IF auth.uid() IS NULL OR (p_user_id IS DISTINCT FROM auth.uid() AND NOT public.is_admin()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized profile submission.');
  END IF;
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
  IF v_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found.');
  END IF;
  IF v_profile.profile_status IN ('approved', 'suspended') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile is ' || v_profile.profile_status || ' and cannot be resubmitted.');
  END IF;
  IF v_profile.date_of_birth IS NULL OR v_profile.height IS NULL OR v_profile.community IS NULL
     OR v_profile.education IS NULL OR v_profile.occupation IS NULL OR v_profile.city IS NULL
     OR v_profile.about_me IS NULL OR char_length(v_profile.about_me) < 20 THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Please complete all required profile fields (Date of Birth, Height, Community, Education, Occupation, City, and About Me with at least 20 characters).');
  END IF;
  UPDATE public.profiles SET profile_status = 'pending_approval', rejection_reason = NULL, updated_at = now()
  WHERE id = v_profile.id;
  RETURN jsonb_build_object('success', true, 'message', 'Profile successfully submitted for approval.', 'profile_id', v_profile.profile_id);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.check_user_entitlement(uuid, text), public.is_profile_complete(uuid),
  public.submit_profile_for_approval(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_user_entitlement(uuid, text), public.is_profile_complete(uuid),
  public.submit_profile_for_approval(uuid) TO authenticated;

-- Trigger functions need no client EXECUTE grant. generate_public_profile_id is the
-- profiles.profile_id column default, so inserting members still need it.
REVOKE EXECUTE ON FUNCTION public.handle_new_interest_notification(), public.handle_new_profile_preferences(),
  public.handle_new_user(), public.handle_profile_updated(), public.generate_public_profile_id()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_public_profile_id() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.require_admin() FROM authenticated;

-- Advisor: pin search_path on the remaining helpers (incl. the 008 fixes applied outside a migration).
ALTER FUNCTION public.generate_public_profile_id() SET search_path = public;
ALTER FUNCTION public.handle_profile_updated() SET search_path = public;
ALTER FUNCTION public.get_my_profile_id() SET search_path = public;
ALTER FUNCTION public.handle_new_interest_notification() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.guard_profile_system_columns(), public.set_inquiry_priority(),
  public.trg_subscription_priority() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.profile_card_json(public.profiles) SET search_path = public;
