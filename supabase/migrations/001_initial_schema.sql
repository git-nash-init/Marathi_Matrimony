-- ============================================================================
-- SUPABASE POSTGRESQL DATABASE FOUNDATION: MARATHI + ENGLISH MATRIMONIAL
-- MIGRATION: 001_initial_schema.sql
-- ============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL, -- References auth.users(id) once auth is integrated
    profile_id TEXT UNIQUE NOT NULL,
    profile_for TEXT, -- 'myself', 'son', 'daughter', 'brother', 'sister', 'friend', 'relative'
    gender TEXT, -- 'male', 'female'
    date_of_birth DATE,
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    height_cm INTEGER,
    marital_status TEXT, -- 'never_married', 'divorced', 'widowed', 'awaiting_divorce'
    mother_tongue TEXT DEFAULT 'Marathi',
    religion TEXT DEFAULT 'Hindu',
    community TEXT, -- Caste: Maratha, Kokanastha Brahmin, Deshastha Brahmin, CKP, etc.
    sub_community TEXT, -- Sub-caste / 96 Kuli / Gotra / Shakha
    manglik_status TEXT, -- 'non_manglik', 'manglik', 'anshik_manglik', 'dont_know'
    horoscope_available BOOLEAN DEFAULT FALSE,
    about_me TEXT,
    city TEXT,
    district TEXT,
    state TEXT DEFAULT 'Maharashtra',
    country TEXT DEFAULT 'India',
    education TEXT,
    college TEXT,
    occupation TEXT,
    company TEXT,
    annual_income NUMERIC,
    employment_type TEXT, -- 'private', 'government', 'business', 'defence', 'self_employed', 'not_working'
    diet TEXT, -- 'vegetarian', 'non_vegetarian', 'eggetarian', 'jain', 'vegan'
    smoking TEXT, -- 'no', 'yes', 'occasionally'
    drinking TEXT, -- 'no', 'yes', 'occasionally'
    fitness TEXT,
    family_type TEXT, -- 'nuclear', 'joint'
    family_values TEXT, -- 'traditional', 'moderate', 'liberal'
    father_occupation TEXT,
    mother_occupation TEXT,
    siblings_count INTEGER DEFAULT 0,
    profile_photo_url TEXT,
    profile_status TEXT DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'rejected', 'suspended'
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified', 'rejected'
    is_active BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_height_positive CHECK (height_cm IS NULL OR height_cm > 0),
    CONSTRAINT chk_annual_income_non_negative CHECK (annual_income IS NULL OR annual_income >= 0),
    CONSTRAINT chk_siblings_count_non_negative CHECK (siblings_count IS NULL OR siblings_count >= 0)
);

-- Comments
COMMENT ON TABLE public.profiles IS 'Core matrimonial member profiles with personal, cultural, educational, and family details.';
COMMENT ON COLUMN public.profiles.user_id IS 'Foreign key to auth.users(id) - populated upon Supabase Auth implementation.';

-- ============================================================================
-- 2. PROFILE PHOTOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profile_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    photo_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_sort_order_non_negative CHECK (sort_order >= 0)
);

COMMENT ON TABLE public.profile_photos IS 'Gallery photos associated with matrimonial profiles with privacy and moderation controls.';

-- ============================================================================
-- 3. PARTNER PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.partner_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    min_age INTEGER,
    max_age INTEGER,
    min_height_cm INTEGER,
    max_height_cm INTEGER,
    marital_status TEXT,
    religion TEXT,
    community TEXT,
    sub_community TEXT,
    education TEXT,
    occupation TEXT,
    min_income NUMERIC,
    max_income NUMERIC,
    country TEXT DEFAULT 'India',
    state TEXT,
    city TEXT,
    diet TEXT,
    smoking TEXT,
    drinking TEXT,
    manglik_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validation Constraints
    CONSTRAINT chk_pref_min_age CHECK (min_age IS NULL OR min_age >= 18),
    CONSTRAINT chk_pref_age_range CHECK (min_age IS NULL OR max_age IS NULL OR max_age >= min_age),
    CONSTRAINT chk_pref_min_height CHECK (min_height_cm IS NULL OR min_height_cm > 0),
    CONSTRAINT chk_pref_height_range CHECK (min_height_cm IS NULL OR max_height_cm IS NULL OR max_height_cm >= min_height_cm),
    CONSTRAINT chk_pref_min_income CHECK (min_income IS NULL OR min_income >= 0),
    CONSTRAINT chk_pref_income_range CHECK (min_income IS NULL OR max_income IS NULL OR max_income >= min_income)
);

-- ============================================================================
-- 4. EDUCATION OPTIONS TABLE (LOOKUP / MASTER)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.education_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_mr TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- ============================================================================
-- 5. OCCUPATION OPTIONS TABLE (LOOKUP / MASTER)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.occupation_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_mr TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- ============================================================================
-- 6. LOCATION OPTIONS TABLE (LOOKUP / MASTER)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.location_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country TEXT DEFAULT 'India',
    state TEXT,
    district TEXT,
    city TEXT,
    name_en TEXT,
    name_mr TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 7. COMMUNITY OPTIONS TABLE (LOOKUP / MASTER)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.community_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_mr TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- ============================================================================
-- 8. INTERESTS TABLE (MATCHMAKING INTENT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent self-interest
    CONSTRAINT chk_interests_no_self CHECK (sender_profile_id <> receiver_profile_id),
    -- Prevent duplicate interests between same pair
    CONSTRAINT uq_interest_sender_receiver UNIQUE (sender_profile_id, receiver_profile_id)
);

-- ============================================================================
-- 9. SHORTLISTS TABLE (SAVED PROFILES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shortlisted_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent self-shortlisting
    CONSTRAINT chk_shortlist_no_self CHECK (profile_id <> shortlisted_profile_id),
    -- Prevent duplicate shortlist
    CONSTRAINT uq_shortlist_profile_pair UNIQUE (profile_id, shortlisted_profile_id)
);

-- ============================================================================
-- 10. PROFILE VIEWS TABLE (ANALYTICS / AUDIT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent self-view log
    CONSTRAINT chk_view_no_self CHECK (viewer_profile_id <> viewed_profile_id)
);

-- ============================================================================
-- 11. BLOCKED PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blocked_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent self-blocking
    CONSTRAINT chk_block_no_self CHECK (profile_id <> blocked_profile_id),
    -- Prevent duplicate blocks
    CONSTRAINT uq_block_profile_pair UNIQUE (profile_id, blocked_profile_id)
);

-- ============================================================================
-- 12. PROFILE REPORTS TABLE (MODERATION)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profile_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT, -- 'fake_profile', 'inappropriate_photos', 'harassment', 'incorrect_information', 'other'
    description TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent self-reporting
    CONSTRAINT chk_report_no_self CHECK (reporter_profile_id <> reported_profile_id)
);

-- ============================================================================
-- 13. SUBSCRIPTION PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_mr TEXT NOT NULL,
    description_en TEXT,
    description_mr TEXT,
    duration_days INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    max_interests INTEGER,
    can_view_contact BOOLEAN DEFAULT FALSE,
    can_send_unlimited_interest BOOLEAN DEFAULT FALSE,
    can_view_profile_views BOOLEAN DEFAULT FALSE,
    can_use_advanced_search BOOLEAN DEFAULT FALSE,
    can_send_messages BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_duration_days_non_negative CHECK (duration_days >= 0),
    CONSTRAINT chk_plan_price_non_negative CHECK (price >= 0)
);

-- ============================================================================
-- 14. SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT DEFAULT 'inactive', -- 'active', 'expired', 'inactive', 'cancelled'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 15. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_gateway TEXT, -- 'razorpay', 'manual_offline', etc.
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    gateway_signature TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_payment_amount_non_negative CHECK (amount >= 0)
);

-- ============================================================================
-- 16. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'interest_received', 'interest_accepted', 'profile_view', 'verification_update', 'system'
    title_en TEXT,
    title_mr TEXT,
    message_en TEXT,
    message_mr TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 17. SUCCESS STORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT,
    title_mr TEXT,
    description_en TEXT,
    description_mr TEXT,
    image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR FREQUENTLY SEARCHED FIELDS & FOREIGN KEYS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_dob ON public.profiles(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_religion ON public.profiles(religion);
CREATE INDEX IF NOT EXISTS idx_profiles_community ON public.profiles(community);
CREATE INDEX IF NOT EXISTS idx_profiles_education ON public.profiles(education);
CREATE INDEX IF NOT EXISTS idx_profiles_occupation ON public.profiles(occupation);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(profile_status);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON public.profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_active_visible ON public.profiles(is_active, is_visible);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_photos_profile_id ON public.profile_photos(profile_id);
CREATE INDEX IF NOT EXISTS idx_partner_pref_profile_id ON public.partner_preferences(profile_id);

CREATE INDEX IF NOT EXISTS idx_interests_sender ON public.interests(sender_profile_id);
CREATE INDEX IF NOT EXISTS idx_interests_receiver ON public.interests(receiver_profile_id);
CREATE INDEX IF NOT EXISTS idx_interests_status ON public.interests(status);

CREATE INDEX IF NOT EXISTS idx_shortlists_profile ON public.shortlists(profile_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_shortlisted ON public.shortlists(shortlisted_profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON public.profile_views(viewer_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON public.profile_views(viewed_profile_id);

CREATE INDEX IF NOT EXISTS idx_blocked_profile ON public.blocked_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_blocked_target ON public.blocked_profiles(blocked_profile_id);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.profile_reports(reporter_profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON public.profile_reports(reported_profile_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_profile ON public.subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date);

CREATE INDEX IF NOT EXISTS idx_payments_profile ON public.payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(profile_id, is_read);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) FOUNDATION
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_options ENABLE ROW LEVEL SECURITY;

-- Public Master/Lookup Tables: Read-only access for all clients
CREATE POLICY "Public lookup: education_options read" ON public.education_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public lookup: occupation_options read" ON public.occupation_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public lookup: location_options read" ON public.location_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public lookup: community_options read" ON public.community_options FOR SELECT USING (is_active = true);
CREATE POLICY "Public lookup: subscription_plans read" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Public lookup: success_stories read" ON public.success_stories FOR SELECT USING (is_published = true);

-- Profiles & Sensitive Tables:
-- When Auth is activated in Step 3, policies will bind auth.uid() to user_id.
-- Currently, RLS is enabled with zero open leak policies.

-- ============================================================================
-- HELPER TRIGGERS: AUTOMATIC updated_at TIMESTAMP REFRESH
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_partner_preferences_updated_at
BEFORE UPDATE ON public.partner_preferences
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_interests_updated_at
BEFORE UPDATE ON public.interests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_profile_reports_updated_at
BEFORE UPDATE ON public.profile_reports
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_success_stories_updated_at
BEFORE UPDATE ON public.success_stories
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
