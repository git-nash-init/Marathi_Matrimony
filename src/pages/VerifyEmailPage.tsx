import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const VerifyEmailPage: React.FC = () => {
  const { t } = useLanguage();
  const { resendVerificationEmail } = useAuth();
  const location = useLocation();

  const emailFromState = (location.state as { email?: string })?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) {
      setErrorMessage(t.auth.validation.invalidEmail);
      return;
    }

    setResending(true);
    setErrorMessage(null);
    setResendSuccess(false);

    try {
      const { error } = await resendVerificationEmail(email.trim());
      if (error) {
        setErrorMessage(error.message || t.auth.validation.generalError);
      } else {
        setResendSuccess(true);
      }
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || t.auth.validation.generalError);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="section" style={{ background: 'var(--color-bg)', minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          {/* Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Mail size={32} />
          </div>

          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
            {t.auth.verifyEmail.title}
          </h2>

          <p style={{ color: 'var(--color-dark)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '12px' }}>
            {t.auth.verifyEmail.sentNotice}
          </p>

          {email && (
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '20px',
              background: '#F1F5F9',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: '0.92rem',
              marginBottom: '16px'
            }}>
              {email}
            </div>
          )}

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
            {t.auth.verifyEmail.desc}
          </p>

          {resendSuccess && (
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: '#DCFCE7',
              color: '#15803D',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} />
              <span>{t.auth.verifyEmail.resendSuccess}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: '#FEE2E2',
              color: '#B91C1C',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {!emailFromState && (
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '6px' }}>
                {t.auth.emailLabel}
              </label>
              <input
                type="email"
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  background: 'var(--color-bg)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={handleResend}
              disabled={resending}
            >
              <RefreshCw size={16} style={{ marginRight: '8px', animation: resending ? 'spin 1s linear infinite' : 'none' }} />
              {resending ? t.auth.verifyEmail.resending : t.auth.verifyEmail.resendBtn}
            </Button>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: '0.92rem',
                marginTop: '8px'
              }}
            >
              <ArrowLeft size={16} />
              {t.auth.verifyEmail.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
