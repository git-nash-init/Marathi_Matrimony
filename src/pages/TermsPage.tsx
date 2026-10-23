import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';

export const TermsPage: React.FC = () => {
  const { t, brandName } = useLanguage();

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '860px' }}>
        <SectionHeading
          badge={t.termsPage.badge}
          title={t.termsPage.title}
          subtitle={`${brandName} ${t.termsPage.subtitleSuffix}`}
        />

        <div className="card" style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.termsPage.sec1Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.termsPage.sec1Desc}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.termsPage.sec2Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.termsPage.sec2Desc}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.termsPage.sec3Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.termsPage.sec3Desc}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
              {t.termsPage.sec4Title}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.96rem' }}>
              {t.termsPage.sec4Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
