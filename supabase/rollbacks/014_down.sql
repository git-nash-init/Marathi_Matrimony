-- Rolls back the Phase 2 database changes (migrations 014a to 014g).
-- Replaced functions (get_recommendations, get_new_profiles, get_my_interests, get_my_viewed_profiles,
-- get_my_profile_visitors, get_my_contact_viewers, get_my_contact_unlocks, get_contact_if_unlocked,
-- unlock_profile_contact, record_profile_view, get_profile_documents, guard_profile_system_columns,
-- handle_profile_updated) keep working after this script; their pre-014 bodies are in
-- supabase/baseline/live_schema_2026-11-05.sql if you want them back exactly.

DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
CREATE POLICY profiles_select_policy ON public.profiles FOR SELECT TO authenticated
  USING (profile_status = 'approved' OR user_id = auth.uid() OR public.is_admin());

SELECT cron.unschedule('refresh-profile-ages');
DROP INDEX IF EXISTS public.idx_profiles_approved_gender_dob;
DROP INDEX IF EXISTS public.idx_user_blocks_blocked;

DROP FUNCTION IF EXISTS public.search_profiles(jsonb, integer, integer);
DROP FUNCTION IF EXISTS public.get_my_match_band();
DROP FUNCTION IF EXISTS public.block_member(uuid);
DROP FUNCTION IF EXISTS public.unblock_member(uuid);
DROP FUNCTION IF EXISTS public.get_my_blocked_members();
DROP FUNCTION IF EXISTS public.profile_listing_json(public.profiles);
DROP FUNCTION IF EXISTS public.like_pattern(text);
DROP FUNCTION IF EXISTS public.jsonb_text(jsonb, text, integer);
DROP FUNCTION IF EXISTS public.jsonb_int(jsonb, text);
-- Keep is_blocked_with, age_years, match_age_gap and is_age_in_range while the functions above
-- still use them; drop them last.
DELETE FROM public.platform_settings WHERE key = 'match_age_gap';
