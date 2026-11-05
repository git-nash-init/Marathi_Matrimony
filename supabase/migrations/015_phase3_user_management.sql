-- 015: Phase 3. Admin user management: list, view, edit, block, verify, remove, reset password.
-- Written against the live schema.

-- ─── Account blocks ─────────────────────────────────────────────────────────
-- History is kept: lifting a block stamps it rather than removing the row, and the record stays
-- if the account is later removed (hence no foreign keys).
CREATE TABLE IF NOT EXISTS public.account_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text NOT NULL,
  previous_status public.profile_status_type,
  blocked_by uuid,
  blocked_at timestamptz NOT NULL DEFAULT now(),
  lifted_by uuid,
  lifted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_account_blocks_active ON public.account_blocks (user_id) WHERE lifted_at IS NULL;
ALTER TABLE public.account_blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_blocks FROM PUBLIC, anon, authenticated;

-- Payment records outlive the member they belonged to, with no link back to the person.
CREATE TABLE IF NOT EXISTS public.payment_records_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  plan_id uuid,
  gateway text,
  gateway_order_id text,
  gateway_payment_id text,
  amount numeric,
  currency text,
  status text,
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz,
  archived_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_records_archive ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_records_archive FROM PUBLIC, anon, authenticated;
CREATE POLICY payment_archive_admin_read ON public.payment_records_archive FOR SELECT TO authenticated
  USING (public.is_admin());
GRANT SELECT ON public.payment_records_archive TO authenticated;

CREATE OR REPLACE FUNCTION public.is_account_blocked()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.account_blocks WHERE user_id = auth.uid() AND lifted_at IS NULL);
$$;

CREATE OR REPLACE FUNCTION public.get_my_account_status()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('blocked', public.is_account_blocked());
$$;

-- A blocked account has no member identity: every member action and list that goes through this
-- stops at once, even while the old access token is still valid.
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() AND NOT public.is_account_blocked() LIMIT 1;
$$;

-- Search, matches and every paid feature check the plan, so this stops them too.
CREATE OR REPLACE FUNCTION public.my_plan()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_slug text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'none'; END IF;
  IF public.is_account_blocked() THEN
    RAISE EXCEPTION 'ACCOUNT_BLOCKED' USING ERRCODE = '42501';
  END IF;
  IF public.is_admin(auth.uid()) THEN RETURN 'platinum'; END IF;

  SELECT p.slug INTO v_slug
  FROM public.subscriptions s
  JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = auth.uid() AND s.status = 'active' AND s.end_date > now()
  ORDER BY public.plan_rank(p.slug) DESC, s.end_date DESC
  LIMIT 1;

  RETURN COALESCE(v_slug, 'none');
END;
$$;

ALTER POLICY profiles_select_policy ON public.profiles
  USING (public.is_admin()
         OR (NOT public.is_account_blocked()
             AND (user_id = auth.uid() OR (profile_status = 'approved' AND NOT public.is_blocked_with(id)))));

ALTER POLICY profiles_update_policy ON public.profiles
  USING (user_id = auth.uid() AND NOT public.is_account_blocked())
  WITH CHECK (user_id = auth.uid() AND NOT public.is_account_blocked());

-- ─── Audit helpers ──────────────────────────────────────────────────────────
-- Records what changed. Private values are masked: the log says they changed, not what they are.
CREATE OR REPLACE FUNCTION public.audit_diff(p_old jsonb, p_new jsonb, p_keys text[], p_masked text[])
RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT COALESCE(jsonb_object_agg(k, jsonb_build_object(
           'old', CASE WHEN k = ANY (p_masked) THEN to_jsonb('***'::text) ELSE p_old -> k END,
           'new', CASE WHEN k = ANY (p_masked) THEN to_jsonb('***'::text) ELSE p_new -> k END)), '{}'::jsonb)
  FROM unnest(p_keys) AS k
  WHERE (p_old -> k) IS DISTINCT FROM (p_new -> k);
$$;

CREATE OR REPLACE FUNCTION public.admin_log(p_action text, p_entity text, p_target text, p_details jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (auth.uid(), public.my_admin_role()::text, p_action, p_entity, p_target, COALESCE(p_details, '{}'::jsonb));
$$;

-- Keeps only the listed keys; anything else in the request is refused.
CREATE OR REPLACE FUNCTION public.allowed_changes(p_changes jsonb, p_allowed text[])
RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE v_bad text;
BEGIN
  IF jsonb_typeof(COALESCE(p_changes, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'Changes must be an object.' USING ERRCODE = '22023';
  END IF;
  SELECT k INTO v_bad FROM jsonb_object_keys(COALESCE(p_changes, '{}'::jsonb)) AS k WHERE NOT (k = ANY (p_allowed)) LIMIT 1;
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'The field "%" cannot be edited here.', v_bad USING ERRCODE = '22023';
  END IF;
  RETURN COALESCE(p_changes, '{}'::jsonb);
END;
$$;

-- ─── List and view ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search text DEFAULT NULL, p_status text DEFAULT NULL, p_gender text DEFAULT NULL,
  p_verification text DEFAULT NULL, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_q text := public.like_pattern(NULLIF(left(btrim(COALESCE(p_search, '')), 80), ''));
  v_status text := NULLIF(NULLIF(p_status, ''), 'all');
  v_gender text := NULLIF(NULLIF(p_gender, ''), 'all');
  v_verif text := NULLIF(NULLIF(p_verification, ''), 'all');
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
  v_offset int := GREATEST(COALESCE(p_offset, 0), 0);
  v_result jsonb;
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator', 'support');

  WITH m AS (
    SELECT u.id AS user_id, u.email::text AS email, u.created_at, u.last_sign_in_at,
           p.id AS profile_id, p.profile_id AS profile_code, p.first_name, p.last_name, p.gender::text AS gender,
           public.age_years(p.date_of_birth) AS age, p.city, p.profile_status::text AS profile_status,
           p.verification_status::text AS verification_status, p.avatar_url,
           c.phone_number,
           EXISTS (SELECT 1 FROM public.account_blocks b WHERE b.user_id = u.id AND b.lifted_at IS NULL) AS blocked,
           (SELECT a.role::text FROM public.admin_users a WHERE a.user_id = u.id AND a.is_active) AS admin_role,
           (SELECT sp.name FROM public.subscriptions s JOIN public.subscription_plans sp ON sp.id = s.plan_id
             WHERE s.user_id = u.id AND s.status = 'active' AND s.end_date > now()
             ORDER BY s.end_date DESC LIMIT 1) AS plan_name
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    LEFT JOIN public.profile_contacts c ON c.profile_id = p.id
  ), f AS (
    SELECT * FROM m
    WHERE (v_q IS NULL OR m.email ILIKE v_q OR m.first_name ILIKE v_q OR m.last_name ILIKE v_q
           OR m.profile_code ILIKE v_q OR m.phone_number ILIKE v_q OR m.city ILIKE v_q)
      AND (v_gender IS NULL OR m.gender = v_gender)
      AND (v_verif IS NULL OR m.verification_status = v_verif)
      AND (v_status IS NULL
           OR (v_status = 'blocked' AND m.blocked)
           OR (v_status = 'no_profile' AND m.profile_id IS NULL)
           OR (v_status NOT IN ('blocked', 'no_profile') AND m.profile_status = v_status))
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM f),
    'items', COALESCE((SELECT jsonb_agg(to_jsonb(pg) ORDER BY pg.created_at DESC)
                       FROM (SELECT * FROM f ORDER BY created_at DESC LIMIT v_limit OFFSET v_offset) pg), '[]'::jsonb))
  INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_user(p_user uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.admin_role_type;
  v_u auth.users%ROWTYPE;
  v_p public.profiles%ROWTYPE;
  v_profile jsonb;
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator', 'support');
  v_role := public.my_admin_role();

  SELECT * INTO v_u FROM auth.users WHERE id = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member not found.' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_p FROM public.profiles WHERE user_id = p_user;

  IF v_p.id IS NOT NULL THEN
    v_profile := to_jsonb(v_p) - 'aadhaar_number';
    -- Support staff help members, but don't need their ID digits.
    IF v_role = 'support' THEN v_profile := v_profile - 'aadhaar_last4'; END IF;
    v_profile := v_profile || jsonb_build_object('age', public.age_years(v_p.date_of_birth));
  END IF;

  RETURN jsonb_build_object(
    'user_id', v_u.id, 'email', v_u.email, 'created_at', v_u.created_at, 'last_sign_in_at', v_u.last_sign_in_at,
    'email_confirmed_at', v_u.email_confirmed_at,
    'admin_role', (SELECT role FROM public.admin_users WHERE user_id = p_user AND is_active),
    'profile', v_profile,
    'contacts', CASE WHEN v_p.id IS NULL THEN NULL ELSE
      (SELECT to_jsonb(c) - 'id' FROM public.profile_contacts c WHERE c.profile_id = v_p.id) END,
    'preferences', CASE WHEN v_p.id IS NULL THEN NULL ELSE
      (SELECT to_jsonb(pp) - 'id' FROM public.partner_preferences pp WHERE pp.profile_id = v_p.id) END,
    'block', (SELECT jsonb_build_object('reason', b.reason, 'blocked_at', b.blocked_at)
              FROM public.account_blocks b WHERE b.user_id = p_user AND b.lifted_at IS NULL),
    'subscription', (SELECT jsonb_build_object('plan', sp.name, 'status', s.status, 'end_date', s.end_date)
                     FROM public.subscriptions s JOIN public.subscription_plans sp ON sp.id = s.plan_id
                     WHERE s.user_id = p_user ORDER BY s.end_date DESC LIMIT 1),
    'history', COALESCE((SELECT jsonb_agg(h) FROM (
       SELECT a.action, a.actor_role, a.details, a.created_at
       FROM public.audit_logs a
       WHERE a.target_id IN (p_user::text, COALESCE(v_p.id::text, ''))
       ORDER BY a.created_at DESC LIMIT 20) h), '[]'::jsonb));
END;
$$;

-- ─── Edit ───────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_update_profile(p_profile_id uuid, p_changes jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_allowed text[] := ARRAY['first_name','last_name','gender','date_of_birth','marital_status','height','religion',
    'community','sub_community','gothra','mother_tongue','education','education_detail','college','occupation',
    'employed_in','company','income','work_location','city','state','country','diet','smoking','drinking','about_me',
    'family_type','family_status','father_occupation','mother_occupation','brothers_count','sisters_count',
    'married_brothers_count','married_sisters_count','family_location','family_description','profile_visibility'];
  v_clean jsonb;
  v_old public.profiles%ROWTYPE;
  v_new public.profiles%ROWTYPE;
  v_diff jsonb;
  v_min int;
BEGIN
  PERFORM public.require_admin_role('admin');
  v_clean := public.allowed_changes(p_changes, v_allowed);

  SELECT * INTO v_old FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002'; END IF;

  v_new := jsonb_populate_record(v_old, v_clean);

  IF COALESCE(btrim(v_new.first_name), '') = '' THEN
    RAISE EXCEPTION 'First name cannot be empty.' USING ERRCODE = '22023';
  END IF;
  v_min := CASE WHEN v_new.gender = 'male' THEN 21 ELSE 18 END;
  IF v_new.date_of_birth IS NOT NULL AND v_old.profile_status IN ('approved', 'pending_approval')
     AND public.age_years(v_new.date_of_birth) < v_min THEN
    RAISE EXCEPTION 'This member must be at least % years old.', v_min USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles SET
    first_name = v_new.first_name, last_name = v_new.last_name, gender = v_new.gender,
    date_of_birth = v_new.date_of_birth, marital_status = v_new.marital_status, height = v_new.height,
    religion = v_new.religion, community = v_new.community, sub_community = v_new.sub_community,
    gothra = v_new.gothra, mother_tongue = v_new.mother_tongue, education = v_new.education,
    education_detail = v_new.education_detail, college = v_new.college, occupation = v_new.occupation,
    employed_in = v_new.employed_in, company = v_new.company, income = v_new.income,
    work_location = v_new.work_location, city = v_new.city, state = v_new.state, country = v_new.country,
    diet = v_new.diet, smoking = v_new.smoking, drinking = v_new.drinking, about_me = v_new.about_me,
    family_type = v_new.family_type, family_status = v_new.family_status,
    father_occupation = v_new.father_occupation, mother_occupation = v_new.mother_occupation,
    brothers_count = v_new.brothers_count, sisters_count = v_new.sisters_count,
    married_brothers_count = v_new.married_brothers_count, married_sisters_count = v_new.married_sisters_count,
    family_location = v_new.family_location, family_description = v_new.family_description,
    profile_visibility = v_new.profile_visibility
  WHERE id = p_profile_id;

  v_diff := public.audit_diff(to_jsonb(v_old), to_jsonb(v_new), v_allowed, ARRAY['last_name', 'date_of_birth', 'income']);
  IF v_diff <> '{}'::jsonb THEN
    PERFORM public.admin_log('profile_edited', 'profiles', p_profile_id::text, jsonb_build_object('changes', v_diff));
  END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_contacts(p_profile_id uuid, p_changes jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_allowed text[] := ARRAY['phone_number','whatsapp_number','email','address_line','contact_person','convenient_time_to_call'];
  v_clean jsonb;
  v_old jsonb;
  v_new public.profile_contacts%ROWTYPE;
  v_base public.profile_contacts%ROWTYPE;
  v_diff jsonb;
BEGIN
  PERFORM public.require_admin_role('admin');
  v_clean := public.allowed_changes(p_changes, v_allowed);
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_profile_id) THEN
    RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_base FROM public.profile_contacts WHERE profile_id = p_profile_id FOR UPDATE;
  v_old := CASE WHEN v_base.profile_id IS NULL THEN '{}'::jsonb ELSE to_jsonb(v_base) END;
  v_base.profile_id := p_profile_id;
  v_new := jsonb_populate_record(v_base, v_clean);

  INSERT INTO public.profile_contacts (profile_id, phone_number, whatsapp_number, email, address_line, contact_person, convenient_time_to_call)
  VALUES (p_profile_id, v_new.phone_number, v_new.whatsapp_number, v_new.email, v_new.address_line, v_new.contact_person, v_new.convenient_time_to_call)
  ON CONFLICT (profile_id) DO UPDATE SET
    phone_number = EXCLUDED.phone_number, whatsapp_number = EXCLUDED.whatsapp_number, email = EXCLUDED.email,
    address_line = EXCLUDED.address_line, contact_person = EXCLUDED.contact_person,
    convenient_time_to_call = EXCLUDED.convenient_time_to_call, updated_at = now();

  v_diff := public.audit_diff(v_old, to_jsonb(v_new), v_allowed, v_allowed);
  IF v_diff <> '{}'::jsonb THEN
    PERFORM public.admin_log('contacts_edited', 'profile_contacts', p_profile_id::text, jsonb_build_object('changes', v_diff));
  END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_preferences(p_profile_id uuid, p_changes jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_allowed text[] := ARRAY['min_age','max_age','min_height','max_height','preferred_cities','preferred_states',
    'preferred_education','preferred_occupation','preferred_religion','preferred_community','preferred_marital_status',
    'preferred_diet','min_income','other_preferences'];
  v_clean jsonb;
  v_old jsonb;
  v_base public.partner_preferences%ROWTYPE;
  v_new public.partner_preferences%ROWTYPE;
  v_diff jsonb;
BEGIN
  PERFORM public.require_admin_role('admin');
  v_clean := public.allowed_changes(p_changes, v_allowed);
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_profile_id) THEN
    RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_base FROM public.partner_preferences WHERE profile_id = p_profile_id FOR UPDATE;
  v_old := CASE WHEN v_base.profile_id IS NULL THEN '{}'::jsonb ELSE to_jsonb(v_base) END;
  v_base.profile_id := p_profile_id;
  v_new := jsonb_populate_record(v_base, v_clean);

  IF v_new.min_age IS NOT NULL AND v_new.max_age IS NOT NULL AND v_new.min_age > v_new.max_age THEN
    RAISE EXCEPTION 'Minimum age cannot be above maximum age.' USING ERRCODE = '22023';
  END IF;
  IF v_new.min_height IS NOT NULL AND v_new.max_height IS NOT NULL AND v_new.min_height > v_new.max_height THEN
    RAISE EXCEPTION 'Minimum height cannot be above maximum height.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.partner_preferences (profile_id, min_age, max_age, min_height, max_height, preferred_cities, preferred_states,
    preferred_education, preferred_occupation, preferred_religion, preferred_community, preferred_marital_status,
    preferred_diet, min_income, other_preferences)
  VALUES (p_profile_id, v_new.min_age, v_new.max_age, v_new.min_height, v_new.max_height, v_new.preferred_cities, v_new.preferred_states,
    v_new.preferred_education, v_new.preferred_occupation, v_new.preferred_religion, v_new.preferred_community, v_new.preferred_marital_status,
    v_new.preferred_diet, v_new.min_income, v_new.other_preferences)
  ON CONFLICT (profile_id) DO UPDATE SET
    min_age = EXCLUDED.min_age, max_age = EXCLUDED.max_age, min_height = EXCLUDED.min_height, max_height = EXCLUDED.max_height,
    preferred_cities = EXCLUDED.preferred_cities, preferred_states = EXCLUDED.preferred_states,
    preferred_education = EXCLUDED.preferred_education, preferred_occupation = EXCLUDED.preferred_occupation,
    preferred_religion = EXCLUDED.preferred_religion, preferred_community = EXCLUDED.preferred_community,
    preferred_marital_status = EXCLUDED.preferred_marital_status, preferred_diet = EXCLUDED.preferred_diet,
    min_income = EXCLUDED.min_income, other_preferences = EXCLUDED.other_preferences, updated_at = now();

  v_diff := public.audit_diff(v_old, to_jsonb(v_new), v_allowed, ARRAY[]::text[]);
  IF v_diff <> '{}'::jsonb THEN
    PERFORM public.admin_log('preferences_edited', 'partner_preferences', p_profile_id::text, jsonb_build_object('changes', v_diff));
  END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_verification(p_profile_id uuid, p_status text, p_note text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_old text;
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator');
  IF p_status NOT IN ('unverified', 'pending', 'verified', 'rejected') THEN
    RAISE EXCEPTION 'Unknown verification status.' USING ERRCODE = '22023';
  END IF;
  SELECT verification_status::text INTO v_old FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002'; END IF;
  UPDATE public.profiles SET verification_status = p_status::public.verification_status_type WHERE id = p_profile_id;
  PERFORM public.admin_log('verification_changed', 'profiles', p_profile_id::text,
    jsonb_build_object('from', v_old, 'to', p_status, 'note', p_note));
  RETURN true;
END;
$$;

-- ─── Block, unblock, remove ─────────────────────────────────────────────────
-- Rules shared by blocking and removing. Nobody can act on themselves; only a super admin can act on
-- another admin; the last super admin is always safe.
CREATE OR REPLACE FUNCTION public.admin_check_target(p_user uuid)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_target public.admin_role_type;
BEGIN
  IF p_user = auth.uid() THEN
    RAISE EXCEPTION 'You cannot do this to your own account.' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user) THEN
    RAISE EXCEPTION 'Member not found.' USING ERRCODE = 'P0002';
  END IF;
  SELECT role INTO v_target FROM public.admin_users WHERE user_id = p_user AND is_active;
  IF v_target IS NOT NULL AND public.my_admin_role() <> 'super_admin' THEN
    RAISE EXCEPTION 'Only a super admin can do this to another admin.' USING ERRCODE = '42501';
  END IF;
  IF v_target = 'super_admin' AND NOT EXISTS (
      SELECT 1 FROM public.admin_users WHERE role = 'super_admin' AND is_active AND user_id <> p_user) THEN
    RAISE EXCEPTION 'The last super admin cannot be blocked or removed.' USING ERRCODE = '42501';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_block_user(p_user uuid, p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin');
  v_reason text := btrim(COALESCE(p_reason, ''));
  v_status public.profile_status_type;
BEGIN
  PERFORM public.admin_check_target(p_user);
  IF char_length(v_reason) < 3 THEN
    RAISE EXCEPTION 'Please give a reason for blocking this member.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM public.account_blocks WHERE user_id = p_user AND lifted_at IS NULL) THEN
    RETURN jsonb_build_object('success', true, 'already', true);
  END IF;

  SELECT profile_status INTO v_status FROM public.profiles WHERE user_id = p_user FOR UPDATE;
  INSERT INTO public.account_blocks (user_id, reason, previous_status, blocked_by)
  VALUES (p_user, left(v_reason, 500), v_status, v_admin);
  UPDATE public.profiles SET profile_status = 'suspended' WHERE user_id = p_user;

  PERFORM public.admin_log('account_blocked', 'auth.users', p_user::text, jsonb_build_object('reason', left(v_reason, 500)));
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unblock_user(p_user uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin');
  v_prev public.profile_status_type;
BEGIN
  UPDATE public.account_blocks SET lifted_at = now(), lifted_by = v_admin
  WHERE user_id = p_user AND lifted_at IS NULL
  RETURNING previous_status INTO v_prev;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', true, 'already', true); END IF;

  UPDATE public.profiles SET profile_status = COALESCE(v_prev, 'draft') WHERE user_id = p_user;
  PERFORM public.admin_log('account_unblocked', 'auth.users', p_user::text, jsonb_build_object('restored_status', v_prev));
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Step one of removing a member: checks the typed confirmation, keeps payment records with no link
-- to the person, and logs it. The admin-users Edge Function then removes files and the account.
CREATE OR REPLACE FUNCTION public.admin_prepare_user_removal(p_user uuid, p_confirm text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email text;
  v_profile uuid;
  v_code text;
BEGIN
  PERFORM public.require_admin_role('super_admin');
  PERFORM public.admin_check_target(p_user);

  SELECT email INTO v_email FROM auth.users WHERE id = p_user;
  SELECT id, profile_id INTO v_profile, v_code FROM public.profiles WHERE user_id = p_user;
  IF lower(btrim(COALESCE(p_confirm, ''))) NOT IN (lower(COALESCE(v_email, '')), lower(COALESCE(v_code, ''))) OR btrim(COALESCE(p_confirm, '')) = '' THEN
    RAISE EXCEPTION 'The confirmation text does not match this member.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.payment_records_archive (payment_id, plan_id, gateway, gateway_order_id, gateway_payment_id,
    amount, currency, status, payment_method, paid_at, created_at)
  SELECT id, plan_id, gateway, gateway_order_id, gateway_payment_id, amount, currency, status::text, payment_method, paid_at, created_at
  FROM public.payments WHERE user_id = p_user;

  PERFORM public.admin_log('account_removal_started', 'auth.users', p_user::text, jsonb_build_object('profile_code', v_code));
  RETURN jsonb_build_object('user_id', p_user, 'profile_id', v_profile);
END;
$$;

-- For the password reset email: only an admin gets the address, and it is logged.
CREATE OR REPLACE FUNCTION public.admin_prepare_password_reset(p_user uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text;
BEGIN
  PERFORM public.require_admin_role('admin');
  SELECT email INTO v_email FROM auth.users WHERE id = p_user;
  IF v_email IS NULL THEN RAISE EXCEPTION 'This member has no email address.' USING ERRCODE = 'P0002'; END IF;
  PERFORM public.admin_log('password_reset_sent', 'auth.users', p_user::text, '{}'::jsonb);
  RETURN v_email;
END;
$$;

-- ─── Who may call what ──────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION public.audit_diff(jsonb, jsonb, text[], text[]), public.admin_log(text, text, text, jsonb),
  public.allowed_changes(jsonb, text[]), public.admin_check_target(uuid)
  FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.is_account_blocked(), public.get_my_account_status(),
  public.admin_list_users(text, text, text, text, integer, integer), public.admin_get_user(uuid),
  public.admin_update_profile(uuid, jsonb), public.admin_update_contacts(uuid, jsonb),
  public.admin_update_preferences(uuid, jsonb), public.admin_set_verification(uuid, text, text),
  public.admin_block_user(uuid, text), public.admin_unblock_user(uuid),
  public.admin_prepare_user_removal(uuid, text), public.admin_prepare_password_reset(uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_account_blocked(), public.get_my_account_status(),
  public.admin_list_users(text, text, text, text, integer, integer), public.admin_get_user(uuid),
  public.admin_update_profile(uuid, jsonb), public.admin_update_contacts(uuid, jsonb),
  public.admin_update_preferences(uuid, jsonb), public.admin_set_verification(uuid, text, text),
  public.admin_block_user(uuid, text), public.admin_unblock_user(uuid),
  public.admin_prepare_user_removal(uuid, text), public.admin_prepare_password_reset(uuid)
  TO authenticated, service_role;
