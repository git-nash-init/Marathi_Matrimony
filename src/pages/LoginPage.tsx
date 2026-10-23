import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Lock, Mail, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage(t.auth.validation.invalidCredentials);
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMessage(t.auth.validation.unverifiedEmail);
        } else {
          setErrorMessage(error.message || t.auth.validation.generalError);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Successful login
        navigate(from, { replace: true });
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
        <div className="card" style={{ padding: '36px 30px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary)', color: 'var(--color-white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Heart size={24} fill="#C59A45" color="#C59A45" />
            </div>
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
              <span>Supabase credentials are not yet configured. Please set them in your environment.</span>
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
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '6px' }}>
                {t.auth.emailLabel} *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    background: 'var(--color-bg)',
                    fontSize: '0.95rem'
                  }}
                />
                <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)' }}>
                  {t.auth.password} *
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {t.auth.forgotPasswordLink}
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    background: 'var(--color-bg)',
                    fontSize: '0.95rem'
                  }}
                />
                <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
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
