-- 006_premium_entitlements.sql
-- Single source of truth for plan → feature access, enforced in the database.
-- Written against the LIVE schema (see src/types/database.types.ts), not 001–005.

-- ─── Plan helpers ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.plan_rank(p_slug text)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_slug WHEN 'silver' THEN 1 WHEN 'diamond' THEN 2 WHEN 'platinum' THEN 3 ELSE 0 END;
$$;

-- Active plan slug for the caller: silver | diamond | platinum | none. Admins count as platinum.
CREATE OR REPLACE FUNCTION public.my_plan()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Feature → minimum plan matrix (mirrors the plan cards).
CREATE OR REPLACE FUNCTION public.feature_min_rank(p_feature text)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.has_feature(p_feature text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.plan_rank(public.my_plan()) >= public.feature_min_rank(p_feature);
$$;

-- Daily contact-unlock cap: NULL = unlimited, 0 = not allowed.
CREATE OR REPLACE FUNCTION public.unlock_daily_limit()
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE public.my_plan() WHEN 'silver' THEN 10 WHEN 'diamond' THEN 25 WHEN 'platinum' THEN NULL ELSE 0 END;
$$;

-- Start of today / this month in IST.
CREATE OR REPLACE FUNCTION public.ist_day_start()
RETURNS timestamptz LANGUAGE sql STABLE AS $$
  SELECT date_trunc('day', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
$$;

CREATE OR REPLACE FUNCTION public.ist_month_start()
RETURNS timestamptz LANGUAGE sql STABLE AS $$
  SELECT date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
$$;

-- Interests: count by the time each interest was (re)sent, so send→withdraw→resend consumes quota.
ALTER TABLE public.interests ADD COLUMN IF NOT EXISTS sent_at timestamptz NOT NULL DEFAULT now();
UPDATE public.interests SET sent_at = created_at;
CREATE INDEX IF NOT EXISTS idx_interests_sender_sent ON public.interests (sender_profile_id, sent_at);

CREATE OR REPLACE FUNCTION public.get_my_entitlements()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- ─── Plan rows (text identical to the plan cards / getMockPlans) ─────────────

UPDATE public.subscription_plans SET
  price = 1000, duration_days = 90, sort_order = 1,
  features = '["Unlock Surname, Email, Phone & Address of profiles (10 per day)","View who visited your profile (last 30 days)","Send unlimited interests","View contact numbers unlocked by you","Recommendation profiles","Matchmaking"]'::jsonb
WHERE slug = 'silver';

UPDATE public.subscription_plans SET
  price = 2500, duration_days = 365, sort_order = 2,
  features = '["Everything in Silver","25 contact unlocks per day","Unlock Documents section","See who viewed your contact number","Priority placement in search results","Advanced matchmaking algorithm","Unlimited profile view history","Download profile PDF"]'::jsonb
WHERE slug = 'diamond';

UPDATE public.subscription_plans SET
  price = 3000, duration_days = 548, sort_order = 3,
  features = '["Everything in Diamond","Dedicated relationship manager","Profile highlighted in recommendations","Unlimited contact unlocks per day","Early access to new premium profiles","Priority customer support","WhatsApp assistance"]'::jsonb
WHERE slug = 'platinum';

-- ─── Dummy checkout (swap this one function for Razorpay later) ──────────────

CREATE OR REPLACE FUNCTION public.activate_dummy_subscription(p_plan_slug text, p_payment_method text DEFAULT 'dummy')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Clients must never create payments/subscriptions directly.
DROP POLICY IF EXISTS pay_own_insert ON public.payments;
DROP POLICY IF EXISTS pay_own_update ON public.payments;
REVOKE INSERT, UPDATE, DELETE ON public.payments FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon, authenticated;

-- activate_user_subscription takes an arbitrary user id: callable only from other SECURITY DEFINER code.
REVOKE EXECUTE ON FUNCTION public.activate_user_subscription(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;

-- ─── Execute grants for new functions ────────────────────────────────────────

REVOKE EXECUTE ON FUNCTION public.my_plan(), public.has_feature(text), public.unlock_daily_limit(),
  public.get_my_entitlements(), public.activate_dummy_subscription(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_plan(), public.has_feature(text), public.unlock_daily_limit(),
  public.get_my_entitlements(), public.activate_dummy_subscription(text, text) TO authenticated;
