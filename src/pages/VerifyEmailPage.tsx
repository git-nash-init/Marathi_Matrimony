import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/common/Button';

export const VerifyEmailPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { resendVerificationEmail, user, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = (location.state as { email?: string })?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [verificationConfirmed, setVerificationConfirmed] = useState(false);

  // Check for confirmation tokens in URL hash or search params
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const searchParams = new URLSearchParams(search);
      const code = searchParams.get('code');

      // Check if hash contains access_token or type=signup/recovery
      if (hash && (hash.includes('access_token=') || hash.includes('type='))) {
        setIsVerifyingToken(true);
        try {
          // Parse hash params
          const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
          }

          setVerificationConfirmed(true);
          await refreshProfile();
          setTimeout(() => {
            navigate('/profile/create', { replace: true });
          }, 2000);
        } catch (err) {
          console.error('Error confirming email verification token:', err);
        } finally {
          setIsVerifyingToken(false);
        }
      } else if (code) {
        setIsVerifyingToken(true);
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            setVerificationConfirmed(true);
            await refreshProfile();
            setTimeout(() => {
              navigate('/profile/create', { replace: true });
            }, 2000);
          }
        } catch (err) {
          console.error('Error exchanging code for session:', err);
        } finally {
          setIsVerifyingToken(false);
        }
      } else if (user) {
        // User is already logged in
        setVerificationConfirmed(true);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      }
    };

    handleAuthRedirect();
  }, [user, navigate, refreshProfile]);

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
        const msg = error.message ? error.message.toLowerCase() : '';
        if (msg.includes('rate limit') || msg.includes('429')) {
          setErrorMessage(language === 'mr' ? 'सुरक्षा कारणास्तव ईमेल पाठवण्याची मर्यादा आली आहे. कृपया काही वेळानंतर प्रयत्न करा.' : 'Rate limit reached for sending emails. Please try again in a few minutes.');
        } else {
          setErrorMessage(error.message || t.auth.validation.generalError);
        }
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
        <div className="card auth-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
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

          {verificationConfirmed ? (
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              background: '#DCFCE7',
              color: '#15803D',
              fontSize: '1rem',
              fontWeight: 700,
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle2 size={36} color="#15803D" />
              <span>{language === 'mr' ? 'ईमेल पडताळणी यशस्वी झाली!' : 'Email Verified Successfully!'}</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#166534' }}>
                {language === 'mr' ? 'आपले प्रोफाइल तयार करण्यासाठी पुढे नेत आहोत...' : 'Redirecting to complete your profile setup...'}
              </span>
            </div>
          ) : isVerifyingToken ? (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: '#EFF6FF',
              color: '#1D4ED8',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              <Loader2 size={20} className="animate-spin" />
              <span>{language === 'mr' ? 'ईमेल लिंकची पडताळणी सुरू आहे...' : 'Verifying email confirmation link...'}</span>
            </div>
          ) : null}

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
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '18px' }}>
              <label className="form-label" htmlFor="verify-email">
                {t.auth.emailLabel}
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  id="verify-email"
                  type="email"
                  className="form-input"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
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
