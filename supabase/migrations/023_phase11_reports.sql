-- 023: Phase 11. Reports, in India time. Revenue never includes test payments. Exports carry only
-- profile codes, not names or contact details, and every export is logged.

CREATE OR REPLACE FUNCTION public.admin_reports(p_from date, p_to date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_from date := p_from;
  v_to date := p_to;
  v_start timestamptz;
  v_end timestamptz;
BEGIN
  PERFORM public.require_admin_role('admin');
  IF v_from IS NULL OR v_to IS NULL OR v_from > v_to THEN
    RAISE EXCEPTION 'Please choose a start date before the end date.' USING ERRCODE = '22023';
  END IF;
  IF v_to - v_from > 1100 THEN
    RAISE EXCEPTION 'Please choose a period of up to 3 years.' USING ERRCODE = '22023';
  END IF;
  v_start := v_from::timestamp AT TIME ZONE 'Asia/Kolkata';
  v_end := (v_to + 1)::timestamp AT TIME ZONE 'Asia/Kolkata';

  RETURN jsonb_build_object(
    'from', v_from, 'to', v_to,
    'daily_registrations', (SELECT COALESCE(jsonb_agg(jsonb_build_object('day', d.day, 'count', COALESCE(r.n, 0)) ORDER BY d.day), '[]'::jsonb)
      FROM (SELECT generate_series(GREATEST(v_from, v_to - 89), v_to, interval '1 day')::date AS day) d
      LEFT JOIN (SELECT (created_at AT TIME ZONE 'Asia/Kolkata')::date AS day, count(*) AS n FROM auth.users
                 WHERE created_at >= v_start AND created_at < v_end GROUP BY 1) r ON r.day = d.day),
    'monthly', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'month', to_char(m.month, 'YYYY-MM'),
        'registrations', (SELECT count(*) FROM auth.users u WHERE u.created_at >= GREATEST(m.starts, v_start) AND u.created_at < LEAST(m.ends, v_end)),
        'total_users', (SELECT count(*) FROM auth.users u WHERE u.created_at < LEAST(m.ends, v_end)),
        'revenue', (SELECT COALESCE(sum(amount), 0) FROM public.payments p WHERE p.status = 'captured' AND p.gateway <> 'dummy' AND p.paid_at >= GREATEST(m.starts, v_start) AND p.paid_at < LEAST(m.ends, v_end))
                 + (SELECT COALESCE(sum(amount), 0) FROM public.payment_records_archive a WHERE a.status = 'captured' AND a.gateway <> 'dummy' AND a.paid_at >= GREATEST(m.starts, v_start) AND a.paid_at < LEAST(m.ends, v_end))
      ) ORDER BY m.month), '[]'::jsonb)
      FROM (SELECT g::date AS month, g::timestamp AT TIME ZONE 'Asia/Kolkata' AS starts, (g + interval '1 month')::timestamp AT TIME ZONE 'Asia/Kolkata' AS ends
            FROM generate_series(date_trunc('month', v_from::timestamp), date_trunc('month', v_to::timestamp), interval '1 month') g) m),
    'subscription_sales', (SELECT COALESCE(jsonb_agg(jsonb_build_object('plan', x.name, 'sold', x.sold, 'amount', x.amount, 'test_sold', x.test_sold) ORDER BY x.sold DESC, x.test_sold DESC), '[]'::jsonb)
      FROM (SELECT sp.name,
                   count(*) FILTER (WHERE p.gateway <> 'dummy') AS sold,
                   COALESCE(sum(p.amount) FILTER (WHERE p.gateway <> 'dummy'), 0) AS amount,
                   count(*) FILTER (WHERE p.gateway = 'dummy') AS test_sold
            FROM public.payments p JOIN public.subscription_plans sp ON sp.id = p.plan_id
            WHERE p.status = 'captured' AND p.paid_at >= v_start AND p.paid_at < v_end
            GROUP BY sp.name) x),
    'most_viewed', (SELECT COALESCE(jsonb_agg(jsonb_build_object('profile_code', x.profile_id, 'user_id', x.user_id, 'city', x.city, 'views', x.n) ORDER BY x.n DESC), '[]'::jsonb)
      FROM (SELECT pr.profile_id, pr.user_id, pr.city, count(*) AS n
            FROM public.profile_views v JOIN public.profiles pr ON pr.id = v.viewed_profile_id
            WHERE v.created_at >= v_start AND v.created_at < v_end
            GROUP BY pr.profile_id, pr.user_id, pr.city ORDER BY n DESC LIMIT 10) x));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_log_export(p_format text, p_from date, p_to date)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin');
  IF p_format NOT IN ('excel', 'pdf') THEN RAISE EXCEPTION 'Unknown format.' USING ERRCODE = '22023'; END IF;
  PERFORM public.admin_log('report_exported', 'reports', p_format, jsonb_build_object('from', p_from, 'to', p_to));
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reports(date, date), public.admin_log_export(text, date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reports(date, date), public.admin_log_export(text, date, date) TO authenticated, service_role;
