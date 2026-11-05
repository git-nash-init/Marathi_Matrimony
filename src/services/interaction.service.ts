import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ReportPayload {
  reportedProfileId: string;
  reason: string;
  description?: string;
  reporterProfileId?: string;
}

export interface BlockedMember {
  id: string;
  profile_code: string;
  first_name: string;
  age: number | null;
  city: string | null;
  occupation: string | null;
  avatar_url: string | null;
  blocked_at: string;
}

// Blocks used to live only in this browser under this key. They now live in the database.
try {
  localStorage.removeItem('mm_blocked_ids');
} catch {
  // Storage unavailable: nothing to clean up.
}

async function runBlockRpc(fn: 'block_member' | 'unblock_member', target: string): Promise<void> {
  const { data, error } = await supabase.rpc(fn, { p_target: target });
  if (error) throw error;
  const result = data as unknown as { success: boolean; error?: string };
  if (!result?.success) throw new Error(result?.error || 'The request could not be completed.');
}

export const interactionService = {
  /** Blocks a member. Both members then disappear from each other. Throws on failure. */
  blockMember(targetProfileId: string): Promise<void> {
    return runBlockRpc('block_member', targetProfileId);
  },

  unblockMember(targetProfileId: string): Promise<void> {
    return runBlockRpc('unblock_member', targetProfileId);
  },

  /** The members this member blocked. */
  async getBlockedMembers(): Promise<BlockedMember[]> {
    const { data, error } = await supabase.rpc('get_my_blocked_members');
    if (error) throw error;
    return (data ?? []) as unknown as BlockedMember[];
  },

  // Report a profile
  async reportProfile(payload: ReportPayload): Promise<{ success: boolean; message?: string }> {
    if (payload.reporterProfileId && isSupabaseConfigured()) {
      try {
        const { error } = await (supabase.from('reports') as any).insert({
          reporter_user_id: payload.reporterProfileId,
          reported_user_id: payload.reportedProfileId,
          reason: payload.reason,
          description: payload.description || '',
          status: 'pending',
        });

        if (error) {
          console.warn('Supabase report insert error:', error);
        }
      } catch (err) {
        console.warn('Report submission exception:', err);
      }
    }

    return { success: true, message: 'Report submitted successfully' };
  },
};
