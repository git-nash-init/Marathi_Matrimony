-- ============================================================================
-- SUPABASE POSTGRESQL PROFILE BUILDER ENHANCEMENTS
-- MIGRATION: 004_profile_builder_enhancements.sql
-- ============================================================================

-- Add non-breaking columns to profiles table for full matrimonial depth
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS native_place TEXT,
ADD COLUMN IF NOT EXISTS native_city TEXT,
ADD COLUMN IF NOT EXISTS native_district TEXT,
ADD COLUMN IF NOT EXISTS native_state TEXT DEFAULT 'Maharashtra',
ADD COLUMN IF NOT EXISTS brothers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sisters_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hobbies TEXT,
ADD COLUMN IF NOT EXISTS work_location TEXT,
ADD COLUMN IF NOT EXISTS personality TEXT,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Comments
COMMENT ON COLUMN public.profiles.native_place IS 'Original ancestral hometown / native place in Maharashtra or other states.';
COMMENT ON COLUMN public.profiles.hobbies IS 'Comma-separated or list of member lifestyle interests and hobbies.';
COMMENT ON COLUMN public.profiles.completion_percentage IS 'Live profile completion metric (0-100%).';
