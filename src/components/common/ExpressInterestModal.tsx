import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Profile } from '../../types';
import { interestService } from '../../services/interest.service';
import { Heart, CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button';

import { useToast } from '../../context/ToastContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { SubscriptionGate } from './SubscriptionGate';

interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onInterestSent?: (profileId: string) => void;
}

export const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({
  isOpen,
  onClose,
  profile,
  onInterestSent,
}) => {
  const { language, localize } = useLanguage();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const { interestLimit, interestsThisMonth } = useSubscription();

  if (!isOpen || !profile) return null;

  const profileName = localize(profile.name);

  const handleSendInterest = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await interestService.sendInterest(profile.id);

      if (!res.success && res.code === 'LIMIT_REACHED') {
        setGateOpen(true);
        return;
      }

      if (res.success) {
        setIsSuccess(true);
        toast.success(
          language === 'mr'
            ? `${profileName} यांना आपली पसंती यशस्वीरीत्या पोहोचली आहे! उमेदवाराला तात्काळ सूचना (Notification) पाठवण्यात आली आहे.`
            : `Interest expressed! A notification has popped up for ${profileName}.`
        );
        if (onInterestSent) onInterestSent(profile.id);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1800);
      } else {
        setError(res.message || (language === 'mr' ? 'त्रुटी आली, कृपया पुन्हा प्रयत्न करा' : 'Failed to send interest'));
      }
    } catch (err) {
      setError(language === 'mr' ? 'काहीतरी चूक झाली' : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '18px',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <SubscriptionGate
          isOpen={gateOpen}
          onClose={() => setGateOpen(false)}
          featureLabel={language === 'mr' ? 'अमर्यादित पसंती' : 'Unlimited interests'}
          reason={language === 'mr'
            ? 'या महिन्याच्या ५ मोफत पसंती संपल्या आहेत. अमर्यादित पसंतीसाठी प्लॅन निवडा.'
            : 'You have used all 5 free interests this month. Upgrade for unlimited interests.'}
        />
        {isSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '20px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#F0FDF4',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary, #7A1F3D)', margin: 0 }}>
              {language === 'mr' ? '✓ पसंती पाठवली!' : '✓ Interest Sent!'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              {language === 'mr'
                ? `${profileName} यांना तुमची पसंती यशस्वीरित्या कळवली आहे.`
                : `Your interest was successfully sent to ${profileName}.`}
            </p>
          </div>
        ) : (
          <>
            {/* Header Icon */}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FAF0F3 0%, #FAF5E8 100%)',
                color: 'var(--color-primary, #7A1F3D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid var(--color-border, #E8DFC8)',
              }}
            >
              <Heart size={30} fill="var(--color-primary, #7A1F3D)" />
            </div>

            {/* Title & Body */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary, #7A1F3D)', margin: '0 0 6px 0' }}>
                {language === 'mr' ? 'पसंती (Interest) व्यक्त करा' : 'Express Interest'}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                {language === 'mr'
                  ? `तुम्हाला ${profileName} यांच्या प्रोफाइलमध्ये स्वारस्य व्यक्त करायचे आहे का?`
                  : `Would you like to express interest in ${profileName}'s profile?`}
              </p>
              {interestLimit !== null && (
                <p style={{ color: '#7A1F3D', fontSize: '0.82rem', fontWeight: 600, margin: '8px 0 0' }}>
                  {language === 'mr'
                    ? `या महिन्यात ${Math.max(interestLimit - interestsThisMonth, 0)} / ${interestLimit} पसंती शिल्लक`
                    : `${Math.max(interestLimit - interestsThisMonth, 0)} of ${interestLimit} interests left this month`}
                </p>
              )}
            </div>

            {/* Profile Micro Card */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#FAF8F5',
                borderRadius: '12px',
                border: '1px solid #E8DFC8',
                textAlign: 'left',
              }}
            >
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profileName}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#FAF0F3',
                    color: '#7A1F3D',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {profileName.charAt(0)}
                </div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.92rem' }}>{profileName}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {profile.age} {language === 'mr' ? 'वर्षे' : 'yrs'} • {localize(profile.city)}, {localize(profile.state)}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '0.85rem' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '4px' }}>
              <Button type="button" variant="outline" size="md" onClick={onClose} fullWidth disabled={isSubmitting}>
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSendInterest}
                disabled={isSubmitting}
                fullWidth
              >
                <Sparkles size={16} style={{ marginRight: '6px' }} />
                {isSubmitting
                  ? language === 'mr'
                    ? 'पाठवत आहे...'
                    : 'Sending...'
                  : language === 'mr'
                  ? 'पसंती पाठवा'
                  : 'Send Interest'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
