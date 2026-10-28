import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppNotification {
  id: string;
  user_id?: string;
  type: 'interest_received' | 'interest_accepted' | 'interest_declined' | 'interest_withdrawn' | 'profile_view' | 'system';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_profile_id?: string;
  sender_photo?: string;
}

function getStorageKey(userId?: string): string {
  return userId ? `mm_notifications_${userId}` : 'mm_notifications_guest';
}

// Initial demo notifications for newly created accounts
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    type: 'system',
    title: 'सनईबंधवर आपले स्वागत आहे!',
    message: 'सनईबंध ९६ कुळी मराठा मॅट्रिमोनीवर आपले सहर्ष स्वागत. आपले प्रोफाइल पूर्ण करा आणि सुयोग्य स्थळे शोधा.',
    action_url: '/profile/create',
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

export const notificationService = {
  // Get stored local notifications strictly for this specific user
  getLocalNotifications(userId?: string): AppNotification[] {
    const key = getStorageKey(userId);
    try {
      // Clean up legacy global key if it exists
      const legacy = localStorage.getItem('mm_notifications_state');
      if (legacy && !localStorage.getItem(key)) {
        try {
          const parsed: AppNotification[] = JSON.parse(legacy);
          // Only keep notifications not sent by this user
          const cleaned = parsed.filter(
            (n) => !n.sender_profile_id || n.sender_profile_id !== userId
          );
          localStorage.setItem(key, JSON.stringify(cleaned));
        } catch {}
      }

      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(DEFAULT_NOTIFICATIONS));
        return DEFAULT_NOTIFICATIONS;
      }
      const list: AppNotification[] = JSON.parse(stored);
      // Extra safety: filter out any self-sent notifications that may have been saved earlier
      return list.filter((n) => !n.sender_profile_id || n.sender_profile_id !== userId);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },

  // Save local notifications strictly for this specific user
  setLocalNotifications(notifs: AppNotification[], userId?: string): void {
    const key = getStorageKey(userId);
    try {
      localStorage.setItem(key, JSON.stringify(notifs));
    } catch {}
  },

  // Fetch all notifications for active user
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    const local = this.getLocalNotifications(userId);

    if (userId && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const merged = [...(data as AppNotification[])];
          // Merge local ones that aren't in Supabase
          for (const loc of local) {
            if (!merged.some((m) => m.id === loc.id)) {
              merged.push(loc);
            }
          }
          this.setLocalNotifications(merged, userId);
          return merged;
        }
      } catch (err) {
        console.warn('Could not fetch notifications from Supabase:', err);
      }
    }

    return local;
  },

  // Mark a notification as read
  async markAsRead(notificationId: string, userId?: string): Promise<void> {
    const local = this.getLocalNotifications(userId).map((n) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    this.setLocalNotifications(local, userId);

    if (userId && isSupabaseConfigured()) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Error marking notification as read in DB:', err);
      }
    }
  },

  // Mark all as read
  async markAllAsRead(userId?: string): Promise<void> {
    const local = this.getLocalNotifications(userId).map((n) => ({ ...n, is_read: true }));
    this.setLocalNotifications(local, userId);

    if (userId && isSupabaseConfigured()) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Error marking all notifications as read in DB:', err);
      }
    }
  },

  // Send an Express Interest Notification targeting the recipient ONLY
  async sendInterestNotification(payload: {
    receiverProfileId: string;
    receiverUserId?: string;
    senderProfileId?: string;
    senderName: string;
    senderPhoto?: string;
    senderCity?: string;
  }): Promise<AppNotification> {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: payload.receiverUserId,
      type: 'interest_received',
      title: 'नवीन पसंती (Express Interest) प्राप्त झाली!',
      message: `${payload.senderName} यांनी आपल्या प्रोफाइलमध्ये पसंती दर्शवली आहे.`,
      action_url: `/dashboard`,
      is_read: false,
      created_at: new Date().toISOString(),
      sender_name: payload.senderName,
      sender_profile_id: payload.senderProfileId,
      sender_photo: payload.senderPhoto,
    };

    // 1. DO NOT add to the sender's notification partition!
    // Instead, save into the recipient's partition so recipient sees it when logged in:
    const recipientKey = payload.receiverUserId
      ? `mm_notifications_${payload.receiverUserId}`
      : `mm_notifications_${payload.receiverProfileId}`;
    try {
      const stored = localStorage.getItem(recipientKey);
      const recipientList: AppNotification[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(recipientKey, JSON.stringify([newNotif, ...recipientList]));
    } catch {}

    // 2. Persist in Supabase DB for the RECEIVER if receiverUserId exists:
    if (payload.receiverUserId && isSupabaseConfigured()) {
      try {
        await supabase.from('notifications').insert({
          user_id: payload.receiverUserId,
          type: newNotif.type,
          title: newNotif.title,
          message: newNotif.message,
          action_url: newNotif.action_url,
          is_read: false,
        });
      } catch (err) {
        console.warn('Notification insert DB warning:', err);
      }
    }

    // 3. Dispatch global browser event targeting the RECIPIENT ONLY
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mm:notification_received', {
          detail: {
            ...newNotif,
            targetUserId: payload.receiverUserId,
            targetProfileId: payload.receiverProfileId,
          },
        })
      );
    }

    return newNotif;
  },
};
