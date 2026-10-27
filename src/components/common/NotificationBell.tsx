import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, Check, Clock, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService, AppNotification } from '../../services/notification.service';
import styles from './NotificationBell.module.css';

interface NotificationBellProps {
  isTransparent?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ isTransparent = false }) => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial notifications for current user
  useEffect(() => {
    const load = async () => {
      const data = await notificationService.getNotifications(user?.id);
      setNotifications(data);
    };
    load();
  }, [user?.id]);

  // Listen for real-time notification events (when someone expresses interest)
  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const notif = customEvent.detail;
      if (!notif) return;

      // 1. If sender is the current user, ignore! (Do not pop up self-sent actions)
      if (
        notif.sender_profile_id &&
        (notif.sender_profile_id === profile?.id || notif.sender_profile_id === user?.id)
      ) {
        return;
      }

      // 2. Target check: if this notification targets a specific user or profile,
      // only show if the current user matches that target!
      const isTargetUser = Boolean(user?.id && notif.targetUserId === user.id);
      const isTargetProfile = Boolean(profile?.id && (notif.targetProfileId === profile.id || notif.targetProfileId === user?.id));
      const hasSpecificTarget = Boolean(notif.targetUserId || notif.targetProfileId);

      if (hasSpecificTarget && !isTargetUser && !isTargetProfile) {
        return;
      }

      // Prepend new notification for the intended recipient
      setNotifications((prev) => [notif, ...prev]);

      // Pop up notification toast to the recipient
      const popupMsg =
        language === 'mr'
          ? `नवीन पसंती प्राप्त झाली! ${notif.sender_name || 'एका उमेदवाराने'} आपल्या प्रोफाइलमध्ये पसंती दर्शवली आहे.`
          : `New Interest Received! ${notif.sender_name || 'A candidate'} has expressed interest in your profile.`;

      toast.info(popupMsg, 6000);
    };

    window.addEventListener('mm:notification_received', handleNewNotification);
    return () => {
      window.removeEventListener('mm:notification_received', handleNewNotification);
    };
  }, [language, toast, user?.id, profile?.id]);

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
                    {notif.type === 'interest_received' ? (
                      <Heart size={16} fill="#E11D48" color="#E11D48" />
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
    </div>
  );
};
