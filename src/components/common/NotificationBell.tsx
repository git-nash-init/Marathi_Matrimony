import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BellRing, Heart, Check, Clock, ExternalLink, Undo2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  notificationService,
  browserNotifications,
  AppNotification,
  BrowserPermission,
} from '../../services/notification.service';
import { NotificationPermissionPrompt } from './NotificationPermissionPrompt';
import styles from './NotificationBell.module.css';

interface NotificationBellProps {
  isTransparent?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isTransparent = false }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<BrowserPermission>(() => browserNotifications.permission());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial notifications for current user
  useEffect(() => {
    const load = async () => {
      const data = await notificationService.getNotifications(user?.id);
      setNotifications(data);
    };
    load();
  }, [user?.id]);

  // Real-time: new rows in public.notifications for this user arrive over Supabase Realtime
  // (written server-side by send_interest / respond_to_interest / withdraw_interest).
  useEffect(() => {
    if (!user?.id) return;
    return notificationService.subscribe(user.id, (notif) => {
      setNotifications((prev) => (prev.some((n) => n.id === notif.id) ? prev : [notif, ...prev]));
      toast.info(`${notif.title} — ${notif.message}`, 6000);
      // OS notification too, so it is seen when the tab is in the background.
      if (document.hidden) browserNotifications.show(notif, (url) => navigate(url));
    });
  }, [user?.id, toast, navigate]);

  const handleEnableNotifications = async () => {
    const result = await browserNotifications.request();
    setPermission(result);
    if (result === 'granted') {
      toast.success(language === 'mr' ? 'सूचना सुरू झाल्या.' : 'Notifications enabled.');
    } else if (result === 'denied') {
      toast.error(language === 'mr'
        ? 'सूचना ब्लॉक आहेत. ब्राउझरच्या साइट सेटिंग्जमधून परवानगी द्या.'
        : 'Notifications are blocked. Allow them in your browser\'s site settings.');
    }
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(user?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      await notificationService.markAsRead(notif.id, user?.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.bellContainer} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.bellBtn} ${isTransparent ? styles.transparent : styles.solid}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        title={language === 'mr' ? 'सूचना (Notifications)' : 'Notifications'}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.headerTitle}>
              <Bell size={16} color="var(--color-primary, #7B191E)" />
              <span>{language === 'mr' ? 'सूचना (Notifications)' : 'Notifications'}</span>
              {unreadCount > 0 && <span className={styles.headerCount}>{unreadCount}</span>}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markReadBtn}
                onClick={handleMarkAllRead}
              >
                <Check size={13} />
                <span>{language === 'mr' ? 'सर्व वाचले' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          {user && permission === 'default' && (
            <button type="button" className={styles.permissionRow} onClick={handleEnableNotifications}>
              <BellRing size={16} />
              <span>
                <strong>{language === 'mr' ? 'ब्राउझर सूचना सुरू करा' : 'Turn on browser notifications'}</strong>
                <small>
                  {language === 'mr'
                    ? 'नवीन पसंती व उत्तरे साइट बंद असतानाही कळतील.'
                    : 'Get alerted about new interests and replies even when this tab is in the background.'}
                </small>
              </span>
            </button>
          )}
          {user && permission === 'denied' && (
            <div className={styles.permissionBlocked}>
              {language === 'mr'
                ? 'ब्राउझर सूचना ब्लॉक आहेत. पत्त्याच्या पट्टीतील 🔒 चिन्हावर क्लिक करून “Notifications” ला परवानगी द्या.'
                : 'Browser notifications are blocked. Click the 🔒 icon in the address bar and allow “Notifications”.'}
            </div>
          )}

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Clock size={28} color="#94A3B8" />
                <p>
                  {language === 'mr'
                    ? 'सध्या कोणतीही नवीन सूचना नाही.'
                    : 'No new notifications right now.'}
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  to={notif.action_url || '/dashboard'}
                  className={`${styles.notificationItem} ${!notif.is_read ? styles.unread : ''}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <div className={styles.itemIcon}>
                    {notif.type === 'interest_received' || notif.type === 'interest_accepted' ? (
                      <Heart size={16} fill="#E11D48" color="#E11D48" />
                    ) : notif.type === 'interest_withdrawn' || notif.type === 'interest_declined' ? (
                      <Undo2 size={16} color="#6B7280" />
                    ) : (
                      <Bell size={16} color="var(--color-primary, #7B191E)" />
                    )}
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{notif.title}</div>
                    <div className={styles.itemMessage}>{notif.message}</div>
                    <div className={styles.itemTime}>
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  {!notif.is_read && <span className={styles.unreadDot} />}
                </Link>
              ))
            )}
          </div>

          <div className={styles.dropdownFooter}>
            <Link
              to="/dashboard"
              className={styles.viewDashboardLink}
              onClick={() => setIsOpen(false)}
            >
              <span>{language === 'mr' ? 'माझ्या डॅशबोर्डवर पहा' : 'View in Dashboard'}</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      )}

      {user && permission === 'default' && <NotificationPermissionPrompt onEnable={handleEnableNotifications} />}
    </div>
  );
};
