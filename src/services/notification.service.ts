import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppNotification {
  id: string;
  user_id?: string;
  type: 'interest_received' | 'interest_accepted' | 'profile_view' | 'system';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_profile_id?: string;
  sender_photo?: string;
}

const LOCAL_STORAGE_NOTIFICATIONS_KEY = 'mm_notifications_state';

// Initial demo notifications for new accounts
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'system',
    title: 'सनईबंधवर आपले स्वागत आहे!',
    message: 'सनईबंध ९६ कुळी मराठा मॅट्रिमोनीवर आपले सहर्ष स्वागत. आपले प्रोफाइल पूर्ण करा आणि सुयोग्य स्थळे शोधा.',
    action_url: '/profile/create',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const notificationService = {
  // Get stored local notifications
  getLocalNotifications(): AppNotification[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_NOTIFICATIONS_KEY);
      if (!stored) {
        localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
        return DEFAULT_NOTIFICATIONS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },

  // Save local notifications
  setLocalNotifications(notifs: AppNotification[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifs));
    } catch {}
  },

  // Fetch all notifications for active user
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    const local = this.getLocalNotifications();

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
          this.setLocalNotifications(merged);
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
    const local = this.getLocalNotifications().map((n) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    this.setLocalNotifications(local);

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
    const local = this.getLocalNotifications().map((n) => ({ ...n, is_read: true }));
    this.setLocalNotifications(local);

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

  // Send an Express Interest Notification to candidate
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

    // 1. Add to local cache immediately
    const current = this.getLocalNotifications();
    this.setLocalNotifications([newNotif, ...current]);

    // 2. Persist in Supabase DB if user_id or connection exists
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

    // 3. Dispatch global browser event so popups trigger instantly on recipient screen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('mm:notification_received', {
          detail: newNotif,
        })
      );
    }

    return newNotif;
  },
};
