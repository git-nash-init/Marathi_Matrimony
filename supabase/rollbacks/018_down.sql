-- Rolls back Phase 6 (migrations 018a and 018b). Run by hand in the SQL Editor.
-- search_profiles and admin_update_profile keep accepting the new fields; both stop mattering once
-- the columns are gone, so restore their earlier bodies from migrations 014 and 015 first.
DROP FUNCTION IF EXISTS public.admin_import_villages(jsonb);
DROP FUNCTION IF EXISTS public.admin_save_location(text, uuid, uuid, text, text);
DROP FUNCTION IF EXISTS public.admin_location_summary();
DROP FUNCTION IF EXISTS public.admin_save_lookup(uuid, text, text, text, text, int, boolean);
DROP FUNCTION IF EXISTS public.admin_list_lookups(text);
DROP FUNCTION IF EXISTS public.search_villages(uuid, text);
DROP FUNCTION IF EXISTS public.like_prefix(text);
DROP TABLE IF EXISTS public.villages;
DROP TABLE IF EXISTS public.talukas;
DROP TABLE IF EXISTS public.districts;
DROP TABLE IF EXISTS public.lookup_options;
-- Removing these also removes what members entered, so do it only if you are sure:
--   ALTER TABLE public.profiles DROP COLUMN rashi, DROP COLUMN nakshatra, DROP COLUMN manglik, DROP COLUMN kuldaivat,
--     DROP COLUMN district, DROP COLUMN taluka, DROP COLUMN native_district, DROP COLUMN native_taluka, DROP COLUMN native_place;
