import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';

export const PrivacyPolicyPage: React.FC = () => {
  const { t, brandName } = useLanguage();

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '860px' }}>
        <SectionHeading
          badge={t.privacyPage.badge}
          title={t.privacyPage.title}
          subtitle={`${brandName} ${t.privacyPage.subtitlePrefix}`}
        />

        <div className="card" style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.privacyPage.sec1Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.privacyPage.sec1Desc}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.privacyPage.sec2Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.privacyPage.sec2Desc}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.privacyPage.sec3Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.privacyPage.sec3Desc}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.privacyPage.sec4Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.privacyPage.sec4Desc}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.privacyPage.sec5Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.privacyPage.sec5Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
