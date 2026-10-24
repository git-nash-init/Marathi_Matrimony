import React from 'react';
import { Heart, ShieldCheck, Award, Users, CheckCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';

export const AboutUsPage: React.FC = () => {
  const { t, brandName, language } = useLanguage();

  return (
    <div className="section">
      <div className="container">
        <SectionHeading
          badge={t.aboutUsPage.badge}
          title={language === 'mr' ? `${brandName} बद्दल` : `About ${brandName}`}
          subtitle={t.aboutUsPage.subtitle}
        />

        {/* Mission & Vision Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            marginBottom: '60px'
          }}
        >
          <div className="card" style={{ padding: '36px 30px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Heart size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '14px' }}>
              {t.aboutUsPage.missionTitle}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', fontSize: '1rem' }}>
              {t.aboutUsPage.missionDesc}
            </p>
          </div>

          <div className="card" style={{ padding: '36px 30px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--color-secondary-light)', color: 'var(--color-secondary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '14px' }}>
              {t.aboutUsPage.valuesTitle}
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-text-muted)', fontSize: '0.98rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} color="var(--color-secondary)" />
                <span>{t.aboutUsPage.val1}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} color="var(--color-secondary)" />
                <span>{t.aboutUsPage.val2}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} color="var(--color-secondary)" />
                <span>{t.aboutUsPage.val3}</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} color="var(--color-secondary)" />
                <span>{t.aboutUsPage.val4}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why We Are Different */}
        <div
          style={{
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '40px',
            maxWidth: '960px',
            margin: '0 auto 60px auto'
          }}
        >
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '16px', textAlign: 'center' }}>
            {t.aboutUsPage.diffTitle}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.75', textAlign: 'center', maxWidth: '780px', margin: '0 auto 30px auto' }}>
            {t.aboutUsPage.diffDesc}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'center' }}>
            <div style={{ padding: '20px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={32} color="var(--color-primary)" style={{ margin: '0 auto 8px auto' }} />
              <h4 style={{ color: 'var(--color-dark)', marginBottom: '4px' }}>{t.aboutUsPage.diffCard1Title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t.aboutUsPage.diffCard1Desc}</p>
            </div>
            <div style={{ padding: '20px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <Users size={32} color="var(--color-secondary-hover)" style={{ margin: '0 auto 8px auto' }} />
              <h4 style={{ color: 'var(--color-dark)', marginBottom: '4px' }}>{t.aboutUsPage.diffCard2Title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t.aboutUsPage.diffCard2Desc}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Button to="/register" variant="primary" size="lg">
            {t.nav.registerFree}
          </Button>
        </div>
      </div>
    </div>
  );
};
