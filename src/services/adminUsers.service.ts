import { supabase } from '../lib/supabase';

const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);

export interface AdminUserRow {
  user_id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  profile_id: string | null;
  profile_code: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  age: number | null;
  city: string | null;
  profile_status: string | null;
  verification_status: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  blocked: boolean;
  admin_role: string | null;
  plan_name: string | null;
}

export interface AdminUserDetail {
  user_id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  admin_role: string | null;
  profile: Record<string, any> | null;
  contacts: Record<string, any> | null;
  preferences: Record<string, any> | null;
  block: { reason: string; blocked_at: string } | null;
  subscription: { plan: string; status: string; end_date: string } | null;
  history: { action: string; actor_role: string | null; details: any; created_at: string }[];
}

export interface UserListParams {
  search?: string;
  status?: string;
  gender?: string;
  verification?: string;
  page: number;
  pageSize: number;
}

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(fn, args);
  if (error) throw error;
  return data as T;
}

// Actions needing the Auth admin API go through the admin-users Edge Function.
async function userAction(body: Record<string, unknown>): Promise<Record<string, any>> {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  if (error) {
    let message: string | undefined;
    try {
      message = (await (error as { context?: Response }).context?.json())?.error;
    } catch {
      // No readable body: fall through to the original error.
    }
    throw message ? new Error(message) : error;
  }
  return data as Record<string, any>;
}

export const adminUsersService = {
  listUsers({ search, status, gender, verification, page, pageSize }: UserListParams) {
    return call<{ total: number; items: AdminUserRow[] }>('admin_list_users', {
      p_search: search || null,
      p_status: status || null,
      p_gender: gender || null,
      p_verification: verification || null,
      p_limit: pageSize,
      p_offset: page * pageSize,
    });
  },
  getUser: (userId: string) => call<AdminUserDetail>('admin_get_user', { p_user: userId }),
  updateProfile: (profileId: string, changes: Record<string, unknown>) =>
    call<boolean>('admin_update_profile', { p_profile_id: profileId, p_changes: changes }),
  updateContacts: (profileId: string, changes: Record<string, unknown>) =>
    call<boolean>('admin_update_contacts', { p_profile_id: profileId, p_changes: changes }),
  updatePreferences: (profileId: string, changes: Record<string, unknown>) =>
    call<boolean>('admin_update_preferences', { p_profile_id: profileId, p_changes: changes }),
  setVerification: (profileId: string, status: string, note?: string) =>
    call<boolean>('admin_set_verification', { p_profile_id: profileId, p_status: status, p_note: note ?? null }),
  block: (userId: string, reason: string) => userAction({ action: 'block', user_id: userId, reason }),
  unblock: (userId: string) => userAction({ action: 'unblock', user_id: userId }),
  sendPasswordReset: (userId: string) => userAction({ action: 'reset_password', user_id: userId }),
  remove: (userId: string, confirm: string) => userAction({ action: 'remove', user_id: userId, confirm }),
};
