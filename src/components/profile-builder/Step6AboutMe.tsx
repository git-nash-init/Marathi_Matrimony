import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ProfileFormData } from '../../types/profileBuilder.types';
import { FormTextarea } from '../common/FormTextarea';
import { InfoCard } from '../common/InfoCard';
import { SectionCard } from '../common/SectionCard';
import { StepHeader } from '../common/StepHeader';
import { UserCheck, Sparkles } from 'lucide-react';

interface Step6Props {
  data: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: any) => void;
  errors?: Record<string, string>;
}

// Regex to detect phone numbers, emails, URLs, or explicit contact sharing
const CONTACT_INFO_REGEX = /(\b[6-9]\d{9}\b|\+?91[\s-]?\d{10}|\b\d{5}[\s-]?\d{5}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|https?:\/\/|www\.|\bwhatsapp\b|\bcall\s*me\b|\bcontact\s*no\b|\bph(one)?\s*:\s*\d+)/i;

export const Step6AboutMe: React.FC<Step6Props> = ({ data, onChange, errors = {} }) => {
  const { t, language } = useLanguage();
  const [contactWarning, setContactWarning] = useState<boolean>(false);

  const charCount = data.about_me?.length || 0;
  const minLength = 50;
  const maxLength = 1000;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    onChange('about_me', text);

    if (CONTACT_INFO_REGEX.test(text)) {
      setContactWarning(true);
    } else {
      setContactWarning(false);
    }
  };

  const addTemplate = (snippet: string) => {
    const current = data.about_me ? data.about_me.trim() + ' ' : '';
    onChange('about_me', current + snippet);
  };

  const templates =
    language === 'mr'
      ? [
          'मी एक शांत, सुस्वभावी आणि कौटुंबिक मूल्यांचा आदर करणारा/करणारी व्यक्ती आहे.',
          'माझ्या मोकळ्या वेळेत मला वाचन, निसर्गभ्रमण आणि संगीताची आवड आहे.',
          'आम्ही सुसंस्कृत मध्यमवर्गीय मराठी कुटुंबातून आलो आहोत.',
          'मला समजूतदार, सुशिक्षित आणि कुटुंबवत्सल जोडीदाराची अपेक्षा आहे.',
        ]
      : [
          'I am an easy-going person with strong family values and mutual respect.',
          'In my free time, I enjoy traveling, reading, and exploring nature.',
          'We belong to a cultured and close-knit Maharashtrian family.',
          'I am looking for an understanding, educated and family-oriented partner.',
        ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <StepHeader
        stepNumber={6}
        totalSteps={10}
        title={t('profileBuilder.step6Title')}
        subtitle={t('profileBuilder.step6Subtitle')}
        icon={<UserCheck size={22} />}
      />

      {/* Safety Notice Banner */}
      <InfoCard type="warning" title={t('profileBuilder.safetyNoticeTitle')}>
        {t('profileBuilder.safetyNoticeDesc')}
      </InfoCard>

      {/* SECTION: About Me Bio */}
      <SectionCard
        title={t('profileBuilder.step6Title')}
        subtitle={language === 'mr' ? 'आपला स्वभाव, छंद व अपेक्षांचा संक्षिप्त परिचय' : 'Your personality, values & lifestyle'}
        icon={<UserCheck size={20} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormTextarea
            label={t('profileBuilder.aboutMe')}
            required
            value={data.about_me || ''}
            onChange={handleChange}
            rows={7}
            maxLength={maxLength}
            charCount={charCount}
            maxChars={maxLength}
            error={contactWarning ? t('profileBuilder.contactInfoWarning') : errors.about_me}
            placeholder={t('profileBuilder.aboutMePlaceholder')}
            helperText={
              charCount < minLength
                ? `${t('profileBuilder.minCharsRequired', { min: minLength })} (${charCount}/${minLength})`
                : undefined
            }
          />

          {/* Quick Suggestions / Prompts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
            <label
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--color-text-muted, #6C625E)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={16} color="var(--color-secondary, #C59A45)" />
              {t('profileBuilder.quickSuggestions')}
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addTemplate(tpl)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    background: 'var(--color-bg, #FAF7F2)',
                    border: '1px solid var(--color-border, #E8DFC8)',
                    color: 'var(--color-dark, #242124)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary, #7A1F3D)';
                    e.currentTarget.style.background = 'var(--color-primary-light, #FAF0F3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border, #E8DFC8)';
                    e.currentTarget.style.background = 'var(--color-bg, #FAF7F2)';
                  }}
                >
                  + {tpl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
