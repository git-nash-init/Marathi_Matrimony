-- Rolls back the Phase 3 database changes (migrations 015a and 015b). Run by hand in the SQL Editor.
-- Lift every block first, or those members stay suspended with no record of why.
-- my_plan and the two profile policies go back to their pre-015 form. get_my_profile_id goes back too.
-- The admin-users Edge Function needs these functions, so remove it as well.

DROP FUNCTION IF EXISTS public.admin_list_users(text, text, text, text, int, int);
DROP FUNCTION IF EXISTS public.admin_get_user(uuid);
DROP FUNCTION IF EXISTS public.admin_update_profile(uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_update_contacts(uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_update_preferences(uuid, jsonb);
DROP FUNCTION IF EXISTS public.admin_set_verification(uuid, text, text);
DROP FUNCTION IF EXISTS public.admin_block_user(uuid, text);
DROP FUNCTION IF EXISTS public.admin_unblock_user(uuid);
DROP FUNCTION IF EXISTS public.admin_prepare_user_removal(uuid, text);
DROP FUNCTION IF EXISTS public.admin_prepare_password_reset(uuid);
DROP FUNCTION IF EXISTS public.admin_check_target(uuid);
DROP FUNCTION IF EXISTS public.allowed_changes(jsonb, text[]);
DROP FUNCTION IF EXISTS public.admin_log(text, text, text, jsonb);
DROP FUNCTION IF EXISTS public.audit_diff(jsonb, jsonb, text[], text[]);

ALTER POLICY profiles_select_policy ON public.profiles
  USING (public.is_admin()
         OR user_id = auth.uid()
         OR (profile_status = 'approved' AND NOT public.is_blocked_with(id)));
ALTER POLICY profiles_update_policy ON public.profiles
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.my_plan()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_slug text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'none'; END IF;
  IF public.is_admin(auth.uid()) THEN RETURN 'platinum'; END IF;
  SELECT p.slug INTO v_slug
  FROM public.subscriptions s
  JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE s.user_id = auth.uid() AND s.status = 'active' AND s.end_date > now()
  ORDER BY public.plan_rank(p.slug) DESC, s.end_date DESC
  LIMIT 1;
  RETURN COALESCE(v_slug, 'none');
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

DROP FUNCTION IF EXISTS public.get_my_account_status();
DROP FUNCTION IF EXISTS public.is_account_blocked();

-- Kept deliberately: account_blocks and payment_records_archive hold history that should not be lost.
-- Drop them yourself only if you are sure:
--   DROP TABLE public.account_blocks;
--   DROP TABLE public.payment_records_archive;
