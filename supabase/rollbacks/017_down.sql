-- Rolls back Phase 5 (migration 017). Run by hand in the SQL Editor.
-- The 'inactive' filter on admin_list_users is harmless and stays.
DROP FUNCTION IF EXISTS public.admin_dashboard_stats();
