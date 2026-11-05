-- Rolls back Phase 11 (migration 023). Run by hand in the SQL Editor.
DROP FUNCTION IF EXISTS public.admin_log_export(text, date, date);
DROP FUNCTION IF EXISTS public.admin_reports(date, date);
