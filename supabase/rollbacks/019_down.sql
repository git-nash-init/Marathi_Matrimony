-- Rolls back Phase 7 (migration 019). Run by hand in the SQL Editor. Published text and stories are lost if you
-- run the commented lines, so leave them unless you are sure.
DROP FUNCTION IF EXISTS public.admin_set_setting(text, jsonb);
DROP FUNCTION IF EXISTS public.admin_get_settings();
DROP FUNCTION IF EXISTS public.get_public_settings();
DROP FUNCTION IF EXISTS public.admin_save_story(uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_list_stories();
DROP FUNCTION IF EXISTS public.admin_content_history(text);
DROP FUNCTION IF EXISTS public.admin_reset_content(text);
DROP FUNCTION IF EXISTS public.admin_publish_content(text);
DROP FUNCTION IF EXISTS public.admin_save_content_draft(text, text, text);
DROP FUNCTION IF EXISTS public.admin_list_content();
DROP FUNCTION IF EXISTS public.content_value_ok(text, text);
DROP FUNCTION IF EXISTS public.get_site_content();
DROP POLICY IF EXISTS site_media_admin_insert ON storage.objects;
ALTER POLICY platform_settings_select_policy ON public.platform_settings USING (true);
-- DROP TABLE public.success_stories; DROP TABLE public.site_content_versions; DROP TABLE public.site_content;
