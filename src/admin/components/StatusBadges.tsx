import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from '../pages/adminPages.module.css';

interface StatusRow {
  profile_status?: string | null;
  verification_status?: string | null;
  blocked?: boolean;
  admin_role?: string | null;
}

const PROFILE: Record<string, { en: string; mr: string; tone: string }> = {
  approved: { en: 'Approved', mr: 'मंजूर', tone: styles.badgeGood },
  pending_approval: { en: 'Pending', mr: 'प्रलंबित', tone: styles.badgeWarn },
  draft: { en: 'Draft', mr: 'मसुदा', tone: '' },
  rejected: { en: 'Rejected', mr: 'नाकारले', tone: styles.badgeBad },
  suspended: { en: 'Suspended', mr: 'निलंबित', tone: styles.badgeBad },
  deactivated: { en: 'Deactivated', mr: 'निष्क्रिय', tone: '' },
};

const VERIFICATION: Record<string, { en: string; mr: string; tone: string }> = {
  verified: { en: 'Verified', mr: 'पडताळलेले', tone: styles.badgeGood },
  pending: { en: 'ID pending', mr: 'ओळख प्रलंबित', tone: styles.badgeWarn },
  rejected: { en: 'ID rejected', mr: 'ओळख नाकारली', tone: styles.badgeBad },
};

const Badge: React.FC<{ tone: string; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`${styles.badge} ${tone}`}>{children}</span>
);

export const StatusBadges: React.FC<{ row: StatusRow }> = ({ row }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const profile = row.profile_status ? PROFILE[row.profile_status] : null;
  const verification = row.verification_status ? VERIFICATION[row.verification_status] : null;

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4 }}>
      {row.blocked ? (
        <Badge tone={styles.badgeBad}>{mr ? 'ब्लॉक' : 'Blocked'}</Badge>
      ) : profile ? (
        <Badge tone={profile.tone}>{mr ? profile.mr : profile.en}</Badge>
      ) : (
        <Badge tone="">{mr ? 'प्रोफाइल नाही' : 'No profile'}</Badge>
      )}
      {verification && <Badge tone={verification.tone}>{mr ? verification.mr : verification.en}</Badge>}
      {row.admin_role && <Badge tone={styles.badgeInfo}>{row.admin_role.replace('_', ' ')}</Badge>}
    </span>
  );
};
