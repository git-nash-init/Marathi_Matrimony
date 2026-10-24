import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';

export const ResetPasswordPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { updatePassword, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return t.auth.validation.passwordMinLength;
    if (!/[A-Z]/.test(pass)) return t.auth.validation.passwordUppercase;
    if (!/[a-z]/.test(pass)) return t.auth.validation.passwordLowercase;
    if (!/[0-9]/.test(pass)) return t.auth.validation.passwordNumber;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const passError = validatePassword(password);
    if (passError) {
      setErrorMessage(passError);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t.auth.validation.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMessage(error.message || t.auth.validation.generalError);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || t.auth.validation.generalError);
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
              {t.auth.resetPasswordPage.title}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {t.auth.resetPasswordPage.subtitle}
            </p>
          </div>

          {!isConfigured && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: '#FEF3C7', color: '#92400E', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{language === 'mr' ? 'डेटाबेस जोडणी उपलब्ध नाही. कृपया सेटिंग्ज तपासा.' : 'Database credentials are not yet configured. Please set them in your environment.'}</span>
            </div>
          )}

          {success ? (
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
                {t.auth.resetPasswordPage.success}
              </p>
              <Button onClick={() => navigate('/dashboard')} variant="primary" size="md" fullWidth>
                {t.dashboard.title}
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
                <label className="form-label" htmlFor="reset-new-password">
                  {t.auth.resetPasswordPage.newPasswordLabel} <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="reset-new-password"
                    type="password"
                    required
                    className="form-input"
                    placeholder={t.auth.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reset-confirm-password">
                  {t.auth.resetPasswordPage.confirmPasswordLabel} <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="reset-confirm-password"
                    type="password"
                    required
                    className="form-input"
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                {loading ? t.auth.resetPasswordPage.submitting : t.auth.resetPasswordPage.submitBtn}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
