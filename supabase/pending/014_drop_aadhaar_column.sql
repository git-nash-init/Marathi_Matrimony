-- 014: Run ONLY after the client from Phase 1 is live on Hostinger.
-- The site currently deployed still sends aadhaar_number when saving a profile, and dropping the
-- column first would break profile saving. The trigger from 013 already erases anything sent.

CREATE OR REPLACE FUNCTION public.guard_profile_system_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_ins boolean := TG_OP = 'INSERT';
  v_id_same boolean;
  v_prefix text;
BEGIN
  NEW.age := CASE WHEN NEW.date_of_birth IS NULL THEN NULL
                  ELSE date_part('year', age((now() AT TIME ZONE 'Asia/Kolkata')::date, NEW.date_of_birth))::int END;

  IF current_user IN ('authenticated', 'anon') AND NOT public.is_admin() THEN
    IF v_ins THEN
      NEW.listing_priority := 0; NEW.approved_at := NULL; NEW.is_featured := false;
      NEW.featured_until := NULL; NEW.rejection_reason := NULL;
      NEW.profile_id := public.generate_public_profile_id(); NEW.created_at := now();
    ELSE
      NEW.listing_priority := OLD.listing_priority; NEW.approved_at := OLD.approved_at;
      NEW.is_featured := OLD.is_featured; NEW.featured_until := OLD.featured_until;
      NEW.rejection_reason := OLD.rejection_reason;
      NEW.user_id := OLD.user_id; NEW.profile_id := OLD.profile_id; NEW.created_at := OLD.created_at;
    END IF;

    v_prefix := 'https://hgucqabzlaxelkfiavvm.supabase.co/storage/v1/object/public/profile-photos/' || auth.uid()::text || '/';
    IF NEW.avatar_url IS NOT NULL
       AND (v_ins OR NEW.avatar_url IS DISTINCT FROM OLD.avatar_url)
       AND NOT starts_with(NEW.avatar_url, v_prefix) THEN
      RAISE EXCEPTION 'Photos must be uploaded through the profile form.' USING ERRCODE = '22023';
    END IF;
    IF EXISTS (SELECT 1 FROM unnest(COALESCE(NEW.photos, '{}'::text[])) AS u
               WHERE NOT starts_with(u, v_prefix)
                 AND (v_ins OR NOT (u = ANY (COALESCE(OLD.photos, '{}'::text[]))))) THEN
      RAISE EXCEPTION 'Photos must be uploaded through the profile form.' USING ERRCODE = '22023';
    END IF;

    v_id_same := NOT v_ins AND NEW.aadhaar_last4 IS NOT DISTINCT FROM OLD.aadhaar_last4;

    IF NOT v_ins AND OLD.profile_status = 'suspended' THEN
      NEW.profile_status := 'suspended';
    ELSIF NOT v_ins AND OLD.profile_status = 'approved' THEN
      NEW.profile_status := 'approved';
    ELSIF NOT v_ins AND OLD.profile_status = 'rejected' AND NEW.profile_status = 'draft' THEN
      NEW.profile_status := 'rejected';
    ELSIF NEW.profile_status NOT IN ('draft', 'pending_approval') THEN
      NEW.profile_status := 'pending_approval';
    END IF;

    IF v_id_same AND OLD.verification_status IN ('verified', 'rejected') THEN
      NEW.verification_status := OLD.verification_status;
    ELSIF NEW.verification_status NOT IN ('unverified', 'pending') THEN
      NEW.verification_status := 'pending';
    END IF;
  END IF;

  IF NEW.profile_status = 'approved' AND (TG_OP = 'INSERT' OR OLD.profile_status IS DISTINCT FROM 'approved') THEN
    NEW.approved_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.require_admin_role('admin', 'moderator');
  RETURN COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.created_at DESC) FROM public.profiles p), '[]'::jsonb);
END;
$$;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS aadhaar_number;
