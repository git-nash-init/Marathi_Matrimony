import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'mm_shortlisted_ids';

type ShortlistListener = (profileId: string, isShortlisted: boolean) => void;
const listeners = new Set<ShortlistListener>();

// Helper to retrieve currently authenticated user profile ID
async function resolveCurrentProfileId(explicitId?: string): Promise<string | null> {
  if (explicitId) return explicitId;
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await (supabase.from('profiles') as any)
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data?.id) {
      return data.id;
    }
  } catch {
    // Non-critical: unauthenticated or offline
  }
  return null;
}

export const shortlistService = {
  // Subscribe to shortlist changes across the app
  subscribe(listener: ShortlistListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  notifyListeners(profileId: string, isShortlisted: boolean) {
    listeners.forEach((listener) => {
      try {
        listener(profileId, isShortlisted);
      } catch (err) {
        console.warn('Error in shortlist listener:', err);
      }
    });
  },

  // Get all shortlisted profile IDs
  async getShortlistedIds(userProfileId?: string): Promise<string[]> {
    const profileId = await resolveCurrentProfileId(userProfileId);

    // 1. Check database if user profile ID exists
    if (profileId) {
      try {
        const { data, error } = await (supabase.from('shortlists') as any)
          .select('shortlisted_profile_id')
          .eq('user_profile_id', profileId);

        if (!error && data) {
          const dbIds: string[] = data.map((item: { shortlisted_profile_id: string }) => item.shortlisted_profile_id);
          try {
            const cached: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            const merged = Array.from(new Set([...dbIds, ...cached]));
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          } catch {
            return dbIds;
          }
        }
      } catch (err) {
        console.warn('Shortlist DB fetch failed, falling back to cache:', err);
      }
    }

    // 2. Fallback to localStorage cache
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  // Check if a specific profile is shortlisted
  async isShortlisted(targetProfileId: string, userProfileId?: string): Promise<boolean> {
    const ids = await this.getShortlistedIds(userProfileId);
    return ids.includes(targetProfileId);
  },

  // Toggle shortlist status with optimistic update & rollback protection
  async toggleShortlist(
    targetProfileId: string,
    userProfileId?: string
  ): Promise<{ isShortlisted: boolean; success: boolean }> {
    const currentIds = await this.getShortlistedIds(userProfileId);
    const exists = currentIds.includes(targetProfileId);
    const nextState = !exists;

    // 1. Optimistic Local Update
    const updatedIds = nextState
      ? Array.from(new Set([...currentIds, targetProfileId]))
      : currentIds.filter((id) => id !== targetProfileId);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedIds));
    } catch {}

    // Notify all UI listeners immediately
    this.notifyListeners(targetProfileId, nextState);

    // 2. Persist to Supabase if authenticated
    const profileId = await resolveCurrentProfileId(userProfileId);
    if (profileId) {
      try {
        if (nextState) {
          // Insert shortlist record (ON CONFLICT DO NOTHING handled by unique constraint)
          const { error } = await (supabase.from('shortlists') as any).upsert(
            {
              user_profile_id: profileId,
              shortlisted_profile_id: targetProfileId,
            },
            { onConflict: 'user_profile_id,shortlisted_profile_id', ignoreDuplicates: true }
          );

          if (error) {
            console.error('Failed to save shortlist to database:', error);
            // Rollback local storage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentIds));
            this.notifyListeners(targetProfileId, exists);
            return { isShortlisted: exists, success: false };
          }
        } else {
          // Delete shortlist record
          const { error } = await (supabase.from('shortlists') as any)
            .delete()
            .match({ user_profile_id: profileId, shortlisted_profile_id: targetProfileId });

          if (error) {
            console.error('Failed to remove shortlist from database:', error);
            // Rollback local storage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentIds));
            this.notifyListeners(targetProfileId, exists);
            return { isShortlisted: exists, success: false };
          }
        }
      } catch (err) {
        console.error('Shortlist persistence error:', err);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentIds));
        this.notifyListeners(targetProfileId, exists);
        return { isShortlisted: exists, success: false };
      }
    }

    return { isShortlisted: nextState, success: true };
  },

  // Remove directly from shortlist
  async removeFromShortlist(
    targetProfileId: string,
    userProfileId?: string
  ): Promise<{ success: boolean }> {
    const isCurrently = await this.isShortlisted(targetProfileId, userProfileId);
    if (!isCurrently) return { success: true };
    const res = await this.toggleShortlist(targetProfileId, userProfileId);
    return { success: res.success && !res.isShortlisted };
  },
};
