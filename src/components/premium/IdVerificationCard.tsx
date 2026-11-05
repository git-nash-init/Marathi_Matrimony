import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';
import { FormInput } from '../common/FormInput';
import { describeError, UploadProgress } from '../states/UiStates';
import { idFileProblem, moderationService, MyVerification } from '../../services/moderation.service';

/** Lets a member upload an ID privately and shows where the review stands. */
export const IdVerificationCard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { success } = useToast();
  const mr = language === 'mr';
  const [state, setState] = useState<MyVerification | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [last4, setLast4] = useState('');
  const [last4Touched, setLast4Touched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setState(await moderationService.getMyVerification());
    } catch {
      setState(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (!loaded || !state) return null;

  const box: React.CSSProperties = { background: 'var(--color-surface-pure)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 18, marginBottom: 16 };
  const heading: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 6px', fontSize: '1rem' };

  if (state.status === 'verified') {
    return (
      <section style={box}>
        <h2 style={heading}><CheckCircle2 size={18} color="#15803D" /> {mr ? 'ओळख पडताळली' : 'Identity verified'}</h2>
        <p style={{ margin: 0, color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
          {mr ? 'आपल्या प्रोफाइलवर Verified बॅज दिसतो.' : 'Your profile shows the Verified badge.'}
        </p>
      </section>
    );
  }

  if (state.latest?.status === 'pending') {
    return (
      <section style={box}>
        <h2 style={heading}><Clock size={18} color="#B45309" /> {mr ? 'ओळखपत्र तपासले जात आहे' : 'Your ID is being checked'}</h2>
        <p style={{ margin: 0, color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
          {mr ? 'तपासणी पूर्ण झाल्यावर आपल्याला सूचना मिळेल. आणखी काही करण्याची गरज नाही.' : 'You will get a notification when this is done. There is nothing else you need to do.'}
        </p>
      </section>
    );
  }

  const last4Error = last4Touched && last4 && !/^[0-9]{4}$/.test(last4)
    ? (mr ? 'फक्त शेवटचे ४ अंक टाका.' : 'Enter only the last 4 digits.') : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLast4Touched(true);
    setFailure(null);
    if (!file) {
      setFileError(mr ? 'कृपया फाइल निवडा.' : 'Please choose a file.');
      return;
    }
    if (fileError || last4Error || !user) return;
    setBusy(true);
    try {
      setProgress(0);
      await moderationService.submitIdDocument(user.id, file, last4 || null, setProgress);
      success(mr ? 'ओळखपत्र पाठवले. तपासणीनंतर सूचना मिळेल.' : 'ID sent. You will be notified once it has been checked.');
      setFile(null);
      setLast4('');
      void load();
    } catch (err) {
      const message = (err as Error)?.message;
      if (message === 'UPLOAD_FAILED') {
        setFailure(mr
          ? 'फाइल अपलोड झाली नाही. आपली इंटरनेट जोडणी तपासून पुन्हा प्रयत्न करा.'
          : 'The file did not upload. Please check your connection and try again.');
      } else if (err instanceof Error && !(err as { code?: string }).code) {
        setFailure(message);
      } else {
        const generic = describeError(err, language);
        setFailure(`${generic.what} ${generic.fix}`);
      }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <section style={box}>
      <h2 style={heading}><ShieldCheck size={18} color="var(--color-primary)" /> {mr ? 'आपली ओळख पडताळा' : 'Verify your identity'}</h2>
      <p style={{ margin: '0 0 12px', color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
        {mr
          ? 'आधार किंवा इतर शासकीय ओळखपत्र अपलोड करा. ते फक्त आमच्या तपासणी पथकाला दिसते, इतर सदस्यांना कधीच नाही. आधार असल्यास पहिले ८ अंक झाकून अपलोड करा.'
          : 'Upload an Aadhaar or other government ID. Only our review team can see it, never other members. For Aadhaar, please cover the first 8 digits before uploading.'}
      </p>
      {state.latest?.status === 'rejected' && state.latest.notes && (
        <p role="status" style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-warning-bg)', color: 'var(--color-danger)', fontSize: '0.9rem', margin: '0 0 12px' }}>
          {mr ? 'मागील कागदपत्र स्वीकारले नाही' : 'Your last document was not accepted'}: {state.latest.notes}
        </p>
      )}
      <form onSubmit={submit} noValidate>
        <label htmlFor="id-file" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 4 }}>
          {mr ? 'ओळखपत्र (JPG, PNG, WebP किंवा PDF, ५ MB पर्यंत)' : 'ID document (JPG, PNG, WebP or PDF, up to 5 MB)'}
        </label>
        <input
          id="id-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          aria-invalid={Boolean(fileError)}
          onChange={(e) => {
            const chosen = e.target.files?.[0] ?? null;
            setFile(chosen);
            setFileError(chosen ? idFileProblem(chosen, mr) : null);
          }}
        />
        {fileError && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.86rem', margin: '4px 0 0' }}>{fileError}</p>}
        {!state.aadhaar_last4 && (
          <div style={{ maxWidth: 240, marginTop: 12 }}>
            <FormInput
              id="id-last4"
              label={mr ? 'शेवटचे ४ अंक' : 'Last 4 digits'}
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              value={last4}
              error={last4Error}
              onBlur={() => setLast4Touched(true)}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        )}
        {progress !== null && <div style={{ marginTop: 10 }}><UploadProgress percent={progress} /></div>}
        {failure && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.88rem', margin: '10px 0 0' }}>{failure}</p>}
        <div style={{ marginTop: 12 }}>
          <Button type="submit" variant="primary" size="sm" icon={<Upload size={15} />} disabled={busy}>
            {busy ? (mr ? 'अपलोड होत आहे...' : 'Uploading...') : (mr ? 'तपासणीसाठी पाठवा' : 'Send for review')}
          </Button>
        </div>
      </form>
    </section>
  );
};
