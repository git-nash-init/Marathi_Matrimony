-- ============================================================================
-- SUPABASE POSTGRESQL DISCOVERY, SHORTLISTS, INTERESTS, BLOCKS & REPORTS
-- MIGRATION: 005_discovery_interactions.sql
-- ============================================================================

-- 1. Ensure RLS is enabled on all interaction tables
ALTER TABLE IF EXISTS public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blocked_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profile_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profile_views ENABLE ROW LEVEL SECURITY;

-- 2. BLOCKED PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own blocked profiles" ON public.blocked_profiles;
DROP POLICY IF EXISTS "Users can block profiles" ON public.blocked_profiles;
DROP POLICY IF EXISTS "Users can unblock profiles" ON public.blocked_profiles;

CREATE POLICY "Users can view their own blocked profiles"
ON public.blocked_profiles
FOR SELECT
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can block profiles"
ON public.blocked_profiles
FOR INSERT
TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can unblock profiles"
ON public.blocked_profiles
FOR DELETE
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 3. PROFILE REPORTS POLICIES
DROP POLICY IF EXISTS "Users can create profile reports" ON public.profile_reports;
DROP POLICY IF EXISTS "Users can view own submitted reports" ON public.profile_reports;

CREATE POLICY "Users can create profile reports"
ON public.profile_reports
FOR INSERT
TO authenticated
WITH CHECK (reporter_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own submitted reports"
ON public.profile_reports
FOR SELECT
TO authenticated
USING (reporter_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 4. PROFILE VIEWS POLICIES
DROP POLICY IF EXISTS "Users can record profile views" ON public.profile_views;
DROP POLICY IF EXISTS "Users can view own profile view history" ON public.profile_views;

CREATE POLICY "Users can record profile views"
ON public.profile_views
FOR INSERT
TO authenticated
WITH CHECK (viewer_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own profile view history"
ON public.profile_views
FOR SELECT
TO authenticated
USING (viewer_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 5. DISCOVERY & SEARCH INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_discovery_active 
ON public.profiles (is_active, is_visible, profile_status) 
WHERE is_active = true AND is_visible = true;

CREATE INDEX IF NOT EXISTS idx_profiles_gender 
ON public.profiles (gender);

CREATE INDEX IF NOT EXISTS idx_profiles_marital_status 
ON public.profiles (marital_status);

CREATE INDEX IF NOT EXISTS idx_profiles_religion_community 
ON public.profiles (religion, community);

CREATE INDEX IF NOT EXISTS idx_profiles_location 
ON public.profiles (state, district, city);

CREATE INDEX IF NOT EXISTS idx_profiles_verification_status 
ON public.profiles (verification_status);

CREATE INDEX IF NOT EXISTS idx_profiles_height 
ON public.profiles (height_cm);

CREATE INDEX IF NOT EXISTS idx_profiles_annual_income 
ON public.profiles (annual_income);

CREATE INDEX IF NOT EXISTS idx_interests_participants 
ON public.interests (sender_profile_id, receiver_profile_id, status);

CREATE INDEX IF NOT EXISTS idx_shortlists_lookup 
ON public.shortlists (profile_id, shortlisted_profile_id);

CREATE INDEX IF NOT EXISTS idx_blocked_profiles_lookup 
ON public.blocked_profiles (profile_id, blocked_profile_id);
