import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState, SuccessPanel } from '../../components/states/UiStates';
import styles from './MfaPanels.module.css';

const CODE_FORMAT = /^\d{6}$/;

const CodeForm: React.FC<{
  submitLabel: string;
  onSubmit: (code: string) => Promise<string | null>;
}> = ({ submitLabel, onSubmit }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const [code, setCode] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!CODE_FORMAT.test(code)) {
      setFieldError(mr ? 'अ‍ॅपमधील ६ अंकी कोड टाका.' : 'Enter the 6-digit code from your app.');
      return;
    }
    setBusy(true);
    const failure = await onSubmit(code);
    setBusy(false);
    if (failure) {
      setFieldError(failure);
      setCode('');
    }
  };

  return (
    <form onSubmit={submit} className={styles.form}>
      <FormInput
        id="mfa-code"
        label={mr ? '६ अंकी कोड' : '6-digit code'}
        value={code}
        onChange={(e) => {
          setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
          setFieldError(undefined);
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        error={fieldError}
      />
      <Button type="submit" variant="primary" size="sm" disabled={busy}>
        {busy ? (mr ? 'तपासत आहे...' : 'Checking...') : submitLabel}
      </Button>
    </form>
  );
};

/** Asks for the code from the admin's authenticator app. */
export const MfaChallenge: React.FC<{ onDone: () => Promise<void> | void }> = ({ onDone }) => {
  const { language } = useLanguage();
  const { signOut } = useAuth();
  const mr = language === 'mr';
  const [factorId, setFactorId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (!active) return;
      if (error) setLoadError(error);
      else setFactorId(data.totp[0]?.id ?? null);
    });
    return () => { active = false; };
  }, [attempt]);

  if (loadError) {
    return <ErrorState error={loadError} onRetry={() => { setLoadError(null); setAttempt((n) => n + 1); }} />;
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <ShieldCheck size={24} />
        <h2>{mr ? '२-टप्पा पडताळणी' : '2-step verification'}</h2>
      </div>
      <p>{mr ? 'प्रमाणीकरण अ‍ॅप उघडा आणि सनईबंधसाठीचा कोड टाका.' : 'Open your authenticator app and enter the code for Sanaibandh.'}</p>
      {factorId ? (
        <CodeForm
          submitLabel={mr ? 'पडताळा' : 'Verify'}
          onSubmit={async (code) => {
            const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
            if (error) return mr ? 'कोड जुळला नाही. अ‍ॅपमधील नवीन कोड टाका.' : 'That code did not match. Enter the current code from your app.';
            await onDone();
            return null;
          }}
        />
      ) : (
        <Skeleton height={80} borderRadius={8} />
      )}
      <button type="button" className={styles.linkButton} onClick={() => void signOut()}>
        {mr ? 'लॉग आउट करा' : 'Sign out'}
      </button>
    </div>
  );
};

/** Sets up an authenticator app. */
export const MfaEnroll: React.FC<{ onDone: () => Promise<void> | void; required?: boolean; onCancel?: () => void }> = ({ onDone, required, onCancel }) => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const [enrollment, setEnrollment] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      // An abandoned setup leaves an unverified factor behind, and it would block a new one.
      const { data: existing, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      for (const factor of existing.all.filter((f) => f.status === 'unverified')) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Sanaibandh admin' });
      if (error) throw error;
      if (active) setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })().catch((err) => { if (active) setLoadError(err); });
    return () => { active = false; };
  }, [attempt]);

  if (loadError) {
    return <ErrorState error={loadError} onRetry={() => { setLoadError(null); setAttempt((n) => n + 1); }} />;
  }

  if (done) {
    return (
      <SuccessPanel
        title={mr ? '२-टप्पा पडताळणी सुरू झाली' : '2-step verification is on'}
        message={mr ? 'आपले प्रशासक खाते आता अधिक सुरक्षित आहे.' : 'Your admin account is now better protected.'}
        nextSteps={[mr ? 'प्रत्येक लॉगिनवेळी अ‍ॅपमधील कोड विचारला जाईल.' : 'Each sign-in will ask for a code from your app.']}
        action={{ label: mr ? 'पुढे जा' : 'Continue', onClick: () => void onDone() }}
      />
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <ShieldCheck size={24} />
        <h2>{mr ? '२-टप्पा पडताळणी सुरू करा' : 'Set up 2-step verification'}</h2>
      </div>
      {required && <p>{mr ? 'प्रशासक प्रवेशासाठी हे आवश्यक आहे.' : 'This is required for admin access.'}</p>}
      <ol className={styles.steps}>
        <li>{mr ? 'फोनवर Google Authenticator किंवा तत्सम अ‍ॅप उघडा.' : 'Open Google Authenticator or a similar app on your phone.'}</li>
        <li>{mr ? 'हा QR कोड स्कॅन करा.' : 'Scan this QR code.'}</li>
        <li>{mr ? 'अ‍ॅपमधील ६ अंकी कोड खाली टाका.' : 'Enter the 6-digit code from the app below.'}</li>
      </ol>
      {enrollment ? (
        <>
          <img src={enrollment.qr} alt={mr ? '२-टप्पा पडताळणी QR कोड' : '2-step verification QR code'} className={styles.qr} />
          <details className={styles.manual}>
            <summary>{mr ? 'स्कॅन होत नाही? कोड हाताने टाका' : "Can't scan? Enter the key by hand"}</summary>
            <code>{enrollment.secret}</code>
          </details>
          <CodeForm
            submitLabel={mr ? 'सुरू करा' : 'Turn on'}
            onSubmit={async (code) => {
              const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollment.factorId, code });
              if (error) return mr ? 'कोड जुळला नाही. अ‍ॅपमधील नवीन कोड टाका.' : 'That code did not match. Enter the current code from your app.';
              setDone(true);
              return null;
            }}
          />
        </>
      ) : (
        <Skeleton height={200} borderRadius={8} />
      )}
      {onCancel && (
        <button type="button" className={styles.linkButton} onClick={onCancel}>
          {mr ? 'रद्द करा' : 'Cancel'}
        </button>
      )}
    </div>
  );
};
