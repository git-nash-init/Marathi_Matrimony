import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import {
  calculateAgeFromDob,
  cmToFeetInches,
  MARATHI_COMMUNITIES,
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  ANNUAL_INCOME_RANGES,
  DIET_OPTIONS,
  FAMILY_TYPES,
  FAMILY_VALUES,
  OptionItem,
} from '../../data/profileOptions';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { InfoCard } from '../common/InfoCard';
import {
  CheckCircle2,
  Edit3,
  User,
  GraduationCap,
  Users,
  Utensils,
  MapPin,
  FileText,
  ShieldCheck,
} from 'lucide-react';

interface Step8Props {
  data: ProfileFormData;
  onJumpToStep: (step: number) => void;
  completionPercentage: number;
}

export const Step8ReviewSubmit: React.FC<Step8Props> = ({
  data,
  onJumpToStep,
  completionPercentage,
}) => {
  const { t, language } = useLanguage();

  const getCommunityLabel = (id?: string) => {
    if (!id) return '-';
    const found = MARATHI_COMMUNITIES.find((c: OptionItem) => c.id === id);
    return found ? (language === 'mr' ? found.mr : found.en) : id;
  };

  const getEducationLabel = (id?: string) => {
    if (!id) return '-';
    const found = EDUCATION_OPTIONS.find((e: OptionItem) => e.id === id);
    return found ? (language === 'mr' ? found.mr : found.en) : id;
  };

  const getOccupationLabel = (id?: string) => {
    if (!id) return '-';
    const found = OCCUPATION_OPTIONS.find((o: OptionItem) => o.id === id);
    return found ? (language === 'mr' ? found.mr : found.en) : id;
  };

  const getIncomeLabel = (id?: string) => {
    if (!id) return '-';
    const found = ANNUAL_INCOME_RANGES.find((inc: OptionItem) => inc.id === id);
    return found ? (language === 'mr' ? found.mr : found.en) : id;
  };

  const getDietLabel = (id?: string) => {
    if (!id) return '-';
    const found = DIET_OPTIONS.find((d: OptionItem) => d.id === id);
    return found ? (language === 'mr' ? found.mr : found.en) : id;
  };

  const getFamilyTypeLabel = (id?: string) => {
    if (!id) return '-';
    const found = FAMILY_TYPES.find((f: OptionItem) => f.id === id);
    return found ? (language === 'mr' ? found.mr : found.en) : id;
  };

  const getFamilyValuesLabel = (id?: string) => {
    if (!id) return '-';
    const found = FAMILY_VALUES.find((f: OptionItem) => f.id === id);
    return found ? (language === 'mr' ? found.mr : found.en) : id;
  };

  const renderEditBtn = (stepNum: number) => (
    <button
      type="button"
      onClick={() => onJumpToStep(stepNum)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 14px',
        borderRadius: '8px',
        fontSize: '0.82rem',
        fontWeight: 700,
        fontFamily: 'inherit',
        background: 'var(--color-primary-light, #FAF0F3)',
        color: 'var(--color-primary, #7A1F3D)',
        border: '1px solid var(--color-primary-subtle, #F3DEE5)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#F3DEE5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-primary-light, #FAF0F3)';
      }}
    >
      <Edit3 size={13} />
      {language === 'mr' ? 'बदला' : 'Edit'}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={8}
        totalSteps={10}
        title={t('profileBuilder.step8Title')}
        subtitle={t('profileBuilder.step8Subtitle')}
        icon={<CheckCircle2 size={22} />}
      />

      {/* Profile Completion Progress Card */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #FAF0F3 0%, #FAF5E8 100%)',
          border: '1.5px solid var(--color-border, #E8DFC8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-primary, #7A1F3D)',
            }}
          >
            {t('profileBuilder.profileCompletion')}
          </span>
          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: 'var(--color-dark, #242124)',
              margin: '2px 0 0 0',
            }}
          >
            {completionPercentage}% {t('profileBuilder.complete')}
          </h3>
        </div>

        <div style={{ width: '200px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              width: '100%',
              height: '10px',
              borderRadius: '9999px',
              background: 'rgba(36, 33, 36, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${completionPercentage}%`,
                height: '100%',
                borderRadius: '9999px',
                background: 'linear-gradient(90deg, var(--color-primary, #7A1F3D) 0%, var(--color-secondary, #C59A45) 100%)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: Basic Information */}
      <SectionCard
        title={t('profileBuilder.step1Title')}
        icon={<User size={20} />}
        action={renderEditBtn(1)}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            fontSize: '0.88rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.fullName')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>
              {data.first_name} {data.last_name || ''}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.ageDob')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>
              {data.date_of_birth ? `${calculateAgeFromDob(data.date_of_birth)} yrs (${data.date_of_birth})` : '-'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.height')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{cmToFeetInches(data.height_cm)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.maritalStatus')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)', textTransform: 'capitalize' }}>
              {data.marital_status || '-'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.community')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{getCommunityLabel(data.community)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.subCommunity')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.sub_community || '-'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.manglik')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)', textTransform: 'capitalize' }}>
              {data.manglik || '-'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.motherTongue')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.mother_tongue || 'Marathi'}</strong>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 2: Education & Career */}
      <SectionCard
        title={t('profileBuilder.step2Title')}
        icon={<GraduationCap size={20} />}
        action={renderEditBtn(2)}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            fontSize: '0.88rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.highestEducation')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{getEducationLabel(data.highest_education)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.educationDetail')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.education_detail || '-'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.occupation')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{getOccupationLabel(data.occupation)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.annualIncome')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{getIncomeLabel(data.annual_income)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.organizationName')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.organization_name || '-'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.workLocation')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.work_location || '-'}</strong>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 3: Family Details */}
      <SectionCard
        title={t('profileBuilder.step3Title')}
        icon={<Users size={20} />}
        action={renderEditBtn(3)}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            fontSize: '0.88rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.fatherOccupation')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.father_occupation || '-'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.motherOccupation')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.mother_occupation || '-'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.familyType')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{getFamilyTypeLabel(data.family_type)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.familyValues')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>{getFamilyValuesLabel(data.family_values)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.brothersCount')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>
              {data.brothers_count || 0} ({data.brothers_married || 0} {language === 'mr' ? 'विवाहित' : 'married'})
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {t('profileBuilder.sistersCount')}
            </span>
            <strong style={{ color: 'var(--color-dark, #242124)' }}>
              {data.sisters_count || 0} ({data.sisters_married || 0} {language === 'mr' ? 'विवाहित' : 'married'})
            </strong>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 4 & 5: Lifestyle & Location */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <SectionCard
          title={t('profileBuilder.step4Title')}
          icon={<Utensils size={20} />}
          action={renderEditBtn(4)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)' }}>{t('profileBuilder.diet')}: </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>{getDietLabel(data.diet)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)' }}>
                {t('profileBuilder.smoking')} / {t('profileBuilder.drinking')}:{' '}
              </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>
                {data.smoking} / {data.drinking}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)' }}>{t('profileBuilder.hobbies')}: </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.hobbies?.join(', ') || '-'}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={t('profileBuilder.step5Title')}
          icon={<MapPin size={20} />}
          action={renderEditBtn(5)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)' }}>{t('profileBuilder.currentCity')}: </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>
                {data.current_city}, {data.current_state}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)' }}>{t('profileBuilder.nativePlace')}: </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.native_place || '-'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)' }}>{t('profileBuilder.currentCountry')}: </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>{data.current_country}</strong>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* SECTION 6 & 7: About Me & Preferences */}
      <SectionCard
        title={`${t('profileBuilder.step6Title')} & ${t('profileBuilder.step7Title')}`}
        icon={<FileText size={20} />}
        action={renderEditBtn(6)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
              {t('profileBuilder.aboutMe')}:
            </span>
            <p
              style={{
                background: 'var(--color-bg, #FAF7F2)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid var(--color-border-light, #F0EAE1)',
                color: 'var(--color-dark, #242124)',
                fontStyle: 'italic',
                margin: 0,
                lineHeight: '1.6',
              }}
            >
              "{data.about_me || '-'}"
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border-light, #F0EAE1)',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
                {t('profileBuilder.partnerAgeRange')}
              </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>
                {data.partner_min_age} - {data.partner_max_age} yrs
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
                {t('profileBuilder.partnerHeightRange')}
              </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>
                {cmToFeetInches(data.partner_min_height)} - {cmToFeetInches(data.partner_max_height)}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
                {t('profileBuilder.partnerEducation')}
              </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>
                {data.partner_education?.[0] || t('profileBuilder.doesNotMatter')}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
                {t('profileBuilder.partnerIncome')}
              </span>
              <strong style={{ color: 'var(--color-dark, #242124)' }}>
                {data.partner_min_income || t('profileBuilder.doesNotMatter')}
              </strong>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* SECTION 8: Identity Verification Status / ओळख पडताळणी स्थिती */}
      <SectionCard
        title={language === 'mr' ? 'ओळख पडताळणी स्थिती' : 'Identity Verification Status'}
        icon={<ShieldCheck size={20} />}
        action={renderEditBtn(9)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted, #6C625E)', display: 'block', fontSize: '0.8rem' }}>
              {language === 'mr' ? 'ओळखपत्र प्रकार व स्थिती' : 'Verification Type & Status'}
            </span>
            <strong style={{ color: data.self_attested ? '#15803D' : 'var(--color-dark, #242124)' }}>
              {data.self_attested
                ? (language === 'mr' ? '✓ आधार ओळख पडताळणी पूर्ण (Verified)' : '✓ Aadhaar Identity Verified')
                : (language === 'mr' ? 'पडताळणी बाकी (Not Verified)' : 'Not Verified')}
            </strong>
          </div>

          {data.self_attested ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: '#DCFCE7',
                color: '#15803D',
                border: '1px solid #86EFAC',
              }}
            >
              <CheckCircle2 size={15} />
              {language === 'mr' ? 'सत्यापित प्रोफाइल बॅज' : 'Verified Profile Badge'}
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: '#FAF0F3',
                color: 'var(--color-primary, #7A1F3D)',
                border: '1px solid var(--color-border, #E8DFC8)',
              }}
            >
              {language === 'mr' ? 'पडताळणी बाकी' : 'Pending Verification'}
            </span>
          )}
        </div>
      </SectionCard>

      {/* Moderation & Privacy InfoCard */}
      <InfoCard type="gold" title={t('profileBuilder.submissionNoticeTitle')}>
        {t('profileBuilder.submissionNoticeDesc')}
      </InfoCard>
    </div>
  );
};
