import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, LayoutDashboard, Search } from 'lucide-react';

interface Step10Props {
  profileId: string | null;
  firstName: string;
}

export const Step10ProfileSubmitted: React.FC<Step10Props> = ({ profileId, firstName }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '28px',
        maxWidth: '620px',
        margin: '0 auto',
        padding: '30px 10px',
      }}
    >
      {/* Success Hero Icon */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'var(--color-success-bg, #E8F8F0)',
            color: 'var(--color-success, #1E824C)',
            border: '2px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(30, 130, 76, 0.18)',
          }}
        >
          <CheckCircle2 size={48} />
        </div>

        <div>
          <h2
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--color-primary, #7A1F3D)',
              margin: '0 0 8px 0',
            }}
          >
            {t('profileBuilder.submittedHeading')}!
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-text-muted, #6C625E)',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            {firstName ? `${firstName}, ` : ''}
            {t('profileBuilder.submittedSubheading')}
          </p>
        </div>
      </div>

      {/* Confirmation Details Card */}
      <div
        style={{
          width: '100%',
          padding: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #FAF0F3 0%, #FAF5E8 100%)',
          border: '1.5px solid var(--color-border, #E8DFC8)',
          boxShadow: '0 4px 16px rgba(122, 31, 61, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          textAlign: 'left',
        }}
      >
        {/* Profile ID Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--color-border-light, #F0EAE1)',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted, #6C625E)',
            }}
          >
            {language === 'mr' ? 'नोंदणीकृत प्रोफाइल आयडी' : 'Registered Profile ID'}
          </span>
          <span
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: 'var(--color-primary, #7A1F3D)',
              background: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border, #E8DFC8)',
            }}
          >
            {profileId || 'MM109284'}
          </span>
        </div>

        {/* Status Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--color-border-light, #F0EAE1)',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted, #6C625E)',
            }}
          >
            {language === 'mr' ? 'सद्यस्थिती' : 'Current Status'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#0369A1',
              background: '#F0F9FF',
              padding: '4px 12px',
              borderRadius: '9999px',
              border: '1px solid #BAE6FD',
            }}
          >
            <Clock size={14} />
            {language === 'mr' ? 'तपासणी प्रक्रियेत (Under Review)' : 'Under Moderation Review'}
          </span>
        </div>

        {/* Verification Timeline Notice */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingTop: '4px', fontSize: '0.85rem', color: 'var(--color-text-muted, #6C625E)', lineHeight: '1.5' }}>
          <ShieldCheck size={18} color="var(--color-success, #1E824C)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{t('profileBuilder.reviewNotice')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={{
            flex: '1 1 200px',
            minHeight: '48px',
            padding: '12px 24px',
            borderRadius: '12px',
            background: 'var(--color-primary, #7A1F3D)',
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 800,
            fontFamily: 'inherit',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(122, 31, 61, 0.28)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary-hover, #60142E)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-primary, #7A1F3D)';
          }}
        >
          <LayoutDashboard size={18} />
          {language === 'mr' ? 'माझ्या डॅशबोर्डवर जा' : 'Go to My Dashboard'}
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/search')}
          style={{
            flex: '1 1 180px',
            minHeight: '48px',
            padding: '12px 24px',
            borderRadius: '12px',
            background: '#FFFFFF',
            color: 'var(--color-dark, #242124)',
            border: '1.5px solid var(--color-border, #E8DFC8)',
            fontSize: '0.95rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg, #FAF7F2)';
            e.currentTarget.style.borderColor = 'var(--color-secondary, #C59A45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = 'var(--color-border, #E8DFC8)';
          }}
        >
          <Search size={18} />
          {language === 'mr' ? 'स्थळे शोधा' : 'Browse Matches'}
        </button>
      </div>
    </div>
  );
};
