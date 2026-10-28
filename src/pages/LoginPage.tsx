import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  const validate = (): boolean => {
    setErrorMessage(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage(t.auth.validation.invalidEmail);
      return false;
    }
    if (!password) {
      setErrorMessage(t.auth.validation.passwordRequired);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await signIn(email.trim(), password);

      if (error) {
        const msg = error.message ? error.message.toLowerCase() : '';
        if (msg.includes('invalid login credentials')) {
          setErrorMessage(t.auth.validation.invalidCredentials);
        } else if (msg.includes('email not confirmed')) {
          setErrorMessage(t.auth.validation.unverifiedEmail);
        } else if (msg.includes('abort') || msg.includes('timed out')) {
          setErrorMessage(language === 'mr' ? 'जोडणी वेळ संपली. कृपया इंटरनेट तपासा व पुन्हा प्रयत्न करा.' : 'Connection timed out. Please check your internet connection and try again.');
        } else {
          setErrorMessage(error.message || t.auth.validation.generalError);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Successful login - route designated admin to admin hub if default destination
        const isAdminUser = email.trim().toLowerCase() === 'vaishalibagave8@gmail.com' || 
          data.user?.app_metadata?.role === 'admin' || 
          data.user?.user_metadata?.role === 'admin';

        if (isAdminUser && (!location.state || from === '/dashboard')) {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      const msg = errObj?.message ? errObj.message.toLowerCase() : '';
      if (msg.includes('abort') || msg.includes('timed out')) {
        setErrorMessage(language === 'mr' ? 'जोडणी वेळ संपली. कृपया इंटरनेट तपासा व पुन्हा प्रयत्न करा.' : 'Connection timed out. Please check your internet connection and try again.');
      } else {
        setErrorMessage(errObj?.message || t.auth.validation.generalError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ background: 'var(--color-bg)', minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card auth-card" style={{ padding: '38px 32px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '14px', textDecoration: 'none' }} title={language === 'mr' ? 'सनईबंध मुख्यपृष्ठ' : 'Sanaibandh Home'}>
              <BrandLogo size={58} />
            </Link>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>
              {t.auth.loginTitle}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {t.auth.loginSubtitle}
            </p>
          </div>

          {!isConfigured && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: '#FEF3C7', color: '#92400E', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{language === 'mr' ? 'डेटाबेस जोडणी उपलब्ध नाही. कृपया सेटिंग्ज तपासा.' : 'Database credentials are not yet configured. Please set them in your environment.'}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: '#FEE2E2', color: '#B91C1C', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">
                <span>{t.auth.emailLabel}</span>
                <span className="required-star">*</span>
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Mail size={19} />
                </div>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  <span>{t.auth.password}</span>
                  <span className="required-star">*</span>
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {t.auth.forgotPasswordLink}
                </Link>
              </div>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Lock size={19} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input has-toggle"
                  placeholder="••••••••"
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                {t.auth.rememberMe}
              </label>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? t.auth.loggingIn : t.auth.loginBtn}
            </Button>
          </form>

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--color-border-light)', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{t.auth.noAccount} </span>
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              {t.auth.registerNow}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
