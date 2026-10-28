import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Unlock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { LockedField } from '../common/LockedField';
import { SubscriptionGate } from '../common/SubscriptionGate';
import { Button } from '../common/Button';
import styles from '../../pages/ProfileDetailPage.module.css';

export interface UnlockedContact {
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  address_line?: string | null;
}

interface ProfileDocument {
  doc_type: 'biodata' | 'horoscope' | 'education';
  storage_path: string;
  file_name: string;
}

interface ContactSectionProps {
  profileId: string;
  isOwnProfile: boolean;
  onContactChange?: (contact: UnlockedContact | null) => void;
}

const DOC_LABELS: Record<string, { en: string; mr: string }> = {
  biodata: { en: 'Biodata', mr: 'बायोडाटा' },
  horoscope: { en: 'Horoscope (Kundali)', mr: 'कुंडली' },
  education: { en: 'Education Certificate', mr: 'शैक्षणिक प्रमाणपत्र' },
};

/** Contact details + documents. Values never reach the DOM until the database returns them. */
export const ContactSection: React.FC<ContactSectionProps> = ({ profileId, isOwnProfile, onContactChange }) => {
  const { language, t } = useLanguage();
  const toast = useToast();
  const mr = language === 'mr';
  const sub = useSubscription();
  const [contact, setContact] = useState<UnlockedContact | null>(null);
  const [docs, setDocs] = useState<ProfileDocument[]>([]);
  const [busy, setBusy] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState<string | undefined>();

  const canSeeDocs = sub.has('unlock_documents') || isOwnProfile;

  const updateContact = useCallback((c: UnlockedContact | null) => {
    setContact(c);
    onContactChange?.(c);
  }, [onContactChange]);

  useEffect(() => {
    let mounted = true;
    updateContact(null);
    if (isOwnProfile || !sub.has('unlock_contact')) return;
    supabase.rpc('get_contact_if_unlocked', { p_target: profileId }).then(({ data }) => {
      const d = data as any;
      if (mounted && d?.unlocked) updateContact(d);
    });
    return () => { mounted = false; };
  }, [profileId, isOwnProfile, sub.plan, updateContact]);

  useEffect(() => {
    let mounted = true;
    setDocs([]);
    if (!canSeeDocs) return;
    supabase.rpc('get_profile_documents', { p_target: profileId }).then(({ data }) => {
      if (mounted && Array.isArray(data)) setDocs(data as unknown as ProfileDocument[]);
    });
    return () => { mounted = false; };
  }, [profileId, canSeeDocs]);

  const handleUnlock = async () => {
    if (!sub.has('unlock_contact')) {
      setGateReason(t.premium.needSilver);
      setGateOpen(true);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc('unlock_profile_contact', { p_target_profile_id: profileId });
    setBusy(false);
    const d = data as any;
    if (error || !d?.success) {
      if (d?.code === 'LIMIT_REACHED') {
        toast.error(t.premium.dailyLimit);
        setGateReason(d.error);
        setGateOpen(true);
      } else if (d?.code === 'UPGRADE_REQUIRED') {
        setGateReason(d.error);
        setGateOpen(true);
      } else {
        toast.error(d?.error || error?.message || t.premium.unlockFailed);
      }
      return;
    }
    updateContact(d);
    void sub.refresh();
    toast.success(t.premium.unlockedToast);
  };

  const openDoc = async (doc: ProfileDocument) => {
    const { data, error } = await supabase.storage.from('profile-documents').createSignedUrl(doc.storage_path, 120);
    if (error || !data?.signedUrl) {
      toast.error(mr ? 'दस्तऐवज उघडता आला नाही.' : 'Could not open document.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  const unlocked = Boolean(contact);
  const remaining = sub.unlockLimit === null ? null : Math.max(sub.unlockLimit - sub.unlocksToday, 0);

  return (
    <>
      <div className={styles.infoGrid}>
        <LockedField label={mr ? 'आडनाव' : 'Surname'} value={contact?.last_name || undefined} isUnlocked={unlocked} featureLabel="Surname" />
        <LockedField label={mr ? 'ईमेल' : 'Email ID'} value={contact?.email || undefined} isUnlocked={unlocked} featureLabel="Email ID" />
        <LockedField label={mr ? 'फोन नंबर' : 'Phone Number'} value={contact?.phone_number || undefined} isUnlocked={unlocked} featureLabel="Contact Number" />
        <LockedField label={mr ? 'पत्ता' : 'Address'} value={contact?.address_line || undefined} isUnlocked={unlocked} featureLabel="Address" />
      </div>

      {!unlocked && !isOwnProfile && (
        <div style={{ marginTop: 16 }}>
          <Button variant="primary" size="md" onClick={handleUnlock} disabled={busy} icon={<Unlock size={16} />}>
            {t.premium.unlockContact}
            {sub.has('unlock_contact') && (
              remaining === null
                ? ` (${t.premium.unlimited})`
                : ` (${t.premium.unlocksLeft.replace('{left}', String(remaining)).replace('{limit}', String(sub.unlockLimit))})`
            )}
          </Button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <strong style={{ fontSize: '0.95rem' }}>{mr ? 'कागदपत्रे' : 'Documents'}</strong>
        {!canSeeDocs ? (
          <LockedField
            label={mr ? 'कागदपत्रे' : 'Documents'}
            isUnlocked={false}
            featureLabel="Documents"
            reason="Documents require a Diamond or Platinum plan."
          />
        ) : docs.length === 0 ? (
          <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {t.premium.noDocuments}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', display: 'grid', gap: 8 }}>
            {docs.map((d) => (
              <li key={d.doc_type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} />
                <span style={{ flex: 1 }}>{(DOC_LABELS[d.doc_type] || { en: d.doc_type, mr: d.doc_type })[mr ? 'mr' : 'en']}</span>
                <Button variant="outline" size="sm" onClick={() => openDoc(d)}>{t.premium.view}</Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SubscriptionGate isOpen={gateOpen} onClose={() => setGateOpen(false)} featureLabel="Contact details" reason={gateReason} />
    </>
  );
};
