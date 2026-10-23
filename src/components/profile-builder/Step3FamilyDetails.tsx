import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import {
  FAMILY_TYPES,
  FAMILY_VALUES,
  FAMILY_STATUS_OPTIONS,
  OptionItem,
} from '../../data/profileOptions';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { Users, Home, Heart, Shield } from 'lucide-react';

interface Step3Props {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const Step3FamilyDetails: React.FC<Step3Props> = ({ data, onChange, errors = {} }) => {
  const { t, language } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={3}
        totalSteps={10}
        title={t('profileBuilder.step3Title')}
        subtitle={t('profileBuilder.step3Subtitle')}
        icon={<Users size={22} />}
      />

      {/* SECTION 1: Parents Information / पालकांची माहिती */}
      <SectionCard
        title={language === 'mr' ? 'पालकांची माहिती' : 'Parents Information'}
        subtitle={language === 'mr' ? 'आई-वडिलांचा व्यवसाय व पार्श्वभूमी' : "Father's & mother's occupation"}
        icon={<Heart size={20} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <FormInput
            label={t('profileBuilder.fatherOccupation')}
            required
            value={data.father_occupation || ''}
            onChange={(e) => onChange('father_occupation', e.target.value)}
            error={errors.father_occupation}
            placeholder={t('profileBuilder.fatherOccupationPlaceholder')}
            maxLength={100}
          />

          <FormInput
            label={t('profileBuilder.motherOccupation')}
            required
            value={data.mother_occupation || ''}
            onChange={(e) => onChange('mother_occupation', e.target.value)}
            error={errors.mother_occupation}
            placeholder={t('profileBuilder.motherOccupationPlaceholder')}
            maxLength={100}
          />
        </div>
      </SectionCard>

      {/* SECTION 2: Family Structure & Values / कुटुंब पार्श्वभूमी */}
      <SectionCard
        title={language === 'mr' ? 'कुटुंब पार्श्वभूमी व संस्कार' : 'Family Structure & Values'}
        subtitle={language === 'mr' ? 'कुटुंब प्रकार, मूल्ये व आर्थिक स्थिती' : 'Family type, cultural values & economic status'}
        icon={<Home size={20} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          <FormSelect
            label={t('profileBuilder.familyType')}
            required
            value={data.family_type || 'nuclear'}
            onChange={(e) => onChange('family_type', e.target.value)}
            error={errors.family_type}
            placeholder={`-- ${t('profileBuilder.selectFamilyType')} --`}
            options={FAMILY_TYPES.map((item: OptionItem) => ({
              value: item.id,
              label: language === 'mr' ? item.mr : item.en,
            }))}
          />

          <FormSelect
            label={t('profileBuilder.familyValues')}
            required
            value={data.family_values || 'traditional'}
            onChange={(e) => onChange('family_values', e.target.value)}
            error={errors.family_values}
            placeholder={`-- ${t('profileBuilder.selectFamilyValues')} --`}
            options={FAMILY_VALUES.map((item: OptionItem) => ({
              value: item.id,
              label: language === 'mr' ? item.mr : item.en,
            }))}
          />

          <FormSelect
            label={t('profileBuilder.familyStatus')}
            value={data.family_status || 'middle_class'}
            onChange={(e) => onChange('family_status', e.target.value)}
            placeholder={`-- ${t('profileBuilder.selectFamilyStatus')} --`}
            options={FAMILY_STATUS_OPTIONS.map((item: OptionItem) => ({
              value: item.id,
              label: language === 'mr' ? item.mr : item.en,
            }))}
          />
        </div>
      </SectionCard>

      {/* SECTION 3: Siblings Information / भावंडांची माहिती */}
      <SectionCard
        title={t('profileBuilder.siblingsDetails')}
        subtitle={language === 'mr' ? 'भाऊ व बहिणींची संख्या आणि वैवाहिक स्थिती' : 'Brothers & sisters count and marital details'}
        icon={<Shield size={20} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Brothers Count */}
          <FormSelect
            label={t('profileBuilder.brothersCount')}
            value={data.brothers_count ?? 0}
            onChange={(e) => onChange('brothers_count', Number(e.target.value))}
            options={[0, 1, 2, 3, 4, 5].map((num) => ({
              value: num,
              label: `${num} ${num === 0 ? (language === 'mr' ? '(नाहीत)' : '(None)') : ''}`,
            }))}
          />

          {/* Brothers Married */}
          <FormSelect
            label={t('profileBuilder.brothersMarried')}
            value={data.brothers_married ?? 0}
            onChange={(e) => onChange('brothers_married', Number(e.target.value))}
            disabled={!data.brothers_count || data.brothers_count === 0}
            options={Array.from({ length: (data.brothers_count || 0) + 1 }, (_, i) => ({
              value: i,
              label: `${i}`,
            }))}
          />

          {/* Sisters Count */}
          <FormSelect
            label={t('profileBuilder.sistersCount')}
            value={data.sisters_count ?? 0}
            onChange={(e) => onChange('sisters_count', Number(e.target.value))}
            options={[0, 1, 2, 3, 4, 5].map((num) => ({
              value: num,
              label: `${num} ${num === 0 ? (language === 'mr' ? '(नाहीत)' : '(None)') : ''}`,
            }))}
          />

          {/* Sisters Married */}
          <FormSelect
            label={t('profileBuilder.sistersMarried')}
            value={data.sisters_married ?? 0}
            onChange={(e) => onChange('sisters_married', Number(e.target.value))}
            disabled={!data.sisters_count || data.sisters_count === 0}
            options={Array.from({ length: (data.sisters_count || 0) + 1 }, (_, i) => ({
              value: i,
              label: `${i}`,
            }))}
          />
        </div>
      </SectionCard>
    </div>
  );
};
