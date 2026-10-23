import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  identityVerificationService,
  VerificationStatusType,
} from '../../services/identityVerification.service';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export interface VerificationCardProps {
  idType?: string;
  idNumber?: string;
  onIdTypeChange?: (val: string) => void;
  onIdNumberChange?: (val: string) => void;
  isVerified?: boolean;
  onVerificationSuccess?: (maskedId: string) => void;
  error?: string;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  idType = 'aadhaar',
  idNumber = '',
  onIdTypeChange,
  onIdNumberChange,
  isVerified = false,
  onVerificationSuccess,
  error,
}) => {
  const { language } = useLanguage();
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatusType>(
    isVerified ? 'verified' : 'not_started'
  );
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState<string>('');
  const [maskedIdDisplay, setMaskedIdDisplay] = useState<string>(
    idNumber ? (idNumber.includes('XXXX') ? idNumber : `XXXX-XXXX-${idNumber.slice(-4)}`) : ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Status Badge Label & Color Helper
  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return {
          label: language === 'mr' ? '✓ ओळख पडताळणी पूर्ण' : '✓ Identity Verified',
          bg: '#DCFCE7',
          color: '#15803D',
          border: '#86EFAC',
          icon: <CheckCircle2 size={16} />,
        };
      case 'otp_sent':
        return {
          label: language === 'mr' ? 'OTP पाठवला आहे' : 'OTP Sent',
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FDE68A',
          icon: <Clock size={16} />,
        };
      case 'pending':
        return {
          label: language === 'mr' ? 'पडताळणी प्रक्रियेत' : 'Pending Verification',
          bg: '#E0F2FE',
          color: '#0369A1',
          border: '#BAE6FD',
          icon: <Clock size={16} />,
        };
      case 'failed':
        return {
          label: language === 'mr' ? 'पडताळणी अयशस्वी' : 'Verification Failed',
          bg: '#FEE2E2',
          color: '#B91C1C',
          border: '#FCA5A5',
          icon: <AlertCircle size={16} />,
        };
      case 'manual_review':
        return {
          label: language === 'mr' ? 'मॅन्युअल तपासणी' : 'Manual Review',
          bg: '#F3E8FF',
          color: '#7E22CE',
          border: '#D8B4FE',
          icon: <ShieldAlert size={16} />,
        };
      case 'expired':
        return {
          label: language === 'mr' ? 'सत्र कालबाह्य' : 'Session Expired',
          bg: '#F1F5F9',
          color: '#475569',
          border: '#CBD5E1',
          icon: <Clock size={16} />,
        };
      default:
        return {
          label: language === 'mr' ? 'पडताळणी बाकी' : 'Not Verified',
          bg: '#FAF0F3',
          color: 'var(--color-primary, #7A1F3D)',
          border: 'var(--color-border, #E8DFC8)',
          icon: <ShieldAlert size={16} />,
        };
    }
  };

  const statusInfo = getStatusBadge();

  // Initiate Aadhaar verification via service abstraction
  const handleInitiateVerification = async () => {
    if (!consentGiven) {
      setFeedback({
        type: 'error',
        text: language === 'mr' ? 'कृपया आधी संमती द्या.' : 'Please provide consent before initiating verification.',
      });
      return;
    }

    try {
      setIsLoading(true);
      setFeedback(null);
      const res = await identityVerificationService.startAadhaarVerification(idNumber || '1234', consentGiven);

      if (res.success && res.transactionId) {
        setTransactionId(res.transactionId);
        setVerificationStatus('otp_sent');
        if (res.maskedId) {
          setMaskedIdDisplay(res.maskedId);
          if (onIdNumberChange) onIdNumberChange(res.maskedId);
        }
        setFeedback({
          type: 'success',
          text: res.message,
        });
      } else {
        setVerificationStatus(res.status || 'failed');
        setFeedback({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error communicating with verification provider.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm OTP
  const handleVerifyOtp = async () => {
    if (!transactionId || !otpInput.trim()) {
      setFeedback({
        type: 'error',
        text: language === 'mr' ? 'कृपया ६ अंकी OTP प्रविष्ट करा.' : 'Please enter the 6-digit OTP.',
      });
      return;
    }

    try {
      setIsLoading(true);
      const res = await identityVerificationService.verifyOtp(transactionId, otpInput.trim());

      if (res.success && res.verified) {
        setVerificationStatus('verified');
        if (res.maskedId) {
          setMaskedIdDisplay(res.maskedId);
          if (onIdNumberChange) onIdNumberChange(res.maskedId);
        }
        if (onVerificationSuccess) onVerificationSuccess(res.maskedId || maskedIdDisplay);
        setFeedback({
          type: 'success',
          text: language === 'mr'
            ? '✓ ओळख पडताळणी यशस्वीरीत्या पूर्ण झाली! आपले प्रोफाइल पडताळलेले प्रोफाइल म्हणून चिन्हांकित केले जाईल.'
            : '✓ Identity verification completed successfully! Your profile will be marked as a Verified Profile.',
        });
      } else {
        setVerificationStatus('failed');
        setFeedback({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Verification process encountered an issue.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1.5px solid var(--color-border, #E8DFC8)',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(122, 31, 61, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FAF0F3 0%, #FAF5E8 100%)',
          padding: '20px 24px',
          borderBottom: '1.5px solid var(--color-border, #E8DFC8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--color-primary, #7A1F3D)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: '0 4px 12px rgba(122, 31, 61, 0.25)',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--color-primary, #7A1F3D)',
                margin: 0,
              }}
            >
              {language === 'mr' ? 'आधार ओळख पडताळणी' : 'Aadhaar Verification'}
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted, #6C625E)',
                margin: '2px 0 0 0',
              }}
            >
              {language === 'mr'
                ? 'सुरक्षित ओळख पडताळणी (Authorised Verification Provider)'
                : 'Secure Identity Verification (Authorised Verification Provider)'}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: statusInfo.bg,
            color: statusInfo.color,
            border: `1.5px solid ${statusInfo.border}`,
          }}
        >
          {statusInfo.icon}
          {statusInfo.label}
        </div>
      </div>

      {/* Main Card Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Verified Success State Display */}
        {verificationStatus === 'verified' ? (
          <div
            style={{
              padding: '24px',
              borderRadius: '14px',
              background: '#F0FDF4',
              border: '1.5px solid #86EFAC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803D', margin: '0 0 4px 0' }}>
                {language === 'mr' ? '✓ ओळख पडताळणी पूर्ण' : '✓ Identity Verified'}
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#166534', margin: 0 }}>
                {language === 'mr'
                  ? `ओळख संदर्भ: ${maskedIdDisplay || 'XXXX-XXXX-1234'} • पडताळलेले प्रोफाइल म्हणून चिन्हांकित केले जाईल.`
                  : `Identity Ref: ${maskedIdDisplay || 'XXXX-XXXX-1234'} • Will be marked as a Verified Profile.`}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Input Form Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
              {/* ID Type Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-dark, #242124)' }}>
                  {language === 'mr' ? 'ओळखपत्राचा प्रकार' : 'Identity Document Type'}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={idType}
                    onChange={(e) => onIdTypeChange && onIdTypeChange(e.target.value)}
                    disabled={verificationStatus === 'otp_sent'}
                    style={{
                      width: '100%',
                      minHeight: '50px',
                      height: '50px',
                      padding: '12px 42px 12px 16px',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      fontFamily: 'inherit',
                      color: 'var(--color-dark, #242124)',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid var(--color-border, #E8DFC8)',
                      borderRadius: '12px',
                      outline: 'none',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                    }}
                  >
                    <option value="aadhaar">{language === 'mr' ? 'आधार कार्ड (Aadhaar Card)' : 'Aadhaar Card'}</option>
                    <option value="pan">{language === 'mr' ? 'पॅन कार्ड (PAN Card)' : 'PAN Card'}</option>
                    <option value="voter_id">{language === 'mr' ? 'मतदान ओळखपत्र (Voter ID)' : 'Voter ID'}</option>
                    <option value="passport">{language === 'mr' ? 'पासपोर्ट (Passport)' : 'Passport'}</option>
                  </select>
                  <div
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'var(--color-primary, #7A1F3D)',
                    }}
                  >
                    ▼
                  </div>
                </div>
              </div>

              {/* ID Number / Last 4 Digits Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-dark, #242124)' }}>
                  {language === 'mr' ? 'आधार क्रमांक (किंवा शेवटचे ४ अंक)' : 'Aadhaar Number (or Last 4 Digits)'}
                </label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder={language === 'mr' ? 'उदा. 1234 किंवा XXXX-XXXX-1234' : 'e.g. 1234 or XXXX-XXXX-1234'}
                  value={maskedIdDisplay || idNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaskedIdDisplay(val);
                    if (onIdNumberChange) onIdNumberChange(val);
                  }}
                  disabled={verificationStatus === 'otp_sent'}
                  style={{
                    width: '100%',
                    minHeight: '50px',
                    height: '50px',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    fontFamily: 'inherit',
                    color: 'var(--color-dark, #242124)',
                    backgroundColor: '#FFFFFF',
                    border: error ? '1.5px solid #DC2626' : '1.5px solid var(--color-border, #E8DFC8)',
                    borderRadius: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* MANDATORY CONSENT CHECKBOX & LEGAL LINKS */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'var(--color-bg, #FAF7F2)',
                border: '1.5px solid var(--color-border, #E8DFC8)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--color-dark, #242124)',
                  lineHeight: '1.5',
                }}
              >
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--color-primary, #7A1F3D)',
                    marginTop: '2px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <span>
                  {language === 'mr'
                    ? 'मी ओळख पडताळणीसाठी आवश्यक संमती देतो/देते.'
                    : 'I hereby provide explicit consent for secure identity verification.'}
                </span>
              </label>

              {/* Policy Links */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '0.78rem',
                  color: 'var(--color-primary, #7A1F3D)',
                  paddingLeft: '30px',
                  flexWrap: 'wrap',
                }}
              >
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  {language === 'mr' ? 'गोपनीयता धोरण (Privacy Policy)' : 'Privacy Policy'}
                  <ExternalLink size={11} />
                </a>
                <span>•</span>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  {language === 'mr' ? 'नियम व अटी (Terms)' : 'Terms of Service'}
                  <ExternalLink size={11} />
                </a>
                <span>•</span>
                <span style={{ color: 'var(--color-text-muted, #8E8480)' }}>
                  {language === 'mr' ? 'ओळख पडताळणी धोरण' : 'Identity Verification Policy'}
                </span>
              </div>
            </div>

            {/* OTP Flow (when OTP is sent) */}
            {verificationStatus === 'otp_sent' && (
              <div
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: '#FFFBEB',
                  border: '1.5px solid #FDE68A',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <KeyRound size={20} color="#B45309" />
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#92400E' }}>
                    {language === 'mr' ? 'मोबाईलवर आलेला OTP प्रविष्ट करा' : 'Enter OTP Received on Mobile'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    style={{
                      minHeight: '48px',
                      height: '48px',
                      padding: '0 16px',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      letterSpacing: '0.2em',
                      textAlign: 'center',
                      borderRadius: '10px',
                      border: '1.5px solid #D97706',
                      background: '#FFFFFF',
                      width: '180px',
                      outline: 'none',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otpInput.length < 6}
                    style={{
                      minHeight: '48px',
                      padding: '0 24px',
                      borderRadius: '10px',
                      background: 'var(--color-primary, #7A1F3D)',
                      color: '#FFFFFF',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      fontFamily: 'inherit',
                      border: 'none',
                      cursor: isLoading || otpInput.length < 6 ? 'not-allowed' : 'pointer',
                      opacity: isLoading || otpInput.length < 6 ? 0.6 : 1,
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {isLoading
                      ? language === 'mr' ? 'पडताळत आहे...' : 'Verifying...'
                      : language === 'mr' ? 'OTP तपासा (Verify OTP)' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleInitiateVerification}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary, #7A1F3D)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    {language === 'mr' ? 'OTP पुन्हा पाठवा (Resend OTP)' : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Initiate CTA (Only when NOT otp_sent or verified) */}
            {verificationStatus !== 'otp_sent' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleInitiateVerification}
                  disabled={!consentGiven || isLoading}
                  style={{
                    minHeight: '50px',
                    padding: '0 28px',
                    borderRadius: '12px',
                    background: consentGiven && !isLoading ? 'var(--color-primary, #7A1F3D)' : '#D1D5DB',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    fontFamily: 'inherit',
                    border: 'none',
                    cursor: consentGiven && !isLoading ? 'pointer' : 'not-allowed',
                    boxShadow: consentGiven && !isLoading ? '0 4px 14px rgba(122, 31, 61, 0.25)' : 'none',
                    transition: 'all 0.18s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Lock size={16} />
                  {isLoading
                    ? language === 'mr' ? 'सुरू करत आहे...' : 'Initiating...'
                    : language === 'mr' ? 'OTP द्वारे पडताळणी सुरू करा' : 'Initiate Verification via OTP'}
                </button>

                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted, #8E8480)' }}>
                  {language === 'mr'
                    ? 'पडताळलेले प्रोफाइल म्हणून चिन्हांकित केले जाईल.'
                    : 'Will be marked as a Verified Profile.'}
                </span>
              </div>
            )}

            {/* Feedback Message */}
            {feedback && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  background: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                  color: feedback.type === 'success' ? '#15803D' : '#B91C1C',
                  border: `1px solid ${feedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {feedback.text}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
