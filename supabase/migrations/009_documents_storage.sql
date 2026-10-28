-- 009_documents_storage.sql
-- Diamond+ "Documents section": private bucket + metadata table. Object path: <profile uuid>/<doc_type>-<ts>.<ext>

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-documents', 'profile-documents', false, 5242880, ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf','image/jpeg','image/png'];

CREATE TABLE IF NOT EXISTS public.profile_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN ('biodata','horoscope','education')),
  storage_path text NOT NULL,
  file_name text NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes <= 5242880),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, doc_type)
);
ALTER TABLE public.profile_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_documents_owner_all ON public.profile_documents;
CREATE POLICY profile_documents_owner_all ON public.profile_documents FOR ALL TO authenticated
  USING (profile_id = (SELECT public.get_my_profile_id()) OR (SELECT public.is_admin()))
  WITH CHECK (profile_id = (SELECT public.get_my_profile_id()));

-- Storage: owner manages own folder; admins and has_feature('unlock_documents') members may read approved profiles' files.
DROP POLICY IF EXISTS profile_documents_owner_write ON storage.objects;
CREATE POLICY profile_documents_owner_write ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'profile-documents' AND (storage.foldername(name))[1] = (SELECT public.get_my_profile_id())::text)
  WITH CHECK (bucket_id = 'profile-documents' AND (storage.foldername(name))[1] = (SELECT public.get_my_profile_id())::text);

DROP POLICY IF EXISTS profile_documents_premium_read ON storage.objects;
CREATE POLICY profile_documents_premium_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-documents' AND (
    (SELECT public.is_admin())
    OR ((SELECT public.has_feature('unlock_documents'))
        AND EXISTS (SELECT 1 FROM public.profiles p
                    WHERE p.id::text = (storage.foldername(name))[1] AND p.profile_status = 'approved'))));

-- Document list for a profile (metadata only). Owner, admin, or Diamond+ for approved profiles.
CREATE OR REPLACE FUNCTION public.get_profile_documents(p_target uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (p_target = public.get_my_profile_id() OR public.is_admin()
          OR (public.has_feature('unlock_documents')
              AND EXISTS (SELECT 1 FROM public.profiles WHERE id = p_target AND profile_status = 'approved'))) THEN
    RAISE EXCEPTION 'FEATURE_LOCKED';
  END IF;
  RETURN COALESCE((SELECT jsonb_agg(jsonb_build_object('doc_type', doc_type, 'storage_path', storage_path,
                                                       'file_name', file_name, 'created_at', created_at) ORDER BY doc_type)
                   FROM public.profile_documents WHERE profile_id = p_target), '[]'::jsonb);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_profile_documents(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profile_documents(uuid) TO authenticated;
