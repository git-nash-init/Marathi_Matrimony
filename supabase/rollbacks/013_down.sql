-- Rolls back 013_phase1_foundation.sql.
-- NOT reversible: full Aadhaar numbers erased by 013 cannot be restored, and verification_status
-- changes are not undone. The aadhaar_last4 column is kept. Auto-approval stays off.

-- Storage
DROP POLICY IF EXISTS photo_bucket_update_policy ON storage.objects;
CREATE POLICY "Allow auth update to profile-photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos') WITH CHECK (bucket_id = 'profile-photos');
CREATE POLICY "Allow auth uploads to profile-photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos');

-- Rate limiting
DROP TRIGGER IF EXISTS trg_contact_rate_limit ON public.contact_inquiries;
DROP FUNCTION IF EXISTS public.limit_contact_inquiries();
SELECT cron.unschedule('purge-rate-limits');

-- Policies
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS contacts_owner_policy ON public.profile_contacts;
DROP POLICY IF EXISTS contacts_admin_read_policy ON public.profile_contacts;
CREATE POLICY contacts_insert_update_policy ON public.profile_contacts FOR ALL TO authenticated
  USING (profile_id = public.get_my_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS preferences_owner_modify_policy ON public.partner_preferences;
CREATE POLICY preferences_owner_modify_policy ON public.partner_preferences FOR ALL TO authenticated
  USING (profile_id = public.get_my_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS photos_owner_manage_policy ON public.profile_photos;
CREATE POLICY photos_owner_manage_policy ON public.profile_photos FOR ALL TO authenticated
  USING (profile_id = public.get_my_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS user_blocks_manage_policy ON public.user_blocks;
CREATE POLICY user_blocks_manage_policy ON public.user_blocks FOR ALL TO authenticated
  USING (blocker_profile_id = public.get_my_profile_id() OR public.is_admin());

DROP POLICY IF EXISTS plans_select_policy ON public.subscription_plans;
CREATE POLICY plans_select_policy ON public.subscription_plans FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS admin_users_manage_policy ON public.admin_users;
CREATE POLICY admin_users_manage_policy ON public.admin_users FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS platform_settings_admin_policy ON public.platform_settings;
CREATE POLICY platform_settings_admin_policy ON public.platform_settings FOR ALL TO authenticated USING (public.is_admin());

DROP TRIGGER IF EXISTS trg_guard_last_super_admin ON public.admin_users;
DROP FUNCTION IF EXISTS public.guard_last_super_admin();

-- Admin checks: drop the MFA and role layer. The role-checking admin_* functions keep working
-- because require_admin_role falls back to this is_admin; restore them from 011 for a full undo.
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p_user_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_user_id AND is_active)
     AND (p_user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active));
$$;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile_id() TO anon;
GRANT EXECUTE ON FUNCTION public.get_vapid_public_key() TO anon;

DELETE FROM public.platform_settings WHERE key = 'admin_mfa_required';
-- Re-grants on profiles for anon are deliberately not restored: guests never needed them.
