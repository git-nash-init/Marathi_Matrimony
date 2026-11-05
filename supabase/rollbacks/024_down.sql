-- Rolls back Phase 12 (migration 024). Run by hand in the SQL Editor.
DROP FUNCTION IF EXISTS public.search_suggestions(text);
