import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { isAdminEmail } from '../../services/admin.service';
import { SubscriptionGate } from './SubscriptionGate';
import styles from './LockedField.module.css';

interface LockedFieldProps {
  /** Visible label */
  label: string;
  /** The actual value — shown blurred/hidden */
  value?: string;
  /** Feature name shown in gate modal */
  featureLabel?: string;
  /** Custom reason text */
  reason?: string;
  /** Whether the field IS unlocked (user has subscription) */
  isUnlocked?: boolean;
  /** Optional className */
  className?: string;
}

export const LockedField: React.FC<LockedFieldProps> = ({
  label,
  value,
  featureLabel,
  reason,
  isUnlocked = false,
  className,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [gateOpen, setGateOpen] = useState(false);

  const isAdmin = Boolean(user?.email && isAdminEmail(user.email));
  const isFieldUnlocked = isUnlocked || isAdmin;

  if (isFieldUnlocked && value) {
    return (
      <div className={`${styles.field} ${className || ''}`}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
    );
  }

  return (
    <>
      <div
        className={`${styles.field} ${styles.locked} ${className || ''}`}
        onClick={() => setGateOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setGateOpen(true)}
        aria-label={`${label} — ${language === 'mr' ? 'सुरक्षित. पाहण्यासाठी सदस्य व्हा.' : 'locked. Click to unlock.'}`}
      >
        <span className={styles.label}>{label}</span>
        <div className={styles.lockedRow}>
          <span className={styles.blurredValue}>
            {value ? value : '•••••••••••'}
          </span>
          <div className={styles.lockBadge}>
            <Lock size={12} />
            <span>{language === 'mr' ? 'पाहण्यासाठी सदस्य व्हा' : 'Subscribe to View'}</span>
          </div>
        </div>
      </div>

      <SubscriptionGate
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        featureLabel={featureLabel || label}
        reason={reason}
      />
    </>
  );
};
