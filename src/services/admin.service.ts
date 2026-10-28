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

const STORAGE_AUTO_VERIFY_KEY = 'mm_admin_auto_verify_aadhaar';

export const adminService = {
  // Check if auto-verify for Aadhaar submissions is enabled (default: true for seamless onboarding)
  getAutoVerifySetting(): boolean {
    const saved = localStorage.getItem(STORAGE_AUTO_VERIFY_KEY);
    if (saved === null) return true; // Default to true so users don't get stuck in pending
    return saved === 'true';
  },

  setAutoVerifySetting(enabled: boolean): void {
    localStorage.setItem(STORAGE_AUTO_VERIFY_KEY, enabled ? 'true' : 'false');
  },

  // Fetch all profiles for administrative review
  async fetchProfiles(params?: {
    status?: 'all' | 'pending' | 'verified' | 'rejected' | 'draft';
    search?: string;
  }): Promise<AdminProfileItem[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      let query = (supabase.from('profiles') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (params?.status && params.status !== 'all') {
        if (params.status === 'pending') {
          query = query.or('verification_status.eq.pending,profile_status.eq.pending_approval');
        } else if (params.status === 'verified') {
          query = query.eq('verification_status', 'verified');
        } else if (params.status === 'rejected') {
          query = query.or('verification_status.eq.rejected,profile_status.eq.rejected');
        } else if (params.status === 'draft') {
          query = query.eq('profile_status', 'draft');
        }
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching admin profiles:', error);
        return [];
      }

      let results: AdminProfileItem[] = data || [];

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
      const { error } = await (supabase.from('profiles') as any)
        .update({
          profile_status: 'approved',
          verification_status: 'verified',
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

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
      const { error } = await (supabase.from('profiles') as any)
        .update({
          profile_status: 'rejected',
          verification_status: 'rejected',
          admin_notes: reason || 'Rejected by moderator',
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

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
      const { data, error } = await (supabase.from('profiles') as any)
        .update({
          profile_status: 'approved',
          verification_status: 'verified',
          updated_at: new Date().toISOString(),
        })
        .or('verification_status.eq.pending,profile_status.eq.pending_approval')
        .select('id');

      if (error) throw error;
      return { count: data?.length || 0, success: true };
    } catch (err) {
      console.error('Batch approve error:', err);
      return { count: 0, success: false };
    }
  },
};
