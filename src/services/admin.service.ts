import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AdminProfileItem {
  id: string;
  profile_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female';
  profile_status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'suspended';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  aadhaar_number: string | null;
  city: string | null;
  state: string | null;
  occupation: string | null;
  education: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

export const PRIMARY_ADMIN_EMAIL = 'vaishalibagave8@gmail.com';

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return email.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL;
};

const AUTO_APPROVAL_KEY = 'aadhaar_auto_approval';

export const adminService = {
  PRIMARY_ADMIN_EMAIL,
  isAdminEmail,

  // Aadhaar auto-approval is a platform setting enforced by the profiles trigger (migration 011).
  async getAutoVerifySetting(): Promise<boolean> {
    const { data } = await (supabase.from('platform_settings') as any)
      .select('value')
      .eq('key', AUTO_APPROVAL_KEY)
      .maybeSingle();
    return data ? data.value === true : true;
  },

  async setAutoVerifySetting(enabled: boolean): Promise<boolean> {
    const { error } = await (supabase.from('platform_settings') as any)
      .update({ value: enabled, updated_at: new Date().toISOString() })
      .eq('key', AUTO_APPROVAL_KEY);
    if (error) console.error('Auto-approval setting error:', error);
    return !error;
  },

  // Fetch all profiles (including surname/Aadhaar) for administrative review
  async fetchProfiles(params?: {
    status?: 'all' | 'pending' | 'verified' | 'rejected' | 'draft';
    search?: string;
  }): Promise<AdminProfileItem[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase.rpc('admin_list_profiles');
      if (error) {
        console.error('Error fetching admin profiles:', error);
        return [];
      }

      let results = ((data as unknown as AdminProfileItem[]) || []).filter((p) => {
        switch (params?.status) {
          case 'pending': return p.verification_status === 'pending' || p.profile_status === 'pending_approval';
          case 'verified': return p.verification_status === 'verified';
          case 'rejected': return p.verification_status === 'rejected' || p.profile_status === 'rejected';
          case 'draft': return p.profile_status === 'draft';
          default: return true;
        }
      });

      if (params?.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        results = results.filter((p) => {
          const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
          const profId = (p.profile_id || '').toLowerCase();
          const aadhaar = (p.aadhaar_number || '').toLowerCase();
          const city = (p.city || '').toLowerCase();
          return (
            fullName.includes(q) ||
            profId.includes(q) ||
            aadhaar.includes(q) ||
            city.includes(q)
          );
        });
      }

      return results;
    } catch (err) {
      console.error('Failed to query admin profiles:', err);
      return [];
    }
  },

  // Approve and verify a profile
  async approveProfile(profileId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    try {
      const { error } = await supabase.rpc('admin_approve_profile', { p_profile_id: profileId });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Approve profile error:', err);
      return { success: false, error: err.message || 'Failed to approve profile' };
    }
  },

  // Reject a profile
  async rejectProfile(profileId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    try {
      const { error } = await supabase.rpc('admin_reject_profile', {
        p_profile_id: profileId,
        ...(reason ? { p_reason: reason } : {}),
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Reject profile error:', err);
      return { success: false, error: err.message || 'Failed to reject profile' };
    }
  },

  // Batch approve all pending profiles
  async batchApprovePending(): Promise<{ count: number; success: boolean }> {
    if (!isSupabaseConfigured()) return { count: 0, success: false };

    try {
      const { data, error } = await supabase.rpc('admin_batch_approve_pending');
      if (error) throw error;
      return { count: Number(data) || 0, success: true };
    } catch (err) {
      console.error('Batch approve error:', err);
      return { count: 0, success: false };
    }
  },
};
