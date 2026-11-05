-- 016: Phase 4. Profile approval, photo review, ID verification, member reports.
-- Written against the live schema.

-- Every decision made on a profile. Members read their latest through get_my_profile_review only.
CREATE TABLE IF NOT EXISTS public.profile_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('approved', 'rejected', 'correction', 'photo_removed')),
  note text,
  fields text[] NOT NULL DEFAULT '{}',
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profile_reviews_profile ON public.profile_reviews (profile_id, created_at DESC);
ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_reviews FROM PUBLIC, anon, authenticated;

ALTER TABLE public.moderation_reports
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS action_taken text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON public.moderation_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications (status, submitted_at DESC);

-- Members may only ever create a waiting request, and only the review team may change one.
ALTER POLICY verifications_user_insert_policy ON public.verifications
  WITH CHECK (user_id = auth.uid() AND status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL);
ALTER POLICY verifications_admin_manage_policy ON public.verifications
  USING (public.my_admin_role() IN ('super_admin', 'admin', 'moderator'));

-- Size and type limits enforced by storage itself, not only by the browser.
UPDATE storage.buckets SET file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'verification-documents';

-- Internal helper: tells a member something happened. Not callable from the API.
CREATE OR REPLACE FUNCTION public.notify_member(p_user uuid, p_type text, p_title text, p_message text, p_url text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, type, title, message, action_url)
  VALUES (p_user, p_type, p_title, p_message, p_url);
$$;
REVOKE ALL ON FUNCTION public.notify_member(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;

-- ─── Approval ───────────────────────────────────────────────────────────────
-- Approval says the profile may be shown. It no longer claims the person's identity was checked.
CREATE OR REPLACE FUNCTION public.admin_approve_profile(p_profile_id uuid, p_notes text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin', 'moderator');
  v_p public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_p FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002'; END IF;
  IF EXISTS (SELECT 1 FROM public.account_blocks b WHERE b.user_id = v_p.user_id AND b.lifted_at IS NULL) THEN
    RAISE EXCEPTION 'This account is blocked. Unblock it first.' USING ERRCODE = '22023';
  END IF;
  IF v_p.profile_status NOT IN ('pending_approval', 'rejected') THEN
    RAISE EXCEPTION 'Only a submitted or rejected profile can be approved.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles SET profile_status = 'approved', rejection_reason = NULL, updated_at = now() WHERE id = p_profile_id;
  INSERT INTO public.profile_reviews (profile_id, kind, note, reviewed_by) VALUES (p_profile_id, 'approved', p_notes, v_admin);
  PERFORM public.admin_log('profile_approved', 'profiles', p_profile_id::text, jsonb_build_object('notes', p_notes));
  PERFORM public.notify_member(v_p.user_id, 'profile_approved', 'प्रोफाइल मंजूर झाली | Profile approved',
    'आपली प्रोफाइल आता इतर सदस्यांना दिसते. | Your profile is now visible to other members.', '/dashboard');
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_profile(p_profile_id uuid, p_reason text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin', 'moderator');
  v_p public.profiles%ROWTYPE;
  v_reason text := trim(COALESCE(p_reason, ''));
BEGIN
  IF length(v_reason) < 3 THEN
    RAISE EXCEPTION 'Please give a reason so the member knows what happened.' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_p FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002'; END IF;
  IF v_p.profile_status NOT IN ('pending_approval', 'approved') THEN
    RAISE EXCEPTION 'Only a submitted or approved profile can be rejected.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles SET profile_status = 'rejected', rejection_reason = v_reason, updated_at = now() WHERE id = p_profile_id;
  INSERT INTO public.profile_reviews (profile_id, kind, note, reviewed_by) VALUES (p_profile_id, 'rejected', v_reason, v_admin);
  PERFORM public.admin_log('profile_rejected', 'profiles', p_profile_id::text, jsonb_build_object('reason', v_reason));
  PERFORM public.notify_member(v_p.user_id, 'profile_rejected', 'प्रोफाइल मंजूर झाली नाही | Profile not approved',
    v_reason, '/dashboard');
  RETURN true;
END;
$$;

-- Sends a profile back for changes. It returns to draft, so the member can edit and resubmit.
CREATE OR REPLACE FUNCTION public.admin_request_correction(p_profile_id uuid, p_fields text[], p_note text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin', 'moderator');
  v_p public.profiles%ROWTYPE;
  v_note text := trim(COALESCE(p_note, ''));
  v_allowed text[] := ARRAY['name','photos','date_of_birth','community','education','occupation','family','location','about_me','contact'];
BEGIN
  IF length(v_note) < 3 THEN
    RAISE EXCEPTION 'Please tell the member what to change.' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(array_length(p_fields, 1), 0) = 0 OR NOT (p_fields <@ v_allowed) THEN
    RAISE EXCEPTION 'Please choose which parts need changing.' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_p FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002'; END IF;
  IF v_p.profile_status NOT IN ('pending_approval', 'approved') THEN
    RAISE EXCEPTION 'Only a submitted or approved profile can be sent back.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles SET profile_status = 'draft', rejection_reason = v_note, updated_at = now() WHERE id = p_profile_id;
  INSERT INTO public.profile_reviews (profile_id, kind, note, fields, reviewed_by) VALUES (p_profile_id, 'correction', v_note, p_fields, v_admin);
  PERFORM public.admin_log('profile_correction_requested', 'profiles', p_profile_id::text, jsonb_build_object('fields', p_fields, 'note', v_note));
  PERFORM public.notify_member(v_p.user_id, 'profile_correction', 'प्रोफाइलमध्ये बदल आवश्यक | Changes needed on your profile',
    v_note, '/dashboard');
  RETURN true;
END;
$$;

-- What the member should see on their dashboard while the profile waits on them.
CREATE OR REPLACE FUNCTION public.get_my_profile_review()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT jsonb_build_object('kind', r.kind, 'note', r.note, 'fields', to_jsonb(r.fields), 'created_at', r.created_at)
          FROM public.profile_reviews r
          WHERE r.profile_id = p.id AND r.kind IN ('rejected', 'correction')
          ORDER BY r.created_at DESC LIMIT 1)
  FROM public.profiles p
  WHERE p.id = public.get_my_profile_id()
    AND p.profile_status IN ('draft', 'rejected') AND p.rejection_reason IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.admin_approval_queue(
  p_tab text DEFAULT 'pending', p_search text DEFAULT NULL, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
  v_q text := NULLIF(trim(COALESCE(p_search, '')), '');
  v_result jsonb;
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator');
  IF v_q IS NOT NULL THEN v_q := '%' || regexp_replace(v_q, '([%_\\])', '\\\1', 'g') || '%'; END IF;

  WITH sorted AS (
    SELECT p.*, CASE
        WHEN p.profile_status = 'pending_approval' THEN 'pending'
        WHEN p.profile_status = 'draft' AND p.rejection_reason IS NOT NULL THEN 'correction'
        WHEN p.profile_status = 'draft' THEN 'draft'
        ELSE p.profile_status::text END AS tab
    FROM public.profiles p
    WHERE NOT EXISTS (SELECT 1 FROM public.account_blocks b WHERE b.user_id = p.user_id AND b.lifted_at IS NULL)
  ), matched AS (
    SELECT * FROM sorted s
    WHERE v_q IS NULL OR concat_ws(' ', s.first_name, s.last_name) ILIKE v_q OR s.profile_id ILIKE v_q OR s.city ILIKE v_q
  ), page AS (
    SELECT * FROM matched m WHERE m.tab = p_tab
    ORDER BY CASE WHEN p_tab = 'pending' THEN m.updated_at END ASC, m.updated_at DESC
    LIMIT v_limit OFFSET GREATEST(COALESCE(p_offset, 0), 0)
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM matched m WHERE m.tab = p_tab),
    'counts', COALESCE((SELECT jsonb_object_agg(c.tab, c.n) FROM (SELECT tab, count(*) AS n FROM matched GROUP BY tab) c), '{}'::jsonb),
    'items', COALESCE((SELECT jsonb_agg(jsonb_build_object(
        'id', g.id, 'user_id', g.user_id, 'profile_id', g.profile_id, 'first_name', g.first_name, 'last_name', g.last_name,
        'gender', g.gender, 'age', g.age, 'city', g.city, 'state', g.state, 'occupation', g.occupation, 'education', g.education,
        'community', g.community, 'marital_status', g.marital_status, 'about_me', g.about_me, 'avatar_url', g.avatar_url,
        'photos', to_jsonb(g.photos), 'aadhaar_last4', g.aadhaar_last4, 'verification_status', g.verification_status,
        'profile_status', g.profile_status, 'rejection_reason', g.rejection_reason, 'updated_at', g.updated_at, 'created_at', g.created_at)
      ORDER BY CASE WHEN p_tab = 'pending' THEN g.updated_at END ASC, g.updated_at DESC) FROM page g), '[]'::jsonb))
  INTO v_result;
  RETURN v_result;
END;
$$;

-- ─── Photos ─────────────────────────────────────────────────────────────────
-- Takes a photo off a profile and returns its storage path, so the caller can clear the file too:
-- the bucket is public, so a rejected photo must not stay there.
CREATE OR REPLACE FUNCTION public.admin_remove_photo(p_profile_id uuid, p_url text, p_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin', 'moderator');
  v_p public.profiles%ROWTYPE;
  v_reason text := trim(COALESCE(p_reason, ''));
  v_prefix text := 'https://hgucqabzlaxelkfiavvm.supabase.co/storage/v1/object/public/profile-photos/';
  v_photos text[];
BEGIN
  IF length(v_reason) < 3 THEN
    RAISE EXCEPTION 'Please give a reason so the member knows what to upload instead.' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_p FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found.' USING ERRCODE = 'P0002'; END IF;
  IF NOT (p_url = v_p.avatar_url OR p_url = ANY (COALESCE(v_p.photos, '{}'::text[]))) THEN
    RAISE EXCEPTION 'This photo is not on this profile.' USING ERRCODE = '22023';
  END IF;

  v_photos := array_remove(COALESCE(v_p.photos, '{}'::text[]), p_url);
  UPDATE public.profiles
  SET photos = v_photos,
      avatar_url = CASE WHEN avatar_url = p_url THEN v_photos[1] ELSE avatar_url END,
      updated_at = now()
  WHERE id = p_profile_id;

  INSERT INTO public.profile_reviews (profile_id, kind, note, reviewed_by) VALUES (p_profile_id, 'photo_removed', v_reason, v_admin);
  PERFORM public.admin_log('photo_removed', 'profiles', p_profile_id::text, jsonb_build_object('reason', v_reason));
  PERFORM public.notify_member(v_p.user_id, 'photo_removed', 'एक फोटो काढला | A photo was taken down', v_reason, '/profile/edit');
  RETURN jsonb_build_object('path', CASE WHEN starts_with(p_url, v_prefix) THEN substr(p_url, length(v_prefix) + 1) END);
END;
$$;

-- ─── ID verification ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_id_verification(p_paths text[], p_last4 text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_me uuid := public.get_my_profile_id();
  v_user uuid := auth.uid();
  v_status public.verification_status_type;
BEGIN
  IF v_user IS NULL OR v_me IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUTH_REQUIRED', 'error', 'Please log in.');
  END IF;
  IF COALESCE(array_length(p_paths, 1), 0) NOT BETWEEN 1 AND 3 THEN
    RETURN jsonb_build_object('success', false, 'code', 'BAD_FILES', 'error', 'Please upload one to three files.');
  END IF;
  IF p_last4 IS NOT NULL AND p_last4 !~ '^[0-9]{4}$' THEN
    RETURN jsonb_build_object('success', false, 'code', 'BAD_LAST4', 'error', 'Please enter exactly the last 4 digits.');
  END IF;
  IF NOT public.rate_limit_hit('id_verification:' || v_user::text, 5, interval '1 day') THEN
    RETURN jsonb_build_object('success', false, 'code', 'RATE_LIMITED', 'error', 'Too many attempts today. Please try again tomorrow.');
  END IF;

  SELECT verification_status INTO v_status FROM public.profiles WHERE id = v_me;
  IF v_status = 'verified' THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALREADY_VERIFIED', 'error', 'Your identity is already verified.');
  END IF;
  IF EXISTS (SELECT 1 FROM public.verifications WHERE user_id = v_user AND status = 'pending') THEN
    RETURN jsonb_build_object('success', false, 'code', 'ALREADY_WAITING', 'error', 'Your documents are already waiting for review.');
  END IF;
  -- Each file must be this member's own, and must really have been uploaded.
  IF EXISTS (SELECT 1 FROM unnest(p_paths) AS u
             WHERE NOT starts_with(u, v_user::text || '/')
                OR NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = 'verification-documents' AND o.name = u)) THEN
    RETURN jsonb_build_object('success', false, 'code', 'BAD_FILES', 'error', 'We could not find your uploaded file. Please upload it again.');
  END IF;

  INSERT INTO public.verifications (user_id, verification_type, status, document_paths, submitted_at)
  VALUES (v_user, 'government_id', 'pending', p_paths, now());
  UPDATE public.profiles
  SET verification_status = 'pending', aadhaar_last4 = COALESCE(p_last4, aadhaar_last4), updated_at = now()
  WHERE id = v_me;
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_verification()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'status', p.verification_status,
    'aadhaar_last4', p.aadhaar_last4,
    'latest', (SELECT jsonb_build_object('status', v.status, 'notes', v.notes, 'submitted_at', v.submitted_at, 'reviewed_at', v.reviewed_at)
               FROM public.verifications v WHERE v.user_id = p.user_id ORDER BY v.submitted_at DESC LIMIT 1))
  FROM public.profiles p WHERE p.id = public.get_my_profile_id();
$$;

CREATE OR REPLACE FUNCTION public.admin_verification_queue(p_status text DEFAULT 'pending', p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator');
  RETURN jsonb_build_object(
    'total', (SELECT count(*) FROM public.verifications WHERE status::text = p_status),
    'counts', COALESCE((SELECT jsonb_object_agg(c.status, c.n) FROM (SELECT status, count(*) AS n FROM public.verifications GROUP BY status) c), '{}'::jsonb),
    'items', COALESCE((SELECT jsonb_agg(row_to_json(r)) FROM (
      SELECT v.id, v.user_id, v.status, v.notes, v.submitted_at, v.reviewed_at,
             COALESCE(array_length(v.document_paths, 1), 0) AS document_count,
             p.id AS profile_id, p.profile_id AS profile_code, p.first_name, p.last_name, p.gender, p.age,
             p.date_of_birth, p.city, p.avatar_url, p.aadhaar_last4
      FROM public.verifications v
      LEFT JOIN public.profiles p ON p.user_id = v.user_id
      WHERE v.status::text = p_status
      ORDER BY CASE WHEN p_status = 'pending' THEN v.submitted_at END ASC, v.submitted_at DESC
      LIMIT v_limit OFFSET GREATEST(COALESCE(p_offset, 0), 0)) r), '[]'::jsonb));
END;
$$;

-- Every look at someone's identity document is recorded.
CREATE OR REPLACE FUNCTION public.admin_open_verification_documents(p_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_paths text[];
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator');
  SELECT document_paths INTO v_paths FROM public.verifications WHERE id = p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found.' USING ERRCODE = 'P0002'; END IF;
  PERFORM public.admin_log('id_document_viewed', 'verifications', p_id::text, '{}'::jsonb);
  RETURN to_jsonb(COALESCE(v_paths, '{}'::text[]));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_verification(p_id uuid, p_approve boolean, p_note text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin', 'moderator');
  v_row public.verifications%ROWTYPE;
  v_note text := NULLIF(trim(COALESCE(p_note, '')), '');
BEGIN
  SELECT * INTO v_row FROM public.verifications WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found.' USING ERRCODE = 'P0002'; END IF;
  IF v_row.status <> 'pending' THEN
    RAISE EXCEPTION 'This request has already been reviewed.' USING ERRCODE = '22023';
  END IF;
  IF NOT p_approve AND length(COALESCE(v_note, '')) < 3 THEN
    RAISE EXCEPTION 'Please tell the member why, so they can try again.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.verifications
  SET status = CASE WHEN p_approve THEN 'verified' ELSE 'rejected' END::public.verification_status_type,
      notes = v_note, reviewed_by = v_admin, reviewed_at = now()
  WHERE id = p_id;
  UPDATE public.profiles
  SET verification_status = CASE WHEN p_approve THEN 'verified' ELSE 'rejected' END::public.verification_status_type, updated_at = now()
  WHERE user_id = v_row.user_id;

  PERFORM public.admin_log(CASE WHEN p_approve THEN 'id_verified' ELSE 'id_rejected' END, 'verifications', p_id::text, jsonb_build_object('note', v_note));
  IF p_approve THEN
    PERFORM public.notify_member(v_row.user_id, 'id_verified', 'ओळख पडताळली | Identity verified',
      'आपल्या प्रोफाइलवर आता Verified बॅज दिसेल. | Your profile now shows the Verified badge.', '/dashboard');
  ELSE
    PERFORM public.notify_member(v_row.user_id, 'id_rejected', 'ओळखपत्र स्वीकारले नाही | ID document not accepted', v_note, '/dashboard');
  END IF;
  RETURN true;
END;
$$;

-- ─── Member reports ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.report_member(p_target uuid, p_reason text, p_details text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_me uuid := public.get_my_profile_id();
BEGIN
  IF auth.uid() IS NULL OR v_me IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUTH_REQUIRED', 'error', 'Please log in to report a profile.');
  END IF;
  IF p_target = v_me THEN
    RETURN jsonb_build_object('success', false, 'code', 'SELF', 'error', 'You cannot report your own profile.');
  END IF;
  IF p_reason NOT IN ('fake_profile', 'incorrect_information', 'inappropriate_content', 'harassment', 'other') THEN
    RETURN jsonb_build_object('success', false, 'code', 'BAD_REASON', 'error', 'Please choose a reason.');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target) THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'error', 'This profile is no longer available.');
  END IF;
  -- Reporting the same profile again while it is open changes nothing, and tells the member so.
  IF EXISTS (SELECT 1 FROM public.moderation_reports
             WHERE reporter_profile_id = v_me AND reported_profile_id = p_target AND status IN ('open', 'reviewing')) THEN
    RETURN jsonb_build_object('success', true, 'already_reported', true);
  END IF;
  IF NOT public.rate_limit_hit('report:' || auth.uid()::text, 10, interval '1 day') THEN
    RETURN jsonb_build_object('success', false, 'code', 'RATE_LIMITED', 'error', 'You have sent many reports today. Please try again tomorrow.');
  END IF;

  INSERT INTO public.moderation_reports (reporter_profile_id, reported_profile_id, reason, details, status)
  VALUES (v_me, p_target, p_reason, NULLIF(left(trim(COALESCE(p_details, '')), 2000), ''), 'open');
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_reports(p_status text DEFAULT 'open', p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_limit int := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator');
  RETURN jsonb_build_object(
    'total', (SELECT count(*) FROM public.moderation_reports WHERE status = p_status),
    'counts', COALESCE((SELECT jsonb_object_agg(c.status, c.n) FROM (SELECT status, count(*) AS n FROM public.moderation_reports GROUP BY status) c), '{}'::jsonb),
    'items', COALESCE((SELECT jsonb_agg(row_to_json(r)) FROM (
      SELECT m.id, m.reason, m.details, m.status, m.created_at, m.admin_notes, m.action_taken, m.reviewed_at,
             reporter.first_name AS reporter_name, reporter.profile_id AS reporter_code,
             target.id AS target_profile_id, target.user_id AS target_user_id, target.profile_id AS target_code,
             target.first_name AS target_first_name, target.last_name AS target_last_name, target.avatar_url AS target_avatar_url,
             EXISTS (SELECT 1 FROM public.account_blocks b WHERE b.user_id = target.user_id AND b.lifted_at IS NULL) AS target_blocked,
             (SELECT count(*) FROM public.moderation_reports x WHERE x.reported_profile_id = m.reported_profile_id) AS target_report_count
      FROM public.moderation_reports m
      LEFT JOIN public.profiles reporter ON reporter.id = m.reporter_profile_id
      LEFT JOIN public.profiles target ON target.id = m.reported_profile_id
      WHERE m.status = p_status
      ORDER BY CASE WHEN p_status = 'open' THEN m.created_at END ASC, m.created_at DESC
      LIMIT v_limit OFFSET GREATEST(COALESCE(p_offset, 0), 0)) r), '[]'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_resolve_report(p_report_id uuid, p_status text, p_notes text DEFAULT NULL, p_action_taken text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin', 'moderator');
  v_reporter uuid;
BEGIN
  IF p_status NOT IN ('reviewing', 'resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Unknown status.' USING ERRCODE = '22023';
  END IF;
  IF p_action_taken IS NOT NULL AND p_action_taken NOT IN ('none', 'contacted', 'corrected', 'blocked', 'removed') THEN
    RAISE EXCEPTION 'Unknown action.' USING ERRCODE = '22023';
  END IF;
  IF p_status IN ('resolved', 'dismissed') AND length(trim(COALESCE(p_notes, ''))) < 3 THEN
    RAISE EXCEPTION 'Please note what you found.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.moderation_reports
  SET status = p_status, admin_notes = NULLIF(trim(COALESCE(p_notes, '')), ''), action_taken = p_action_taken,
      reviewed_by = v_admin, reviewed_at = now()
  WHERE id = p_report_id
  RETURNING reporter_profile_id INTO v_reporter;
  IF NOT FOUND THEN RAISE EXCEPTION 'Report not found.' USING ERRCODE = 'P0002'; END IF;

  PERFORM public.admin_log('report_' || p_status, 'moderation_reports', p_report_id::text,
    jsonb_build_object('notes', p_notes, 'action_taken', p_action_taken));
  IF p_status IN ('resolved', 'dismissed') THEN
    -- The outcome stays private; the reporter only learns that it was looked at.
    PERFORM public.notify_member(p.user_id, 'report_reviewed', 'आपला रिपोर्ट तपासला | Your report was reviewed',
      'कळवल्याबद्दल धन्यवाद. | Thank you for letting us know.', NULL)
    FROM public.profiles p WHERE p.id = v_reporter;
  END IF;
  RETURN true;
END;
$$;

-- ─── Access ─────────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION
  public.admin_request_correction(uuid, text[], text), public.get_my_profile_review(),
  public.admin_approval_queue(text, text, int, int), public.admin_remove_photo(uuid, text, text),
  public.submit_id_verification(text[], text), public.get_my_verification(),
  public.admin_verification_queue(text, int, int), public.admin_open_verification_documents(uuid),
  public.admin_review_verification(uuid, boolean, text), public.report_member(uuid, text, text),
  public.admin_list_reports(text, int, int)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION
  public.admin_request_correction(uuid, text[], text), public.get_my_profile_review(),
  public.admin_approval_queue(text, text, int, int), public.admin_remove_photo(uuid, text, text),
  public.submit_id_verification(text[], text), public.get_my_verification(),
  public.admin_verification_queue(text, int, int), public.admin_open_verification_documents(uuid),
  public.admin_review_verification(uuid, boolean, text), public.report_member(uuid, text, text),
  public.admin_list_reports(text, int, int)
TO authenticated, service_role;

-- Retired from the API: approving in bulk skips the review, suspending without a record skips
-- account_blocks, and the others read or change tables nothing uses.
REVOKE EXECUTE ON FUNCTION
  public.admin_batch_approve_pending(), public.admin_toggle_user_suspension(uuid, boolean, text),
  public.admin_moderate_photo(uuid, text, text), public.admin_list_profiles()
FROM PUBLIC, anon, authenticated;
