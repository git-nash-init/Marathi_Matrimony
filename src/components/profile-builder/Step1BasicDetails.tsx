import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import {
  COMMUNITY_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  MANGLIK_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  RELIGION_OPTIONS,
  calculateAgeFromDob,
  cmToFeetInches,
  OptionItem,
} from '../../data/profileOptions';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { SegmentedControl } from '../common/SegmentedControl';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { User, Calendar, Ruler, Award, Heart } from 'lucide-react';

interface Step1Props {
  data?: ProfileFormData;
  formData?: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: unknown) => void;
  errors?: Record<string, string>;
}

export const Step1BasicDetails: React.FC<Step1Props> = ({
  data,
  formData: propFormData,
  onChange,
  errors = {},
}) => {
  const formData = data || propFormData || ({} as ProfileFormData);
  const { t, language } = useLanguage();
  const calculatedAge = calculateAgeFromDob(formData.date_of_birth);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={1}
        totalSteps={10}
        title={t('profileBuilder.step1Title')}
        subtitle={t('profileBuilder.step1Subtitle')}
        icon={<User size={22} />}
      />

      {/* SECTION 1: Basic Information / प्राथमिक माहिती */}
      <SectionCard
        title={language === 'mr' ? 'प्राथमिक माहिती' : 'Basic Information'}
        subtitle={language === 'mr' ? 'प्रोफाइल धारकाची मूलभूत ओळख' : 'Profile ownership & personal identity'}
        icon={<User size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile For */}
          <SegmentedControl
            label={t('profileBuilder.profileFor')}
            required
            value={formData.profile_for || 'self'}
            onChange={(val) => onChange('profile_for', val)}
            options={[
              { value: 'self', label: t('auth.myself') },
              { value: 'son', label: t('auth.son') },
              { value: 'daughter', label: t('auth.daughter') },
              { value: 'brother', label: t('auth.brother') },
              { value: 'sister', label: t('auth.sister') },
              { value: 'relative', label: t('auth.relative') },
            ]}
          />

          {/* Gender Selection Cards */}
          <SegmentedControl
            label={t('profileBuilder.gender')}
            required
            size="lg"
            columns={2}
            value={formData.gender || 'female'}
            onChange={(val) => onChange('gender', val)}
            options={[
              {
                value: 'female',
                label: `👰 ${t('auth.bride')}`,
                sublabel: language === 'mr' ? 'वधू (स्त्री)' : 'Female (Bride)',
              },
              {
                value: 'male',
                label: `🤵 ${t('auth.groom')}`,
                sublabel: language === 'mr' ? 'वर (पुरुष)' : 'Male (Groom)',
              },
            ]}
          />

          {/* First Name & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormInput
              label={t('profileBuilder.firstName')}
              required
              value={formData.first_name || ''}
              onChange={(e) => onChange('first_name', e.target.value)}
              error={errors.first_name}
              placeholder={language === 'mr' ? 'उदा. राहुल / प्राजक्ता' : 'e.g. Rahul / Prajakta'}
              maxLength={60}
            />

            <FormInput
              label={t('profileBuilder.lastName')}
              value={formData.last_name || ''}
              onChange={(e) => onChange('last_name', e.target.value)}
              placeholder={language === 'mr' ? 'उदा. जोशी / कदम / पाटील' : 'e.g. Joshi / Kadam / Patil'}
              maxLength={60}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2: Birth & Physical Details / जन्म व शारीरिक तपशील */}
      <SectionCard
        title={language === 'mr' ? 'जन्म व शारीरिक तपशील' : 'Birth & Physical Details'}
        subtitle={language === 'mr' ? 'जन्मतारीख, वय, उंची व वैवाहिक स्थिती' : 'Date of birth, age, height & marital status'}
        icon={<Calendar size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Row 1: DOB & Height */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormInput
              type="date"
              label={t('profileBuilder.dob')}
              required
              value={formData.date_of_birth || ''}
              onChange={(e) => onChange('date_of_birth', e.target.value)}
              error={errors.date_of_birth}
              prefix={<Calendar size={16} />}
              badge={
                calculatedAge !== null ? (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: calculatedAge >= 18 ? '#15803D' : '#DC2626',
                      background: calculatedAge >= 18 ? '#DCFCE7' : '#FEE2E2',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {t('profileBuilder.ageLabel')} {calculatedAge} {language === 'mr' ? 'वर्षे' : 'years'}
                  </span>
                ) : null
              }
            />

            <FormInput
              type="number"
              min={120}
              max={230}
              label={t('profileBuilder.heightCm')}
              required
              value={formData.height_cm || ''}
              onChange={(e) => onChange('height_cm', e.target.value ? parseInt(e.target.value, 10) : null)}
              error={errors.height_cm}
              placeholder="165"
              prefix={<Ruler size={16} />}
              badge={
                formData.height_cm && formData.height_cm > 0 ? (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--color-primary, #7A1F3D)',
                      background: 'var(--color-primary-light, #FAF0F3)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {cmToFeetInches(formData.height_cm)}
                  </span>
                ) : null
              }
            />
          </div>

          {/* Row 2: Marital Status & Mother Tongue */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormSelect
              label={t('profileBuilder.maritalStatus')}
              required
              value={formData.marital_status || 'never_married'}
              onChange={(e) => onChange('marital_status', e.target.value)}
              prefix={<Heart size={16} />}
              options={MARITAL_STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label[language],
              }))}
            />

            <FormSelect
              label={t('profileBuilder.motherTongue')}
              required
              value={formData.mother_tongue || 'Marathi'}
              onChange={(e) => onChange('mother_tongue', e.target.value)}
              options={MOTHER_TONGUE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label[language],
              }))}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 3: Religion, Community & Horoscope / धर्म, जात व जन्मपत्रिका */}
      <SectionCard
        title={language === 'mr' ? 'धर्म, जात व जन्मपत्रिका' : 'Religion, Community & Horoscope'}
        subtitle={language === 'mr' ? 'जात, गोत्र, मांगलिक स्थिती व पत्रिका' : 'Community, sub-caste, manglik & horoscope details'}
        icon={<Award size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Row 1: Religion & Community */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormSelect
              label={t('profileBuilder.religion')}
              value={formData.religion || 'Hindu'}
              onChange={(e) => onChange('religion', e.target.value)}
              options={RELIGION_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label[language],
              }))}
            />

            <FormSelect
              label={t('profileBuilder.community')}
              required
              value={formData.community || ''}
              onChange={(e) => onChange('community', e.target.value)}
              error={errors.community}
              placeholder={`-- ${language === 'mr' ? 'जात निवडा' : 'Select Community'} --`}
              options={COMMUNITY_OPTIONS.map((opt: OptionItem) => ({
                value: opt.id,
                label: language === 'mr' ? opt.mr : opt.en,
              }))}
            />
          </div>

          {/* Row 2: Sub-Community & Manglik Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormInput
              label={t('profileBuilder.subCommunity')}
              value={formData.sub_community || ''}
              onChange={(e) => onChange('sub_community', e.target.value)}
              placeholder={language === 'mr' ? 'उदा. ९६ कुळी / कौशिक गोत्र / शाखा' : 'e.g. 96 Kuli / Kaushik Gotra'}
              maxLength={80}
            />

            <FormSelect
              label={t('profileBuilder.manglik')}
              value={formData.manglik || 'no'}
              onChange={(e) => onChange('manglik', e.target.value)}
              options={MANGLIK_OPTIONS.map((opt: OptionItem) => ({
                value: opt.id,
                label: language === 'mr' ? opt.mr : opt.en,
              }))}
            />
          </div>

          {/* Horoscope Available Toggle Card */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'var(--color-secondary-light, #FAF5E8)',
              border: '1.5px solid rgba(197, 154, 69, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
            }}
            onClick={() => onChange('horoscope_match_required', !formData.horoscope_match_required)}
          >
            <input
              type="checkbox"
              id="horoscope_toggle"
              checked={formData.horoscope_match_required !== false}
              onChange={(e) => onChange('horoscope_match_required', e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                accentColor: 'var(--color-primary, #7A1F3D)',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="horoscope_toggle"
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--color-secondary-hover, #AA8232)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Award size={18} />
              {t('profileBuilder.horoscopeAvailable')}
            </label>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
