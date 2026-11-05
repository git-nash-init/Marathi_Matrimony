-- Phase 4 database checks. Always ends in an error on purpose: "TEST REPORT (rolled back) FAILED: n".
-- The error rolls back every change, so nothing stays in the database. Look for FAILED: 0.
DO $test$
DECLARE
  v_admin uuid; v_member uuid; v_member_p uuid; v_viewer uuid; v_viewer_p uuid; v_rid uuid; v_vid uuid;
  v_r text[] := '{}'; v_failed int := 0; v_ok boolean; v_n int; v_j jsonb;
  v_url text := 'https://hgucqabzlaxelkfiavvm.supabase.co/storage/v1/object/public/profile-photos/abc/one.jpg';
  v_open int := (SELECT count(*) FROM public.moderation_reports WHERE status = 'open');
  v_waiting int := (SELECT count(*) FROM public.verifications WHERE status = 'pending');
BEGIN
  SELECT user_id INTO v_admin FROM public.admin_users WHERE role = 'super_admin' AND is_active LIMIT 1;
  SELECT user_id, id INTO v_member, v_member_p FROM public.profiles
    WHERE profile_status = 'approved' AND gender = 'male' AND user_id <> v_admin ORDER BY created_at LIMIT 1;
  SELECT p.user_id, p.id INTO v_viewer, v_viewer_p FROM public.profiles p
    WHERE p.gender = 'female' AND NOT EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = p.user_id)
    ORDER BY p.created_at LIMIT 1;
  UPDATE public.profiles SET profile_status = 'pending_approval', verification_status = 'unverified',
    photos = ARRAY[v_url], avatar_url = v_url WHERE id = v_member_p;

  -- Members are refused
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_viewer, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN PERFORM public.admin_approval_queue(); v_failed := v_failed + 1; v_r := v_r || 'FAIL member read queue'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot read the queue'::text; END;
  BEGIN PERFORM public.admin_approve_profile(v_viewer_p); v_failed := v_failed + 1; v_r := v_r || 'FAIL member approved'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot approve'::text; END;
  BEGIN PERFORM public.admin_list_reports(); v_failed := v_failed + 1; v_r := v_r || 'FAIL member read reports'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot read reports'::text; END;
  BEGIN PERFORM public.admin_batch_approve_pending(); v_failed := v_failed + 1; v_r := v_r || 'FAIL batch still callable'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok bulk approve is retired'::text; END;
  BEGIN
    INSERT INTO public.verifications (user_id, verification_type, status) VALUES (v_viewer, 'government_id', 'verified');
    v_failed := v_failed + 1; v_r := v_r || 'FAIL member marked themselves verified'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok member cannot insert a verified request'::text; END;

  -- Reports
  v_j := public.report_member(v_member_p, 'fake_profile', 'Looks fake');
  v_ok := (v_j ->> 'success')::boolean AND NOT v_j ? 'already_reported';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'report is saved');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  v_j := public.report_member(v_member_p, 'fake_profile', 'again');
  v_ok := (v_j ->> 'already_reported')::boolean;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'second report while open is not duplicated');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  v_j := public.report_member(v_viewer_p, 'fake_profile', NULL);
  v_ok := v_j ->> 'code' = 'SELF';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'cannot report yourself');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  v_j := public.report_member(v_member_p, 'made_up', NULL);
  v_ok := v_j ->> 'code' = 'BAD_REASON';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'unknown reason refused');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  -- ID: someone else's path, and a file that does not exist
  v_j := public.submit_id_verification(ARRAY[v_member::text || '/x.jpg'], NULL);
  v_ok := v_j ->> 'code' = 'BAD_FILES';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'another member''s file path refused');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  v_j := public.submit_id_verification(ARRAY[v_viewer::text || '/never-uploaded.jpg'], NULL);
  v_ok := v_j ->> 'code' = 'BAD_FILES';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'a file that was never uploaded is refused');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  v_j := public.submit_id_verification(ARRAY[v_viewer::text || '/x.jpg'], '12');
  v_ok := v_j ->> 'code' = 'BAD_LAST4';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'last 4 must be 4 digits');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  INSERT INTO public.verifications (user_id, verification_type, status, document_paths)
    VALUES (v_viewer, 'government_id', 'pending', ARRAY[v_viewer::text || '/x.jpg']) RETURNING id INTO v_vid;
  SELECT id INTO v_rid FROM public.moderation_reports WHERE reporter_profile_id = v_viewer_p AND reported_profile_id = v_member_p;

  -- Admin
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_j := public.admin_approval_queue('pending', NULL, 5, 0);
  v_ok := (v_j ->> 'total')::int >= 1 AND (v_j -> 'counts' ->> 'pending')::int >= 1 AND v_j::text NOT LIKE '%aadhaar_number%';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'queue lists pending with counts, no full ID');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  v_j := public.admin_approval_queue('pending', '100%', 5, 0);
  v_ok := (v_j ->> 'total')::int = 0;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'search treats % as text');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  BEGIN PERFORM public.admin_reject_profile(v_member_p, ' '); v_failed := v_failed + 1; v_r := v_r || 'FAIL reject without reason'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok reject needs a reason'::text; END;
  BEGIN PERFORM public.admin_request_correction(v_member_p, ARRAY['made_up'], 'fix it'); v_failed := v_failed + 1; v_r := v_r || 'FAIL unknown field'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok correction needs known fields'::text; END;
  BEGIN PERFORM public.admin_remove_photo(v_member_p, 'https://evil.example/x.jpg', 'bad photo'); v_failed := v_failed + 1; v_r := v_r || 'FAIL foreign photo'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok photo must be on the profile'::text; END;

  v_j := public.admin_remove_photo(v_member_p, v_url, 'Not a clear photo');
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_member_p AND avatar_url IS NULL AND COALESCE(array_length(photos, 1), 0) = 0;
  v_ok := v_n = 1 AND v_j ->> 'path' = 'abc/one.jpg';
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'photo removal clears photo and returns its path');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  PERFORM public.admin_request_correction(v_member_p, ARRAY['photos', 'about_me'], 'Please add a clear photo');
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_member, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  v_j := public.get_my_profile_review();
  v_ok := v_j ->> 'kind' = 'correction' AND v_j -> 'fields' ? 'photos';
  SELECT count(*) INTO v_n FROM public.notifications WHERE user_id = v_member AND type = 'profile_correction';
  v_ok := v_ok AND v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'member sees what to change and is notified');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  UPDATE public.profiles SET rejection_reason = NULL WHERE user_id = v_member;
  SELECT count(*) INTO v_n FROM public.profiles WHERE user_id = v_member AND rejection_reason IS NOT NULL;
  v_ok := v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'member cannot wipe the admin note');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  RESET ROLE;

  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated', 'aal', 'aal1')::text, true);
  SET LOCAL ROLE authenticated;
  BEGIN PERFORM public.admin_approve_profile(v_member_p); v_failed := v_failed + 1; v_r := v_r || 'FAIL draft approved'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok a draft cannot be approved'::text; END;
  RESET ROLE;
  UPDATE public.profiles SET profile_status = 'pending_approval' WHERE id = v_member_p;
  SET LOCAL ROLE authenticated;
  PERFORM public.admin_approve_profile(v_member_p);
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_member_p AND profile_status = 'approved' AND verification_status = 'unverified' AND rejection_reason IS NULL;
  v_ok := v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'approval does not mark the person verified');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  SET LOCAL ROLE authenticated;
  PERFORM public.admin_block_user(v_member, 'Fake profile');
  RESET ROLE;
  UPDATE public.profiles SET profile_status = 'pending_approval' WHERE id = v_member_p;
  SET LOCAL ROLE authenticated;
  BEGIN PERFORM public.admin_approve_profile(v_member_p); v_failed := v_failed + 1; v_r := v_r || 'FAIL blocked approved'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok a blocked account cannot be approved'::text; END;

  v_j := public.admin_verification_queue('pending', 100, 0);
  v_ok := (v_j ->> 'total')::int = v_waiting + 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'ID queue lists the request');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  PERFORM public.admin_open_verification_documents(v_vid);
  SELECT count(*) INTO v_n FROM public.audit_logs WHERE action = 'id_document_viewed' AND target_id = v_vid::text;
  v_ok := v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'opening an ID document is logged');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  BEGIN PERFORM public.admin_review_verification(v_vid, false, ''); v_failed := v_failed + 1; v_r := v_r || 'FAIL ID reject without note'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok ID rejection needs a note'::text; END;
  PERFORM public.admin_review_verification(v_vid, true, NULL);
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_viewer_p AND verification_status = 'verified';
  v_ok := v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'ID approval verifies the member');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  SET LOCAL ROLE authenticated;
  BEGIN PERFORM public.admin_review_verification(v_vid, false, 'changed my mind'); v_failed := v_failed + 1; v_r := v_r || 'FAIL reviewed twice'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok a request is reviewed only once'::text; END;

  v_j := public.admin_list_reports('open', 100, 0);
  v_ok := (v_j ->> 'total')::int = v_open + 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'reports list works');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;
  BEGIN PERFORM public.admin_resolve_report(v_rid, 'resolved', '', 'blocked'); v_failed := v_failed + 1; v_r := v_r || 'FAIL resolve without note'::text;
  EXCEPTION WHEN invalid_parameter_value THEN v_r := v_r || 'ok resolving needs a note'::text; END;
  PERFORM public.admin_resolve_report(v_rid, 'resolved', 'Confirmed fake', 'blocked');
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.notifications WHERE user_id = v_viewer AND type = 'report_reviewed' AND message NOT LIKE '%fake%';
  v_ok := v_n = 1;
  v_r := v_r || (CASE WHEN v_ok THEN 'ok ' ELSE 'FAIL ' END || 'reporter is told, without the outcome');
  IF NOT v_ok THEN v_failed := v_failed + 1; END IF;

  -- Support role: no access to the review tools
  ALTER TABLE public.admin_users DISABLE TRIGGER trg_guard_last_super_admin;
  UPDATE public.admin_users SET role = 'support' WHERE user_id = v_admin;
  SET LOCAL ROLE authenticated;
  BEGIN PERFORM public.admin_open_verification_documents(v_vid); v_failed := v_failed + 1; v_r := v_r || 'FAIL support opened ID'::text;
  EXCEPTION WHEN insufficient_privilege THEN v_r := v_r || 'ok support cannot open ID documents'::text; END;
  RESET ROLE;

  RAISE EXCEPTION E'TEST REPORT (rolled back) FAILED: %\n%', v_failed, array_to_string(v_r, E'\n');
END;
$test$;
