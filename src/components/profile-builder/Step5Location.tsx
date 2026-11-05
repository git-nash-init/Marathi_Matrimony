import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import { MAHARASHTRA_CITIES } from '../../data/profileOptions';
import { FormInput } from '../common/FormInput';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { usePlaces } from '../../services/lookups.service';
import { DistrictTalukaFields, VillageField } from './PlaceFields';
import { MapPin, Home, Globe } from 'lucide-react';

interface Step5Props {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const Step5Location: React.FC<Step5Props> = ({ data, onChange, errors = {} }) => {
  const { t, language } = useLanguage();
  const districts = usePlaces();

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

            <DistrictTalukaFields
              idPrefix="current"
              districts={districts}
              district={data.current_district}
              taluka={data.current_taluka}
              onDistrict={(v) => onChange('current_district', v)}
              onTaluka={(v) => onChange('current_taluka', v)}
              districtLabel={t('profileBuilder.currentDistrict')}
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
          <DistrictTalukaFields
            idPrefix="native"
            districts={districts}
            district={data.native_district}
            taluka={data.native_taluka}
            onDistrict={(v) => onChange('native_district', v)}
            onTaluka={(v) => onChange('native_taluka', v)}
            districtLabel={t('profileBuilder.nativeDistrict')}
          />

          <VillageField
            districts={districts}
            district={data.native_district}
            taluka={data.native_taluka}
            label={t('profileBuilder.nativePlace')}
            required
            value={data.native_place || ''}
            onChange={(v) => onChange('native_place', v)}
            error={errors.native_place}
            placeholder={t('profileBuilder.nativePlacePlaceholder')}
            prefix={<Home size={16} />}
          />
        </div>
      </SectionCard>
    </div>
  );
};
