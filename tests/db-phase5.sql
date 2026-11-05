-- Phase 5 database checks. Always ends in an error on purpose: "TEST REPORT (rolled back) FAILED: n".
-- The error rolls back every change, so nothing stays in the database. Look for FAILED: 0.
DO $test$
DECLARE
  v_admin uuid; v_member uuid; v_plan uuid; v_pay uuid;
  v_r text[] := '{}'; v_failed int := 0; v_ok boolean; v_j jsonb; v_j2 jsonb; v_rev numeric;
BEGIN
  SELECT user_id INTO v_admin FROM public.admin_users WHERE role = 'super_admin' AND is_active LIMIT 1;
  SELECT user_id INTO v_member FROM public.profiles WHERE gender='male' AND user_id <> v_admin ORDER BY created_at LIMIT 1;
  SELECT id INTO v_plan FROM public.subscription_plans LIMIT 1;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_member, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN PERFORM public.admin_dashboard_stats(); v_failed := v_failed + 1; v_r := v_r || 'FAIL member read stats'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot read stats'::text; END;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_j := public.admin_dashboard_stats();
  RESET ROLE;
  v_ok := (v_j->>'total_users')::int = (SELECT count(*) FROM auth.users)
      AND (v_j->>'male')::int = (SELECT count(*) FROM public.profiles WHERE gender='male')
      AND (v_j->>'female')::int = (SELECT count(*) FROM public.profiles WHERE gender='female');
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'counts match the tables');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_rev := (v_j->>'revenue_total')::numeric;
  INSERT INTO public.payments (user_id, plan_id, gateway, gateway_order_id, amount, currency, status, paid_at)
    VALUES (v_member, v_plan, 'dummy', 't1', 500, 'INR', 'captured', now());
  SET LOCAL ROLE authenticated;
  v_j2 := public.admin_dashboard_stats();
  RESET ROLE;
  v_ok := (v_j2->>'revenue_total')::numeric = v_rev AND (v_j2->>'test_payments')::int = (v_j->>'test_payments')::int + 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'test payments are not revenue, and are counted apart');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  INSERT INTO public.payments (user_id, plan_id, gateway, gateway_order_id, amount, currency, status, paid_at)
    VALUES (v_member, v_plan, 'razorpay', 't2', 1000, 'INR', 'captured', now()) RETURNING id INTO v_pay;
  INSERT INTO public.payments (user_id, plan_id, gateway, gateway_order_id, amount, currency, status, paid_at)
    VALUES (v_member, v_plan, 'razorpay', 't3', 2000, 'INR', 'failed', now());
  SET LOCAL ROLE authenticated;
  v_j2 := public.admin_dashboard_stats();
  RESET ROLE;
  v_ok := (v_j2->>'revenue_total')::numeric = v_rev + 1000 AND (v_j2->>'revenue_this_month')::numeric >= 1000;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'real captured payments count, failed ones do not');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  SET LOCAL ROLE authenticated;
  v_j2 := public.admin_list_users(NULL, 'inactive', NULL, NULL, 1, 0);
  v_ok := (v_j2->>'total')::int = (v_j->>'total_users')::int - (v_j->>'active')::int;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'inactive list size equals total minus active');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  ALTER TABLE public.admin_users DISABLE TRIGGER trg_guard_last_super_admin;
  UPDATE public.admin_users SET role = 'moderator' WHERE user_id = v_admin;
  SET LOCAL ROLE authenticated;
  v_j2 := public.admin_dashboard_stats();
  RESET ROLE;
  v_ok := v_j2->'revenue_total' = 'null'::jsonb AND v_j2->'paid_members' = 'null'::jsonb AND (v_j2->>'total_users')::int > 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'moderator sees counts but no revenue');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  RAISE EXCEPTION E'TEST REPORT (rolled back) FAILED: %\n%', v_failed, array_to_string(v_r, E'\n');
END;
$test$;
