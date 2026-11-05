-- Run this yourself: Supabase dashboard > SQL Editor > paste > Run.
--
-- This is the last piece of Phase 2. The Supabase MCP tool declines any statement containing DELETE
-- or DROP, so it could not be applied from here. Safe to run more than once.

CREATE OR REPLACE FUNCTION public.unblock_member(p_target uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_me uuid := public.get_my_profile_id();
BEGIN
  IF auth.uid() IS NULL OR v_me IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'AUTH_REQUIRED', 'error', 'Please log in.');
  END IF;
  DELETE FROM public.user_blocks WHERE blocker_profile_id = v_me AND blocked_profile_id = p_target;
  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.unblock_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unblock_member(uuid) TO authenticated, service_role;
