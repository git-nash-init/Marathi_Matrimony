-- Rolls back the Phase 4 database changes (migrations 016 and 016b). Run by hand in the SQL Editor.
-- The approve and reject functions keep their new, stricter behaviour; their pre-016 bodies are in
-- supabase/baseline/live_schema_2026-11-05.sql if you want them back exactly.

DROP FUNCTION IF EXISTS public.admin_request_correction(uuid, text[], text);
DROP FUNCTION IF EXISTS public.get_my_profile_review();
DROP FUNCTION IF EXISTS public.admin_approval_queue(text, text, int, int);
DROP FUNCTION IF EXISTS public.admin_remove_photo(uuid, text, text);
DROP FUNCTION IF EXISTS public.submit_id_verification(text[], text);
DROP FUNCTION IF EXISTS public.get_my_verification();
DROP FUNCTION IF EXISTS public.admin_verification_queue(text, int, int);
DROP FUNCTION IF EXISTS public.admin_open_verification_documents(uuid);
DROP FUNCTION IF EXISTS public.admin_review_verification(uuid, boolean, text);
DROP FUNCTION IF EXISTS public.report_member(uuid, text, text);
DROP FUNCTION IF EXISTS public.admin_list_reports(text, int, int);

GRANT EXECUTE ON FUNCTION
  public.admin_batch_approve_pending(), public.admin_toggle_user_suspension(uuid, boolean, text),
  public.admin_moderate_photo(uuid, text, text), public.admin_list_profiles()
TO authenticated;

ALTER POLICY verifications_user_insert_policy ON public.verifications WITH CHECK (user_id = auth.uid());
ALTER POLICY verifications_admin_manage_policy ON public.verifications USING (public.is_admin());

-- Kept deliberately: profile_reviews and the extra moderation_reports columns hold decision history.
