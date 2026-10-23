import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import { StepHeader } from '../common/StepHeader';
import { VerificationCard } from '../common/VerificationCard';
import { InfoCard } from '../common/InfoCard';
import { ShieldCheck } from 'lucide-react';

interface Step9Props {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const Step9IdentityVerification: React.FC<Step9Props> = ({
  data,
  onChange,
  errors = {},
}) => {
  const { language } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={9}
        totalSteps={10}
        title={language === 'mr' ? 'ओळख पडताळणी' : 'Identity Verification'}
        subtitle={
          language === 'mr'
            ? 'तुमची ओळख सुरक्षितपणे पडताळा आणि प्रोफाइलवरील विश्वास वाढवा.'
            : 'Verify your identity securely and enhance your profile credibility.'
        }
        icon={<ShieldCheck size={22} />}
      />

      {/* Trust & Safety Banner */}
      <InfoCard
        type="info"
        title={language === 'mr' ? 'सुरक्षित ओळख पडताळणी' : 'Secure Identity Verification'}
      >
        {language === 'mr'
          ? 'ओळख पडताळणी यशस्वी झाल्यावर आपले प्रोफाइल अधिकृतपणे पडताळलेले प्रोफाइल (Verified Profile) म्हणून चिन्हांकित केले जाईल.'
          : 'Upon successful identity verification, your profile will be designated as a Verified Profile.'}
      </InfoCard>

      {/* Interactive Verification Card */}
      <VerificationCard
        idType={data.id_type || 'aadhaar'}
        idNumber={data.id_number || ''}
        onIdTypeChange={(val) => onChange('id_type', val)}
        onIdNumberChange={(val) => onChange('id_number', val)}
        isVerified={data.self_attested === true}
        onVerificationSuccess={(maskedId) => {
          onChange('self_attested', true);
          if (maskedId) onChange('id_number', maskedId);
        }}
        error={errors.id_number}
      />
    </div>
  );
};
