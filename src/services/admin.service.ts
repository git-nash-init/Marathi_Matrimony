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
  aadhaar_last4: string | null;
  city: string | null;
  state: string | null;
  occupation: string | null;
  education: string | null;
  avatar_url: string | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
}

export const adminService = {
  // Fetch all profiles (including surname and last 4 ID digits) for administrative review.
  // Throws on failure, so the page can show an error rather than an empty list.
  async fetchProfiles(): Promise<AdminProfileItem[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.rpc('admin_list_profiles');
    if (error) throw error;
    return (data as unknown as AdminProfileItem[]) || [];
  },

  // Requires a super admin who has completed 2-step verification in this session.
  async setMfaRequired(required: boolean): Promise<void> {
    const { error } = await supabase.rpc('admin_set_mfa_required', { p_required: required });
    if (error) throw error;
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
