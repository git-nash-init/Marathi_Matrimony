-- Rolls back Phase 8 (migration 020). Run by hand in the SQL Editor.
DROP FUNCTION IF EXISTS public.admin_list_payments(text, text, int, int);
DROP FUNCTION IF EXISTS public.admin_list_subscriptions(text, text, int, int);
DROP FUNCTION IF EXISTS public.admin_save_plan(uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_list_plans();
ALTER POLICY plans_admin_manage_policy ON public.subscription_plans USING (public.is_admin());
ALTER POLICY payments_admin_manage_policy ON public.payments USING (public.is_admin());
ALTER POLICY subscriptions_admin_manage_policy ON public.subscriptions USING (public.is_admin());
ALTER POLICY payments_select_policy ON public.payments USING (user_id = auth.uid() OR public.is_admin());
ALTER POLICY subscriptions_select_policy ON public.subscriptions USING (user_id = auth.uid() OR public.is_admin());
-- plan_rank and my_plan keep working with or without custom plans, so they are left as they are.
-- The tier column is kept, because plans created since depend on it.
