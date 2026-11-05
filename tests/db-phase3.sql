-- Phase 3 database checks. Run in the Supabase SQL Editor or through the MCP.
-- It always ends in an error on purpose: "TEST REPORT (rolled back) FAILED: n". The error rolls back
-- every change, so nothing stays in the database. Look for FAILED: 0.
DO $test$
DECLARE
  v_admin uuid; v_member uuid; v_member_p uuid; v_other uuid; v_other_p uuid; v_viewer uuid;
  v_r text[] := '{}'; v_failed int := 0; v_ok boolean; v_n int; v_j jsonb; v_t text;
BEGIN
  SELECT user_id INTO v_admin FROM public.admin_users WHERE role = 'super_admin' AND is_active LIMIT 1;
  SELECT user_id, id INTO v_member, v_member_p FROM public.profiles
    WHERE profile_status = 'approved' AND gender = 'male' AND user_id <> v_admin ORDER BY created_at LIMIT 1;
  SELECT user_id, id INTO v_other, v_other_p FROM public.profiles
    WHERE profile_status = 'approved' AND gender = 'female' ORDER BY created_at LIMIT 1;
  -- An ordinary member: admins may read every profile, so they prove nothing about hiding.
  SELECT p.user_id INTO v_viewer FROM public.profiles p
    WHERE p.gender = 'female' AND NOT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = p.user_id)
    ORDER BY p.created_at LIMIT 1;

  -- Member cannot use admin functions
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_member, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN PERFORM public.admin_list_users(); v_failed := v_failed + 1; v_r := v_r || 'FAIL member listed users'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot list users'::text; END;
  BEGIN PERFORM public.admin_get_user(v_other); v_failed := v_failed + 1; v_r := v_r || 'FAIL member read a user'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot read a user'::text; END;
  BEGIN PERFORM public.admin_update_profile(v_other_p, '{"first_name":"x"}'); v_failed := v_failed + 1; v_r := v_r || 'FAIL member edited'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot edit others'::text; END;
  BEGIN PERFORM public.admin_block_user(v_other, 'testing'); v_failed := v_failed + 1; v_r := v_r || 'FAIL member blocked'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot block accounts'::text; END;
  BEGIN PERFORM public.admin_prepare_user_removal(v_other, 'x'); v_failed := v_failed + 1; v_r := v_r || 'FAIL member removed'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot remove accounts'::text; END;
  RESET ROLE;

  -- Admin
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_j := public.admin_list_users(NULL, NULL, NULL, NULL, 5, 0);
  v_ok := (v_j ->> 'total')::int >= 2 AND jsonb_array_length(v_j -> 'items') BETWEEN 1 AND 5;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'admin lists users with paging');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  v_j := public.admin_list_users(NULL, 'no_such', NULL, NULL, 5, 0);
  v_ok := (v_j ->> 'total')::int = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'status filter applies');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  v_j := public.admin_get_user(v_member);
  v_ok := v_j -> 'profile' ->> 'id' = v_member_p::text AND NOT (v_j -> 'profile') ? 'aadhaar_number';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'admin reads a member, no full ID');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  PERFORM public.admin_update_profile(v_member_p, '{"city":"Test City","last_name":"Testsurname"}');
  v_j := public.admin_get_user(v_member);
  v_t := (v_j -> 'history')::text;
  v_ok := v_j -> 'profile' ->> 'city' = 'Test City' AND v_t LIKE '%profile_edited%' AND v_t NOT LIKE '%Testsurname%' AND v_t LIKE '%Test City%';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'edit saved, logged, surname masked in the log');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  BEGIN PERFORM public.admin_update_profile(v_member_p, '{"user_id":"00000000-0000-0000-0000-000000000000"}'); v_failed := v_failed + 1; v_r := v_r || 'FAIL edited user_id'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok fields outside the list are refused'::text; END;
  BEGIN PERFORM public.admin_update_profile(v_member_p, '{"first_name":"  "}'); v_failed := v_failed + 1; v_r := v_r || 'FAIL blank name'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok blank first name refused'::text; END;
  BEGIN PERFORM public.admin_update_profile(v_member_p, json_build_object('date_of_birth', (current_date - interval '20 years')::date)::jsonb); v_failed := v_failed + 1; v_r := v_r || 'FAIL man of 20 saved'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok minimum age holds for admin edits'::text; END;

  PERFORM public.admin_update_contacts(v_member_p, '{"phone_number":"+919999999999"}');
  v_j := public.admin_get_user(v_member);
  -- The whole history: entries in one transaction share a timestamp, so their order is not fixed.
  v_t := (v_j -> 'history')::text;
  v_ok := v_j -> 'contacts' ->> 'phone_number' = '+919999999999' AND v_t LIKE '%contacts_edited%' AND v_t NOT LIKE '%9999999999%';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'contact edit saved, phone masked in the log');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  PERFORM public.admin_update_preferences(v_member_p, '{"min_age":22,"max_age":28,"preferred_cities":["Pune"]}');
  v_j := public.admin_get_user(v_member);
  v_ok := (v_j -> 'preferences' ->> 'max_age')::int = 28 AND v_j -> 'preferences' -> 'preferred_cities' ->> 0 = 'Pune';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'preference edit saved');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  PERFORM public.admin_set_verification(v_member_p, 'verified');
  v_j := public.admin_get_user(v_member);
  v_ok := v_j -> 'profile' ->> 'verification_status' = 'verified';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'verify works apart from approval');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  BEGIN PERFORM public.admin_block_user(v_admin, 'testing'); v_failed := v_failed + 1; v_r := v_r || 'FAIL self block'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok an admin cannot block themselves'::text; END;
  BEGIN PERFORM public.admin_prepare_user_removal(v_admin, 'x'); v_failed := v_failed + 1; v_r := v_r || 'FAIL self remove'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok an admin cannot remove themselves'::text; END;
  BEGIN PERFORM public.admin_block_user(v_member, '  '); v_failed := v_failed + 1; v_r := v_r || 'FAIL block without reason'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok blocking needs a reason'::text; END;
  BEGIN PERFORM public.admin_prepare_user_removal(v_member, 'wrong text'); v_failed := v_failed + 1; v_r := v_r || 'FAIL removal without confirmation'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok removal needs the exact confirmation'::text; END;
  RESET ROLE;

  -- Before the block an ordinary member can see them, so the check after the block means something.
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_viewer, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_member_p;
  v_ok := v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'control: another member sees them before the block');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_j := public.admin_block_user(v_member, 'Fake profile');
  v_ok := (v_j ->> 'success')::boolean AND (public.admin_get_user(v_member) -> 'block' ->> 'reason') = 'Fake profile'
      AND public.admin_get_user(v_member) -> 'profile' ->> 'profile_status' = 'suspended';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'block recorded with reason, profile suspended');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  -- Blocked member, still holding a live token
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_member, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_ok := (public.get_my_account_status() ->> 'blocked')::boolean AND public.get_my_profile_id() IS NULL;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'blocked member loses identity at once');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  SELECT count(*) INTO v_n FROM public.profiles;
  v_ok := v_n = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'blocked member can read no profiles');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  BEGIN PERFORM public.search_profiles('{}'::jsonb); v_failed := v_failed + 1; v_r := v_r || 'FAIL blocked member searched'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok blocked member cannot search'::text; END;
  v_j := public.send_interest(v_other_p, NULL);
  v_ok := NOT (v_j ->> 'success')::boolean;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'blocked member cannot send interest');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  UPDATE public.profiles SET about_me = 'x' WHERE user_id = v_member;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_ok := v_n = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'blocked member cannot edit their profile');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  -- Another ordinary member does not find them
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_viewer, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_member_p;
  v_ok := v_n = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'other members can no longer find them');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_j := public.admin_unblock_user(v_member);
  v_ok := (v_j ->> 'success')::boolean AND public.admin_get_user(v_member) -> 'profile' ->> 'profile_status' = 'approved'
      AND public.admin_get_user(v_member) -> 'block' = 'null'::jsonb;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'unblock restores the previous status');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_member, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_ok := public.get_my_profile_id() = v_member_p AND NOT (public.get_my_account_status() ->> 'blocked')::boolean;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'unblocked member has access again');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  -- Moderator limits
  ALTER TABLE public.admin_users DISABLE TRIGGER trg_guard_last_super_admin;
  UPDATE public.admin_users SET role = 'moderator' WHERE user_id = v_admin;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  PERFORM public.admin_list_users();
  v_r := v_r || 'ok moderator can list users'::text;
  PERFORM public.admin_set_verification(v_member_p, 'pending');
  v_r := v_r || 'ok moderator can change verification'::text;
  BEGIN PERFORM public.admin_update_profile(v_member_p, '{"city":"x"}'); v_failed := v_failed + 1; v_r := v_r || 'FAIL moderator edited'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok moderator cannot edit'::text; END;
  BEGIN PERFORM public.admin_block_user(v_member, 'testing'); v_failed := v_failed + 1; v_r := v_r || 'FAIL moderator blocked'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok moderator cannot block'::text; END;
  RESET ROLE;

  RAISE EXCEPTION E'TEST REPORT (rolled back) FAILED: %\n%', v_failed, array_to_string(v_r, E'\n');
END;
$test$;
