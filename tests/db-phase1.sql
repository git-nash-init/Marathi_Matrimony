-- Phase 1 database tests. These run against the real database as anon, a member and an admin,
-- with simulated JWT claims. Run the whole file through the Supabase SQL editor or MCP execute_sql.
-- The final RAISE aborts the transaction, so nothing here is ever saved: the "error" that comes
-- back IS the report. Look for "FAILED: 0".
DO $test$
DECLARE
  v_member uuid;      -- a non-admin who has a profile
  v_member_profile uuid;
  v_other_profile uuid;
  v_admin uuid;       -- the active super admin
  v_results text[] := '{}';
  v_failed int := 0;
  v_n int;
  v_text text;
  v_row public.profiles%ROWTYPE;
  v_prefix text := 'https://hgucqabzlaxelkfiavvm.supabase.co/storage/v1/object/public/profile-photos/';
BEGIN
  SELECT p.user_id, p.id INTO v_member, v_member_profile FROM public.profiles p
    WHERE NOT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = p.user_id)
    ORDER BY (p.profile_status = 'draft') DESC, p.created_at LIMIT 1;
  SELECT p.id INTO v_other_profile FROM public.profiles p WHERE p.id <> v_member_profile ORDER BY p.created_at LIMIT 1;
  SELECT user_id INTO v_admin FROM public.admin_users WHERE role = 'super_admin' AND is_active LIMIT 1;

  -- ── Signed-out visitor ───────────────────────────────────────────────────
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
  SET LOCAL ROLE anon;

  BEGIN
    PERFORM 1 FROM public.profiles LIMIT 1;
    v_failed := v_failed + 1; v_results := v_results || 'FAIL anon can read profiles'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok anon cannot read profiles'::text; END;

  BEGIN
    PERFORM public.is_admin();
    v_failed := v_failed + 1; v_results := v_results || 'FAIL anon can call is_admin'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok anon cannot call is_admin'::text; END;

  BEGIN
    PERFORM public.admin_list_profiles();
    v_failed := v_failed + 1; v_results := v_results || 'FAIL anon can call admin_list_profiles'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok anon cannot list profiles'::text; END;

  SELECT count(*) INTO v_n FROM public.subscription_plans WHERE is_active;
  IF v_n >= 1 THEN v_results := v_results || 'ok anon can read active plans'::text;
  ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL anon cannot read plans'::text; END IF;

  RESET ROLE;

  -- ── Member ───────────────────────────────────────────────────────────────
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_member, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;

  IF (public.get_admin_context() ->> 'is_admin')::boolean = false AND public.get_admin_context() - 'is_admin' = '{}'::jsonb
    THEN v_results := v_results || 'ok member context reveals nothing'::text;
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL member context'::text; END IF;

  BEGIN
    PERFORM public.admin_list_profiles();
    v_failed := v_failed + 1; v_results := v_results || 'FAIL member can list profiles'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok member cannot list profiles'::text; END;

  BEGIN
    PERFORM public.admin_approve_profile(v_member_profile);
    v_failed := v_failed + 1; v_results := v_results || 'FAIL member can approve'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok member cannot approve'::text; END;

  BEGIN
    PERFORM public.admin_set_mfa_required(false);
    v_failed := v_failed + 1; v_results := v_results || 'FAIL member can change MFA'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok member cannot change MFA'::text; END;

  BEGIN
    PERFORM public.rate_limit_hit('x', 1, interval '1 hour');
    v_failed := v_failed + 1; v_results := v_results || 'FAIL member can call rate_limit_hit'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok rate_limit_hit is internal'::text; END;

  UPDATE public.admin_users SET role = 'super_admin' WHERE user_id = v_admin;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN v_results := v_results || 'ok member cannot edit admin_users'::text;
  ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL member edited admin_users'::text; END IF;

  UPDATE public.platform_settings SET value = 'true'::jsonb WHERE key = 'admin_mfa_required';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN v_results := v_results || 'ok member cannot edit settings'::text;
  ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL member edited settings'::text; END IF;

  UPDATE public.profiles SET first_name = 'x' WHERE id = v_other_profile;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN v_results := v_results || 'ok member cannot edit another profile'::text;
  ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL member edited another profile'::text; END IF;

  -- Own row: system columns are ignored, a full number is reduced to its last 4, status stays non-approved.
  UPDATE public.profiles
  SET aadhaar_number = '1234 5678 9012', age = 99, date_of_birth = DATE '1990-01-01',
      profile_status = 'approved', verification_status = 'verified',
      listing_priority = 9, is_featured = true, profile_id = 'HACKED', user_id = v_admin
  WHERE id = v_member_profile;
  RESET ROLE;

  SELECT * INTO v_row FROM public.profiles WHERE id = v_member_profile;
  IF v_row.aadhaar_number IS NULL AND v_row.aadhaar_last4 = '9012'
    THEN v_results := v_results || 'ok full ID reduced to last 4'::text;
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL full ID stored'::text; END IF;
  IF v_row.age = date_part('year', age((now() AT TIME ZONE 'Asia/Kolkata')::date, DATE '1990-01-01'))::int
    THEN v_results := v_results || 'ok age comes from date of birth'::text;
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL age writable'::text; END IF;
  IF v_row.user_id = v_member AND v_row.profile_id <> 'HACKED' AND v_row.listing_priority <> 9 AND NOT COALESCE(v_row.is_featured, false)
    THEN v_results := v_results || 'ok identity and system columns locked'::text;
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL system columns writable'::text; END IF;
  IF v_row.verification_status <> 'verified'
    THEN v_results := v_results || 'ok member cannot self-verify'::text;
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL member self-verified'::text; END IF;
  -- A draft that sends "approved" must land in the queue, not go live.
  IF v_row.profile_status <> 'approved' AND v_row.approved_at IS NULL
    THEN v_results := v_results || ('ok member cannot self-approve (status ' || v_row.profile_status || ')');
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL member self-approved'::text; END IF;

  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_member, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN
    UPDATE public.profiles SET avatar_url = 'https://evil.example/x.jpg' WHERE id = v_member_profile;
    v_failed := v_failed + 1; v_results := v_results || 'FAIL foreign avatar accepted'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_results := v_results || 'ok foreign avatar refused'::text; END;
  BEGIN
    UPDATE public.profiles SET photos = ARRAY[v_prefix || v_admin::text || '/x.jpg'] WHERE id = v_member_profile;
    v_failed := v_failed + 1; v_results := v_results || 'FAIL another member''s photo accepted'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_results := v_results || 'ok another member''s photo refused'::text; END;
  UPDATE public.profiles SET avatar_url = v_prefix || v_member::text || '/avatar_1.jpg' WHERE id = v_member_profile;
  v_results := v_results || 'ok own photo accepted'::text;

  BEGIN
    PERFORM public.save_push_subscription('https://evil.example/hook', 'k', 'a');
    v_failed := v_failed + 1; v_results := v_results || 'FAIL non-push endpoint accepted'::text;
  EXCEPTION WHEN raise_exception THEN v_results := v_results || 'ok non-push endpoint refused'::text; END;
  RESET ROLE;

  -- ── Admin ────────────────────────────────────────────────────────────────
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;

  IF (public.get_admin_context() ->> 'role') = 'super_admin'
    THEN v_results := v_results || 'ok admin context has role'::text;
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL admin context'::text; END IF;

  v_text := public.admin_list_profiles()::text;
  IF v_text NOT LIKE '%aadhaar_number%' AND v_text LIKE '%aadhaar_last4%'
    THEN v_results := v_results || 'ok admin list has last 4, no full ID'::text;
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL admin list columns'::text; END IF;

  UPDATE public.profiles SET first_name = 'x' WHERE id = v_member_profile;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN v_results := v_results || 'ok admin cannot bypass audited edits'::text;
  ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL admin edited directly'::text; END IF;

  BEGIN
    PERFORM public.admin_set_mfa_required(true);
    v_failed := v_failed + 1; v_results := v_results || 'FAIL MFA requirement set without aal2'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok MFA requirement needs aal2'::text; END;

  BEGIN
    UPDATE public.admin_users SET is_active = false WHERE user_id = v_admin;
    IF (SELECT count(*) FROM public.admin_users WHERE role = 'super_admin' AND is_active) = 0 THEN
      v_failed := v_failed + 1; v_results := v_results || 'FAIL last super admin removed'::text;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok last super admin protected'::text; END;
  RESET ROLE;

  -- Required MFA: an admin at aal1 loses access, at aal2 keeps it.
  UPDATE public.platform_settings SET value = 'true'::jsonb WHERE key = 'admin_mfa_required';
  SET LOCAL ROLE authenticated;
  IF public.is_admin() = false THEN v_results := v_results || 'ok required MFA blocks aal1 admin'::text;
  ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL aal1 admin allowed'::text; END IF;
  IF (public.get_admin_context() ->> 'is_admin')::boolean
    THEN v_results := v_results || 'ok aal1 admin can still reach MFA setup'::text;
    ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL aal1 admin locked out of setup'::text; END IF;
  BEGIN
    PERFORM public.admin_list_profiles();
    v_failed := v_failed + 1; v_results := v_results || 'FAIL aal1 admin listed profiles'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok aal1 admin refused data'::text; END;
  RESET ROLE;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  SET LOCAL ROLE authenticated;
  IF public.is_admin() THEN v_results := v_results || 'ok aal2 admin allowed'::text;
  ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL aal2 admin refused'::text; END IF;
  RESET ROLE;

  -- A moderator can approve but not manage settings or batch approve.
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  UPDATE public.platform_settings SET value = 'false'::jsonb WHERE key = 'admin_mfa_required';
  ALTER TABLE public.admin_users DISABLE TRIGGER trg_guard_last_super_admin;
  UPDATE public.admin_users SET role = 'moderator' WHERE user_id = v_admin;
  SET LOCAL ROLE authenticated;
  BEGIN
    PERFORM public.admin_batch_approve_pending();
    v_failed := v_failed + 1; v_results := v_results || 'FAIL moderator batch approved'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_results := v_results || 'ok moderator cannot batch approve'::text; END;
  PERFORM public.admin_list_profiles();
  v_results := v_results || 'ok moderator can list for approval'::text;
  UPDATE public.platform_settings SET value = 'true'::jsonb WHERE key = 'admin_mfa_required';
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n = 0 THEN v_results := v_results || 'ok moderator cannot edit settings'::text;
  ELSE v_failed := v_failed + 1; v_results := v_results || 'FAIL moderator edited settings'::text; END IF;
  RESET ROLE;

  RAISE EXCEPTION E'TEST REPORT (rolled back) FAILED: %\n%', v_failed, array_to_string(v_results, E'\n');
END;
$test$;
