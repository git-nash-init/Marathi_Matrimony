import { supabase } from './supabase';

/**
 * Every profiles column clients may SELECT. last_name and aadhaar_number are excluded by a
 * column-level grant (migration 011), so `select('*')` on profiles fails — use this list.
 * Keep in sync with the GRANT SELECT (...) in 011_security_hardening.sql.
 */
export const PROFILE_COLUMNS = [
  'id', 'user_id', 'profile_id', 'first_name', 'gender', 'date_of_birth', 'age', 'marital_status', 'height',
  'religion', 'community', 'sub_community', 'gothra', 'mother_tongue', 'languages_spoken', 'education',
  'education_detail', 'occupation', 'employed_in', 'company', 'income', 'city', 'state', 'country', 'diet',
  'smoking', 'drinking', 'about_me', 'profile_status', 'verification_status', 'profile_visibility',
  'is_featured', 'featured_until', 'created_by', 'created_at', 'updated_at', 'college',
  'additional_qualifications', 'work_location', 'family_type', 'family_status', 'father_occupation',
  'mother_occupation', 'brothers_count', 'sisters_count', 'married_brothers_count', 'married_sisters_count',
  'family_location', 'family_description', 'hobbies', 'lifestyle_interests', 'rejection_reason',
  'completion_percentage', 'avatar_url', 'photos', 'photos_hidden', 'listing_priority', 'approved_at',
].join(', ');

export interface PrivateProfileFields {
  last_name: string | null;
  aadhaar_number: string | null;
}

/** The signed-in member's own surname and Aadhaar (owner-only RPC). */
export async function fetchMyPrivateFields(): Promise<PrivateProfileFields> {
  const { data } = await supabase.rpc('get_my_private_profile');
  const d = (data ?? {}) as Partial<PrivateProfileFields>;
  return { last_name: d.last_name ?? null, aadhaar_number: d.aadhaar_number ?? null };
}
