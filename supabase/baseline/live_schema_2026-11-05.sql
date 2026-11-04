-- Reference only: what the LIVE database looked like on 2026-11-05, after migration 013.
-- Migrations 001-012 do not rebuild it (17 tables were created outside them), so use this file to see
-- the real schema. Do NOT run it on the live project. Generated from the Postgres catalog; it lists
-- tables, constraints, indexes, policies, functions and triggers, but not grants, extensions or data.

CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role admin_role_type NOT NULL DEFAULT 'moderator'::admin_role_type,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_user_id_key UNIQUE (user_id),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id),
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_role text NOT NULL DEFAULT 'system'::text,
  action text NOT NULL,
  target_entity text NOT NULL,
  target_id text NOT NULL,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contact_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING'::text,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  priority boolean NOT NULL DEFAULT false,
  CONSTRAINT contact_inquiries_pkey PRIMARY KEY (id),
  CONSTRAINT contact_inquiries_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'IN_PROGRESS'::text, 'RESOLVED'::text, 'SPAM'::text])))
);
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.contact_unlocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  unlocker_profile_id uuid NOT NULL,
  unlocked_profile_id uuid NOT NULL,
  subscription_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_contact_unlock_pair UNIQUE (unlocker_profile_id, unlocked_profile_id),
  CONSTRAINT contact_unlocks_pkey PRIMARY KEY (id),
  CONSTRAINT contact_unlocks_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  CONSTRAINT contact_unlocks_unlocked_profile_id_fkey FOREIGN KEY (unlocked_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT contact_unlocks_unlocker_profile_id_fkey FOREIGN KEY (unlocker_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_different_unlock_users CHECK ((unlocker_profile_id <> unlocked_profile_id))
);
ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conversation_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  last_read_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_conversation_user UNIQUE (conversation_id, user_id),
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT conversation_participants_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_one_id uuid NOT NULL,
  participant_two_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  last_message_text text,
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_conversation_pair UNIQUE (participant_one_id, participant_two_id),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_participant_one_id_fkey FOREIGN KEY (participant_one_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT conversations_participant_two_id_fkey FOREIGN KEY (participant_two_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_diff_participants CHECK ((participant_one_id <> participant_two_id)),
  CONSTRAINT conversations_status_check CHECK ((status = ANY (ARRAY['active'::text, 'archived'::text, 'blocked'::text, 'closed'::text])))
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  discount_type discount_type_enum NOT NULL DEFAULT 'percentage'::discount_type_enum,
  discount_value numeric(10,2) NOT NULL,
  max_uses integer NOT NULL DEFAULT 100,
  used_count integer NOT NULL DEFAULT 0,
  valid_from timestamp with time zone NOT NULL DEFAULT now(),
  valid_until timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coupons_code_key UNIQUE (code),
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT chk_coupon_validity_dates CHECK ((valid_until > valid_from)),
  CONSTRAINT coupons_discount_value_check CHECK ((discount_value > (0)::numeric))
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.interests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_profile_id uuid NOT NULL,
  receiver_profile_id uuid NOT NULL,
  status interest_status_type NOT NULL DEFAULT 'pending'::interest_status_type,
  custom_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_interest_pair UNIQUE (sender_profile_id, receiver_profile_id),
  CONSTRAINT interests_pkey PRIMARY KEY (id),
  CONSTRAINT interests_receiver_profile_id_fkey FOREIGN KEY (receiver_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT interests_sender_profile_id_fkey FOREIGN KEY (sender_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_different_interest_users CHECK ((sender_profile_id <> receiver_profile_id))
);
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  sender_profile_id uuid NOT NULL,
  message_text text NOT NULL,
  message_type text NOT NULL DEFAULT 'text'::text,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_profile_id_fkey FOREIGN KEY (sender_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT messages_message_text_check CHECK (((char_length(message_text) > 0) AND (char_length(message_text) <= 2000))),
  CONSTRAINT messages_message_type_check CHECK ((message_type = ANY (ARRAY['text'::text, 'system'::text])))
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.moderation_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_profile_id uuid NOT NULL,
  reported_profile_id uuid NOT NULL,
  conversation_id uuid,
  message_id uuid,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT moderation_reports_pkey PRIMARY KEY (id),
  CONSTRAINT moderation_reports_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
  CONSTRAINT moderation_reports_message_id_fkey FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
  CONSTRAINT moderation_reports_reported_profile_id_fkey FOREIGN KEY (reported_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT moderation_reports_reporter_profile_id_fkey FOREIGN KEY (reporter_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT moderation_reports_status_check CHECK ((status = ANY (ARRAY['open'::text, 'reviewing'::text, 'resolved'::text, 'dismissed'::text])))
);
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.partner_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  min_age integer NOT NULL DEFAULT 18,
  max_age integer NOT NULL DEFAULT 60,
  min_height integer NOT NULL DEFAULT 140,
  max_height integer NOT NULL DEFAULT 220,
  preferred_cities text[] DEFAULT ARRAY[]::text[],
  preferred_states text[] DEFAULT ARRAY['Maharashtra'::text],
  preferred_education text[] DEFAULT ARRAY[]::text[],
  preferred_occupation text[] DEFAULT ARRAY[]::text[],
  preferred_religion text[] DEFAULT ARRAY['Hindu'::text],
  preferred_community text[] DEFAULT ARRAY[]::text[],
  preferred_marital_status marital_status_type[] DEFAULT ARRAY['never_married'::marital_status_type],
  other_preferences text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  preferred_diet text[] NOT NULL DEFAULT '{}'::text[],
  min_income text,
  CONSTRAINT partner_preferences_profile_id_key UNIQUE (profile_id),
  CONSTRAINT partner_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT partner_preferences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT partner_preferences_check CHECK ((max_age >= min_age)),
  CONSTRAINT partner_preferences_check1 CHECK ((max_height >= min_height)),
  CONSTRAINT partner_preferences_min_age_check CHECK ((min_age >= 18)),
  CONSTRAINT partner_preferences_min_height_check CHECK ((min_height >= 100))
);
ALTER TABLE public.partner_preferences ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid,
  gateway text NOT NULL DEFAULT 'razorpay'::text,
  gateway_order_id text NOT NULL,
  gateway_payment_id text,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR'::text,
  status payment_status_type NOT NULL DEFAULT 'created'::payment_status_type,
  payment_method text,
  paid_at timestamp with time zone,
  raw_response jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  plan_id uuid,
  CONSTRAINT payments_gateway_order_id_key UNIQUE (gateway_order_id),
  CONSTRAINT payments_gateway_payment_id_key UNIQUE (gateway_payment_id),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT payments_amount_check CHECK ((amount >= (0)::numeric))
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.platform_settings (
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT platform_settings_pkey PRIMARY KEY (key),
  CONSTRAINT platform_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profile_boosts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  status boost_status_type NOT NULL DEFAULT 'active'::boost_status_type,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profile_boosts_pkey PRIMARY KEY (id),
  CONSTRAINT profile_boosts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.profile_boosts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profile_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  phone_number text,
  whatsapp_number text,
  email text NOT NULL,
  address_line text,
  contact_person text DEFAULT 'Self'::text,
  convenient_time_to_call text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profile_contacts_profile_id_key UNIQUE (profile_id),
  CONSTRAINT profile_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT profile_contacts_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.profile_contacts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profile_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  doc_type text NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  size_bytes integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profile_documents_profile_id_doc_type_key UNIQUE (profile_id, doc_type),
  CONSTRAINT profile_documents_pkey PRIMARY KEY (id),
  CONSTRAINT profile_documents_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_documents_doc_type_check CHECK ((doc_type = ANY (ARRAY['biodata'::text, 'horoscope'::text, 'education'::text]))),
  CONSTRAINT profile_documents_size_bytes_check CHECK ((size_bytes <= 5242880))
);
ALTER TABLE public.profile_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profile_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  storage_path text NOT NULL,
  photo_type text NOT NULL DEFAULT 'avatar'::text,
  is_primary boolean NOT NULL DEFAULT false,
  visibility photo_visibility_type NOT NULL DEFAULT 'public'::photo_visibility_type,
  approval_status photo_approval_type NOT NULL DEFAULT 'pending'::photo_approval_type,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profile_photos_pkey PRIMARY KEY (id),
  CONSTRAINT profile_photos_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  viewer_profile_id uuid NOT NULL,
  viewed_profile_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profile_views_pkey PRIMARY KEY (id),
  CONSTRAINT profile_views_viewed_profile_id_fkey FOREIGN KEY (viewed_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT profile_views_viewer_profile_id_fkey FOREIGN KEY (viewer_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_different_view_users CHECK ((viewer_profile_id <> viewed_profile_id))
);
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_id text NOT NULL DEFAULT generate_public_profile_id(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  gender gender_type NOT NULL,
  date_of_birth date,
  age integer,
  marital_status marital_status_type NOT NULL DEFAULT 'never_married'::marital_status_type,
  height integer,
  religion text NOT NULL DEFAULT 'Hindu'::text,
  community text,
  sub_community text,
  gothra text,
  mother_tongue text NOT NULL DEFAULT 'Marathi'::text,
  languages_spoken text[] DEFAULT ARRAY['Marathi'::text],
  education text,
  education_detail text,
  occupation text,
  employed_in text NOT NULL DEFAULT 'Private Sector'::text,
  company text,
  income text,
  city text,
  state text NOT NULL DEFAULT 'Maharashtra'::text,
  country text NOT NULL DEFAULT 'India'::text,
  diet text NOT NULL DEFAULT 'Vegetarian'::text,
  smoking text DEFAULT 'No'::text,
  drinking text DEFAULT 'No'::text,
  about_me text,
  profile_status profile_status_type NOT NULL DEFAULT 'draft'::profile_status_type,
  verification_status verification_status_type NOT NULL DEFAULT 'unverified'::verification_status_type,
  profile_visibility profile_visibility_type NOT NULL DEFAULT 'registered_only'::profile_visibility_type,
  is_featured boolean NOT NULL DEFAULT false,
  featured_until timestamp with time zone,
  created_by text NOT NULL DEFAULT 'Self'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  college text,
  additional_qualifications text,
  work_location text,
  family_type text DEFAULT 'Nuclear'::text,
  family_status text DEFAULT 'Middle Class'::text,
  father_occupation text,
  mother_occupation text,
  brothers_count integer DEFAULT 0,
  sisters_count integer DEFAULT 0,
  married_brothers_count integer DEFAULT 0,
  married_sisters_count integer DEFAULT 0,
  family_location text,
  family_description text,
  hobbies text[] DEFAULT ARRAY[]::text[],
  lifestyle_interests text[] DEFAULT ARRAY[]::text[],
  rejection_reason text,
  completion_percentage integer DEFAULT 20,
  avatar_url text,
  photos text[] DEFAULT '{}'::text[],
  photos_hidden boolean DEFAULT false,
  aadhaar_number text,
  listing_priority smallint NOT NULL DEFAULT 0,
  approved_at timestamp with time zone,
  aadhaar_last4 text,
  CONSTRAINT profiles_profile_id_key UNIQUE (profile_id),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT check_dob_valid CHECK ((date_of_birth <= (CURRENT_DATE - '18 years'::interval))),
  CONSTRAINT profiles_aadhaar_last4_format CHECK ((aadhaar_last4 ~ '^\d{4}$'::text)),
  CONSTRAINT profiles_about_me_check CHECK ((char_length(about_me) >= 20)),
  CONSTRAINT profiles_height_check CHECK (((height >= 100) AND (height <= 250)))
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_used_at timestamp with time zone,
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rate_limits (
  key text NOT NULL,
  window_start timestamp with time zone NOT NULL,
  hits integer NOT NULL DEFAULT 1,
  CONSTRAINT rate_limits_pkey PRIMARY KEY (key, window_start)
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status report_status_type NOT NULL DEFAULT 'pending'::report_status_type,
  admin_notes text,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT reports_reporter_user_id_fkey FOREIGN KEY (reporter_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT chk_different_report_users CHECK ((reporter_user_id <> reported_user_id))
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.shortlists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  shortlisted_profile_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_shortlist_pair UNIQUE (user_profile_id, shortlisted_profile_id),
  CONSTRAINT shortlists_pkey PRIMARY KEY (id),
  CONSTRAINT shortlists_shortlisted_profile_id_fkey FOREIGN KEY (shortlisted_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT shortlists_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_different_shortlist_users CHECK ((user_profile_id <> shortlisted_profile_id))
);
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  discounted_price numeric(10,2),
  duration_days integer NOT NULL,
  features jsonb NOT NULL DEFAULT '{"can_message": false, "message_limit": 0, "interest_limit": 10, "view_horoscope": false, "advanced_search": false, "featured_profile": false, "priority_support": false, "profile_boost_count": 0, "profile_views_limit": 50, "contact_unlock_limit": 0}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_slug_key UNIQUE (slug),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_plans_discounted_price_check CHECK ((discounted_price >= (0)::numeric)),
  CONSTRAINT subscription_plans_duration_days_check CHECK ((duration_days > 0)),
  CONSTRAINT subscription_plans_price_check CHECK ((price >= (0)::numeric))
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  status subscription_status_type NOT NULL DEFAULT 'active'::subscription_status_type,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  payment_id uuid,
  auto_renew boolean NOT NULL DEFAULT false,
  feature_usage jsonb NOT NULL DEFAULT '{"boosts_used": 0, "messages_sent": 0, "interests_sent": 0, "contacts_unlocked": 0}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_blocks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  blocker_profile_id uuid NOT NULL,
  blocked_profile_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_block UNIQUE (blocker_profile_id, blocked_profile_id),
  CONSTRAINT user_blocks_pkey PRIMARY KEY (id),
  CONSTRAINT user_blocks_blocked_profile_id_fkey FOREIGN KEY (blocked_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT user_blocks_blocker_profile_id_fkey FOREIGN KEY (blocker_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT chk_block_self CHECK ((blocker_profile_id <> blocked_profile_id))
);
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  payment_id uuid,
  amount_paid integer NOT NULL,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id),
  CONSTRAINT user_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text])))
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  verification_type verification_type_enum NOT NULL DEFAULT 'government_id'::verification_type_enum,
  status verification_status_type NOT NULL DEFAULT 'pending'::verification_status_type,
  document_paths text[] NOT NULL DEFAULT ARRAY[]::text[],
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  notes text,
  CONSTRAINT verifications_pkey PRIMARY KEY (id),
  CONSTRAINT verifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_type text NOT NULL,
  gateway text NOT NULL DEFAULT 'razorpay'::text,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'processed'::text,
  error_message text,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT webhook_events_event_id_key UNIQUE (event_id),
  CONSTRAINT webhook_events_pkey PRIMARY KEY (id),
  CONSTRAINT webhook_events_status_check CHECK ((status = ANY (ARRAY['processing'::text, 'processed'::text, 'failed'::text, 'ignored'::text])))
);
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_contact_inquiries_created ON public.contact_inquiries USING btree (created_at DESC);

CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries USING btree (status);

CREATE INDEX idx_contact_unlocks_unlocked ON public.contact_unlocks USING btree (unlocked_profile_id, created_at DESC);

CREATE INDEX idx_conversations_last_msg ON public.conversations USING btree (last_message_at DESC);

CREATE INDEX idx_conversations_participants ON public.conversations USING btree (participant_one_id, participant_two_id);

CREATE INDEX idx_interests_lookup ON public.interests USING btree (sender_profile_id, receiver_profile_id, status);

CREATE INDEX idx_interests_receiver ON public.interests USING btree (receiver_profile_id);

CREATE INDEX idx_interests_sender ON public.interests USING btree (sender_profile_id);

CREATE INDEX idx_interests_sender_sent ON public.interests USING btree (sender_profile_id, sent_at);

CREATE INDEX idx_interests_status ON public.interests USING btree (status);

CREATE INDEX idx_messages_conv_created ON public.messages USING btree (conversation_id, created_at);

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, is_read);

CREATE INDEX idx_participants_conv ON public.conversation_participants USING btree (conversation_id);

CREATE INDEX idx_participants_user ON public.conversation_participants USING btree (user_id);

CREATE INDEX idx_payments_order ON public.payments USING btree (gateway_order_id);

CREATE INDEX idx_payments_user ON public.payments USING btree (user_id);

CREATE INDEX idx_photos_profile_id ON public.profile_photos USING btree (profile_id);

CREATE INDEX idx_preferences_profile_id ON public.partner_preferences USING btree (profile_id);

CREATE INDEX idx_profile_views_lookup ON public.profile_views USING btree (viewer_profile_id, viewed_profile_id, created_at DESC);

CREATE INDEX idx_profile_views_target ON public.profile_views USING btree (viewed_profile_id);

CREATE INDEX idx_profile_views_viewed ON public.profile_views USING btree (viewed_profile_id, created_at DESC);

CREATE INDEX idx_profile_views_viewer ON public.profile_views USING btree (viewer_profile_id);

CREATE INDEX idx_profiles_city ON public.profiles USING btree (city);

CREATE INDEX idx_profiles_community ON public.profiles USING btree (community);

CREATE INDEX idx_profiles_created_at ON public.profiles USING btree (created_at DESC) WHERE (profile_status = 'approved'::profile_status_type);

CREATE INDEX idx_profiles_dob ON public.profiles USING btree (date_of_birth);

CREATE INDEX idx_profiles_education ON public.profiles USING btree (education);

CREATE INDEX idx_profiles_education_occupation ON public.profiles USING btree (education, occupation, income) WHERE (profile_status = 'approved'::profile_status_type);

CREATE INDEX idx_profiles_featured ON public.profiles USING btree (is_featured) WHERE (is_featured = true);

CREATE INDEX idx_profiles_gender ON public.profiles USING btree (gender);

CREATE INDEX idx_profiles_listing ON public.profiles USING btree (listing_priority DESC, created_at DESC);

CREATE INDEX idx_profiles_marital_status ON public.profiles USING btree (marital_status);

CREATE INDEX idx_profiles_occupation ON public.profiles USING btree (occupation);

CREATE INDEX idx_profiles_religion ON public.profiles USING btree (religion);

CREATE INDEX idx_profiles_search_composite ON public.profiles USING btree (gender, profile_status, community, city, age);

CREATE INDEX idx_profiles_state ON public.profiles USING btree (state);

CREATE INDEX idx_profiles_status ON public.profiles USING btree (profile_status);

CREATE INDEX idx_profiles_verification ON public.profiles USING btree (verification_status);

CREATE INDEX idx_profiles_visibility ON public.profiles USING btree (profile_visibility);

CREATE INDEX idx_reports_reported ON public.reports USING btree (reported_user_id);

CREATE INDEX idx_shortlists_lookup ON public.shortlists USING btree (user_profile_id, shortlisted_profile_id);

CREATE INDEX idx_shortlists_target ON public.shortlists USING btree (shortlisted_profile_id);

CREATE INDEX idx_shortlists_user ON public.shortlists USING btree (user_profile_id);

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status, end_date);

CREATE INDEX idx_subscriptions_user ON public.subscriptions USING btree (user_id);

CREATE INDEX idx_unlocks_unlocker ON public.contact_unlocks USING btree (unlocker_profile_id);

CREATE INDEX idx_user_blocks_pair ON public.user_blocks USING btree (blocker_profile_id, blocked_profile_id);

CREATE INDEX idx_verifications_user ON public.verifications USING btree (user_id);

CREATE INDEX idx_webhook_events_event_id ON public.webhook_events USING btree (event_id);

CREATE INDEX idx_webhook_events_type ON public.webhook_events USING btree (event_type);

CREATE INDEX push_subscriptions_user_idx ON public.push_subscriptions USING btree (user_id);

CREATE UNIQUE INDEX uq_profile_primary_photo ON public.profile_photos USING btree (profile_id) WHERE (is_primary = true);

CREATE POLICY admin_users_manage_policy ON public.admin_users FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY admin_users_select_policy ON public.admin_users FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) OR is_admin()));

CREATE POLICY audit_logs_select_policy ON public.audit_logs FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY contact_inquiries_admin_select ON public.contact_inquiries FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY contact_inquiries_admin_update ON public.contact_inquiries FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY contact_inquiries_public_insert ON public.contact_inquiries FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY unlocks_admin_select ON public.contact_unlocks FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY participants_select_policy ON public.conversation_participants FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) OR (conversation_id IN ( SELECT conversations.id
   FROM conversations
  WHERE ((conversations.participant_one_id = get_my_profile_id()) OR (conversations.participant_two_id = get_my_profile_id())))) OR is_admin()));

CREATE POLICY conversations_select_policy ON public.conversations FOR SELECT TO authenticated
  USING (((participant_one_id = get_my_profile_id()) OR (participant_two_id = get_my_profile_id()) OR is_admin()));

CREATE POLICY coupons_admin_manage_policy ON public.coupons FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY coupons_select_policy ON public.coupons FOR SELECT TO authenticated
  USING (((is_active = true) OR is_admin()));

CREATE POLICY interests_select_policy ON public.interests FOR SELECT TO authenticated
  USING (((sender_profile_id = get_my_profile_id()) OR (receiver_profile_id = get_my_profile_id()) OR is_admin()));

CREATE POLICY messages_insert_policy ON public.messages FOR INSERT TO authenticated
  WITH CHECK (((sender_id = auth.uid()) AND (sender_profile_id = get_my_profile_id()) AND (conversation_id IN ( SELECT conversations.id
   FROM conversations
  WHERE (((conversations.participant_one_id = get_my_profile_id()) OR (conversations.participant_two_id = get_my_profile_id())) AND (conversations.status = 'active'::text))))));

CREATE POLICY messages_select_policy ON public.messages FOR SELECT TO authenticated
  USING (((conversation_id IN ( SELECT conversations.id
   FROM conversations
  WHERE ((conversations.participant_one_id = get_my_profile_id()) OR (conversations.participant_two_id = get_my_profile_id())))) OR is_admin()));

CREATE POLICY messages_update_policy ON public.messages FOR UPDATE TO authenticated
  USING (((sender_id = auth.uid()) OR is_admin()));

CREATE POLICY moderation_reports_insert_policy ON public.moderation_reports FOR INSERT TO authenticated
  WITH CHECK ((reporter_profile_id = get_my_profile_id()));

CREATE POLICY moderation_reports_select_policy ON public.moderation_reports FOR SELECT TO authenticated
  USING (((reporter_profile_id = get_my_profile_id()) OR is_admin()));

CREATE POLICY notifications_user_policy ON public.notifications FOR ALL TO authenticated
  USING (((user_id = auth.uid()) OR is_admin()));

CREATE POLICY preferences_owner_modify_policy ON public.partner_preferences FOR ALL TO authenticated
  USING ((profile_id = get_my_profile_id()))
  WITH CHECK ((profile_id = get_my_profile_id()));

CREATE POLICY preferences_select_policy ON public.partner_preferences FOR SELECT TO authenticated
  USING (true);

CREATE POLICY pay_own_select ON public.payments FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY payments_admin_manage_policy ON public.payments FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY payments_select_policy ON public.payments FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) OR is_admin()));

CREATE POLICY platform_settings_admin_policy ON public.platform_settings FOR ALL TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY platform_settings_select_policy ON public.platform_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY boosts_admin_policy ON public.profile_boosts FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY boosts_select_policy ON public.profile_boosts FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) OR (status = 'active'::boost_status_type) OR is_admin()));

CREATE POLICY contacts_admin_read_policy ON public.profile_contacts FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY contacts_owner_policy ON public.profile_contacts FOR ALL TO authenticated
  USING ((profile_id = get_my_profile_id()))
  WITH CHECK ((profile_id = get_my_profile_id()));

CREATE POLICY profile_documents_owner_all ON public.profile_documents FOR ALL TO authenticated
  USING (((profile_id = ( SELECT get_my_profile_id() AS get_my_profile_id)) OR ( SELECT is_admin() AS is_admin)))
  WITH CHECK ((profile_id = ( SELECT get_my_profile_id() AS get_my_profile_id)));

CREATE POLICY photos_owner_manage_policy ON public.profile_photos FOR ALL TO authenticated
  USING ((profile_id = get_my_profile_id()))
  WITH CHECK ((profile_id = get_my_profile_id()));

CREATE POLICY photos_select_policy ON public.profile_photos FOR SELECT TO authenticated
  USING ((((approval_status = 'approved'::photo_approval_type) AND (visibility <> 'private'::photo_visibility_type)) OR (profile_id = get_my_profile_id()) OR is_admin()));

CREATE POLICY views_admin_select ON public.profile_views FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY profiles_insert_policy ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY profiles_select_policy ON public.profiles FOR SELECT TO authenticated
  USING (((profile_status = 'approved'::profile_status_type) OR (user_id = auth.uid()) OR is_admin()));

CREATE POLICY profiles_update_policy ON public.profiles FOR UPDATE TO authenticated
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY push_subscriptions_owner_select ON public.push_subscriptions FOR SELECT TO authenticated
  USING ((user_id = ( SELECT auth.uid() AS uid)));

CREATE POLICY reports_admin_manage_policy ON public.reports FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY reports_insert_policy ON public.reports FOR INSERT TO authenticated
  WITH CHECK ((reporter_user_id = auth.uid()));

CREATE POLICY reports_select_policy ON public.reports FOR SELECT TO authenticated
  USING (((reporter_user_id = auth.uid()) OR is_admin()));

CREATE POLICY shortlists_manage_policy ON public.shortlists FOR ALL TO authenticated
  USING (((user_profile_id = get_my_profile_id()) OR is_admin()));

CREATE POLICY plans_admin_manage_policy ON public.subscription_plans FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY plans_public_read ON public.subscription_plans FOR SELECT TO public
  USING ((is_active = true));

CREATE POLICY plans_select_policy ON public.subscription_plans FOR SELECT TO authenticated
  USING (((is_active = true) OR is_admin()));

CREATE POLICY subscriptions_admin_manage_policy ON public.subscriptions FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY subscriptions_select_policy ON public.subscriptions FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) OR is_admin()));

CREATE POLICY user_blocks_manage_policy ON public.user_blocks FOR ALL TO authenticated
  USING ((blocker_profile_id = get_my_profile_id()))
  WITH CHECK ((blocker_profile_id = get_my_profile_id()));

CREATE POLICY user_blocks_select_policy ON public.user_blocks FOR SELECT TO authenticated
  USING (((blocker_profile_id = get_my_profile_id()) OR (blocked_profile_id = get_my_profile_id()) OR is_admin()));

CREATE POLICY subs_own_insert ON public.user_subscriptions FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY subs_own_select ON public.user_subscriptions FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY subs_own_update ON public.user_subscriptions FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY verifications_admin_manage_policy ON public.verifications FOR ALL TO authenticated
  USING (is_admin());

CREATE POLICY verifications_user_insert_policy ON public.verifications FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid()));

CREATE POLICY verifications_user_manage_policy ON public.verifications FOR SELECT TO authenticated
  USING (((user_id = auth.uid()) OR is_admin()));

CREATE POLICY "Service role manages webhook_events" ON public.webhook_events FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public Access to profile-photos" ON storage.objects FOR SELECT TO public
  USING ((bucket_id = 'profile-photos'::text));

CREATE POLICY doc_bucket_insert_policy ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (((bucket_id = 'verification-documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY doc_bucket_select_policy ON storage.objects FOR SELECT TO authenticated
  USING (((bucket_id = 'verification-documents'::text) AND (((storage.foldername(name))[1] = (auth.uid())::text) OR is_admin())));

CREATE POLICY photo_bucket_delete_policy ON storage.objects FOR DELETE TO authenticated
  USING (((bucket_id = 'profile-photos'::text) AND (((storage.foldername(name))[1] = (auth.uid())::text) OR is_admin())));

CREATE POLICY photo_bucket_update_policy ON storage.objects FOR UPDATE TO authenticated
  USING (((bucket_id = 'profile-photos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)))
  WITH CHECK (((bucket_id = 'profile-photos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY photo_bucket_upload_policy ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (((bucket_id = 'profile-photos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));

CREATE POLICY photo_bucket_view_policy ON storage.objects FOR SELECT TO authenticated
  USING (((bucket_id = 'profile-photos'::text) AND (((storage.foldername(name))[1] = (auth.uid())::text) OR (EXISTS ( SELECT 1
   FROM (profile_photos pp
     JOIN profiles p ON ((pp.profile_id = p.id)))
  WHERE ((pp.storage_path = objects.name) AND (pp.approval_status = 'approved'::photo_approval_type) AND (pp.visibility <> 'private'::photo_visibility_type)))) OR is_admin())));

CREATE POLICY profile_documents_owner_write ON storage.objects FOR ALL TO authenticated
  USING (((bucket_id = 'profile-documents'::text) AND ((storage.foldername(name))[1] = (( SELECT get_my_profile_id() AS get_my_profile_id))::text)))
  WITH CHECK (((bucket_id = 'profile-documents'::text) AND ((storage.foldername(name))[1] = (( SELECT get_my_profile_id() AS get_my_profile_id))::text)));

CREATE POLICY profile_documents_premium_read ON storage.objects FOR SELECT TO authenticated
  USING (((bucket_id = 'profile-documents'::text) AND (( SELECT is_admin() AS is_admin) OR (( SELECT has_feature('unlock_documents'::text) AS has_feature) AND (EXISTS ( SELECT 1
   FROM profiles p
  WHERE (((p.id)::text = (storage.foldername(objects.name))[1]) AND (p.profile_status = 'approved'::profile_status_type))))))));

CREATE OR REPLACE FUNCTION public.activate_dummy_subscription(p_plan_slug text, p_payment_method text DEFAULT 'dummy'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan public.subscription_plans%ROWTYPE;
  v_payment_id uuid;
  v_sub_id uuid;
  v_txn text := 'TXN' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((floor(random()*10000))::int::text, 4, '0');
  v_price numeric;
  v_sub public.subscriptions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  SELECT * INTO v_plan FROM public.subscription_plans
  WHERE slug = p_plan_slug AND is_active = true AND slug IN ('silver','diamond','platinum');
  IF NOT FOUND THEN RAISE EXCEPTION 'PLAN_NOT_FOUND'; END IF;

  v_price := COALESCE(v_plan.discounted_price, v_plan.price);

  INSERT INTO public.payments (user_id, plan_id, gateway, gateway_order_id, gateway_payment_id, amount, currency, status, payment_method, paid_at, raw_response)
  VALUES (auth.uid(), v_plan.id, 'dummy', 'order_' || v_txn, v_txn, v_price, 'INR', 'captured', p_payment_method, now(),
          jsonb_build_object('mode','dummy','transaction_id', v_txn))
  RETURNING id INTO v_payment_id;

  v_sub_id := public.activate_user_subscription(auth.uid(), v_plan.id, v_payment_id);
  SELECT * INTO v_sub FROM public.subscriptions WHERE id = v_sub_id;

  RETURN jsonb_build_object(
    'subscription_id', v_sub_id, 'payment_id', v_payment_id, 'transaction_id', v_txn,
    'plan_slug', v_plan.slug, 'plan_name', v_plan.name, 'amount', v_price,
    'start_date', v_sub.start_date, 'end_date', v_sub.end_date);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.activate_user_subscription(p_user_id uuid, p_plan_id uuid, p_payment_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan RECORD;
  v_new_sub_id UUID;
  v_end_date TIMESTAMPTZ;
BEGIN
  -- 1. Fetch Plan Details
  SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found or inactive';
  END IF;

  -- 2. Compute Expiry
  v_end_date := now() + (v_plan.duration_days || ' days')::INTERVAL;

  -- 3. Expire / Supersede previous active subscriptions for this user
  UPDATE public.subscriptions
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE user_id = p_user_id AND status = 'active';

  -- 4. Insert New Active Subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    payment_id,
    auto_renew,
    feature_usage,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    p_plan_id,
    'active',
    now(),
    v_end_date,
    p_payment_id,
    false,
    '{
      "interests_sent": 0,
      "contacts_unlocked": 0,
      "messages_sent": 0,
      "boosts_used": 0
    }'::JSONB,
    now(),
    now()
  )
  RETURNING id INTO v_new_sub_id;

  -- 5. Link subscription ID back to payment record if provided
  IF p_payment_id IS NOT NULL THEN
    UPDATE public.payments
    SET 
      subscription_id = v_new_sub_id,
      status = 'captured',
      paid_at = now(),
      updated_at = now()
    WHERE id = p_payment_id;
  END IF;

  RETURN v_new_sub_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_approve_profile(p_profile_id uuid, p_notes text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_batch_approve_pending()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_profiles()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator');
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(p) - 'aadhaar_number' ORDER BY p.created_at DESC) FROM public.profiles p), '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_mfa_satisfied()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT NOT COALESCE((SELECT value = 'true'::jsonb FROM public.platform_settings WHERE key = 'admin_mfa_required'), false)
      OR COALESCE(auth.jwt() ->> 'aal', '') = 'aal2';
$function$
;

CREATE OR REPLACE FUNCTION public.admin_moderate_photo(p_photo_id uuid, p_status text, p_notes text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_reject_profile(p_profile_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_resolve_report(p_report_id uuid, p_status text, p_notes text DEFAULT NULL::text, p_action_taken text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_set_mfa_required(p_required boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_admin uuid := public.require_admin_role('super_admin');
BEGIN
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
$function$
;

CREATE OR REPLACE FUNCTION public.admin_toggle_user_suspension(p_profile_id uuid, p_suspend boolean, p_reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_entitlement(p_user_id uuid, p_feature_key text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.delete_push_subscription(p_endpoint text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH d AS (DELETE FROM public.push_subscriptions WHERE endpoint = p_endpoint AND user_id = auth.uid() RETURNING 1)
  SELECT EXISTS (SELECT 1 FROM d);
$function$
;

CREATE OR REPLACE FUNCTION public.enqueue_push_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_secret text;
BEGIN
  IF NEW.user_id IS NULL
     OR NOT EXISTS (SELECT 1 FROM public.push_subscriptions WHERE user_id = NEW.user_id) THEN
    RETURN NEW;
  END IF;
  SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret';
  PERFORM net.http_post(
    url := 'https://hgucqabzlaxelkfiavvm.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', v_secret),
    body := jsonb_build_object('notification', jsonb_build_object(
      'id', NEW.id, 'user_id', NEW.user_id, 'type', NEW.type, 'title', NEW.title,
      'message', NEW.message, 'action_url', NEW.action_url)),
    timeout_milliseconds := 5000);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'enqueue_push_notification: %', SQLERRM;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.expire_subscriptions()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_n int := 0; v_user uuid;
BEGIN
  FOR v_user IN
    UPDATE public.subscriptions SET status = 'expired', updated_at = now()
    WHERE status = 'active' AND end_date <= now() RETURNING user_id
  LOOP
    PERFORM public.sync_listing_priority(v_user);
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.feature_min_rank(p_feature text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_feature
    WHEN 'unlock_contact'        THEN 1
    WHEN 'view_who_viewed_me'    THEN 1
    WHEN 'unlimited_interests'   THEN 1
    WHEN 'view_my_unlocks'       THEN 1
    WHEN 'recommendations'       THEN 1
    WHEN 'matchmaking'           THEN 1
    WHEN 'unlock_documents'      THEN 2
    WHEN 'view_contact_viewers'  THEN 2
    WHEN 'priority_listing'      THEN 2
    WHEN 'advanced_matchmaking'  THEN 2
    WHEN 'unlimited_view_history' THEN 2
    WHEN 'download_pdf'          THEN 2
    WHEN 'highlighted_profile'   THEN 3
    WHEN 'unlimited_unlocks'     THEN 3
    WHEN 'early_access'          THEN 3
    WHEN 'priority_support'      THEN 3
    ELSE 99
  END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_public_profile_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id TEXT;
  v_exists BOOLEAN := true;
BEGIN
  WHILE v_exists LOOP
    v_id := 'MTR' || floor(random() * 899999 + 100000)::TEXT;
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE profile_id = v_id) INTO v_exists;
  END LOOP;
  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_admin_context()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_contact_if_unlocked(p_target uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_t public.profiles%ROWTYPE;
  v_c public.profile_contacts%ROWTYPE;
BEGIN
  IF v_me IS NULL OR NOT public.has_feature('unlock_contact') THEN RETURN jsonb_build_object('unlocked', false); END IF;
  IF v_me <> p_target AND NOT EXISTS (SELECT 1 FROM public.contact_unlocks WHERE unlocker_profile_id = v_me AND unlocked_profile_id = p_target) THEN
    RETURN jsonb_build_object('unlocked', false);
  END IF;
  SELECT * INTO v_t FROM public.profiles WHERE id = p_target;
  SELECT * INTO v_c FROM public.profile_contacts WHERE profile_id = p_target;
  RETURN jsonb_build_object('unlocked', true, 'last_name', v_t.last_name, 'email', v_c.email, 'phone_number', v_c.phone_number,
    'whatsapp_number', v_c.whatsapp_number, 'address_line', v_c.address_line);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_contact_unlocks()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_me uuid := public.get_my_profile_id();
BEGIN
  IF NOT public.has_feature('view_my_unlocks') THEN RAISE EXCEPTION 'FEATURE_LOCKED'; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(public.profile_card_json(p) || jsonb_build_object(
             'unlocked_at', cu.created_at, 'last_name', p.last_name, 'email', c.email, 'phone_number', c.phone_number,
             'whatsapp_number', c.whatsapp_number, 'address_line', c.address_line)
           ORDER BY cu.created_at DESC)
    FROM public.contact_unlocks cu
    JOIN public.profiles p ON p.id = cu.unlocked_profile_id
    LEFT JOIN public.profile_contacts c ON c.profile_id = p.id
    WHERE cu.unlocker_profile_id = v_me
  ), '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_contact_viewers()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_me uuid := public.get_my_profile_id();
BEGIN
  IF NOT public.has_feature('view_contact_viewers') THEN RAISE EXCEPTION 'FEATURE_LOCKED'; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(public.profile_card_json(p) || jsonb_build_object('unlocked_at', cu.created_at) ORDER BY cu.created_at DESC)
    FROM public.contact_unlocks cu
    JOIN public.profiles p ON p.id = cu.unlocker_profile_id
    WHERE cu.unlocked_profile_id = v_me
  ), '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_entitlements()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plan text := public.my_plan();
  v_me uuid := public.get_my_profile_id();
  v_expiry timestamptz;
  v_features text[] := ARRAY[
    'unlock_contact','view_who_viewed_me','unlimited_interests','view_my_unlocks','recommendations','matchmaking',
    'unlock_documents','view_contact_viewers','priority_listing','advanced_matchmaking','unlimited_view_history','download_pdf',
    'highlighted_profile','unlimited_unlocks','early_access','priority_support'];
  v_flags jsonb := '{}'::jsonb;
  v_f text;
  v_unlocks int := 0;
  v_interests int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('plan','none','features','{}'::jsonb);
  END IF;

  SELECT max(s.end_date) INTO v_expiry FROM public.subscriptions s
  WHERE s.user_id = auth.uid() AND s.status = 'active' AND s.end_date > now();

  FOREACH v_f IN ARRAY v_features LOOP
    v_flags := v_flags || jsonb_build_object(v_f, public.plan_rank(v_plan) >= public.feature_min_rank(v_f));
  END LOOP;

  IF v_me IS NOT NULL THEN
    SELECT count(*) INTO v_unlocks FROM public.contact_unlocks
      WHERE unlocker_profile_id = v_me AND created_at >= public.ist_day_start();
    SELECT count(*) INTO v_interests FROM public.interests
      WHERE sender_profile_id = v_me AND sent_at >= public.ist_month_start();
  END IF;

  RETURN jsonb_build_object(
    'plan', v_plan,
    'is_admin', public.is_admin(auth.uid()),
    'expires_at', v_expiry,
    'features', v_flags,
    'unlocks_today', v_unlocks,
    'unlock_limit', public.unlock_daily_limit(),
    'interests_this_month', v_interests,
    'interest_limit', CASE WHEN public.has_feature('unlimited_interests') THEN NULL ELSE 5 END
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_interests(p_direction text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_private_profile()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object('last_name', p.last_name, 'aadhaar_last4', p.aadhaar_last4)
  FROM public.profiles p WHERE p.user_id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_profile_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_profile_visitors()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_me uuid := public.get_my_profile_id();
BEGIN
  IF NOT public.has_feature('view_who_viewed_me') THEN RAISE EXCEPTION 'FEATURE_LOCKED'; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(public.profile_card_json(p) || jsonb_build_object('viewed_at', v.last_view, 'view_count', v.cnt)
                     ORDER BY v.last_view DESC)
    FROM (SELECT viewer_profile_id, max(created_at) AS last_view, count(*) AS cnt
          FROM public.profile_views
          WHERE viewed_profile_id = v_me AND created_at >= now() - interval '30 days'
          GROUP BY viewer_profile_id) v
    JOIN public.profiles p ON p.id = v.viewer_profile_id
  ), '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_viewed_profiles()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_unlimited boolean := public.has_feature('unlimited_view_history');
  v_items jsonb;
  v_total int;
BEGIN
  SELECT count(DISTINCT viewed_profile_id) INTO v_total FROM public.profile_views WHERE viewer_profile_id = v_me;

  SELECT COALESCE(jsonb_agg(public.profile_card_json(p) || jsonb_build_object('viewed_at', q.viewed_at) ORDER BY q.viewed_at DESC), '[]'::jsonb)
  INTO v_items
  FROM (
    SELECT viewed_profile_id, max(created_at) AS viewed_at
    FROM public.profile_views
    WHERE viewer_profile_id = v_me AND (v_unlimited OR created_at >= now() - interval '7 days')
    GROUP BY viewed_profile_id
    ORDER BY max(created_at) DESC
    LIMIT CASE WHEN v_unlimited THEN 100000 ELSE 20 END
  ) q JOIN public.profiles p ON p.id = q.viewed_profile_id;

  RETURN jsonb_build_object('items', v_items, 'capped', (NOT v_unlimited) AND v_total > jsonb_array_length(v_items));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_new_profiles()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_early boolean := public.has_feature('early_access');
BEGIN
  RETURN COALESCE((
    SELECT jsonb_agg(public.profile_card_json(p) || jsonb_build_object(
             'approved_at', p.approved_at, 'is_early_access', p.approved_at > now() - interval '72 hours')
           ORDER BY p.approved_at DESC)
    FROM public.profiles p
    WHERE p.profile_status = 'approved' AND p.profile_visibility <> 'hidden'
      AND p.id IS DISTINCT FROM v_me
      AND p.approved_at > now() - interval '7 days'
      AND (v_early OR p.approved_at <= now() - interval '72 hours')
  ), '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_target_profile_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_profile_documents(p_target uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (p_target = public.get_my_profile_id() OR public.is_admin()
          OR (public.has_feature('unlock_documents')
              AND EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target AND profile_status = 'approved'))) THEN
    RAISE EXCEPTION 'FEATURE_LOCKED';
  END IF;
  RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('doc_type', doc_type, 'storage_path', storage_path,
                                                       'file_name', file_name, 'created_at', created_at) ORDER BY doc_type)
                   FROM public.profile_documents WHERE profile_id = p_target), '[]'::jsonb);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_recommendations(p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_vapid_public_key()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_vapid_public';
$function$
;

CREATE OR REPLACE FUNCTION public.guard_last_super_admin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.guard_profile_system_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ins boolean := TG_OP = 'INSERT';
  v_digits text;
  v_id_same boolean;
  v_prefix text;
BEGIN
  IF NEW.aadhaar_number IS NOT NULL THEN
    v_digits := regexp_replace(NEW.aadhaar_number, '\D', '', 'g');
    IF length(v_digits) >= 4 THEN NEW.aadhaar_last4 := right(v_digits, 4); END IF;
    NEW.aadhaar_number := NULL;
  END IF;

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
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_interest_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_receiver_user_id UUID;
  v_sender_name TEXT;
  v_sender_profile_id TEXT;
BEGIN
  SELECT user_id INTO v_receiver_user_id FROM public.profiles WHERE id = NEW.receiver_profile_id;
  
  SELECT COALESCE(NULLIF(TRIM(first_name || ' ' || last_name), ''), 'A verified member'), profile_id 
  INTO v_sender_name, v_sender_profile_id 
  FROM public.profiles WHERE id = NEW.sender_profile_id;

  IF v_receiver_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      is_read,
      created_at
    ) VALUES (
      v_receiver_user_id,
      'interest_received',
      'New Interest Received',
      COALESCE(v_sender_name, 'A member') || ' (' || COALESCE(v_sender_profile_id, 'Profile') || ') has expressed interest in your profile.',
      '/dashboard',
      false,
      now()
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_interest_notification error: %', SQLERRM;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_profile_preferences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.partner_preferences (
    profile_id,
    min_age,
    max_age,
    min_height,
    max_height,
    preferred_states,
    preferred_religion,
    preferred_community,
    preferred_marital_status
  ) VALUES (
    NEW.id,
    GREATEST(18, COALESCE(NEW.age - 5, 21)),
    LEAST(60, COALESCE(NEW.age + 5, 35)),
    GREATEST(140, COALESCE(NEW.height - 10, 150)),
    LEAST(220, COALESCE(NEW.height + 15, 185)),
    ARRAY[COALESCE(NEW.state, 'Maharashtra')],
    ARRAY[COALESCE(NEW.religion, 'Hindu')],
    CASE WHEN NEW.community IS NOT NULL THEN ARRAY[NEW.community] ELSE ARRAY[]::TEXT[] END,
    ARRAY['never_married'::public.marital_status_type]
  )
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_profile_preferences exception: %', SQLERRM;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
DECLARE
  v_profile_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_gender public.gender_type;
BEGIN
  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'Member');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  
  BEGIN
    v_gender := (NEW.raw_user_meta_data->>'gender')::public.gender_type;
  EXCEPTION WHEN OTHERS THEN
    v_gender := 'other'::public.gender_type;
  END;

  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    gender,
    profile_status,
    verification_status,
    profile_visibility,
    created_by
  )
  VALUES (
    NEW.id,
    v_first_name,
    v_last_name,
    v_gender,
    'draft'::public.profile_status_type,
    'unverified'::public.verification_status_type,
    'registered_only'::public.profile_visibility_type,
    COALESCE(NEW.raw_user_meta_data->>'created_for', 'Self')
  )
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_profile_id;

  IF v_profile_id IS NOT NULL THEN
    INSERT INTO public.profile_contacts (
      profile_id,
      email,
      phone_number
    )
    VALUES (
      v_profile_id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user exception: %', SQLERRM;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_profile_updated()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.age := date_part('year', age(NEW.date_of_birth));
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_feature(p_feature text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.plan_rank(public.my_plan()) >= public.feature_min_rank(p_feature);
$function$
;

CREATE OR REPLACE FUNCTION public.income_lakhs(p text)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN p IS NULL OR p IN ('', 'any', 'not_disclosed') THEN NULL
    WHEN p LIKE 'below%' THEN 0
    ELSE NULLIF(substring(p FROM '\d+'), '')::numeric
  END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p_user_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_user_id AND is_active)
     AND (p_user_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active))
     AND public.admin_mfa_satisfied();
$function$
;

CREATE OR REPLACE FUNCTION public.is_profile_complete(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(public.my_admin_role() = 'super_admin', false);
$function$
;

CREATE OR REPLACE FUNCTION public.ist_day_start()
 RETURNS timestamp with time zone
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
$function$
;

CREATE OR REPLACE FUNCTION public.ist_month_start()
 RETURNS timestamp with time zone
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
$function$
;

CREATE OR REPLACE FUNCTION public.limit_contact_inquiries()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_pdf_download(p_target uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_feature('download_pdf') THEN RAISE EXCEPTION 'FEATURE_LOCKED'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id)
  VALUES (auth.uid(), 'member', 'profile_pdf_download', 'profiles', p_target::text);
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.my_admin_role()
 RETURNS admin_role_type
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.admin_users
  WHERE user_id = auth.uid() AND is_active AND public.admin_mfa_satisfied();
$function$
;

CREATE OR REPLACE FUNCTION public.my_plan()
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_slug text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'none'; END IF;
  IF public.is_admin(auth.uid()) THEN RETURN 'platinum'; END IF;

  SELECT p.slug INTO v_slug
  FROM public.subscriptions s
  JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = auth.uid() AND s.status = 'active' AND s.end_date > now()
  ORDER BY public.plan_rank(p.slug) DESC, s.end_date DESC
  LIMIT 1;

  RETURN COALESCE(v_slug, 'none');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.plan_rank(p_slug text)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  SELECT CASE p_slug WHEN 'silver' THEN 1 WHEN 'diamond' THEN 2 WHEN 'platinum' THEN 3 ELSE 0 END;
$function$
;

CREATE OR REPLACE FUNCTION public.pref_score(pp partner_preferences, t profiles)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.profile_card_json(p profiles)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'id', p.id, 'profile_code', p.profile_id, 'first_name', p.first_name, 'age', p.age, 'height', p.height,
    'city', p.city, 'state', p.state, 'occupation', p.occupation, 'education', p.education,
    'community', p.community, 'avatar_url', p.avatar_url,
    'is_highlighted', p.listing_priority >= 3, 'listing_priority', p.listing_priority);
$function$
;

CREATE OR REPLACE FUNCTION public.push_service_config()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object(
    'public_key', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_vapid_public'),
    'private_key', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_vapid_private'),
    'webhook_secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'push_webhook_secret'));
$function$
;

CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key text, p_limit integer, p_window interval)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_hits integer;
BEGIN
  INSERT INTO public.rate_limits AS r (key, window_start)
  VALUES (p_key, date_bin(p_window, now(), timestamptz '2000-01-01'))
  ON CONFLICT (key, window_start) DO UPDATE SET hits = r.hits + 1
  RETURNING hits INTO v_hits;
  RETURN v_hits <= p_limit;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.record_profile_view(p_viewed uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_me uuid := public.get_my_profile_id();
BEGIN
  IF v_me IS NULL OR v_me = p_viewed THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_viewed AND profile_status = 'approved') THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.profile_views
             WHERE viewer_profile_id = v_me AND viewed_profile_id = p_viewed AND created_at >= public.ist_day_start()) THEN
    RETURN false;
  END IF;
  INSERT INTO public.profile_views (viewer_profile_id, viewed_profile_id) VALUES (v_me, p_viewed);
  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.require_admin()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized. Admin privileges required.' USING ERRCODE = '42501';
  END IF;
  RETURN auth.uid();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.require_admin_role(VARIADIC p_roles admin_role_type[])
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.respond_to_interest(p_interest_id uuid, p_accept boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_user_agent text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.send_interest(p_receiver uuid, p_message text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.set_inquiry_priority()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.priority := false;
  IF auth.uid() IS NOT NULL AND public.my_plan() = 'platinum' THEN NEW.priority := true; END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.store_push_vapid_keys(p_public text, p_private text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('push_vapid_keys'));
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'push_vapid_private') THEN
    PERFORM vault.create_secret(p_private, 'push_vapid_private', 'Web push VAPID private key');
    PERFORM vault.create_secret(p_public, 'push_vapid_public', 'Web push VAPID public key');
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_profile_for_approval(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.sync_listing_priority(p_user uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_rank int;
BEGIN
  SELECT COALESCE(max(public.plan_rank(p.slug)), 0) INTO v_rank
  FROM public.subscriptions s JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = p_user AND s.status = 'active' AND s.end_date > now();
  UPDATE public.profiles SET listing_priority = CASE WHEN v_rank >= 3 THEN 3 WHEN v_rank = 2 THEN 2 ELSE 0 END
  WHERE user_id = p_user;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_subscription_priority()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.sync_listing_priority(NEW.user_id);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.unlock_daily_limit()
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE public.my_plan() WHEN 'silver' THEN 10 WHEN 'diamond' THEN 25 WHEN 'platinum' THEN NULL ELSE 0 END;
$function$
;

CREATE OR REPLACE FUNCTION public.unlock_profile_contact(p_target_profile_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_target public.profiles%ROWTYPE;
  v_c public.profile_contacts%ROWTYPE;
  v_limit int;
  v_used int;
  v_already boolean;
BEGIN
  IF auth.uid() IS NULL OR v_me IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUTH_REQUIRED', 'error', 'Please log in and create your profile first.');
  END IF;
  IF v_me = p_target_profile_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'SELF', 'error', 'This is your own profile.');
  END IF;
  IF NOT public.has_feature('unlock_contact') THEN
    RETURN jsonb_build_object('success', false, 'code', 'UPGRADE_REQUIRED', 'error', 'A Silver, Diamond or Platinum plan is required to unlock contact details.');
  END IF;

  SELECT * INTO v_target FROM public.profiles WHERE id = p_target_profile_id AND profile_status = 'approved';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'error', 'Profile not available.');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('unlock:' || v_me::text));

  v_limit := public.unlock_daily_limit();
  SELECT count(*) INTO v_used FROM public.contact_unlocks
    WHERE unlocker_profile_id = v_me AND created_at >= public.ist_day_start();
  v_already := EXISTS (SELECT 1 FROM public.contact_unlocks
                       WHERE unlocker_profile_id = v_me AND unlocked_profile_id = p_target_profile_id);

  IF NOT v_already THEN
    IF v_limit IS NOT NULL AND v_used >= v_limit THEN
      RETURN jsonb_build_object('success', false, 'code', 'LIMIT_REACHED', 'limit', v_limit, 'used', v_used,
        'error', 'You have reached your daily contact unlock limit.');
    END IF;
    INSERT INTO public.contact_unlocks (unlocker_profile_id, unlocked_profile_id, subscription_id)
    VALUES (v_me, p_target_profile_id,
            (SELECT id FROM public.subscriptions WHERE user_id = auth.uid() AND status = 'active' AND end_date > now()
             ORDER BY end_date DESC LIMIT 1));
    v_used := v_used + 1;
  END IF;

  SELECT * INTO v_c FROM public.profile_contacts WHERE profile_id = p_target_profile_id;

  RETURN jsonb_build_object('success', true, 'already', v_already,
    'last_name', v_target.last_name, 'email', v_c.email, 'phone_number', v_c.phone_number,
    'whatsapp_number', v_c.whatsapp_number, 'address_line', v_c.address_line,
    'unlocks_today', v_used, 'unlock_limit', v_limit);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.withdraw_interest(p_receiver uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE TRIGGER trg_guard_last_super_admin BEFORE DELETE OR UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION guard_last_super_admin();

CREATE TRIGGER trg_contact_rate_limit BEFORE INSERT ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION limit_contact_inquiries();

CREATE TRIGGER trg_inquiry_priority BEFORE INSERT ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION set_inquiry_priority();

CREATE TRIGGER trg_notifications_push AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION enqueue_push_notification();

CREATE TRIGGER trg_init_partner_preferences AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_new_profile_preferences();

CREATE TRIGGER trg_profiles_system_columns BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION guard_profile_system_columns();

CREATE TRIGGER trg_profiles_updated BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_profile_updated();

CREATE TRIGGER trg_subscriptions_priority AFTER INSERT OR UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION trg_subscription_priority();
