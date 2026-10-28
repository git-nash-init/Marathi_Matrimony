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
  /**
   * subscribe: free member (opens the plans gate) · upgrade: paid, but the plan is too low ·
   * unlock: the plan covers it, clicking calls onUnlock instead of the gate.
   */
  mode?: 'subscribe' | 'upgrade' | 'unlock';
  onUnlock?: () => void;
}

const BADGE_TEXT = {
  subscribe: { mr: 'पाहण्यासाठी सदस्य व्हा', en: 'Subscribe to View' },
  upgrade: { mr: 'पाहण्यासाठी अपग्रेड करा', en: 'Upgrade to View' },
  unlock: { mr: 'पाहण्यासाठी अनलॉक करा', en: 'Unlock to View' },
};

export const LockedField: React.FC<LockedFieldProps> = ({
  label,
  value,
  featureLabel,
  reason,
  isUnlocked = false,
  className,
  mode = 'subscribe',
  onUnlock,
}) => {
  const { language } = useLanguage();
  const [gateOpen, setGateOpen] = useState(false);
  const activate = () => (mode === 'unlock' && onUnlock ? onUnlock() : setGateOpen(true));

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
        onClick={activate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && activate()}
        aria-label={`${label} — ${language === 'mr' ? `सुरक्षित. ${BADGE_TEXT[mode].mr}.` : `locked. ${BADGE_TEXT[mode].en}.`}`}
      >
        <span className={styles.label}>{label}</span>
        <div className={styles.lockedRow}>
          <span className={styles.blurredValue} aria-hidden="true">•••••••••••</span>
          <div className={styles.lockBadge}>
            <Lock size={12} />
            <span>{BADGE_TEXT[mode][language === 'mr' ? 'mr' : 'en']}</span>
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
