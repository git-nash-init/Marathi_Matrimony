import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileText,
  Info,
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
  const [consentGiven, setConsentGiven] = useState<boolean>(true);
  const [inputVal, setInputVal] = useState<string>(() => {
    const raw = (idNumber || '').replace(/\D/g, '');
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  });

  useEffect(() => {
    if (idNumber) {
      const raw = idNumber.replace(/\D/g, '');
      setInputVal(raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim());
    }
  }, [idNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setInputVal(formatted);

    if (onIdNumberChange) {
      onIdNumberChange(raw);
    }

    if (raw.length === 12 && consentGiven) {
      if (onVerificationSuccess) {
        onVerificationSuccess(raw);
      }
    }
  };

  const handleConsentToggle = (checked: boolean) => {
    setConsentGiven(checked);
    const raw = inputVal.replace(/\D/g, '');
    if (raw.length === 12 && checked && onVerificationSuccess) {
      onVerificationSuccess(raw);
    }
  };

  const rawDigits = inputVal.replace(/\D/g, '');
  const isValidAadhaar = rawDigits.length === 12;
  const isRegistered = (isValidAadhaar && consentGiven) || isVerified;

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
              background: 'var(--color-primary, #800020)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: '0 4px 12px rgba(128, 0, 32, 0.25)',
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
                color: 'var(--color-primary, #800020)',
                margin: 0,
              }}
            >
              {language === 'mr' ? 'आधार ओळख नोंदणी' : 'Aadhaar Identity Registration'}
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted, #6C625E)',
                margin: '2px 0 0 0',
              }}
            >
              {language === 'mr'
                ? 'प्रशासकीय पडताळणीसाठी आपला १२ अंकी आधार क्रमांक प्रविष्ट करा (OTP ची आवश्यकता नाही)'
                : 'Enter your 12-digit Aadhaar number for administrative review (No OTP required)'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            background: isRegistered ? '#DCFCE7' : '#FEF3C7',
            color: isRegistered ? '#15803D' : '#B45309',
            border: isRegistered ? '1px solid #86EFAC' : '1px solid #FDE68A',
          }}
        >
          {isRegistered ? <CheckCircle2 size={16} /> : <FileText size={16} />}
          <span>
            {isRegistered
              ? (language === 'mr' ? '✓ आधार क्रमांक नोंदवला गेला' : '✓ Aadhaar Registered')
              : (language === 'mr' ? 'नोंदणी बाकी (१२ अंक आवश्यक)' : 'Pending Entry (12 digits)')}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Document Selection & Number Input */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '8px',
              }}
            >
              {language === 'mr' ? 'ओळखपत्राचा प्रकार' : 'Document Type'}
            </label>
            <select
              value={idType}
              onChange={(e) => onIdTypeChange && onIdTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.92rem',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                outline: 'none',
              }}
            >
              <option value="aadhaar">{language === 'mr' ? 'आधार कार्ड (Aadhaar Card)' : 'Aadhaar Card'}</option>
              <option value="pan">{language === 'mr' ? 'पॅन कार्ड (PAN Card)' : 'PAN Card'}</option>
              <option value="voter_id">{language === 'mr' ? 'मतदान ओळखपत्र (Voter ID)' : 'Voter ID'}</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '8px',
              }}
            >
              {language === 'mr' ? '१२ अंकी आधार क्रमांक' : '12-digit Aadhaar Number'}{' '}
              <span style={{ color: '#E11D48' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '8px',
                  border: error ? '1.5px solid #E11D48' : isValidAadhaar ? '1.5px solid #10B981' : '1.5px solid #CBD5E1',
                  fontSize: '1rem',
                  letterSpacing: '1px',
                  fontWeight: 600,
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                }}
              />
              <Lock
                size={18}
                color="#64748B"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              {isValidAadhaar && (
                <CheckCircle2
                  size={18}
                  color="#10B981"
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              )}
            </div>
            {error && (
              <span style={{ fontSize: '0.78rem', color: '#E11D48', marginTop: '4px', display: 'block' }}>
                {error}
              </span>
            )}
            <span style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
              {language === 'mr'
                ? 'सुरक्षित व एन्क्रिप्टेड — आपला आधार क्रमांक कोणालाही सार्वजनिकरित्या दिसणार नाही.'
                : 'Encrypted & secure — your full Aadhaar number is never visible publicly.'}
            </span>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '14px 16px',
            backgroundColor: '#F8FAFC',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
          }}
        >
          <input
            type="checkbox"
            id="aadhaar_consent"
            checked={consentGiven}
            onChange={(e) => handleConsentToggle(e.target.checked)}
            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--color-primary, #800020)', cursor: 'pointer' }}
          />
          <label htmlFor="aadhaar_consent" style={{ fontSize: '0.84rem', color: '#334155', cursor: 'pointer', lineHeight: '1.5' }}>
            {language === 'mr'
              ? 'मी याद्वारे प्रमाणित करतो/करते की हा आधार क्रमांक माझा स्वतःचा असून सनईबंध पडताळणी पथकाद्वारे (Admin Moderation) प्रोफाइल पडताळणीसाठी मी संमती देत आहे.'
              : 'I hereby certify that this Aadhaar number belongs to me and grant consent for administrative profile verification and KYC review by the Sanaibandh moderation team.'}
          </label>
        </div>

        {/* Moderation Review Info Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: isRegistered ? '#F0FDF4' : '#FEFCE8',
            borderRadius: '8px',
            border: isRegistered ? '1px solid #BBF7D0' : '1px solid #FEF08A',
          }}
        >
          <Info size={20} color={isRegistered ? '#16A34A' : '#CA8A04'} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.84rem', color: isRegistered ? '#166534' : '#854D0E', lineHeight: '1.4' }}>
            {isRegistered
              ? (language === 'mr'
                  ? 'आपला आधार तपशील जतन केला आहे. प्रोफाइल सबमिट केल्यावर प्रशासकीय पथक १२-२४ तासांत तपासणी करून आपले प्रोफाइल "पडताळणी झालेले (Verified)" म्हणून चिन्हांकित करेल.'
                  : 'Your Aadhaar is recorded. After submitting your profile, the moderation team will review it within 12-24 hours and award the Verified badge.')
              : (language === 'mr'
                  ? 'कृपया आपला १२ अंकी आधार क्रमांक प्रविष्ट करा. ओटीपीची कोणतीही गरज नाही.'
                  : 'Please enter your complete 12-digit Aadhaar number. No OTP verification is needed.')}
          </p>
        </div>
      </div>
    </div>
  );
};
