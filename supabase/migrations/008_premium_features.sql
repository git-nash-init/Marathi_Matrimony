-- 008_premium_features.sql
-- Silver / Diamond / Platinum feature RPCs, listing priority and RLS tightening.

-- ─── Columns ─────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS listing_priority smallint NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at timestamptz;
UPDATE public.profiles SET approved_at = created_at WHERE profile_status = 'approved' AND approved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_listing ON public.profiles (listing_priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON public.profile_views (viewed_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON public.profile_views (viewer_profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_unlocked ON public.contact_unlocks (unlocked_profile_id, created_at DESC);

ALTER TABLE public.contact_inquiries ADD COLUMN IF NOT EXISTS priority boolean NOT NULL DEFAULT false;

-- Clients may never set listing_priority / approved_at; approved_at is stamped on approval.
CREATE OR REPLACE FUNCTION public.guard_profile_system_columns()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'UPDATE' THEN
      NEW.listing_priority := OLD.listing_priority;
      NEW.approved_at := OLD.approved_at;
    ELSE
      NEW.listing_priority := 0;
      NEW.approved_at := NULL;
    END IF;
  END IF;
  IF NEW.profile_status = 'approved' AND (TG_OP = 'INSERT' OR OLD.profile_status IS DISTINCT FROM 'approved') THEN
    NEW.approved_at := now();
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_profiles_system_columns ON public.profiles;
CREATE TRIGGER trg_profiles_system_columns BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_system_columns();

-- Platinum contact inquiries are prioritised server-side.
CREATE OR REPLACE FUNCTION public.set_inquiry_priority()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.priority := false;
  IF auth.uid() IS NOT NULL AND public.my_plan() = 'platinum' THEN NEW.priority := true; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_inquiry_priority ON public.contact_inquiries;
CREATE TRIGGER trg_inquiry_priority BEFORE INSERT ON public.contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_inquiry_priority();

-- ─── Listing priority (platinum 3, diamond 2, others 0) ──────────────────────

CREATE OR REPLACE FUNCTION public.sync_listing_priority(p_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_rank int;
BEGIN
  SELECT COALESCE(max(public.plan_rank(p.slug)), 0) INTO v_rank
  FROM public.subscriptions s JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = p_user AND s.status = 'active' AND s.end_date > now();
  UPDATE public.profiles SET listing_priority = CASE WHEN v_rank >= 3 THEN 3 WHEN v_rank = 2 THEN 2 ELSE 0 END
  WHERE user_id = p_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_subscription_priority()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.sync_listing_priority(NEW.user_id);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_subscriptions_priority ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_priority AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.trg_subscription_priority();

CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Backfill for existing subscriptions.
SELECT public.sync_listing_priority(user_id) FROM public.subscriptions WHERE status = 'active';

-- ─── Card helper + scoring ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.profile_card_json(p public.profiles)
RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'id', p.id, 'profile_code', p.profile_id, 'first_name', p.first_name, 'age', p.age, 'height', p.height,
    'city', p.city, 'state', p.state, 'occupation', p.occupation, 'education', p.education,
    'community', p.community, 'avatar_url', p.avatar_url,
    'is_highlighted', p.listing_priority >= 3, 'listing_priority', p.listing_priority);
$$;

-- 0–100: how well profile t fits the preferences pp. Empty preference = no constraint.
CREATE OR REPLACE FUNCTION public.pref_score(pp public.partner_preferences, t public.profiles)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT
    (CASE WHEN t.age IS NULL OR t.age BETWEEN pp.min_age AND pp.max_age THEN 20 ELSE 0 END)
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
            OR lower(COALESCE(t.community, '')) = ANY (ARRAY(SELECT lower(x) FROM unnest(pp.preferred_community) x)) THEN 15 ELSE 0 END)
  + (CASE WHEN COALESCE(cardinality(pp.preferred_religion), 0) = 0
            OR lower(COALESCE(t.religion, '')) = ANY (ARRAY(SELECT lower(x) FROM unnest(pp.preferred_religion) x)) THEN 10 ELSE 0 END);
$$;

-- ─── Tighten reads: premium data is reachable only through the RPCs below ────

DROP POLICY IF EXISTS views_insert_policy ON public.profile_views;
DROP POLICY IF EXISTS views_select_policy ON public.profile_views;
DROP POLICY IF EXISTS unlocks_select_policy ON public.contact_unlocks;
DROP POLICY IF EXISTS contacts_select_policy ON public.profile_contacts;
REVOKE INSERT, UPDATE, DELETE ON public.profile_views FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.contact_unlocks FROM anon, authenticated;
CREATE POLICY views_admin_select ON public.profile_views FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY unlocks_admin_select ON public.contact_unlocks FOR SELECT TO authenticated USING (public.is_admin());

-- ─── Profile views ───────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.record_profile_view(uuid, uuid);

-- Viewer is resolved server-side; one row per viewer per profile per IST day.
CREATE OR REPLACE FUNCTION public.record_profile_view(p_viewed uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_my_profile_visitors()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_my_viewed_profiles()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- ─── Contacts ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.unlock_profile_contact(p_target_profile_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- Read-only: returns contact data only if already unlocked (and the plan is still active).
CREATE OR REPLACE FUNCTION public.get_contact_if_unlocked(p_target uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_my_contact_unlocks()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_my_contact_viewers()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- ─── Recommendations / new profiles ──────────────────────────────────────────

-- Silver: one-way fit. Diamond+: advanced = mutual fit + completeness + recency. Platinum profiles get a boost.
CREATE OR REPLACE FUNCTION public.get_recommendations(p_limit int DEFAULT 20, p_offset int DEFAULT 0)
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
      LIMIT GREATEST(p_limit, 1) OFFSET GREATEST(p_offset, 0)
    ) q JOIN public.profiles p ON p.id = q.pid
  ), '[]'::jsonb);
END;
$$;

-- Profiles approved in the last 7 days. Platinum sees them immediately; everyone else after 72 hours.
CREATE OR REPLACE FUNCTION public.get_new_profiles()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- ─── PDF download log (entitlement check happens before the client builds the PDF) ───

CREATE OR REPLACE FUNCTION public.log_pdf_download(p_target uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_feature('download_pdf') THEN RAISE EXCEPTION 'FEATURE_LOCKED'; END IF;
  INSERT INTO public.audit_logs (actor_id, actor_role, action, target_entity, target_id)
  VALUES (auth.uid(), 'member', 'profile_pdf_download', 'profiles', p_target::text);
  RETURN true;
END;
$$;

-- ─── Grants ──────────────────────────────────────────────────────────────────

REVOKE EXECUTE ON FUNCTION
  public.record_profile_view(uuid), public.get_my_profile_visitors(), public.get_my_viewed_profiles(),
  public.unlock_profile_contact(uuid), public.get_contact_if_unlocked(uuid), public.get_my_contact_unlocks(),
  public.get_my_contact_viewers(), public.get_recommendations(int, int), public.get_new_profiles(),
  public.log_pdf_download(uuid), public.sync_listing_priority(uuid), public.expire_subscriptions(),
  public.profile_card_json(public.profiles), public.pref_score(public.partner_preferences, public.profiles)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION
  public.record_profile_view(uuid), public.get_my_profile_visitors(), public.get_my_viewed_profiles(),
  public.unlock_profile_contact(uuid), public.get_contact_if_unlocked(uuid), public.get_my_contact_unlocks(),
  public.get_my_contact_viewers(), public.get_recommendations(int, int), public.get_new_profiles(),
  public.log_pdf_download(uuid)
  TO authenticated;
