import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { notificationService } from './notification.service';

export type InterestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface InterestItem {
  id: string;
  senderProfileId: string;
  receiverProfileId: string;
  status: InterestStatus;
  createdAt: string;
}

export interface SentInterestItem {
  receiverProfileId: string;
  status: InterestStatus;
  sentAt: string;
  receiverName?: string;
  receiverPhoto?: string;
}

export interface ReceivedInterestItem {
  id: string;
  senderProfileId: string;
  status: InterestStatus;
  receivedAt: string;
  senderName?: string;
  senderPhoto?: string;
  senderCity?: string;
}

function getSentKey(senderId?: string): string {
  return senderId ? `mm_sent_interests_${senderId}` : 'mm_sent_interests_guest';
}

function getReceivedKey(receiverId?: string): string {
  return receiverId ? `mm_received_interests_${receiverId}` : 'mm_received_interests_guest';
}

export const interestService = {
  // Get all sent interests for a user
  getSentInterests(senderId?: string): SentInterestItem[] {
    const key = getSentKey(senderId);
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      // Migrate legacy global interest map if present
      const legacy = localStorage.getItem('mm_interests_state');
      if (legacy) {
        try {
          const map: Record<string, InterestStatus> = JSON.parse(legacy);
          const migrated: SentInterestItem[] = Object.entries(map).map(([receiverProfileId, status]) => ({
            receiverProfileId,
            status,
            sentAt: new Date().toISOString(),
          }));
          localStorage.setItem(key, JSON.stringify(migrated));
          return migrated;
        } catch {}
      }
      return [];
    } catch {
      return [];
    }
  },

  // Get list of receiver profile IDs user has expressed interest to
  getSentProfileIds(senderId?: string): string[] {
    return this.getSentInterests(senderId).map((i) => i.receiverProfileId);
  },

  // Get all received interests for a user
  getReceivedInterests(receiverId?: string): ReceivedInterestItem[] {
    const key = getReceivedKey(receiverId);
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Save an entry to sent interests
  recordSentInterest(senderId: string | undefined, receiverProfileId: string, status: InterestStatus = 'pending') {
    const key = getSentKey(senderId);
    const list = this.getSentInterests(senderId);
    const existingIdx = list.findIndex((i) => i.receiverProfileId === receiverProfileId);
    if (existingIdx >= 0) {
      list[existingIdx].status = status;
    } else {
      list.push({ receiverProfileId, status, sentAt: new Date().toISOString() });
    }
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  },

  // Save an entry to received interests (for the recipient only)
  recordReceivedInterest(receiverProfileId: string, item: ReceivedInterestItem) {
    const key = getReceivedKey(receiverProfileId);
    const list = this.getReceivedInterests(receiverProfileId);
    const existingIdx = list.findIndex((i) => i.senderProfileId === item.senderProfileId);
    if (existingIdx >= 0) {
      list[existingIdx] = item;
    } else {
      list.unshift(item);
    }
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  },

  // Check interest status between current user and target profile
  async getInterestStatus(receiverProfileId: string, senderProfileId?: string): Promise<InterestStatus | null> {
    // 1. Check sender's local list
    const sentList = this.getSentInterests(senderProfileId);
    const found = sentList.find((i) => i.receiverProfileId === receiverProfileId);
    if (found) return found.status;

    // 2. Query Supabase if senderProfileId is provided and Supabase is configured
    if (senderProfileId && isSupabaseConfigured()) {
      try {
        const { data, error } = await (supabase.from('interests') as any)
          .select('status')
          .match({ sender_profile_id: senderProfileId, receiver_profile_id: receiverProfileId })
          .maybeSingle();

        if (!error && data?.status) {
          const status = data.status as InterestStatus;
          this.recordSentInterest(senderProfileId, receiverProfileId, status);
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
    if (senderProfileId && senderProfileId === receiverProfileId) {
      return { success: false, status: 'cancelled', message: 'Cannot express interest to own profile' };
    }

    // Prevent duplicate sending if already sent
    const current = await this.getInterestStatus(receiverProfileId, senderProfileId);
    if (current === 'pending' || current === 'accepted') {
      return { success: true, status: current, message: 'Already sent' };
    }

    // 1. Record in SENDER'S sent list strictly
    this.recordSentInterest(senderProfileId, receiverProfileId, 'pending');

    // 2. Record in RECIPIENT'S received list
    this.recordReceivedInterest(receiverProfileId, {
      id: `interest-${Date.now()}`,
      senderProfileId: senderProfileId || 'anonymous',
      status: 'pending',
      receivedAt: new Date().toISOString(),
      senderName: metadata?.senderName,
      senderPhoto: metadata?.senderPhoto,
      senderCity: metadata?.senderCity,
    });

    // 3. Persist to Supabase database if sender profile is present
    if (senderProfileId && isSupabaseConfigured()) {
      try {
        await (supabase.from('interests') as any).upsert(
          {
            sender_profile_id: senderProfileId,
            receiver_profile_id: receiverProfileId,
            status: 'pending',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'sender_profile_id,receiver_profile_id' }
        );
      } catch (err) {
        console.warn('Supabase interest insert error:', err);
      }
    }

    // 4. Trigger notification popup for the RECIPIENT only
    try {
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
  async respondToInterest(
    interestId: string,
    receiverProfileId: string,
    newStatus: InterestStatus,
    senderProfileId?: string
  ): Promise<boolean> {
    if (senderProfileId) {
      this.recordSentInterest(senderProfileId, receiverProfileId, newStatus);
    }
    const receivedList = this.getReceivedInterests(receiverProfileId);
    const item = receivedList.find((i) => i.id === interestId || i.senderProfileId === senderProfileId);
    if (item) {
      item.status = newStatus;
      try {
        localStorage.setItem(getReceivedKey(receiverProfileId), JSON.stringify(receivedList));
      } catch {}
    }

    try {
      if (interestId && isSupabaseConfigured()) {
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
