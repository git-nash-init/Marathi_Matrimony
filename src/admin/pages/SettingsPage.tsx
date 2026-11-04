import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { describeError } from '../../components/states/UiStates';
import { adminService } from '../../services/admin.service';
import { useAdminSession } from '../adminAccess';
import { MfaEnroll } from '../components/MfaPanels';

const card: React.CSSProperties = {
  background: 'var(--color-surface-pure)',
  border: '1px solid var(--color-border)',
  borderRadius: 14,
  padding: 20,
  maxWidth: 620,
  marginBottom: 16,
};

export const SettingsPage: React.FC = () => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { role, info, refresh } = useAdminSession();
  const mr = language === 'mr';
  const [enrolling, setEnrolling] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [busy, setBusy] = useState(false);

  const required = Boolean(info.mfa_required);

  const toggleRequired = async () => {
    setBusy(true);
    try {
      await adminService.setMfaRequired(!required);
      await refresh();
      showToast(
        !required
          ? (mr ? 'सर्व प्रशासकांसाठी २-टप्पा पडताळणी आवश्यक केली.' : '2-step verification is now required for every admin.')
          : (mr ? '२-टप्पा पडताळणीची सक्ती बंद केली.' : '2-step verification is no longer required.'),
        'success',
      );
    } catch (err) {
      const d = describeError(err, language);
      showToast(`${d.what} ${d.fix}`, 'error');
    } finally {
      setBusy(false);
      setConfirmToggle(false);
    }
  };

  if (enrolling) {
    return (
      <div style={{ maxWidth: 560 }}>
        <MfaEnroll
          onDone={async () => {
            setEnrolling(false);
            await refresh();
          }}
          onCancel={() => setEnrolling(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.35rem', margin: '0 0 16px' }}>{mr ? 'सेटिंग्ज' : 'Settings'}</h1>

      <section style={card}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.05rem', margin: '0 0 8px' }}>
          <ShieldCheck size={20} color="var(--color-primary)" />
          {mr ? '२-टप्पा पडताळणी' : '2-step verification'}
        </h2>
        {info.has_verified_factor ? (
          <p style={{ margin: 0, color: 'var(--color-success)', fontWeight: 600 }}>
            {mr ? 'आपल्या खात्यावर सुरू आहे.' : 'On for your account.'}
          </p>
        ) : (
          <>
            <p style={{ margin: '0 0 12px', color: 'var(--color-ink-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
              {mr
                ? 'आपला पासवर्ड कोणाला मिळाला तरी फोनवरील कोडशिवाय सदस्यांची माहिती दिसणार नाही.'
                : 'Even if someone gets your password, they cannot see member data without the code from your phone.'}
            </p>
            <Button variant="primary" size="sm" onClick={() => setEnrolling(true)}>
              {mr ? 'आता सुरू करा' : 'Set it up now'}
            </Button>
          </>
        )}
      </section>

      {role === 'super_admin' && (
        <section style={card}>
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 8px' }}>{mr ? 'सर्व प्रशासकांसाठी आवश्यक' : 'Require it for every admin'}</h2>
          <p style={{ margin: '0 0 12px', color: 'var(--color-ink-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            {required
              ? (mr ? 'सध्या आवश्यक आहे.' : 'Currently required.')
              : (mr ? 'सध्या ऐच्छिक आहे. सुरू केल्यावर कोडशिवाय कोणत्याही प्रशासकाला प्रवेश मिळणार नाही.' : 'Currently optional. Once on, no admin gets in without a code.')}
          </p>
          {info.aal === 'aal2' ? (
            <Button variant={required ? 'outline' : 'primary'} size="sm" onClick={() => setConfirmToggle(true)} disabled={busy}>
              {required ? (mr ? 'सक्ती बंद करा' : 'Stop requiring it') : (mr ? 'आवश्यक करा' : 'Require it')}
            </Button>
          ) : (
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-ink-muted)' }}>
              {mr ? 'हे बदलण्यासाठी प्रथम वरील २-टप्पा पडताळणी पूर्ण करा.' : 'To change this, first complete 2-step verification above.'}
            </p>
          )}
        </section>
      )}

      <ConfirmDialog
        isOpen={confirmToggle}
        title={required ? (mr ? 'सक्ती बंद करायची?' : 'Stop requiring 2-step verification?') : (mr ? 'सर्वांसाठी आवश्यक करायचे?' : 'Require it for every admin?')}
        message={required
          ? (mr ? 'प्रशासक केवळ पासवर्डने लॉगिन करू शकतील.' : 'Admins could then sign in with a password alone.')
          : (mr ? 'ज्या प्रशासकांनी हे सुरू केले नाही त्यांना पुढील लॉगिनवेळी सेटअप करावे लागेल. फोन हरवल्यास Supabase डॅशबोर्डमधूनच दुरुस्ती शक्य आहे.' : 'Admins who have not set it up must do so at their next visit. If you lose your phone, recovery needs the Supabase dashboard.')}
        confirmLabel={mr ? 'हो, बदला' : 'Yes, change it'}
        cancelLabel={mr ? 'रद्द करा' : 'Cancel'}
        busy={busy}
        onConfirm={() => void toggleRequired()}
        onCancel={() => setConfirmToggle(false)}
      />
    </div>
  );
};
