-- 017: Phase 5. Admin dashboard figures. Active means approved and not blocked; inactive is everyone else.
-- Revenue counts captured payments only and never test (gateway = 'dummy') ones.

CREATE OR REPLACE FUNCTION public.admin_dashboard_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_money boolean;
  v_month_start timestamptz := date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata';
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator', 'support');
  v_money := public.my_admin_role() IN ('super_admin', 'admin');

  RETURN jsonb_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'new_last_7_days', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '7 days'),
    'male', (SELECT count(*) FROM public.profiles WHERE gender = 'male'),
    'female', (SELECT count(*) FROM public.profiles WHERE gender = 'female'),
    'active', (SELECT count(*) FROM public.profiles p WHERE p.profile_status = 'approved'
               AND NOT EXISTS (SELECT 1 FROM public.account_blocks b WHERE b.user_id = p.user_id AND b.lifted_at IS NULL)),
    'blocked', (SELECT count(*) FROM public.account_blocks WHERE lifted_at IS NULL),
    'pending_approvals', (SELECT count(*) FROM public.profiles WHERE profile_status = 'pending_approval'),
    'pending_ids', (SELECT count(*) FROM public.verifications WHERE status = 'pending'),
    'open_reports', (SELECT count(*) FROM public.moderation_reports WHERE status IN ('open', 'reviewing')),
    'open_inquiries', (SELECT count(*) FROM public.contact_inquiries WHERE status NOT IN ('resolved', 'closed')),
    'paid_members', CASE WHEN v_money THEN (
      SELECT count(DISTINCT s.user_id) FROM public.subscriptions s
      JOIN public.payments pay ON pay.id = s.payment_id
      WHERE s.status = 'active' AND s.end_date > now() AND pay.status = 'captured' AND pay.gateway <> 'dummy') END,
    'test_members', CASE WHEN v_money THEN (
      SELECT count(DISTINCT s.user_id) FROM public.subscriptions s
      LEFT JOIN public.payments pay ON pay.id = s.payment_id
      WHERE s.status = 'active' AND s.end_date > now() AND (pay.id IS NULL OR pay.gateway = 'dummy')) END,
    'revenue_total', CASE WHEN v_money THEN (
      SELECT COALESCE(sum(amount), 0) FROM public.payments WHERE status = 'captured' AND gateway <> 'dummy') END,
    'revenue_this_month', CASE WHEN v_money THEN (
      SELECT COALESCE(sum(amount), 0) FROM public.payments
      WHERE status = 'captured' AND gateway <> 'dummy' AND paid_at >= v_month_start) END,
    'test_payments', CASE WHEN v_money THEN (
      SELECT count(*) FROM public.payments WHERE gateway = 'dummy') END,
    'generated_at', now());
END;
$$;
REVOKE ALL ON FUNCTION public.admin_dashboard_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats() TO authenticated, service_role;

-- Also applied here: admin_list_users gained p_status = 'inactive', which is the dashboard card's link:
--   OR (v_status = 'inactive' AND (m.blocked OR m.profile_status IS DISTINCT FROM 'approved'))
-- The full function body is in migration 015 with that one condition added.
