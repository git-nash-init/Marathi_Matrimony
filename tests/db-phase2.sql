-- Phase 2 database tests: marriage age group, search, matches, blocks, profile rules.
-- Runs against the real database inside one transaction that always ends in an error, so nothing
-- is saved. The error text is the report: look for "FAILED: 0".
-- Uses the live approved man and woman, changing their dates of birth inside the transaction.
DO $test$
DECLARE
  v_today date := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  v_man uuid; v_man_p uuid; v_woman uuid; v_woman_p uuid; v_draft uuid; v_draft_p uuid; v_admin uuid;
  v_silver uuid;
  v_d20 date; v_d24 date; v_d25 date; v_d26 date; v_d27 date; v_d30 date; v_d31 date; v_d40 date; v_d50 date;
  v_r text[] := '{}'; v_failed int := 0; v_ok boolean; v_n int; v_j jsonb; v_row public.profiles%ROWTYPE;
BEGIN
  v_d20 := (v_today - make_interval(years => 20, days => 10))::date; v_d24 := (v_today - make_interval(years => 24, days => 10))::date;
  v_d25 := (v_today - make_interval(years => 25, days => 10))::date; v_d26 := (v_today - make_interval(years => 26, days => 10))::date;
  v_d27 := (v_today - make_interval(years => 27, days => 10))::date; v_d30 := (v_today - make_interval(years => 30, days => 10))::date;
  v_d31 := (v_today - make_interval(years => 31, days => 10))::date; v_d40 := (v_today - make_interval(years => 40, days => 10))::date;
  v_d50 := (v_today - make_interval(years => 50, days => 10))::date;
  SELECT user_id, id INTO v_man, v_man_p FROM public.profiles WHERE profile_status = 'approved' AND gender = 'male' ORDER BY created_at LIMIT 1;
  SELECT user_id, id INTO v_woman, v_woman_p FROM public.profiles WHERE profile_status = 'approved' AND gender = 'female' ORDER BY created_at LIMIT 1;
  SELECT user_id, id INTO v_draft, v_draft_p FROM public.profiles
    WHERE profile_status = 'draft' AND user_id NOT IN (v_man, v_woman)
      AND NOT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = profiles.user_id) ORDER BY created_at LIMIT 1;
  SELECT id INTO v_silver FROM public.subscription_plans WHERE slug = 'silver';

  -- ── The rule itself (pure function) ────────────────────────────────────────
  v_ok := public.is_age_in_range('male', v_d30, 'female', v_d25)
      AND public.is_age_in_range('male', v_d30, 'female', v_d30)
      AND public.is_age_in_range('female', v_d25, 'male', v_d25)
      AND public.is_age_in_range('female', v_d25, 'male', v_d30);
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'man 30 matches women 25-30; woman 25 matches men 25-30');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_ok := NOT public.is_age_in_range('male', v_d30, 'female', v_d31)
      AND NOT public.is_age_in_range('male', v_d30, 'female', v_d24)
      AND NOT public.is_age_in_range('female', v_d25, 'male', v_d24)
      AND NOT public.is_age_in_range('female', v_d25, 'male', v_d31);
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'older woman and gap+1 are outside the group, both ways');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_ok := public.is_age_in_range('male', v_d30, 'male', v_d50)
      AND public.is_age_in_range('other', NULL, 'female', v_d25)
      AND NOT public.is_age_in_range('male', NULL, 'female', v_d25);
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'rule applies to man/woman pairs only; missing date of birth is out of range');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  UPDATE public.platform_settings SET value = '3'::jsonb WHERE key = 'match_age_gap';
  v_ok := public.is_age_in_range('male', v_d30, 'female', v_d27)
      AND NOT public.is_age_in_range('male', v_d30, 'female', v_d26);
  UPDATE public.platform_settings SET value = '5'::jsonb WHERE key = 'match_age_gap';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'the gap follows the match_age_gap setting');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  -- ── Set the scene: man 30, approved days ago ───────────────────────────────
  UPDATE public.profiles SET date_of_birth = v_d30, approved_at = now() - interval '5 days' WHERE id = v_man_p;
  UPDATE public.profiles SET date_of_birth = v_d25, approved_at = now() - interval '5 days' WHERE id = v_woman_p;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_man, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;

  v_j := public.get_my_match_band();
  v_ok := (v_j ->> 'applies')::boolean AND (v_j ->> 'min_age')::int = 25 AND (v_j ->> 'max_age')::int = 30 AND v_j ->> 'target_gender' = 'female';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'man 30 sees the band 25-30 women');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.search_profiles('{}'::jsonb);
  v_ok := (v_j ->> 'total')::int = 1 AND (v_j -> 'items' -> 0 ->> 'age_in_range')::boolean AND (v_j -> 'items' -> 0 ->> 'age')::int = 25
          AND v_j -> 'items' -> 0 ->> 'last_name' IS NULL AND v_j -> 'items' -> 0 ->> 'date_of_birth' IS NULL;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'search shows the woman of 25, without surname or date of birth');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  RESET ROLE;
  UPDATE public.profiles SET date_of_birth = v_d31 WHERE id = v_woman_p;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_man, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;

  v_j := public.search_profiles('{}'::jsonb);
  v_ok := (v_j ->> 'total')::int = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'a woman of 31 is hidden from the default search of a man of 30');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.search_profiles('{"show_all_ages": true}'::jsonb);
  v_ok := (v_j ->> 'total')::int = 1 AND NOT (v_j -> 'items' -> 0 ->> 'age_in_range')::boolean;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'show all ages finds her, marked outside the age group');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.get_new_profiles();
  v_ok := jsonb_array_length(v_j) = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'new profiles hides her too');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  BEGIN
    PERFORM public.get_recommendations(10, 0);
    v_r := v_r || 'FAIL recommendations open without a plan'::text; v_failed := v_failed + 1;
  EXCEPTION WHEN raise_exception THEN v_r := v_r || 'ok recommendations still need a plan'::text;
  END;

  -- Woman back to 25; man gets a Silver plan so recommendations work.
  RESET ROLE;
  UPDATE public.profiles SET date_of_birth = v_d25 WHERE id = v_woman_p;
  INSERT INTO public.subscriptions (user_id, plan_id, status, start_date, end_date)
  VALUES (v_man, v_silver, 'active', now(), now() + interval '30 days');
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_man, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;

  v_j := public.get_recommendations(10, 0);
  v_ok := jsonb_array_length(v_j) = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'recommendations include the woman of 25');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.get_new_profiles();
  v_ok := jsonb_array_length(v_j) = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'new profiles include her');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.search_profiles('{"q": "100%_"}'::jsonb);
  v_ok := (v_j ->> 'total')::int = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'search text treats % and _ literally');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.search_profiles('{"min_age": 26}'::jsonb);
  v_ok := (v_j ->> 'total')::int = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'explicit age filter narrows inside the group');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  -- ── Blocks ─────────────────────────────────────────────────────────────────
  v_j := public.block_member(v_woman_p);
  v_ok := (v_j ->> 'success')::boolean;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'man blocks the woman');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.block_member(v_man_p);
  v_ok := NOT (v_j ->> 'success')::boolean AND v_j ->> 'code' = 'SELF';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'nobody can block themselves');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_ok := (public.search_profiles('{"show_all_ages": true}'::jsonb) ->> 'total')::int = 0
      AND jsonb_array_length(public.get_new_profiles()) = 0
      AND jsonb_array_length(public.get_recommendations(10, 0)) = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'a blocked member vanishes from search, new profiles and matches');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_ok := jsonb_array_length(public.get_my_blocked_members()) = 1 AND NOT public.is_blocked_with(v_draft_p) AND public.is_blocked_with(v_woman_p);
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'the blocker sees one blocked member');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.unlock_profile_contact(v_woman_p);
  v_ok := NOT (v_j ->> 'success')::boolean AND v_j ->> 'code' = 'NOT_FOUND';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'contact unlock refuses a blocked member');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_ok := NOT public.record_profile_view(v_woman_p);
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'a visit to a blocked member is not recorded');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  -- The woman does not see the man either.
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_woman, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_ok := (public.search_profiles('{"show_all_ages": true}'::jsonb) ->> 'total')::int = 0
      AND jsonb_array_length(public.get_my_blocked_members()) = 0
      AND public.is_blocked_with(v_man_p);
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'the blocked woman cannot find the man, and has no blocked list');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  -- ── Profile rules ──────────────────────────────────────────────────────────
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_man, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN
    UPDATE public.profiles SET gender = 'female' WHERE id = v_man_p;
    v_r := v_r || 'FAIL gender changed after approval'::text; v_failed := v_failed + 1;
  EXCEPTION WHEN raise_exception THEN v_r := v_r || 'ok gender is locked after approval'::text;
  END;
  BEGIN
    UPDATE public.profiles SET date_of_birth = v_d40 WHERE id = v_man_p;
    v_r := v_r || 'FAIL date of birth changed after approval'::text; v_failed := v_failed + 1;
  EXCEPTION WHEN raise_exception THEN v_r := v_r || 'ok date of birth is locked after approval'::text;
  END;
  UPDATE public.profiles SET about_me = 'Updated about me text for the test.', age = 99 WHERE id = v_man_p;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  RESET ROLE;
  SELECT * INTO v_row FROM public.profiles WHERE id = v_man_p;
  v_ok := v_n = 1 AND v_row.age = 30 AND v_row.about_me LIKE 'Updated about me%';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'other edits still work and age cannot be set by hand');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  IF v_draft IS NOT NULL THEN
    UPDATE public.profiles SET gender = 'male', date_of_birth = v_d20 WHERE id = v_draft_p;
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_draft, 'role', 'authenticated', 'aal', 'aal1')::text, true);
    SET LOCAL ROLE authenticated;
    BEGIN
      UPDATE public.profiles SET profile_status = 'pending_approval' WHERE id = v_draft_p;
      v_r := v_r || 'FAIL a man of 20 could submit'::text; v_failed := v_failed + 1;
    EXCEPTION WHEN raise_exception THEN v_r := v_r || 'ok a man under 21 cannot submit'::text;
    END;
    RESET ROLE;
    UPDATE public.profiles SET gender = 'female' WHERE id = v_draft_p;
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_draft, 'role', 'authenticated', 'aal', 'aal1')::text, true);
    SET LOCAL ROLE authenticated;
    UPDATE public.profiles SET profile_status = 'pending_approval' WHERE id = v_draft_p;
    GET DIAGNOSTICS v_n = ROW_COUNT;
    RESET ROLE;
    v_ok := v_n = 1 AND (SELECT profile_status FROM public.profiles WHERE id = v_draft_p) = 'pending_approval';
    v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'a woman of 20 can submit');
    IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
    UPDATE public.profiles SET profile_status = 'draft', date_of_birth = NULL WHERE id = v_draft_p;
    PERFORM set_config('request.jwt.claims', json_build_object('sub', v_draft, 'role', 'authenticated', 'aal', 'aal1')::text, true);
    SET LOCAL ROLE authenticated;
    BEGIN
      UPDATE public.profiles SET profile_status = 'pending_approval' WHERE id = v_draft_p;
      v_r := v_r || 'FAIL submitted without a date of birth'::text; v_failed := v_failed + 1;
    EXCEPTION WHEN raise_exception THEN v_r := v_r || 'ok submitting needs a date of birth'::text;
    END;
    RESET ROLE;
  ELSE
    v_r := v_r || 'skipped minimum-age checks: no draft profile to use'::text;
  END IF;

  -- Signed-out visitors and members without a profile.
  PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
  SET LOCAL ROLE anon;
  BEGIN
    PERFORM public.search_profiles('{}'::jsonb);
    v_r := v_r || 'FAIL a guest can search'::text; v_failed := v_failed + 1;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok guests cannot search'::text;
  END;
  BEGIN
    PERFORM public.block_member(v_woman_p);
    v_r := v_r || 'FAIL a guest can block'::text; v_failed := v_failed + 1;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok guests cannot block'::text;
  END;
  RESET ROLE;

  RAISE EXCEPTION E'TEST REPORT (rolled back) FAILED: %\n%', v_failed, array_to_string(v_r, E'\n');
END;
$test$;

-- ── Part 2: run AFTER supabase/pending/014_run_by_hand.sql ────────────────────
-- Checks that a block hides the two members from each other even on a direct read, and that
-- unblocking brings them back. Ends in an error too, so nothing is saved.
DO $test2$
DECLARE
  v_today date := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  v_man uuid; v_man_p uuid; v_woman uuid; v_woman_p uuid;
  v_r text[] := '{}'; v_failed int := 0; v_ok boolean; v_n int; v_j jsonb;
BEGIN
  SELECT user_id, id INTO v_man, v_man_p FROM public.profiles WHERE profile_status = 'approved' AND gender = 'male' ORDER BY created_at LIMIT 1;
  SELECT user_id, id INTO v_woman, v_woman_p FROM public.profiles WHERE profile_status = 'approved' AND gender = 'female' ORDER BY created_at LIMIT 1;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_man, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_woman_p;
  v_ok := v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'before the block, the man can read the woman''s profile');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  v_j := public.block_member(v_woman_p);
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_woman_p;
  v_ok := (v_j ->> 'success')::boolean AND v_n = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'after the block, a direct read of her profile returns nothing');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_woman, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_man_p;
  v_ok := v_n = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'the blocked woman cannot read the man''s profile either');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_man, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_j := public.unblock_member(v_woman_p);
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_woman_p;
  v_ok := (v_j ->> 'success')::boolean AND v_n = 1 AND jsonb_array_length(public.get_my_blocked_members()) = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'unblocking brings her back');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_woman, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_man_p;
  v_ok := v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'and she can see him again');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  RAISE EXCEPTION E'TEST REPORT PART 2 (rolled back) FAILED: %\n%', v_failed, array_to_string(v_r, E'\n');
END;
$test2$;
