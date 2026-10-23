-- ============================================================================
-- SUPABASE POSTGRESQL AUTHENTICATION & USER PROFILE OWNERSHIP RLS
-- MIGRATION: 003_auth_rls.sql
-- ============================================================================

-- 1. Ensure foreign key constraint from profiles.user_id to auth.users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_profiles_user_id' AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT fk_profiles_user_id
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Duplicate Profile Protection: Ensure at most one profile per auth user
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_user_id 
ON public.profiles (user_id) 
WHERE user_id IS NOT NULL;

-- 3. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to recreate cleanly and avoid conflicts
DROP POLICY IF EXISTS "Public can view approved and visible profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view active and visible profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- SELECT: Authenticated user can view their own profile (even if draft/hidden)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- SELECT: Public (anon and authenticated) can view approved, visible profiles
CREATE POLICY "Public can view approved and visible profiles"
ON public.profiles
FOR SELECT
TO authenticated, anon
USING (is_active = true AND is_visible = true AND profile_status = 'approved');

-- INSERT: Authenticated user can insert ONLY a profile where user_id matches auth.uid()
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Authenticated user can update ONLY their own profile and cannot change user_id
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Authenticated user can delete ONLY their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- PARTNER PREFERENCES POLICIES
-- ============================================================================
ALTER TABLE public.partner_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own partner preferences" ON public.partner_preferences;
DROP POLICY IF EXISTS "Users can insert own partner preferences" ON public.partner_preferences;
DROP POLICY IF EXISTS "Users can update own partner preferences" ON public.partner_preferences;
DROP POLICY IF EXISTS "Users can delete own partner preferences" ON public.partner_preferences;

CREATE POLICY "Users can view own partner preferences"
ON public.partner_preferences
FOR SELECT
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own partner preferences"
ON public.partner_preferences
FOR INSERT
TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own partner preferences"
ON public.partner_preferences
FOR UPDATE
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own partner preferences"
ON public.partner_preferences
FOR DELETE
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- PROFILE PHOTOS POLICIES
-- ============================================================================
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own photos" ON public.profile_photos;
DROP POLICY IF EXISTS "Public can view approved photos of visible profiles" ON public.profile_photos;

CREATE POLICY "Users can manage own photos"
ON public.profile_photos
FOR ALL
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Public can view approved photos of visible profiles"
ON public.profile_photos
FOR SELECT
TO authenticated, anon
USING (
    is_approved = true AND
    profile_id IN (SELECT id FROM public.profiles WHERE is_active = true AND is_visible = true AND profile_status = 'approved')
);

-- ============================================================================
-- SHORTLISTS POLICIES
-- ============================================================================
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own shortlists" ON public.shortlists;

CREATE POLICY "Users can manage own shortlists"
ON public.shortlists
FOR ALL
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- INTERESTS POLICIES
-- ============================================================================
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view involved interests" ON public.interests;
DROP POLICY IF EXISTS "Users can send interests" ON public.interests;
DROP POLICY IF EXISTS "Receivers can update interest status" ON public.interests;

CREATE POLICY "Users can view involved interests"
ON public.interests
FOR SELECT
TO authenticated
USING (
    sender_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    receiver_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can send interests"
ON public.interests
FOR INSERT
TO authenticated
WITH CHECK (
    sender_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Receivers can update interest status"
ON public.interests
FOR UPDATE
TO authenticated
USING (
    receiver_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    sender_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
