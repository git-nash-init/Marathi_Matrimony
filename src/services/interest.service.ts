import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type InterestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface InterestItem {
  id: string;
  senderProfileId: string;
  receiverProfileId: string;
  status: InterestStatus;
  createdAt: string;
}

const LOCAL_STORAGE_INTERESTS_KEY = 'mm_interests_state';

export const interestService = {
  // Get stored local interests mapping
  getLocalInterests(): Record<string, InterestStatus> {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_INTERESTS_KEY) || '{}');
    } catch {
      return {};
    }
  },

  // Save interest to local cache
  setLocalInterest(receiverProfileId: string, status: InterestStatus) {
    try {
      const state = this.getLocalInterests();
      state[receiverProfileId] = status;
      localStorage.setItem(LOCAL_STORAGE_INTERESTS_KEY, JSON.stringify(state));
    } catch {}
  },

  // Check interest status with a profile
  async getInterestStatus(receiverProfileId: string, senderProfileId?: string): Promise<InterestStatus | null> {
    // 1. Check local cache first for instant feedback
    const local = this.getLocalInterests()[receiverProfileId];
    if (local) return local;

    // 2. Query Supabase if senderProfileId is provided and Supabase is configured
    if (senderProfileId && isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('interests') as any)
          .select('status')
          .match({ sender_profile_id: senderProfileId, receiver_profile_id: receiverProfileId })
          .maybeSingle();

        if (!error && data?.status) {
          const status = data.status as InterestStatus;
          this.setLocalInterest(receiverProfileId, status);
          return status;
        }
      } catch (err) {
        console.warn('Interest status fetch failed:', err);
      }
    }

    return null;
  },

  // Send Express Interest to a profile
  async sendInterest(
    receiverProfileId: string,
    senderProfileId?: string,
    metadata?: { senderName?: string; senderPhoto?: string; senderCity?: string }
  ): Promise<{ success: boolean; status: InterestStatus; message?: string }> {
    // Prevent duplicate sending if already sent
    const current = await this.getInterestStatus(receiverProfileId, senderProfileId);
    if (current === 'pending' || current === 'accepted') {
      return { success: true, status: current, message: 'Already sent' };
    }

    // Cache locally immediately
    this.setLocalInterest(receiverProfileId, 'pending');

    // Persist to database if sender profile is present
    if (senderProfileId && senderProfileId !== receiverProfileId) {
      try {
        const { error } = await (supabase.from('interests') as any).upsert(
          {
            sender_profile_id: senderProfileId,
            receiver_profile_id: receiverProfileId,
            status: 'pending',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'sender_profile_id,receiver_profile_id' }
        );

        if (error) {
          console.warn('Supabase interest insert warning:', error);
        }
      } catch (err) {
        console.warn('Supabase interest insert error:', err);
      }
    }

    // Trigger notification popup for the recipient
    try {
      const { notificationService } = await import('./notification.service');
      await notificationService.sendInterestNotification({
        receiverProfileId,
        senderProfileId,
        senderName: metadata?.senderName || 'A Verified Member',
        senderPhoto: metadata?.senderPhoto,
        senderCity: metadata?.senderCity,
      });
    } catch (e) {
      console.warn('Notification trigger note:', e);
    }

    return { success: true, status: 'pending' };
  },

  // Respond to interest (Accept / Decline / Cancel)
  async respondToInterest(interestId: string, receiverProfileId: string, newStatus: InterestStatus): Promise<boolean> {
    this.setLocalInterest(receiverProfileId, newStatus);
    try {
      if (interestId) {
        await (supabase.from('interests') as any)
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', interestId);
      }
      return true;
    } catch (err) {
      console.warn('Failed to update interest status in DB:', err);
      return false;
    }
  },
};
