import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                  <div className="input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input has-toggle"
                    placeholder={t.auth.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="password-toggle-btn"
                    title={showPassword ? (language === 'mr' ? 'पासवर्ड लपवा' : 'Hide password') : (language === 'mr' ? 'पासवर्ड दाखवा' : 'Show password')}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reset-confirm-password">
                  {t.auth.resetPasswordPage.confirmPasswordLabel} <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="form-input has-toggle"
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="password-toggle-btn"
                    title={showConfirmPassword ? (language === 'mr' ? 'पासवर्ड लपवा' : 'Hide password') : (language === 'mr' ? 'पासवर्ड दाखवा' : 'Show password')}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
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
