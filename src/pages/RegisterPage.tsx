import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, Calendar, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { BrandLogo } from '../components/common/BrandLogo';

export const RegisterPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [profileFor, setProfileFor] = useState('myself');
  const [gender, setGender] = useState('female');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('1998-05-15');
  const [agree, setAgree] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return t.auth.validation.passwordMinLength;
    if (!/[A-Z]/.test(pass)) return t.auth.validation.passwordUppercase;
    if (!/[a-z]/.test(pass)) return t.auth.validation.passwordLowercase;
    if (!/[0-9]/.test(pass)) return t.auth.validation.passwordNumber;
    return null;
  };

  const validate = (): boolean => {
    setErrorMessage(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage(t.auth.validation.invalidEmail);
      return false;
    }
    const passError = validatePassword(password);
    if (passError) {
      setErrorMessage(passError);
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t.auth.validation.passwordMismatch);
      return false;
    }
    if (!agree) {
      setErrorMessage(t.auth.validation.agreeTermsRequired);
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
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Member';
      const lastName = nameParts.slice(1).join(' ') || '';
      const createdFor = profileFor === 'myself' ? 'Self' : (profileFor.charAt(0).toUpperCase() + profileFor.slice(1));

      const { data, error } = await signUp(email.trim(), password, {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName.trim(),
        profile_for: profileFor,
        created_for: createdFor,
        gender: gender,
        mobile: mobile.trim(),
        phone_number: mobile.trim(),
        date_of_birth: dob
      });

      if (error) {
        const msg = error.message ? error.message.toLowerCase() : '';
        if (msg.includes('already registered') || msg.includes('duplicate')) {
          setErrorMessage(t.auth.validation.duplicateEmail);
        } else if (msg.includes('rate limit') || msg.includes('429')) {
          setErrorMessage(language === 'mr' ? 'सुरक्षा कारणास्तव ईमेल पाठवण्याची मर्यादा आली आहे. कृपया काही मिनिटांनंतर प्रयत्न करा किंवा लॉगिन करा.' : 'Security rate limit reached for email confirmations. Please try again in a few minutes or log in.');
        } else if (msg.includes('abort') || msg.includes('timed out')) {
          setErrorMessage(language === 'mr' ? 'जोडणी वेळ संपली. कृपया इंटरनेट तपासा व पुन्हा प्रयत्न करा.' : 'Connection timed out. Please check your internet connection and try again.');
        } else {
          setErrorMessage(error.message || t.auth.validation.generalError);
        }
        setLoading(false);
        return;
      }

      // If active session is returned immediately, proceed directly to profile setup
      if (data?.session) {
        navigate('/profile/create', { replace: true });
        return;
      }

      // If signup requires email confirmation
      navigate('/verify-email', { state: { email: email.trim(), userCreated: Boolean(data?.user) } });
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
    <div className="section" style={{ background: 'var(--color-bg)', minHeight: '80vh', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="card" style={{ padding: '36px 30px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '14px', textDecoration: 'none' }} title={language === 'mr' ? 'सनईबंध मुख्यपृष्ठ' : 'Sanaibandh Home'}>
              <BrandLogo size={58} />
            </Link>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>
              {t.auth.registerTitle}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
              {t.auth.registerSubtitle}
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Profile for */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '8px' }}>
                {t.auth.profileFor}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'myself', label: t.auth.myself || (language === 'mr' ? 'स्वतः' : 'Self') },
                  { id: 'son', label: t.auth.son || (language === 'mr' ? 'मुलगा' : 'Son') },
                  { id: 'daughter', label: t.auth.daughter || (language === 'mr' ? 'मुलगी' : 'Daughter') },
                  { id: 'sibling', label: t.auth.sibling || (language === 'mr' ? 'भाऊ-बहीण' : 'Sibling') },
                  { id: 'relative', label: t.auth.relative || (language === 'mr' ? 'नातेवाईक' : 'Relative') },
                  { id: 'parent', label: t.auth.parent || (language === 'mr' ? 'पालक' : 'Parent') }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfileFor(item.id)}
                    style={{
                      padding: '8px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: profileFor === item.id ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: profileFor === item.id ? 'var(--color-primary-light)' : 'var(--color-bg)',
                      color: profileFor === item.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '8px' }}>
                {t.auth.gender}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  style={{
                    padding: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    border: gender === 'female' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: gender === 'female' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: gender === 'female' ? 'var(--color-white)' : 'var(--color-dark)'
                  }}
                >
                  {t.auth.bride}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  style={{
                    padding: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    border: gender === 'male' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: gender === 'male' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: gender === 'male' ? 'var(--color-white)' : 'var(--color-dark)'
                  }}
                >
                  {t.auth.groom}
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '6px' }}>
                {t.auth.fullName} *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder={t.auth.fullNamePlaceholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)', fontSize: '0.95rem' }}
                />
                <User size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Email Address */}
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
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)', fontSize: '0.95rem' }}
                />
                <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '6px' }}>
                  {t.auth.password} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder={t.auth.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)', fontSize: '0.95rem' }}
                  />
                  <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '6px' }}>
                  {t.auth.confirmPassword} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)', fontSize: '0.95rem' }}
                  />
                  <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            {/* Mobile & DOB */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '6px' }}>
                  {t.auth.mobile}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    placeholder="98220xxxxx"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)', fontSize: '0.95rem' }}
                  />
                  <Phone size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-dark)', marginBottom: '6px' }}>
                  {t.auth.dob} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', background: 'var(--color-bg)', fontSize: '0.95rem', fontFamily: 'inherit' }}
                  />
                  <Calendar size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '4px 0' }}>
              <input
                type="checkbox"
                id="terms"
                required
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', marginTop: '3px' }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', cursor: 'pointer', lineHeight: '1.4' }}>
                {t.auth.agreeTerms}
              </label>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? t.auth.registering : t.auth.registerBtn}
            </Button>
          </form>

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--color-border-light)', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{t.auth.haveAccount} </span>
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              {t.auth.loginNow}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
