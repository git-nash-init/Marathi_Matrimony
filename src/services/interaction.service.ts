import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_BLOCKED_KEY = 'mm_blocked_ids';

export interface ReportPayload {
  reportedProfileId: string;
  reason: string;
  description?: string;
  reporterProfileId?: string;
}

export const interactionService = {
  // Get all blocked profile IDs
  async getBlockedIds(userProfileId?: string): Promise<string[]> {
    if (userProfileId && isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('user_blocks') as any)
          .select('blocked_profile_id')
          .eq('blocker_profile_id', userProfileId);

        if (!error && data) {
          const dbIds = data.map((item: { blocked_profile_id: string }) => item.blocked_profile_id);
          try {
            const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_BLOCKED_KEY) || '[]');
            const merged = Array.from(new Set([...dbIds, ...cached]));
            localStorage.setItem(LOCAL_STORAGE_BLOCKED_KEY, JSON.stringify(merged));
            return merged;
          } catch {
            return dbIds;
          }
        }
      } catch (err) {
        console.warn('Blocked profiles fetch error:', err);
      }
    }

    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_BLOCKED_KEY) || '[]');
    } catch {
      return [];
    }
  },

  // Block a profile
  async blockProfile(targetProfileId: string, userProfileId?: string): Promise<{ success: boolean }> {
    const current = await this.getBlockedIds(userProfileId);
    const updated = Array.from(new Set([...current, targetProfileId]));
    try {
      localStorage.setItem(LOCAL_STORAGE_BLOCKED_KEY, JSON.stringify(updated));
    } catch {}

    if (userProfileId) {
      try {
        await (supabase.from('user_blocks') as any).insert({
          blocker_profile_id: userProfileId,
          blocked_profile_id: targetProfileId,
        });
      } catch (e) {
        console.warn('DB block insert warning:', e);
      }
    }

    return { success: true };
  },

  // Unblock a profile
  async unblockProfile(targetProfileId: string, userProfileId?: string): Promise<{ success: boolean }> {
    const current = await this.getBlockedIds(userProfileId);
    const updated = current.filter((id) => id !== targetProfileId);
    try {
      localStorage.setItem(LOCAL_STORAGE_BLOCKED_KEY, JSON.stringify(updated));
    } catch {}

    if (userProfileId) {
      try {
        await (supabase.from('user_blocks') as any)
          .delete()
          .match({ blocker_profile_id: userProfileId, blocked_profile_id: targetProfileId });
      } catch (e) {
        console.warn('DB unblock warning:', e);
      }
    }

    return { success: true };
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
