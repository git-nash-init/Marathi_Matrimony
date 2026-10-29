import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BellRing, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { browserNotifications } from '../../services/notification.service';
import styles from './NotificationBell.module.css';

interface NotificationPermissionPromptProps {
  /** Requests permission; must run from the click so the browser shows its dialog. */
  onEnable: () => Promise<void>;
}

/**
 * One-time card for signed-in members who have not yet answered the browser's notification
 * permission. "Not now" hides it (the bell dropdown keeps the option).
 */
export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({ onEnable }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (browserNotifications.isPromptDismissed()) return;
    const timer = window.setTimeout(() => setVisible(true), 4000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    browserNotifications.dismissPrompt();
    setVisible(false);
  };

  // Portal to <body>: the header's backdrop-filter/transform would otherwise become the
  // containing block for position:fixed and pin this card inside the header.
  return createPortal(
    <div className={styles.permissionPrompt} role="dialog" aria-live="polite" aria-label={mr ? 'सूचना परवानगी' : 'Notification permission'}>
      <BellRing size={22} className={styles.permissionPromptIcon} />
      <div className={styles.permissionPromptBody}>
        <strong>{mr ? 'नवीन पसंती लगेच कळवू का?' : 'Get notified instantly?'}</strong>
        <p>
          {mr
            ? 'कोणी पसंती पाठवली किंवा उत्तर दिले की आम्ही आपल्याला ब्राउझर सूचना पाठवू.'
            : 'We will send a browser notification when someone sends you an interest or replies to yours.'}
        </p>
        <div className={styles.permissionPromptActions}>
          <button type="button" className="btn btn-primary btn-sm" onClick={async () => { await onEnable(); setVisible(false); }}>
            {mr ? 'परवानगी द्या' : 'Allow notifications'}
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={dismiss}>
            {mr ? 'आता नको' : 'Not now'}
          </button>
        </div>
      </div>
      <button type="button" className={styles.permissionPromptClose} onClick={dismiss} aria-label={mr ? 'बंद करा' : 'Close'}>
        <X size={16} />
      </button>
    </div>,
    document.body
  );
};
