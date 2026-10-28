import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, Undo2 } from 'lucide-react';
import { Profile } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { interestService, InterestStatus } from '../../services/interest.service';
import { ExpressInterestModal } from './ExpressInterestModal';
import { ConfirmDialog } from './ConfirmDialog';

interface InterestButtonProps {
  profile: Profile;
  /** Base button class from the host component's stylesheet */
  className?: string;
  /** Extra class applied while an interest is active */
  sentClassName?: string;
}

/** Express Interest / "Interest Sent · Withdraw" split button, backed by the interests RPCs. */
export const InterestButton: React.FC<InterestButtonProps> = ({ profile, className = '', sentClassName = '' }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const { user } = useAuth();
  const [status, setStatus] = useState<InterestStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Logged-out visitors have no interests to look up (the RPC requires a session).
    if (user) interestService.getInterestStatus(profile.id).then((s) => { if (mounted) setStatus(s); });
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.receiverProfileId === profile.id) setStatus(d.status);
    };
    window.addEventListener('mm:interest_changed', onChange);
    return () => { mounted = false; window.removeEventListener('mm:interest_changed', onChange); };
  }, [profile.id, user]);

  const active = status === 'pending' || status === 'accepted';

  const handleWithdraw = useCallback(async () => {
    setBusy(true);
    const res = await interestService.withdrawInterest(profile.id);
    setBusy(false);
    setConfirmOpen(false);
    if (res.success) {
      setStatus('withdrawn');
      toast.success(t.interests.withdrawnToast);
    } else {
      toast.error(res.message || t.interests.withdrawFailed);
    }
  }, [profile.id, t, toast]);

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <>
      {active ? (
        <div style={{ display: 'flex', gap: 6, flex: 1 }}>
          <button type="button" className={`${className} ${sentClassName}`} disabled style={{ flex: 1 }}>
            <CheckCircle2 size={15} />
            <span>{t.interests.sent}</span>
          </button>
          <button
            type="button"
            className={className}
            style={{ flex: '0 0 auto' }}
            onClick={(e) => { stop(e); setConfirmOpen(true); }}
            aria-label={t.interests.withdrawTitle}
          >
            <Undo2 size={15} />
            <span>{t.interests.withdraw}</span>
          </button>
        </div>
      ) : (
        <button type="button" className={className} onClick={(e) => { stop(e); setModalOpen(true); }}>
          <Sparkles size={15} />
          <span>{status === 'withdrawn' ? t.interests.sendAgain : t.interests.expressInterest}</span>
        </button>
      )}

      <ExpressInterestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onInterestSent={() => setStatus('pending')}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        title={t.interests.withdrawTitle}
        message={t.interests.withdrawMessage}
        confirmLabel={t.interests.withdraw}
        cancelLabel={t.interests.cancel}
        busy={busy}
        onConfirm={handleWithdraw}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};
