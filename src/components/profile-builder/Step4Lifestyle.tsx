import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import {
  DIET_OPTIONS,
  SMOKING_OPTIONS,
  DRINKING_OPTIONS,
  HOBBIES_LIST,
  OptionItem,
} from '../../data/profileOptions';
import { SegmentedControl } from '../common/SegmentedControl';
import { MultiSelect } from '../common/MultiSelect';
import { FormInput } from '../common/FormInput';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { Utensils, Sparkles, Smile } from 'lucide-react';

interface Step4Props {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const Step4Lifestyle: React.FC<Step4Props> = ({ data, onChange, errors = {} }) => {
  const { t, language } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={4}
        totalSteps={10}
        title={t('profileBuilder.step4Title')}
        subtitle={t('profileBuilder.step4Subtitle')}
        icon={<Utensils size={22} />}
      />

      {/* SECTION 1: Diet & Daily Habits / आहार व सवयी */}
      <SectionCard
        title={language === 'mr' ? 'आहार व सवयी' : 'Dietary Habits & Lifestyle'}
        subtitle={language === 'mr' ? 'आहार पद्धती, धूम्रपान व मद्यपान सवयी' : 'Diet preference, smoking & drinking habits'}
        icon={<Utensils size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Diet Preference Pills */}
          <SegmentedControl
            label={t('profileBuilder.diet')}
            required
            error={errors.diet}
            value={data.diet || 'vegetarian'}
            onChange={(val) => onChange('diet', val)}
            options={DIET_OPTIONS.map((opt: OptionItem) => ({
              value: opt.id,
              label: language === 'mr' ? opt.mr : opt.en,
            }))}
          />

          {/* Smoking Habit Pills */}
          <SegmentedControl
            label={t('profileBuilder.smoking')}
            required
            error={errors.smoking}
            value={data.smoking || 'no'}
            onChange={(val) => onChange('smoking', val)}
            options={SMOKING_OPTIONS.map((opt: OptionItem) => ({
              value: opt.id,
              label: language === 'mr' ? opt.mr : opt.en,
            }))}
          />

          {/* Drinking Habit Pills */}
          <SegmentedControl
            label={t('profileBuilder.drinking')}
            required
            error={errors.drinking}
            value={data.drinking || 'no'}
            onChange={(val) => onChange('drinking', val)}
            options={DRINKING_OPTIONS.map((opt: OptionItem) => ({
              value: opt.id,
              label: language === 'mr' ? opt.mr : opt.en,
            }))}
          />
        </div>
      </SectionCard>

      {/* SECTION 2: Hobbies & Interests / छंद व आवडीनिवडी */}
      <SectionCard
        title={t('profileBuilder.hobbies')}
        subtitle={language === 'mr' ? 'आपले आवडते छंद आणि रुची निवडा (एक वा अधिक)' : 'Select your favorite hobbies & interests'}
        icon={<Sparkles size={20} />}
      >
        <MultiSelect
          options={HOBBIES_LIST.map((h: OptionItem) => ({
            value: h.id,
            label: language === 'mr' ? h.mr : h.en,
          }))}
          selectedValues={data.hobbies || []}
          onChange={(vals) => onChange('hobbies', vals)}
          helperText={t('profileBuilder.selectMultiple')}
        />
      </SectionCard>

      {/* SECTION 3: Personality Highlights / व्यक्तिमत्त्व */}
      <SectionCard
        title={t('profileBuilder.personality')}
        subtitle={language === 'mr' ? 'स्वभाव आणि व्यक्तिमत्त्वाचे प्रमुख पैलू' : 'Key personality traits & characteristics'}
        icon={<Smile size={20} />}
      >
        <FormInput
          value={data.personality || ''}
          onChange={(e) => onChange('personality', e.target.value)}
          placeholder={t('profileBuilder.personalityPlaceholder')}
          maxLength={150}
        />
      </SectionCard>
    </div>
  );
};
