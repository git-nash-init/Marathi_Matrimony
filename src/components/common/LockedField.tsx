import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SubscriptionGate } from './SubscriptionGate';
import styles from './LockedField.module.css';

interface LockedFieldProps {
  /** Visible label */
  label: string;
  /** Real value — only pass it once the database has released it. Never rendered while locked. */
  value?: string;
  /** Feature name shown in gate modal */
  featureLabel?: string;
  /** Custom reason text */
  reason?: string;
  /** Whether the field IS unlocked (server returned the value) */
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
  const [gateOpen, setGateOpen] = useState(false);

  if (isUnlocked) {
    return (
      <div className={`${styles.field} ${className || ''}`}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value || '—'}</span>
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
          <span className={styles.blurredValue} aria-hidden="true">•••••••••••</span>
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
