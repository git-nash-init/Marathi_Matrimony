import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Profile } from '../../types';
import { interactionService } from '../../services/interaction.service';
import { Ban, CheckCircle2, X } from 'lucide-react';
import { Button } from './Button';

interface BlockProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onProfileBlocked?: (profileId: string) => void;
}

export const BlockProfileModal: React.FC<BlockProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileBlocked,
}) => {
  const { language, localize } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const profileName = localize(profile.name);

  const handleBlock = async () => {
    setIsSubmitting(true);
    try {
      await interactionService.blockProfile(profile.id);
      setIsSuccess(true);
      if (onProfileBlocked) onProfileBlocked(profile.id);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Block profile error:', err);
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
          maxWidth: '440px',
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
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={34} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              {language === 'mr' ? '✓ प्रोफाइल ब्लॉक केली आहे' : '✓ Profile Blocked'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
              {language === 'mr'
                ? 'हे प्रोफाइल आता तुमच्या शोध निकालांमध्ये दिसणार नाही.'
                : 'This profile will no longer appear in your searches.'}
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ban size={30} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>
                {language === 'mr' ? 'प्रोफाइल ब्लॉक करा?' : 'Block this profile?'}
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                {language === 'mr'
                  ? `तुम्हाला ${profileName} यांना ब्लॉक करायचे आहे का? ब्लॉक केल्यानंतर हे प्रोफाइल तुम्हाला दिसणार नाही.`
                  : `Are you sure you want to block ${profileName}? You will not see this profile in searches.`}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '4px' }}>
              <Button type="button" variant="outline" size="md" onClick={onClose} fullWidth disabled={isSubmitting}>
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleBlock}
                disabled={isSubmitting}
                fullWidth
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
              >
                {isSubmitting
                  ? language === 'mr'
                    ? 'ब्लॉक करत आहे...'
                    : 'Blocking...'
                  : language === 'mr'
                  ? 'होय, ब्लॉक करा'
                  : 'Yes, Block'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
