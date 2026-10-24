import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';

export const ForgotPasswordPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { resetPasswordForEmail, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage(t.auth.validation.invalidEmail);
      return;
    }

    setLoading(true);

    try {
      // Supabase send reset password email
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        // Generic message or error
        console.warn('Password reset error:', error.message);
      }
      // Always show success to prevent account enumeration
      setSubmitted(true);
    } catch (err: unknown) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ background: 'var(--color-bg)', minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card auth-card" style={{ padding: '36px 30px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '14px', textDecoration: 'none' }} title={language === 'mr' ? 'सनईबंध मुख्यपृष्ठ' : 'Sanaibandh Home'}>
              <BrandLogo size={58} />
            </Link>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>
              {t.auth.forgotPasswordPage.title}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {t.auth.forgotPasswordPage.subtitle}
            </p>
          </div>

          {!isConfigured && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: '#FEF3C7', color: '#92400E', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{language === 'mr' ? 'डेटाबेस जोडणी उपलब्ध नाही. कृपया सेटिंग्ज तपासा.' : 'Database credentials are not yet configured. Please set them in your environment.'}</span>
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#15803D',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <p style={{ color: 'var(--color-dark)', fontSize: '0.96rem', lineHeight: '1.6', marginBottom: '24px' }}>
                {t.auth.forgotPasswordPage.genericSuccess}
              </p>
              <Button to="/login" variant="primary" size="md" fullWidth>
                {t.auth.forgotPasswordPage.backToLogin}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {errorMessage && (
                <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: '#FEE2E2', color: '#B91C1C', fontSize: '0.88rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  {t.auth.emailLabel} <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    className="form-input"
                    placeholder={t.auth.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? t.auth.forgotPasswordPage.submitting : t.auth.forgotPasswordPage.submitBtn}
              </Button>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}
                >
                  <ArrowLeft size={16} />
                  {t.auth.forgotPasswordPage.backToLogin}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
