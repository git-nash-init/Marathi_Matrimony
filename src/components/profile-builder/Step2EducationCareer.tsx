import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import {
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  ANNUAL_INCOME_RANGES,
  OptionItem,
} from '../../data/profileOptions';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { GraduationCap, Briefcase, Building2, MapPin } from 'lucide-react';

interface Step2Props {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

export const Step2EducationCareer: React.FC<Step2Props> = ({ data, onChange, errors = {} }) => {
  const { t, language } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={2}
        totalSteps={10}
        title={t('profileBuilder.step2Title')}
        subtitle={t('profileBuilder.step2Subtitle')}
        icon={<GraduationCap size={22} />}
      />

      {/* SECTION 1: Education Details / शिक्षणाची माहिती */}
      <SectionCard
        title={language === 'mr' ? 'शिक्षणाची माहिती' : 'Education Details'}
        subtitle={language === 'mr' ? 'उच्च शिक्षण, पदवी व कॉलेज तपशील' : 'Highest qualification, degree & university'}
        icon={<GraduationCap size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Highest Education */}
            <FormSelect
              label={t('profileBuilder.highestEducation')}
              required
              value={data.highest_education}
              onChange={(e) => onChange('highest_education', e.target.value)}
              error={errors.highest_education}
              placeholder={`-- ${t('profileBuilder.selectEducation')} --`}
              options={EDUCATION_OPTIONS.map((item: OptionItem) => ({
                value: item.id,
                label: language === 'mr' ? item.mr : item.en,
              }))}
            />

            {/* Degree / Major */}
            <FormInput
              label={t('profileBuilder.educationDetail')}
              value={data.education_detail || ''}
              onChange={(e) => onChange('education_detail', e.target.value)}
              placeholder={t('profileBuilder.educationDetailPlaceholder')}
              maxLength={100}
            />
          </div>

          {/* College / Institution Name */}
          <FormInput
            label={t('profileBuilder.collegeInstitution')}
            value={data.college_institution || ''}
            onChange={(e) => onChange('college_institution', e.target.value)}
            placeholder={t('profileBuilder.collegeInstitutionPlaceholder')}
            maxLength={120}
          />
        </div>
      </SectionCard>

      {/* SECTION 2: Career Details / करिअर माहिती */}
      <SectionCard
        title={language === 'mr' ? 'करिअर माहिती' : 'Career Details'}
        subtitle={language === 'mr' ? 'व्यवसाय, पद, कंपनी व वार्षिक उत्पन्न' : 'Profession, designation, company & income'}
        icon={<Briefcase size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Row 1: Occupation & Designation */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormSelect
              label={t('profileBuilder.occupation')}
              required
              value={data.occupation}
              onChange={(e) => onChange('occupation', e.target.value)}
              error={errors.occupation}
              placeholder={`-- ${t('profileBuilder.selectOccupation')} --`}
              prefix={<Briefcase size={16} />}
              options={OCCUPATION_OPTIONS.map((item: OptionItem) => ({
                value: item.id,
                label: language === 'mr' ? item.mr : item.en,
              }))}
            />

            <FormInput
              label={t('profileBuilder.occupationDetail')}
              value={data.occupation_detail || ''}
              onChange={(e) => onChange('occupation_detail', e.target.value)}
              placeholder={t('profileBuilder.occupationDetailPlaceholder')}
              maxLength={100}
            />
          </div>

          {/* Row 2: Employment Type & Organization Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormSelect
              label={t('profileBuilder.employedIn')}
              value={data.employed_in}
              onChange={(e) => onChange('employed_in', e.target.value)}
              placeholder={`-- ${t('profileBuilder.selectEmploymentType')} --`}
              prefix={<Building2 size={16} />}
              options={EMPLOYMENT_TYPE_OPTIONS.map((item: OptionItem) => ({
                value: item.id,
                label: language === 'mr' ? item.mr : item.en,
              }))}
            />

            <FormInput
              label={t('profileBuilder.organizationName')}
              value={data.organization_name || ''}
              onChange={(e) => onChange('organization_name', e.target.value)}
              placeholder={t('profileBuilder.organizationNamePlaceholder')}
              maxLength={120}
            />
          </div>

          {/* Row 3: Annual Income & Work Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <FormSelect
              label={t('profileBuilder.annualIncome')}
              required
              value={data.annual_income}
              onChange={(e) => onChange('annual_income', e.target.value)}
              error={errors.annual_income}
              placeholder={`-- ${t('profileBuilder.selectAnnualIncome')} --`}
              prefix={<span style={{ fontWeight: 800, color: 'var(--color-primary, #7A1F3D)' }}>₹</span>}
              options={ANNUAL_INCOME_RANGES.map((item: OptionItem) => ({
                value: item.id,
                label: language === 'mr' ? item.mr : item.en,
              }))}
            />

            <FormInput
              label={t('profileBuilder.workLocation')}
              value={data.work_location || ''}
              onChange={(e) => onChange('work_location', e.target.value)}
              placeholder={t('profileBuilder.workLocationPlaceholder')}
              prefix={<MapPin size={16} />}
              maxLength={100}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
