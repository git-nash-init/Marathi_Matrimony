-- 020: Phase 8. Plan editing, subscription lists, payment history. No gateway, webhooks or refunds:
-- those come with the payment work, and the dummy checkout is still a launch blocker.

-- Features were tied to three fixed slugs. A tier lets an admin add a plan that unlocks the same features.
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('silver', 'diamond', 'platinum'));
UPDATE public.subscription_plans SET tier = slug WHERE tier IS NULL AND slug IN ('silver', 'diamond', 'platinum');

CREATE OR REPLACE FUNCTION public.plan_rank(p_slug text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE COALESCE((SELECT tier FROM public.subscription_plans WHERE slug = p_slug), p_slug)
    WHEN 'silver' THEN 1 WHEN 'diamond' THEN 2 WHEN 'platinum' THEN 3 ELSE 0 END;
$$;

-- Returns the tier, so per-plan limits and the member's screens work for any plan name.
CREATE OR REPLACE FUNCTION public.my_plan()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_slug text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'none'; END IF;
  IF public.is_account_blocked() THEN
    RAISE EXCEPTION 'ACCOUNT_BLOCKED' USING ERRCODE = '42501';
  END IF;
  IF public.is_admin(auth.uid()) THEN RETURN 'platinum'; END IF;

  SELECT COALESCE(p.tier, p.slug) INTO v_slug
  FROM public.subscriptions s
  JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = auth.uid() AND s.status = 'active' AND s.end_date > now()
  ORDER BY public.plan_rank(p.slug) DESC, s.end_date DESC
  LIMIT 1;

  RETURN COALESCE(v_slug, 'none');
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_dummy_subscription(p_plan_slug text, p_payment_method text DEFAULT 'dummy'::text)
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
  WHERE slug = p_plan_slug AND is_active = true AND tier IS NOT NULL;
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

-- All changes go through audited functions. Reads are limited to the roles that handle money.
ALTER POLICY plans_admin_manage_policy ON public.subscription_plans USING (false) WITH CHECK (false);
ALTER POLICY payments_admin_manage_policy ON public.payments USING (false) WITH CHECK (false);
ALTER POLICY subscriptions_admin_manage_policy ON public.subscriptions USING (false) WITH CHECK (false);
ALTER POLICY payments_select_policy ON public.payments
  USING (user_id = auth.uid() OR public.my_admin_role() IN ('super_admin', 'admin'));
ALTER POLICY subscriptions_select_policy ON public.subscriptions
  USING (user_id = auth.uid() OR public.my_admin_role() IN ('super_admin', 'admin'));
-- Nothing reads this old table, and members could write to it. Closing it removes a way to look subscribed.
REVOKE INSERT, UPDATE ON public.user_subscriptions FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_plans()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin');
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(p) || jsonb_build_object('active_subscribers', (
      SELECT count(DISTINCT s.user_id) FROM public.subscriptions s WHERE s.plan_id = p.id AND s.status = 'active' AND s.end_date > now()))
      ORDER BY p.is_active DESC, p.sort_order, p.price)
    FROM public.subscription_plans p), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_plan(p_id uuid, p jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_old public.subscription_plans%ROWTYPE;
  v_name text := btrim(COALESCE(p ->> 'name', ''));
  v_slug text := lower(btrim(COALESCE(p ->> 'slug', '')));
  v_tier text := p ->> 'tier';
  v_price numeric := (p ->> 'price')::numeric;
  v_discount numeric := NULLIF(p ->> 'discounted_price', '')::numeric;
  v_days int := (p ->> 'duration_days')::int;
  v_features jsonb := COALESCE(p -> 'features', '[]'::jsonb);
  v_active boolean := COALESCE((p ->> 'is_active')::boolean, true);
BEGIN
  PERFORM public.require_admin_role('admin');
  IF v_name = '' OR char_length(v_name) > 80 THEN RAISE EXCEPTION 'Please give the plan a name.' USING ERRCODE = '22023'; END IF;
  IF v_tier IS NULL OR v_tier NOT IN ('silver', 'diamond', 'platinum') THEN RAISE EXCEPTION 'Please choose which features this plan unlocks.' USING ERRCODE = '22023'; END IF;
  IF v_price IS NULL OR v_price < 0 OR v_price > 1000000 THEN RAISE EXCEPTION 'Please enter a valid price.' USING ERRCODE = '22023'; END IF;
  IF v_discount IS NOT NULL AND (v_discount < 0 OR v_discount > v_price) THEN RAISE EXCEPTION 'The offer price cannot be more than the price.' USING ERRCODE = '22023'; END IF;
  IF v_days IS NULL OR v_days NOT BETWEEN 1 AND 3650 THEN RAISE EXCEPTION 'The duration must be from 1 to 3650 days.' USING ERRCODE = '22023'; END IF;
  IF jsonb_typeof(v_features) <> 'array' THEN RAISE EXCEPTION 'Features must be a list.' USING ERRCODE = '22023'; END IF;

  IF p_id IS NULL THEN
    IF v_slug !~ '^[a-z0-9][a-z0-9-]{1,40}$' THEN RAISE EXCEPTION 'The web name may use only small letters, numbers and dashes.' USING ERRCODE = '22023'; END IF;
    INSERT INTO public.subscription_plans (name, slug, description, price, discounted_price, duration_days, features, is_active, sort_order, tier)
    VALUES (v_name, v_slug, NULLIF(btrim(p ->> 'description'), ''), v_price, v_discount, v_days, v_features, v_active, COALESCE((p ->> 'sort_order')::int, 0), v_tier)
    ON CONFLICT (slug) DO NOTHING RETURNING id INTO v_id;
    IF v_id IS NULL THEN RAISE EXCEPTION 'A plan with this web name already exists.' USING ERRCODE = '22023'; END IF;
  ELSE
    SELECT * INTO v_old FROM public.subscription_plans WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Plan not found.' USING ERRCODE = 'P0002'; END IF;
    -- The web name stays fixed, so existing links and receipts keep working.
    UPDATE public.subscription_plans SET name = v_name, description = NULLIF(btrim(p ->> 'description'), ''), price = v_price,
      discounted_price = v_discount, duration_days = v_days, features = v_features, is_active = v_active,
      sort_order = COALESCE((p ->> 'sort_order')::int, sort_order), tier = v_tier, updated_at = now()
    WHERE id = p_id RETURNING id INTO v_id;
  END IF;
  PERFORM public.admin_log('plan_saved', 'subscription_plans', v_id::text, jsonb_build_object(
    'name', v_name, 'price', v_price, 'old_price', v_old.price, 'active', v_active, 'tier', v_tier));
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_subscriptions(p_status text DEFAULT 'active', p_search text DEFAULT NULL, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_q text := public.like_pattern(NULLIF(left(btrim(COALESCE(p_search, '')), 80), ''));
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
  v_result jsonb;
BEGIN
  PERFORM public.require_admin_role('admin');
  WITH m AS (
    SELECT s.id, s.user_id, s.start_date, s.end_date, s.auto_renew, sp.name AS plan_name, u.email::text AS email,
           pr.first_name, pr.last_name, pr.profile_id AS profile_code,
           COALESCE(pay.gateway = 'dummy', true) AS is_test,
           CASE WHEN s.status = 'active' AND s.end_date > now() THEN 'active' ELSE 'expired' END AS state
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    LEFT JOIN auth.users u ON u.id = s.user_id
    LEFT JOIN public.profiles pr ON pr.user_id = s.user_id
    LEFT JOIN public.payments pay ON pay.id = s.payment_id
  ), f AS (
    SELECT * FROM m WHERE v_q IS NULL OR m.email ILIKE v_q OR m.first_name ILIKE v_q OR m.last_name ILIKE v_q OR m.profile_code ILIKE v_q
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM f WHERE state = p_status),
    'counts', COALESCE((SELECT jsonb_object_agg(c.state, c.n) FROM (SELECT state, count(*) AS n FROM f GROUP BY state) c), '{}'::jsonb),
    'items', COALESCE((SELECT jsonb_agg(to_jsonb(g) ORDER BY g.end_date DESC) FROM (
       SELECT * FROM f WHERE state = p_status ORDER BY end_date DESC LIMIT v_limit OFFSET GREATEST(COALESCE(p_offset, 0), 0)) g), '[]'::jsonb))
  INTO v_result;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_payments(p_status text DEFAULT 'all', p_search text DEFAULT NULL, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_q text := public.like_pattern(NULLIF(left(btrim(COALESCE(p_search, '')), 80), ''));
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
  v_result jsonb;
BEGIN
  PERFORM public.require_admin_role('admin');
  -- raw_response is left out on purpose: gateway payloads can hold details staff do not need.
  WITH m AS (
    SELECT pay.id, pay.user_id, pay.gateway, pay.gateway_order_id, pay.gateway_payment_id, pay.amount, pay.currency,
           pay.status::text AS status, pay.payment_method, pay.paid_at, pay.created_at, sp.name AS plan_name,
           u.email::text AS email, pr.first_name, pr.last_name, pr.profile_id AS profile_code, pay.gateway = 'dummy' AS is_test
    FROM public.payments pay
    LEFT JOIN public.subscription_plans sp ON sp.id = pay.plan_id
    LEFT JOIN auth.users u ON u.id = pay.user_id
    LEFT JOIN public.profiles pr ON pr.user_id = pay.user_id
  ), f AS (
    SELECT * FROM m WHERE v_q IS NULL OR m.email ILIKE v_q OR m.first_name ILIKE v_q OR m.last_name ILIKE v_q
       OR m.profile_code ILIKE v_q OR m.gateway_payment_id ILIKE v_q OR m.gateway_order_id ILIKE v_q
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM f WHERE p_status = 'all' OR f.status = p_status),
    'counts', COALESCE((SELECT jsonb_object_agg(c.status, c.n) FROM (SELECT status, count(*) AS n FROM f GROUP BY status) c), '{}'::jsonb),
    'collected', (SELECT COALESCE(sum(amount), 0) FROM public.payments WHERE status = 'captured' AND gateway <> 'dummy')
               + (SELECT COALESCE(sum(amount), 0) FROM public.payment_records_archive WHERE status = 'captured' AND gateway <> 'dummy'),
    'items', COALESCE((SELECT jsonb_agg(to_jsonb(g) ORDER BY g.created_at DESC) FROM (
       SELECT * FROM f WHERE p_status = 'all' OR f.status = p_status ORDER BY created_at DESC LIMIT v_limit OFFSET GREATEST(COALESCE(p_offset, 0), 0)) g), '[]'::jsonb))
  INTO v_result;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_plans(), public.admin_save_plan(uuid, jsonb), public.admin_list_subscriptions(text, text, int, int),
  public.admin_list_payments(text, text, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_plans(), public.admin_save_plan(uuid, jsonb), public.admin_list_subscriptions(text, text, int, int),
  public.admin_list_payments(text, text, int, int) TO authenticated, service_role;

-- Also applied here: admin_dashboard_stats counts archived payments in revenue, so removing an
-- account does not lower the money actually collected.

-- 020b: row rules that check a role run as the member, so the check must be callable. It only ever
-- returns the caller's own role, which reveals nothing.
GRANT EXECUTE ON FUNCTION public.my_admin_role() TO authenticated;
