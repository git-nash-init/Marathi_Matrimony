import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import { MAHARASHTRA_CITIES } from '../../data/profileOptions';
import { FormInput } from '../common/FormInput';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { MapPin, Home, Globe } from 'lucide-react';

interface Step5Props {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const Step5Location: React.FC<Step5Props> = ({ data, onChange, errors = {} }) => {
  const { t, language } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={5}
        totalSteps={10}
        title={t('profileBuilder.step5Title')}
        subtitle={t('profileBuilder.step5Subtitle')}
        icon={<MapPin size={22} />}
      />

      {/* SECTION 1: Current Residence / सध्याचे वास्तव्याचे ठिकाण */}
      <SectionCard
        title={t('profileBuilder.currentResidence')}
        subtitle={language === 'mr' ? 'सध्या राहत असलेले शहर, जिल्हा व राज्य' : 'Current living city, district & state'}
        icon={<MapPin size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Row 1: City & District */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div>
              <FormInput
                label={t('profileBuilder.currentCity')}
                required
                list="city-options-list"
                value={data.current_city || ''}
                onChange={(e) => onChange('current_city', e.target.value)}
                error={errors.current_city}
                placeholder={t('profileBuilder.selectCity')}
                prefix={<MapPin size={16} />}
              />
              <datalist id="city-options-list">
                {MAHARASHTRA_CITIES.map((c) => (
                  <option key={c.id} value={language === 'mr' ? c.mr : c.en} />
                ))}
              </datalist>
            </div>

            <FormInput
              label={t('profileBuilder.currentDistrict')}
              value={data.current_district || ''}
              onChange={(e) => onChange('current_district', e.target.value)}
              placeholder={t('profileBuilder.currentDistrictPlaceholder')}
              maxLength={80}
            />
          </div>

          {/* Row 2: State & Country */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormInput
              label={t('profileBuilder.currentState')}
              required
              value={data.current_state || 'Maharashtra'}
              onChange={(e) => onChange('current_state', e.target.value)}
              error={errors.current_state}
              placeholder="Maharashtra"
              maxLength={80}
            />

            <FormInput
              label={t('profileBuilder.currentCountry')}
              required
              value={data.current_country || 'India'}
              onChange={(e) => onChange('current_country', e.target.value)}
              placeholder="India"
              prefix={<Globe size={16} />}
              maxLength={80}
            />
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2: Native Place / मूळ गाव / वतन */}
      <SectionCard
        title={t('profileBuilder.nativePlaceHeading')}
        subtitle={t('profileBuilder.nativePlaceHelp')}
        icon={<Home size={20} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <FormInput
            label={t('profileBuilder.nativePlace')}
            required
            value={data.native_place || ''}
            onChange={(e) => onChange('native_place', e.target.value)}
            error={errors.native_place}
            placeholder={t('profileBuilder.nativePlacePlaceholder')}
            prefix={<Home size={16} />}
            maxLength={100}
          />

          <FormInput
            label={t('profileBuilder.nativeDistrict')}
            value={data.native_district || ''}
            onChange={(e) => onChange('native_district', e.target.value)}
            placeholder={t('profileBuilder.nativeDistrictPlaceholder')}
            maxLength={80}
          />
        </div>
      </SectionCard>
    </div>
  );
};
