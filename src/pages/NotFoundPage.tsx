import React from 'react';
import { Home, Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="section" style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <h1 style={{ fontSize: '5rem', color: 'var(--color-primary)', fontWeight: 800, lineHeight: 1, marginBottom: '16px' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-dark)', marginBottom: '12px' }}>
          {t.notFoundPage.title}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '1.05rem' }}>
          {t.notFoundPage.desc}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Button to="/" variant="primary" size="lg" icon={<Home size={18} />}>
            {t.notFoundPage.backHome}
          </Button>
          <Button to="/search" variant="outline" size="lg" icon={<Search size={18} />}>
            {t.nav.search}
          </Button>
        </div>
      </div>
    </div>
  );
};
