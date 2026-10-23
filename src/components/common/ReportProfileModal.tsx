import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Profile } from '../../types';
import { interactionService } from '../../services/interaction.service';
import { Flag, CheckCircle2, X } from 'lucide-react';
import { Button } from './Button';

interface ReportProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onReportSubmitted?: () => void;
}

export const ReportProfileModal: React.FC<ReportProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onReportSubmitted,
}) => {
  const { language, localize } = useLanguage();
  const [reason, setReason] = useState('fake_profile');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const profileName = localize(profile.name);

  const reportReasons = [
    { value: 'fake_profile', labelMr: 'बनावट प्रोफाइल / खोटे फोटो', labelEn: 'Fake profile / False photos' },
    { value: 'incorrect_information', labelMr: 'चुकीची वैवाहिक किंवा वैयक्तिक माहिती', labelEn: 'Incorrect marital or personal details' },
    { value: 'inappropriate_content', labelMr: 'अनुचित किंवा अश्लील सामग्री', labelEn: 'Inappropriate or offensive content' },
    { value: 'harassment', labelMr: 'त्रासदायक / अयोग्य वर्तन', labelEn: 'Harassment or rude behavior' },
    { value: 'other', labelMr: 'इतर कारण', labelEn: 'Other reasons' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await interactionService.reportProfile({
        reportedProfileId: profile.id,
        reason,
        description,
      });
      setIsSuccess(true);
      if (onReportSubmitted) onReportSubmitted();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Report error:', err);
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
          maxWidth: '480px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
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
          <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#F0FDF4',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={34} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary, #7A1F3D)', margin: 0 }}>
              {language === 'mr' ? '✓ तुमचा रिपोर्ट प्राप्त झाला आहे' : '✓ Report Received'}
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
              {language === 'mr'
                ? 'आमची पडताळणी टीम या प्रोफाइलची चौकशी करेल.'
                : 'Our moderation team will review this profile.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Flag size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  {language === 'mr' ? 'प्रोफाइल रिपोर्ट करा' : 'Report Profile'}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  {profileName} ({profile.profileId})
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                {language === 'mr' ? 'रिपोर्ट करण्याचे मुख्य कारण निवडा:' : 'Select reason for reporting:'}
              </label>
              {reportReasons.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: reason === r.value ? '1.5px solid var(--color-primary, #7A1F3D)' : '1px solid #E2E8F0',
                    backgroundColor: reason === r.value ? 'var(--color-primary-light, #FAF0F3)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: reason === r.value ? 700 : 500,
                    color: reason === r.value ? 'var(--color-primary, #7A1F3D)' : '#334155',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    style={{ accentColor: 'var(--color-primary, #7A1F3D)' }}
                  />
                  <span>{language === 'mr' ? r.labelMr : r.labelEn}</span>
                </label>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                {language === 'mr' ? 'सविस्तर स्पष्टीकरण (पर्यायी):' : 'Additional details (optional):'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={language === 'mr' ? 'काही अतिरिक्त माहिती द्या...' : 'Provide any additional details...'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <Button type="button" variant="outline" size="md" onClick={onClose} fullWidth disabled={isSubmitting}>
                {language === 'mr' ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
                {isSubmitting
                  ? language === 'mr'
                    ? 'नोंदवत आहे...'
                    : 'Submitting...'
                  : language === 'mr'
                  ? 'रिपोर्ट पाठवा'
                  : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
