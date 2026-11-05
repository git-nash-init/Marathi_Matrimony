-- 019: Phase 7. Website text editing, success stories, platform settings.
-- Text is stored by slot and always rendered as plain text by React, so no HTML can be injected.

CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY CHECK (key ~ '^[a-zA-Z0-9_.]{1,120}$'),
  en text CHECK (char_length(en) <= 20000),
  mr text CHECK (char_length(mr) <= 20000),
  draft_en text CHECK (char_length(draft_en) <= 20000),
  draft_mr text CHECK (char_length(draft_mr) <= 20000),
  published_at timestamptz,
  published_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_content FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.site_content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  en text,
  mr text,
  published_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_content_versions_key ON public.site_content_versions (key, created_at DESC);
ALTER TABLE public.site_content_versions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_content_versions FROM PUBLIC, anon, authenticated;

-- Only what is published, for every visitor.
CREATE OR REPLACE FUNCTION public.get_site_content()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(jsonb_object_agg(key, jsonb_build_object('en', en, 'mr', mr)), '{}'::jsonb)
  FROM public.site_content WHERE en IS NOT NULL OR mr IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_content()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin');
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(c)) FROM public.site_content c), '[]'::jsonb);
END;
$$;

-- Links must be web links, so a pasted javascript: address can never reach a visitor's click.
CREATE OR REPLACE FUNCTION public.content_value_ok(p_key text, p_value text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT p_value IS NULL OR p_key NOT LIKE 'brand.social.%' OR p_value = '' OR p_value ~* '^https://[^\s<>"'']+$';
$$;

CREATE OR REPLACE FUNCTION public.admin_save_content_draft(p_key text, p_en text, p_mr text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin uuid := public.require_admin_role('admin');
BEGIN
  IF COALESCE(btrim(p_en), '') = '' AND COALESCE(btrim(p_mr), '') = '' THEN
    RAISE EXCEPTION 'Please enter the text in at least one language.' USING ERRCODE = '22023';
  END IF;
  IF NOT (public.content_value_ok(p_key, p_en) AND public.content_value_ok(p_key, p_mr)) THEN
    RAISE EXCEPTION 'A social link must start with https://' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.site_content (key, draft_en, draft_mr, updated_at, updated_by)
  VALUES (p_key, p_en, p_mr, now(), v_admin)
  ON CONFLICT (key) DO UPDATE SET draft_en = EXCLUDED.draft_en, draft_mr = EXCLUDED.draft_mr, updated_at = now(), updated_by = v_admin;
  PERFORM public.admin_log('content_draft_saved', 'site_content', p_key, '{}'::jsonb);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_publish_content(p_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin');
  v_row public.site_content%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.site_content WHERE key = p_key FOR UPDATE;
  IF NOT FOUND OR (v_row.draft_en IS NULL AND v_row.draft_mr IS NULL) THEN
    RAISE EXCEPTION 'There is no draft to publish.' USING ERRCODE = '22023';
  END IF;
  -- The outgoing text is kept, so publishing can always be undone.
  INSERT INTO public.site_content_versions (key, en, mr, published_by) VALUES (p_key, v_row.en, v_row.mr, v_admin);
  UPDATE public.site_content
  SET en = NULLIF(btrim(draft_en), ''), mr = NULLIF(btrim(draft_mr), ''), draft_en = NULL, draft_mr = NULL,
      published_at = now(), published_by = v_admin, updated_at = now(), updated_by = v_admin
  WHERE key = p_key;
  PERFORM public.admin_log('content_published', 'site_content', p_key, '{}'::jsonb);
  RETURN true;
END;
$$;

-- Goes back to the original text built into the site.
CREATE OR REPLACE FUNCTION public.admin_reset_content(p_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin');
  v_row public.site_content%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.site_content WHERE key = p_key FOR UPDATE;
  IF NOT FOUND THEN RETURN true; END IF;
  INSERT INTO public.site_content_versions (key, en, mr, published_by) VALUES (p_key, v_row.en, v_row.mr, v_admin);
  UPDATE public.site_content SET en = NULL, mr = NULL, draft_en = NULL, draft_mr = NULL, updated_at = now(), updated_by = v_admin WHERE key = p_key;
  PERFORM public.admin_log('content_reset', 'site_content', p_key, '{}'::jsonb);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_content_history(p_key text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin');
  RETURN COALESCE((SELECT jsonb_agg(row_to_json(v)) FROM (
    SELECT id, en, mr, created_at FROM public.site_content_versions WHERE key = p_key ORDER BY created_at DESC LIMIT 20) v), '[]'::jsonb);
END;
$$;

-- ─── Success stories ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_names_en text NOT NULL CHECK (char_length(couple_names_en) BETWEEN 1 AND 120),
  couple_names_mr text NOT NULL CHECK (char_length(couple_names_mr) BETWEEN 1 AND 120),
  story_en text NOT NULL CHECK (char_length(story_en) BETWEEN 1 AND 3000),
  story_mr text NOT NULL CHECK (char_length(story_mr) BETWEEN 1 AND 3000),
  location_en text CHECK (char_length(location_en) <= 120),
  location_mr text CHECK (char_length(location_mr) <= 120),
  wedding_date date,
  photo_url text,
  consent_confirmed boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  -- A real couple's story can never be public without their agreement.
  CONSTRAINT stories_published_needs_consent CHECK (NOT is_published OR consent_confirmed)
);
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.success_stories FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.success_stories TO anon, authenticated;
CREATE POLICY stories_public_read ON public.success_stories FOR SELECT TO anon, authenticated USING (is_published);

CREATE OR REPLACE FUNCTION public.admin_list_stories()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin');
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sort_order, s.created_at DESC) FROM public.success_stories s), '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_save_story(p_id uuid, p jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('admin');
  v_id uuid;
  v_publish boolean := COALESCE((p ->> 'is_published')::boolean, false);
  v_consent boolean := COALESCE((p ->> 'consent_confirmed')::boolean, false);
  v_photo text := NULLIF(p ->> 'photo_url', '');
BEGIN
  IF v_publish AND NOT v_consent THEN
    RAISE EXCEPTION 'Please confirm the couple agreed before publishing.' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(btrim(p ->> 'couple_names_en'), '') = '' OR COALESCE(btrim(p ->> 'couple_names_mr'), '') = ''
     OR COALESCE(btrim(p ->> 'story_en'), '') = '' OR COALESCE(btrim(p ->> 'story_mr'), '') = '' THEN
    RAISE EXCEPTION 'Please give the names and the story in both languages.' USING ERRCODE = '22023';
  END IF;
  IF v_photo IS NOT NULL AND NOT starts_with(v_photo, 'https://hgucqabzlaxelkfiavvm.supabase.co/storage/v1/object/public/site-media/') THEN
    RAISE EXCEPTION 'Please upload the photo here rather than linking to it.' USING ERRCODE = '22023';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.success_stories (couple_names_en, couple_names_mr, story_en, story_mr, location_en, location_mr, wedding_date, photo_url, consent_confirmed, is_published, sort_order, updated_by)
    VALUES (btrim(p ->> 'couple_names_en'), btrim(p ->> 'couple_names_mr'), btrim(p ->> 'story_en'), btrim(p ->> 'story_mr'),
            NULLIF(btrim(p ->> 'location_en'), ''), NULLIF(btrim(p ->> 'location_mr'), ''), NULLIF(p ->> 'wedding_date', '')::date,
            v_photo, v_consent, v_publish, COALESCE((p ->> 'sort_order')::int, 0), v_admin)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.success_stories SET
      couple_names_en = btrim(p ->> 'couple_names_en'), couple_names_mr = btrim(p ->> 'couple_names_mr'),
      story_en = btrim(p ->> 'story_en'), story_mr = btrim(p ->> 'story_mr'),
      location_en = NULLIF(btrim(p ->> 'location_en'), ''), location_mr = NULLIF(btrim(p ->> 'location_mr'), ''),
      wedding_date = NULLIF(p ->> 'wedding_date', '')::date, photo_url = v_photo,
      consent_confirmed = v_consent, is_published = v_publish, sort_order = COALESCE((p ->> 'sort_order')::int, sort_order),
      updated_at = now(), updated_by = v_admin
    WHERE id = p_id RETURNING id INTO v_id;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Story not found.' USING ERRCODE = 'P0002'; END IF;
  END IF;
  PERFORM public.admin_log('story_saved', 'success_stories', v_id::text, jsonb_build_object('published', v_publish));
  RETURN v_id;
END;
$$;

-- Public read; only admins can add files. SVG is excluded because it can carry scripts.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-media', 'site-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];
CREATE POLICY site_media_admin_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.my_admin_role() IN ('super_admin', 'admin'));

-- ─── Settings ───────────────────────────────────────────────────────────────
-- Members only ever need these. The rest of the table stays with the people who run the site.
ALTER POLICY platform_settings_select_policy ON public.platform_settings
  USING (key IN ('maintenance_mode', 'match_age_gap', 'admin_mfa_required') OR public.is_admin());

CREATE OR REPLACE FUNCTION public.get_public_settings()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object('maintenance_mode', COALESCE((SELECT (value)::text = 'true' FROM public.platform_settings WHERE key = 'maintenance_mode'), false));
$$;

CREATE OR REPLACE FUNCTION public.admin_get_settings()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator', 'support');
  RETURN (SELECT jsonb_object_agg(key, value) FROM public.platform_settings WHERE key IN ('match_age_gap', 'maintenance_mode'));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_setting(p_key text, p_value jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid := public.require_admin_role('super_admin');
  v_old jsonb;
BEGIN
  IF p_key = 'match_age_gap' THEN
    IF jsonb_typeof(p_value) <> 'number' OR (p_value)::text !~ '^[0-9]+$' OR (p_value)::text::int > 20 THEN
      RAISE EXCEPTION 'The age gap must be a whole number from 0 to 20.' USING ERRCODE = '22023';
    END IF;
  ELSIF p_key = 'maintenance_mode' THEN
    IF jsonb_typeof(p_value) <> 'boolean' THEN RAISE EXCEPTION 'Maintenance mode is on or off.' USING ERRCODE = '22023'; END IF;
  ELSE
    RAISE EXCEPTION 'This setting cannot be changed here.' USING ERRCODE = '22023';
  END IF;
  SELECT value INTO v_old FROM public.platform_settings WHERE key = p_key;
  UPDATE public.platform_settings SET value = p_value, updated_by = v_admin, updated_at = now() WHERE key = p_key;
  IF NOT FOUND THEN RAISE EXCEPTION 'Setting not found.' USING ERRCODE = 'P0002'; END IF;
  PERFORM public.admin_log('setting_changed', 'platform_settings', p_key, jsonb_build_object('old', v_old, 'new', p_value));
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.content_value_ok(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_list_content(), public.admin_save_content_draft(text, text, text), public.admin_publish_content(text),
  public.admin_reset_content(text), public.admin_content_history(text), public.admin_list_stories(), public.admin_save_story(uuid, jsonb),
  public.admin_get_settings(), public.admin_set_setting(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_content(), public.admin_save_content_draft(text, text, text), public.admin_publish_content(text),
  public.admin_reset_content(text), public.admin_content_history(text), public.admin_list_stories(), public.admin_save_story(uuid, jsonb),
  public.admin_get_settings(), public.admin_set_setting(text, jsonb) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_site_content(), public.get_public_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_site_content(), public.get_public_settings() TO anon, authenticated, service_role;
