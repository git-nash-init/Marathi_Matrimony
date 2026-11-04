-- 013: Phase 1 foundation.
--   * Admin roles, optional admin MFA (aal2), last-super-admin protection.
--   * Aadhaar: manual review only; keep last 4 digits; full numbers erased (IRREVERSIBLE).
--   * profiles: age derived from date of birth, identity columns locked, photo URLs restricted,
--     admin edits must go through audited functions.
--   * anon: no access to profiles or to SECURITY DEFINER helpers.
--   * profile-photos storage: writes limited to the owner's folder.
--   * Rate limiting, push endpoint allowlist.
-- Written against the live schema. Rollback: supabase/rollbacks/013_down.sql

-- ─── MFA setting and admin helpers ──────────────────────────────────────────
INSERT INTO public.platform_settings (key, value, description)
VALUES ('admin_mfa_required', 'false'::jsonb,
        'When true, admin access requires 2-step verification (aal2). Only a super admin who has completed 2-step verification can turn this on.')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_mfa_satisfied()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT COALESCE((SELECT value = 'true'::jsonb FROM public.platform_settings WHERE key = 'admin_mfa_required'), false)
      OR COALESCE(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p_user_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_user_id AND is_active)
     AND (p_user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active))
     AND public.admin_mfa_satisfied();
$$;

-- The caller's effective role: NULL when not an admin or when required 2-step verification is missing.
CREATE OR REPLACE FUNCTION public.my_admin_role()
RETURNS public.admin_role_type LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.admin_users
  WHERE user_id = auth.uid() AND is_active AND public.admin_mfa_satisfied();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(public.my_admin_role() = 'super_admin', false);
$$;

-- super_admin always passes; other roles must be listed by the calling function.
CREATE OR REPLACE FUNCTION public.require_admin_role(VARIADIC p_roles public.admin_role_type[])
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role public.admin_role_type := public.my_admin_role();
BEGIN
  IF auth.uid() IS NULL OR v_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized. Admin privileges required.' USING ERRCODE = '42501';
  END IF;
  IF v_role <> 'super_admin' AND NOT (v_role = ANY (p_roles)) THEN
    RAISE EXCEPTION 'Your admin role does not allow this action.' USING ERRCODE = '42501';
  END IF;
  RETURN auth.uid();
END;
$$;

-- What the admin UI needs to route the caller. Reveals nothing to non-admins.
CREATE OR REPLACE FUNCTION public.get_admin_context()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_role public.admin_role_type;
BEGIN
  SELECT role INTO v_role FROM public.admin_users WHERE user_id = auth.uid() AND is_active;
  IF auth.uid() IS NULL OR v_role IS NULL THEN
    RETURN jsonb_build_object('is_admin', false);
  END IF;
  RETURN jsonb_build_object(
    'is_admin', true,
    'role', v_role,
    'mfa_required', COALESCE((SELECT value = 'true'::jsonb FROM public.platform_settings WHERE key = 'admin_mfa_required'), false),
    'aal', COALESCE(auth.jwt() ->> 'aal', 'aal1'),
    'has_verified_factor', EXISTS (SELECT 1 FROM auth.mfa_factors f WHERE f.user_id = auth.uid() AND f.status = 'verified'));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_mfa_required(p_required boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('super_admin');
BEGIN
  -- Turning it on from a session without 2-step verification would lock this admin out.
  IF COALESCE(auth.jwt() ->> 'aal', '') <> 'aal2' THEN
    RAISE EXCEPTION 'Complete 2-step verification in this session first.' USING ERRCODE = '42501';
  END IF;
  UPDATE public.platform_settings
  SET value = to_jsonb(p_required), updated_by = v_admin, updated_at = now()
  WHERE key = 'admin_mfa_required';
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, 'super_admin', 'admin_mfa_required_changed', 'platform_settings', 'admin_mfa_required',
          jsonb_build_object('required', p_required));
  RETURN true;
END;
$$;

-- ─── Who can manage admins and settings ─────────────────────────────────────
DROP POLICY IF EXISTS admin_users_manage_policy ON public.admin_users;
CREATE POLICY admin_users_manage_policy ON public.admin_users FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS platform_settings_admin_policy ON public.platform_settings;
CREATE POLICY platform_settings_admin_policy ON public.platform_settings FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- There must always be one active super admin.
CREATE OR REPLACE FUNCTION public.guard_last_super_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.role = 'super_admin' AND OLD.is_active
     AND (TG_OP = 'DELETE' OR NEW.role <> 'super_admin' OR NOT NEW.is_active)
     AND NOT EXISTS (SELECT 1 FROM public.admin_users
                     WHERE id <> OLD.id AND role = 'super_admin' AND is_active) THEN
    RAISE EXCEPTION 'The last active super admin cannot be removed or changed.' USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_guard_last_super_admin ON public.admin_users;
CREATE TRIGGER trg_guard_last_super_admin BEFORE UPDATE OR DELETE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.guard_last_super_admin();

-- ─── Admin RPCs now check roles ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_approve_profile(p_profile_id uuid, p_notes text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('admin', 'moderator');
BEGIN
  UPDATE public.profiles
  SET profile_status = 'approved', verification_status = 'verified', rejection_reason = NULL, updated_at = now()
  WHERE id = p_profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, public.my_admin_role()::text, 'profile_approved', 'profiles', p_profile_id::text, jsonb_build_object('notes', p_notes));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_profile(p_profile_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('admin', 'moderator');
BEGIN
  UPDATE public.profiles
  SET profile_status = 'rejected', verification_status = 'rejected',
      rejection_reason = COALESCE(NULLIF(trim(p_reason), ''), 'Rejected by moderator'), updated_at = now()
  WHERE id = p_profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, public.my_admin_role()::text, 'profile_rejected', 'profiles', p_profile_id::text, jsonb_build_object('reason', p_reason));
  RETURN true;
END;
$$;

-- Only submitted profiles. A verification-pending draft is not ready to approve.
CREATE OR REPLACE FUNCTION public.admin_batch_approve_pending()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('admin'); v_n integer;
BEGIN
  WITH done AS (
    UPDATE public.profiles
    SET profile_status = 'approved', verification_status = 'verified', rejection_reason = NULL, updated_at = now()
    WHERE profile_status = 'pending_approval'
    RETURNING id
  )
  SELECT count(*) INTO v_n FROM done;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, public.my_admin_role()::text, 'profiles_batch_approved', 'profiles', 'pending_queue', jsonb_build_object('count', v_n));
  RETURN v_n;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_moderate_photo(p_photo_id uuid, p_status text, p_notes text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('admin', 'moderator');
BEGIN
  UPDATE public.profile_photos SET approval_status = p_status::photo_approval_type, updated_at = now()
  WHERE id = p_photo_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Photo not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, public.my_admin_role()::text, 'photo_moderated', 'profile_photos', p_photo_id::text,
          jsonb_build_object('status', p_status, 'notes', p_notes));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_resolve_report(
  p_report_id uuid, p_status text, p_notes text DEFAULT NULL, p_action_taken text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('admin', 'moderator');
BEGIN
  UPDATE public.moderation_reports
  SET status = p_status,
      details = CASE WHEN p_notes IS NOT NULL THEN COALESCE(details, '') || ' [Admin Note: ' || p_notes || ']' ELSE details END
  WHERE id = p_report_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Report not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, public.my_admin_role()::text, 'report_status_updated', 'moderation_reports', p_report_id::text,
          jsonb_build_object('status', p_status, 'notes', p_notes, 'action_taken', p_action_taken));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_toggle_user_suspension(p_profile_id uuid, p_suspend boolean, p_reason text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('admin');
BEGIN
  UPDATE public.profiles
  SET profile_status = CASE WHEN p_suspend THEN 'suspended' ELSE 'approved' END::profile_status_type, updated_at = now()
  WHERE id = p_profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id, details)
  VALUES (v_admin, public.my_admin_role()::text, CASE WHEN p_suspend THEN 'user_suspended' ELSE 'user_unsuspended' END,
          'profiles', p_profile_id::text, jsonb_build_object('reason', p_reason));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator');
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(p) - 'aadhaar_number' ORDER BY p.created_at DESC) FROM public.profiles p), '[]'::jsonb);
END;
$$;

-- ─── Aadhaar: last 4 only, manual review only ───────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aadhaar_last4 text;
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_aadhaar_last4_format CHECK (aadhaar_last4 ~ '^\d{4}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.guard_profile_system_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_ins boolean := TG_OP = 'INSERT';
  v_digits text;
  v_id_same boolean;
  v_prefix text;
BEGIN
  -- A full ID number is never stored, whoever sends it. The column is dropped after the client
  -- that stops sending it is deployed (supabase/pending/014_drop_aadhaar_column.sql).
  IF NEW.aadhaar_number IS NOT NULL THEN
    v_digits := regexp_replace(NEW.aadhaar_number, '\D', '', 'g');
    IF length(v_digits) >= 4 THEN NEW.aadhaar_last4 := right(v_digits, 4); END IF;
    NEW.aadhaar_number := NULL;
  END IF;

  -- Age always comes from the date of birth (India time), never from the client.
  NEW.age := CASE WHEN NEW.date_of_birth IS NULL THEN NULL
                  ELSE date_part('year', age((now() AT TIME ZONE 'Asia/Kolkata')::date, NEW.date_of_birth))::int END;

  IF current_user IN ('authenticated', 'anon') AND NOT public.is_admin() THEN
    IF v_ins THEN
      NEW.listing_priority := 0; NEW.approved_at := NULL; NEW.is_featured := false;
      NEW.featured_until := NULL; NEW.rejection_reason := NULL;
      NEW.profile_id := public.generate_public_profile_id(); NEW.created_at := now();
    ELSE
      NEW.listing_priority := OLD.listing_priority; NEW.approved_at := OLD.approved_at;
      NEW.is_featured := OLD.is_featured; NEW.featured_until := OLD.featured_until;
      NEW.rejection_reason := OLD.rejection_reason;
      NEW.user_id := OLD.user_id; NEW.profile_id := OLD.profile_id; NEW.created_at := OLD.created_at;
    END IF;

    -- New photos must be the member's own uploads in our storage.
    v_prefix := 'https://hgucqabzlaxelkfiavvm.supabase.co/storage/v1/object/public/profile-photos/' || auth.uid()::text || '/';
    IF NEW.avatar_url IS NOT NULL
       AND (v_ins OR NEW.avatar_url IS DISTINCT FROM OLD.avatar_url)
       AND NOT starts_with(NEW.avatar_url, v_prefix) THEN
      RAISE EXCEPTION 'Photos must be uploaded through the profile form.' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM unnest(COALESCE(NEW.photos, '{}'::text[])) AS u
               WHERE NOT starts_with(u, v_prefix)
                 AND (v_ins OR NOT (u = ANY (COALESCE(OLD.photos, '{}'::text[]))))) THEN
      RAISE EXCEPTION 'Photos must be uploaded through the profile form.' USING ERRCODE = '22023';
    END IF;

    v_id_same := NOT v_ins AND NEW.aadhaar_last4 IS NOT DISTINCT FROM OLD.aadhaar_last4;

    -- Members can never approve themselves: only draft and pending_approval are theirs to set.
    IF NOT v_ins AND OLD.profile_status = 'suspended' THEN
      NEW.profile_status := 'suspended';
    ELSIF NOT v_ins AND OLD.profile_status = 'approved' THEN
      NEW.profile_status := 'approved';
    ELSIF NOT v_ins AND OLD.profile_status = 'rejected' AND NEW.profile_status = 'draft' THEN
      NEW.profile_status := 'rejected';
    ELSIF NEW.profile_status NOT IN ('draft', 'pending_approval') THEN
      NEW.profile_status := 'pending_approval';
    END IF;

    IF v_id_same AND OLD.verification_status IN ('verified', 'rejected') THEN
      NEW.verification_status := OLD.verification_status;
    ELSIF NEW.verification_status NOT IN ('unverified', 'pending') THEN
      NEW.verification_status := 'pending';
    END IF;
  END IF;

  IF NEW.profile_status = 'approved' AND (TG_OP = 'INSERT' OR OLD.profile_status IS DISTINCT FROM 'approved') THEN
    NEW.approved_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_private_profile()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('last_name', p.last_name, 'aadhaar_last4', p.aadhaar_last4)
  FROM public.profiles p WHERE p.user_id = auth.uid();
$$;

-- The guard moves any incoming number into aadhaar_last4 and clears it, so note which rows hold a
-- number first, then flag digit-only verifications (no admin approval on record; the profile stays
-- live), then erase.
CREATE TEMP TABLE _aadhaar_ids ON COMMIT DROP AS
  SELECT id FROM public.profiles WHERE aadhaar_number IS NOT NULL;

UPDATE public.profiles p
SET verification_status = 'pending'
FROM _aadhaar_ids x
WHERE p.id = x.id
  AND p.verification_status = 'verified'
  AND NOT EXISTS (SELECT 1 FROM public.audit_logs a
                  WHERE a.action = 'profile_approved' AND a.target_id = p.id::text);

-- IRREVERSIBLE: keeps the last 4 digits and erases every stored full ID number.
UPDATE public.profiles
SET aadhaar_last4 = CASE WHEN length(regexp_replace(aadhaar_number, '\D', '', 'g')) >= 4
                         THEN right(regexp_replace(aadhaar_number, '\D', '', 'g'), 4) END,
    aadhaar_number = NULL
WHERE aadhaar_number IS NOT NULL;

DROP FUNCTION IF EXISTS public.aadhaar_auto_approval_enabled();
DELETE FROM public.platform_settings WHERE key = 'aadhaar_auto_approval';

-- Bring every stored age in line with the date of birth (the trigger sets it).
UPDATE public.profiles SET date_of_birth = date_of_birth;

-- ─── Admin edits go through audited functions, not direct writes ────────────
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS contacts_insert_update_policy ON public.profile_contacts;
CREATE POLICY contacts_owner_policy ON public.profile_contacts FOR ALL TO authenticated
  USING (profile_id = public.get_my_profile_id()) WITH CHECK (profile_id = public.get_my_profile_id());
CREATE POLICY contacts_admin_read_policy ON public.profile_contacts FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS preferences_owner_modify_policy ON public.partner_preferences;
CREATE POLICY preferences_owner_modify_policy ON public.partner_preferences FOR ALL TO authenticated
  USING (profile_id = public.get_my_profile_id()) WITH CHECK (profile_id = public.get_my_profile_id());

DROP POLICY IF EXISTS photos_owner_manage_policy ON public.profile_photos;
CREATE POLICY photos_owner_manage_policy ON public.profile_photos FOR ALL TO authenticated
  USING (profile_id = public.get_my_profile_id()) WITH CHECK (profile_id = public.get_my_profile_id());

DROP POLICY IF EXISTS user_blocks_manage_policy ON public.user_blocks;
CREATE POLICY user_blocks_manage_policy ON public.user_blocks FOR ALL TO authenticated
  USING (blocker_profile_id = public.get_my_profile_id()) WITH CHECK (blocker_profile_id = public.get_my_profile_id());

-- ─── Signed-out visitors ────────────────────────────────────────────────────
REVOKE ALL ON public.profiles FROM anon;

-- Guests still read active plans through plans_public_read. This policy calls is_admin(),
-- so it must not apply to anon once that function is revoked below.
DROP POLICY IF EXISTS plans_select_policy ON public.subscription_plans;
CREATE POLICY plans_select_policy ON public.subscription_plans FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_my_profile_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_vapid_public_key() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_my_profile_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_vapid_public_key() TO authenticated, service_role;

-- Internal helpers: called only from other SECURITY DEFINER functions.
REVOKE EXECUTE ON FUNCTION public.require_admin_role(public.admin_role_type[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.my_admin_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_last_super_admin() FROM PUBLIC, anon, authenticated;

-- Policies call these as the signed-in role.
REVOKE EXECUTE ON FUNCTION public.admin_mfa_satisfied() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_mfa_satisfied() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_admin_context() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_mfa_required(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_mfa_required(boolean) TO authenticated;

-- ─── profile-photos: writes only inside the member's own folder ─────────────
DROP POLICY IF EXISTS "Allow auth update to profile-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow auth uploads to profile-photos" ON storage.objects;
DROP POLICY IF EXISTS photo_bucket_update_policy ON storage.objects;
CREATE POLICY photo_bucket_update_policy ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ─── Rate limiting ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM PUBLIC, anon, authenticated;

-- True while the caller is within p_limit hits for the current window.
CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key text, p_limit integer, p_window interval)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_hits integer;
BEGIN
  INSERT INTO public.rate_limits AS r (key, window_start)
  VALUES (p_key, date_bin(p_window, now(), timestamptz '2000-01-01'))
  ON CONFLICT (key, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING hits INTO v_hits;
  RETURN v_hits <= p_limit;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.rate_limit_hit(text, integer, interval) FROM PUBLIC, anon, authenticated;

SELECT cron.schedule('purge-rate-limits', '17 3 * * *',
  $$DELETE FROM public.rate_limits WHERE window_start < now() - interval '2 days'$$);

-- Public contact form: 5 per hour from one address, 60 per hour overall.
CREATE OR REPLACE FUNCTION public.limit_contact_inquiries()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ip text;
BEGIN
  BEGIN
    v_ip := split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1);
  EXCEPTION WHEN OTHERS THEN v_ip := NULL;
  END;
  IF NOT public.rate_limit_hit('contact:all', 60, interval '1 hour')
     OR (NULLIF(v_ip, '') IS NOT NULL AND NOT public.rate_limit_hit('contact:' || v_ip, 5, interval '1 hour')) THEN
    RAISE EXCEPTION 'RATE_LIMITED' USING ERRCODE = 'P0001',
      HINT = 'Too many messages. Please try again in an hour.';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.limit_contact_inquiries() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_contact_rate_limit ON public.contact_inquiries;
CREATE TRIGGER trg_contact_rate_limit BEFORE INSERT ON public.contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.limit_contact_inquiries();

-- Interests: same behaviour, plus at most 30 attempts per hour.
CREATE OR REPLACE FUNCTION public.send_interest(p_receiver uuid, p_message text DEFAULT NULL::text)
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
  IF NOT public.rate_limit_hit('interest:' || v_me::text, 30, interval '1 hour') THEN
    RETURN jsonb_build_object('success', false, 'code', 'RATE_LIMITED', 'error', 'Too many requests. Please try again in an hour.');
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

-- Page size is capped at 50. Age-range matching replaces this function in Phase 2.
CREATE OR REPLACE FUNCTION public.get_recommendations(p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me public.profiles%ROWTYPE;
  v_pp public.partner_preferences%ROWTYPE;
  v_adv boolean := public.has_feature('advanced_matchmaking');
BEGIN
  IF NOT public.has_feature('recommendations') THEN RAISE EXCEPTION 'FEATURE_LOCKED'; END IF;
  SELECT * INTO v_me FROM public.profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN RETURN '[]'::jsonb; END IF;
  SELECT * INTO v_pp FROM public.partner_preferences WHERE profile_id = v_me.id;

  RETURN COALESCE((
    SELECT jsonb_agg(public.profile_card_json(p) || jsonb_build_object('match_percent', q.score) ORDER BY q.score DESC, p.id)
    FROM (
      SELECT s.pid, s.score FROM (
        SELECT t.id AS pid,
          LEAST(100, round(
            (CASE WHEN v_adv THEN
               0.6 * public.pref_score(v_pp, t)
             + 0.25 * COALESCE((SELECT public.pref_score(tp, v_me) FROM public.partner_preferences tp WHERE tp.profile_id = t.id), 50)
             + 0.10 * COALESCE(t.completion_percentage, 0)
             + 0.05 * (CASE WHEN t.updated_at > now() - interval '30 days' THEN 100 WHEN t.updated_at > now() - interval '90 days' THEN 50 ELSE 0 END)
             ELSE public.pref_score(v_pp, t) END)
            + (CASE WHEN t.listing_priority >= 3 THEN 5 ELSE 0 END)))::int AS score
        FROM public.profiles t
        WHERE t.profile_status = 'approved' AND t.id <> v_me.id AND t.profile_visibility <> 'hidden'
          AND (v_me.gender = 'other' OR t.gender = (CASE v_me.gender WHEN 'male' THEN 'female' ELSE 'male' END)::public.gender_type)
          AND NOT EXISTS (SELECT 1 FROM public.user_blocks b
                          WHERE (b.blocker_profile_id = v_me.id AND b.blocked_profile_id = t.id)
                             OR (b.blocker_profile_id = t.id AND b.blocked_profile_id = v_me.id))
      ) s
      ORDER BY s.score DESC, s.pid
      LIMIT LEAST(GREATEST(p_limit, 1), 50) OFFSET GREATEST(p_offset, 0)
    ) q JOIN public.profiles p ON p.id = q.pid
  ), '[]'::jsonb);
END;
$$;

-- ─── Web push: only real push services may be stored as endpoints (SSRF) ────
CREATE OR REPLACE FUNCTION public.save_push_subscription(
  p_endpoint text, p_p256dh text, p_auth text, p_user_agent text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in.' USING ERRCODE = '42501'; END IF;
  IF length(p_endpoint) > 2048
     OR p_endpoint !~ '^https://(fcm\.googleapis\.com|android\.googleapis\.com|([a-z0-9-]+\.)*push\.services\.mozilla\.com|([a-z0-9-]+\.)*notify\.windows\.com|([a-z0-9-]+\.)*push\.apple\.com)/' THEN
    RAISE EXCEPTION 'Invalid endpoint.';
  END IF;
  INSERT INTO public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  VALUES (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 300))
  ON CONFLICT (endpoint) DO UPDATE
    SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent, created_at = now();
  RETURN true;
END;
$$;
