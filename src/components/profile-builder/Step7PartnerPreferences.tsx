import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import {
  MARATHI_COMMUNITIES,
  MARITAL_STATUS_OPTIONS,
  MANGLIK_OPTIONS,
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  ANNUAL_INCOME_RANGES,
  DIET_OPTIONS,
  OptionItem,
  cmToFeetInches,
} from '../../data/profileOptions';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { FormTextarea } from '../common/FormTextarea';
import { MultiSelect } from '../common/MultiSelect';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { HeartHandshake, Sliders, GraduationCap, MapPin, Heart } from 'lucide-react';

interface Step7Props {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const Step7PartnerPreferences: React.FC<Step7Props> = ({ data, onChange }) => {
  const { t, language } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={7}
        totalSteps={10}
        title={t('profileBuilder.step7Title')}
        subtitle={t('profileBuilder.step7Subtitle')}
        icon={<HeartHandshake size={22} />}
      />

      {/* SECTION 1: Age & Height Range / वय व उंची मर्यादा */}
      <SectionCard
        title={language === 'mr' ? 'अपेक्षित वय व उंची मर्यादा' : 'Expected Age & Height Range'}
        subtitle={language === 'mr' ? 'जोडीदाराची किमान व कमाल वयोमर्यादा आणि उंची' : 'Age and height range criteria'}
        icon={<Sliders size={20} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Age Range Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--color-bg, #FAF7F2)',
              border: '1.5px solid var(--color-border, #E8DFC8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-dark, #242124)' }}>
                {t('profileBuilder.partnerAgeRange')}
              </span>
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: 'var(--color-primary, #7A1F3D)',
                  background: 'var(--color-primary-light, #FAF0F3)',
                  padding: '2px 8px',
                  borderRadius: '8px',
                }}
              >
                {data.partner_min_age || 18} - {data.partner_max_age || 40} {language === 'mr' ? 'वर्षे' : 'Years'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormInput
                type="number"
                min={18}
                max={70}
                label={t('profileBuilder.minAge')}
                value={data.partner_min_age || 21}
                onChange={(e) => onChange('partner_min_age', Number(e.target.value))}
              />
              <FormInput
                type="number"
                min={data.partner_min_age || 18}
                max={70}
                label={t('profileBuilder.maxAge')}
                value={data.partner_max_age || 32}
                onChange={(e) => onChange('partner_max_age', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Height Range Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--color-bg, #FAF7F2)',
              border: '1.5px solid var(--color-border, #E8DFC8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-dark, #242124)' }}>
                {t('profileBuilder.partnerHeightRange')}
              </span>
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: 'var(--color-primary, #7A1F3D)',
                  background: 'var(--color-primary-light, #FAF0F3)',
                  padding: '2px 8px',
                  borderRadius: '8px',
                }}
              >
                {cmToFeetInches(data.partner_min_height || 150)} - {cmToFeetInches(data.partner_max_height || 185)}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <FormSelect
                label={t('profileBuilder.minHeight')}
                value={data.partner_min_height || 150}
                onChange={(e) => onChange('partner_min_height', Number(e.target.value))}
                options={Array.from({ length: 66 }, (_, i) => 135 + i).map((cm) => ({
                  value: cm,
                  label: `${cm} cm (${cmToFeetInches(cm)})`,
                }))}
              />
              <FormSelect
                label={t('profileBuilder.maxHeight')}
                value={data.partner_max_height || 185}
                onChange={(e) => onChange('partner_max_height', Number(e.target.value))}
                options={Array.from({ length: 66 }, (_, i) => 135 + i).map((cm) => ({
                  value: cm,
                  label: `${cm} cm (${cmToFeetInches(cm)})`,
                }))}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2: Education & Career Expectations / शिक्षण व करिअर अपेक्षा */}
      <SectionCard
        title={language === 'mr' ? 'शिक्षण व करिअर अपेक्षा' : 'Education & Career Preferences'}
        subtitle={language === 'mr' ? 'जोडीदाराचे अपेक्षित शिक्षण, व्यवसाय व किमान उत्पन्न' : 'Preferred qualifications, career & income'}
        icon={<GraduationCap size={20} />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          <FormSelect
            label={t('profileBuilder.educationPreference')}
            value={data.partner_education?.[0] || 'any'}
            onChange={(e) => onChange('partner_education', [e.target.value])}
            options={[
              { value: 'any', label: t('profileBuilder.doesNotMatter') },
              ...EDUCATION_OPTIONS.map((item: OptionItem) => ({
                value: item.id,
                label: language === 'mr' ? item.mr : item.en,
              })),
            ]}
          />

          <FormSelect
            label={t('profileBuilder.occupationPreference')}
            value={data.partner_occupation?.[0] || 'any'}
            onChange={(e) => onChange('partner_occupation', [e.target.value])}
            options={[
              { value: 'any', label: t('profileBuilder.doesNotMatter') },
              ...OCCUPATION_OPTIONS.map((item: OptionItem) => ({
                value: item.id,
                label: language === 'mr' ? item.mr : item.en,
              })),
            ]}
          />

          <FormSelect
            label={t('profileBuilder.minIncomePreference')}
            value={data.partner_min_income || 'any'}
            onChange={(e) => onChange('partner_min_income', e.target.value)}
            options={[
              { value: 'any', label: t('profileBuilder.doesNotMatter') },
              ...ANNUAL_INCOME_RANGES.map((item: OptionItem) => ({
                value: item.id,
                label: language === 'mr' ? item.mr : item.en,
              })),
            ]}
          />
        </div>
      </SectionCard>

      {/* SECTION 3: Community, Marital & Lifestyle / समाज, वैवाहिक स्थिती व जीवनशैली */}
      <SectionCard
        title={language === 'mr' ? 'वैवाहिक स्थिती, जात व आहार' : 'Marital, Community & Diet Preferences'}
        subtitle={language === 'mr' ? 'अपेक्षित वैवाहिक स्थिती, जात व आहाराच्या सवयी' : 'Marital status, community and diet criteria'}
        icon={<Heart size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <FormSelect
              label={t('profileBuilder.maritalStatusPreference')}
              value={data.partner_marital_status?.[0] || 'any'}
              onChange={(e) => onChange('partner_marital_status', [e.target.value])}
              options={[
                { value: 'any', label: t('profileBuilder.doesNotMatter') },
                ...MARITAL_STATUS_OPTIONS.map((item) => ({
                  value: item.value,
                  label: item.label[language],
                })),
              ]}
            />

            <FormSelect
              label={t('profileBuilder.manglikPreference')}
              value={data.partner_manglik || 'does_not_matter'}
              onChange={(e) => onChange('partner_manglik', e.target.value)}
              options={[
                { value: 'does_not_matter', label: t('profileBuilder.doesNotMatter') },
                ...MANGLIK_OPTIONS.map((item: OptionItem) => ({
                  value: item.id,
                  label: language === 'mr' ? item.mr : item.en,
                })),
              ]}
            />

            <FormSelect
              label={t('profileBuilder.dietPreference')}
              value={data.partner_diet?.[0] || 'any'}
              onChange={(e) => onChange('partner_diet', [e.target.value])}
              options={[
                { value: 'any', label: t('profileBuilder.doesNotMatter') },
                ...DIET_OPTIONS.map((item: OptionItem) => ({
                  value: item.id,
                  label: language === 'mr' ? item.mr : item.en,
                })),
              ]}
            />
          </div>

          {/* Community Multi-select Chips */}
          <MultiSelect
            label={t('profileBuilder.communityPreference')}
            singleSelectAllValue="any"
            options={[
              { value: 'any', label: t('profileBuilder.doesNotMatter') },
              ...MARATHI_COMMUNITIES.map((c: OptionItem) => ({
                value: c.id,
                label: language === 'mr' ? c.mr : c.en,
              })),
            ]}
            selectedValues={data.partner_communities || ['any']}
            onChange={(vals) => onChange('partner_communities', vals)}
            helperText={t('profileBuilder.selectMultiple')}
            maxHeight="200px"
          />
        </div>
      </SectionCard>

      {/* SECTION 4: Location & Other Notes / स्थान व विशेष अपेक्षा */}
      <SectionCard
        title={language === 'mr' ? 'स्थान व विशेष अपेक्षा' : 'Location & Additional Expectations'}
        subtitle={language === 'mr' ? 'अपेक्षित शहरे व इतर तपशील' : 'Preferred cities and specific expectations'}
        icon={<MapPin size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <FormInput
            label={t('profileBuilder.locationPreference')}
            value={data.partner_location || ''}
            onChange={(e) => onChange('partner_location', e.target.value)}
            placeholder={t('profileBuilder.locationPreferencePlaceholder')}
            maxLength={150}
          />

          <FormTextarea
            label={t('profileBuilder.partnerNotes')}
            value={data.partner_notes || ''}
            onChange={(e) => onChange('partner_notes', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={t('profileBuilder.partnerNotesPlaceholder')}
          />
        </div>
      </SectionCard>
    </div>
  );
};
