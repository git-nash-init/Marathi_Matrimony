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

  /**
   * Live feed of new notifications for this user via Supabase Realtime (the notifications
   * table is in the supabase_realtime publication; RLS limits rows to the owner).
   * Returns an unsubscribe function.
   */
  subscribe(userId: string, onInsert: (n: AppNotification) => void): () => void {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => onInsert(payload.new as AppNotification)
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};

// ─── Browser (OS-level) notifications ───────────────────────────────────────

export type BrowserPermission = NotificationPermission | 'unsupported';

const PROMPT_DISMISSED_KEY = 'mm_notif_prompt_dismissed';

export const browserNotifications = {
  permission(): BrowserPermission {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  },

  /** Must be called from a click handler — browsers ignore permission requests without a user gesture. */
  async request(): Promise<BrowserPermission> {
    if (this.permission() === 'unsupported') return 'unsupported';
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  },

  isPromptDismissed(): boolean {
    try {
      return localStorage.getItem(PROMPT_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  },

  dismissPrompt(): void {
    try {
      localStorage.setItem(PROMPT_DISMISSED_KEY, '1');
    } catch {}
  },

  /** Shows an OS notification when permitted; clicking it focuses the tab and opens action_url. */
  show(n: AppNotification, onClick?: (url: string) => void): void {
    if (this.permission() !== 'granted') return;
    try {
      const notification = new Notification(n.title, {
        body: n.message,
        icon: '/images/brand/logo.png',
        tag: n.id,
      });
      notification.onclick = () => {
        window.focus();
        onClick?.(n.action_url || '/dashboard');
        notification.close();
      };
    } catch {
      // Some mobile browsers only allow notifications through a service worker.
    }
  },
};
