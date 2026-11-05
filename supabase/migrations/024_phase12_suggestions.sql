-- 024: Phase 12. "Did you mean" for searches that find nothing. Draws on public place, caste and work
-- values only, never member names.
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.search_suggestions(p_q text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, extensions AS $$
  WITH terms AS (
    SELECT DISTINCT btrim(t) AS term FROM (
      SELECT city AS t FROM public.profiles WHERE profile_status = 'approved'
      UNION ALL SELECT occupation FROM public.profiles WHERE profile_status = 'approved'
      UNION ALL SELECT education FROM public.profiles WHERE profile_status = 'approved'
      UNION ALL SELECT label_en FROM public.lookup_options WHERE kind = 'community' AND is_active
      UNION ALL SELECT label_mr FROM public.lookup_options WHERE kind = 'community' AND is_active
      UNION ALL SELECT name_en FROM public.districts
      UNION ALL SELECT name_mr FROM public.districts
    ) s WHERE t IS NOT NULL AND btrim(t) <> ''
  ), ranked AS (
    SELECT term, similarity(lower(term), lower(left(btrim(COALESCE(p_q, '')), 60))) AS score
    FROM terms
    WHERE auth.uid() IS NOT NULL AND char_length(btrim(COALESCE(p_q, ''))) >= 3
    ORDER BY score DESC, term LIMIT 5
  )
  SELECT jsonb_build_object(
    'did_you_mean', (SELECT term FROM ranked WHERE score >= 0.4 ORDER BY score DESC, term LIMIT 1),
    'suggestions', COALESCE((SELECT jsonb_agg(term ORDER BY score DESC, term) FROM ranked WHERE score >= 0.25), '[]'::jsonb));
$$;
REVOKE ALL ON FUNCTION public.search_suggestions(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_suggestions(text) TO authenticated, service_role;
