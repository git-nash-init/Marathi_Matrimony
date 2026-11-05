import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { describeError } from '../../components/states/UiStates';
import { adminService } from '../../services/admin.service';
import { useAdminSession } from '../adminAccess';
import { MfaEnroll } from '../components/MfaPanels';
import { FormInput } from '../../components/common/FormInput';
import { settingsService } from '../../services/content.service';

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
  const canChange = role === 'super_admin';
  const [gap, setGap] = useState('');
  const [savedGap, setSavedGap] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);
  const [settingError, setSettingError] = useState<string | null>(null);
  const [settingBusy, setSettingBusy] = useState(false);

  useEffect(() => {
    settingsService.get().then((s) => {
      setGap(String(s.match_age_gap));
      setSavedGap(String(s.match_age_gap));
      setMaintenance(Boolean(s.maintenance_mode));
    }).catch(() => setSettingError(mr ? 'सेटिंग्ज वाचता आल्या नाहीत. पान पुन्हा उघडा.' : 'Settings could not be read. Please reopen this page.'));
    // Read once on opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gapError = gap !== '' && (!/^\d+$/.test(gap) || Number(gap) > 20) ? (mr ? '० ते २० मधील पूर्ण संख्या टाका.' : 'Enter a whole number from 0 to 20.') : undefined;

  const saveSetting = async (key: string, value: unknown, done: string, after: () => void) => {
    setSettingBusy(true);
    setSettingError(null);
    try {
      await settingsService.set(key, value);
      after();
      showToast(done, 'success');
    } catch (err) {
      const details = describeError(err, language);
      setSettingError(`${details.what} ${details.fix}`);
    } finally {
      setSettingBusy(false);
    }
  };

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
        <h2 style={{ fontSize: '1.02rem', margin: '0 0 6px' }}>{mr ? 'विवाह वयोगट' : 'Marriage age group'}</h2>
        <p style={{ margin: '0 0 10px', color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
          {mr
            ? 'वराला त्याच्या वयाच्या व इतक्या वर्षांपर्यंत लहान वधू सुचवल्या जातात. बाकीच्या प्रोफाइल पाहता येतात, पण सुचवल्या जात नाहीत.'
            : 'A man is recommended women his own age and up to this many years younger. Others can still be viewed, but are never recommended.'}
        </p>
        <div style={{ maxWidth: 200 }}>
          <FormInput id="age-gap" label={mr ? 'वर्षांतील फरक' : 'Years of difference'} type="number" min={0} max={20} value={gap} disabled={!canChange} error={gapError} onChange={(e) => setGap(e.target.value)} />
        </div>
        {canChange ? (
          <div style={{ marginTop: 10 }}>
            <Button variant="primary" size="sm" disabled={settingBusy || Boolean(gapError) || gap === '' || gap === savedGap}
              onClick={() => void saveSetting('match_age_gap', Number(gap), mr ? 'जतन केले. नवीन शिफारसींना लागू होईल.' : 'Saved. It applies to matches from now on.', () => setSavedGap(gap))}>
              {mr ? 'जतन करा' : 'Save'}
            </Button>
          </div>
        ) : (
          <p style={{ margin: '8px 0 0', color: 'var(--color-ink-muted)', fontSize: '0.86rem' }}>{mr ? 'फक्त मुख्य प्रशासक बदलू शकतात.' : 'Only a super admin can change this.'}</p>
        )}
      </section>

      <section style={card}>
        <h2 style={{ fontSize: '1.02rem', margin: '0 0 6px' }}>{mr ? 'देखभाल मोड' : 'Maintenance mode'}</h2>
        <p style={{ margin: '0 0 10px', color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
          {maintenance
            ? (mr ? 'सध्या चालू आहे: सदस्यांना देखभालीचे पान दिसते. प्रशासक काम करू शकतात.' : 'On now: visitors see a holding page. Admins can still work.')
            : (mr ? 'बंद आहे: वेबसाइट सर्वांसाठी खुली आहे.' : 'Off: the site is open to everyone.')}
        </p>
        {canChange && (
          <Button variant="outline" size="sm" disabled={settingBusy} onClick={() => setConfirmMaintenance(true)}>
            {maintenance ? (mr ? 'बंद करा' : 'Turn off') : (mr ? 'चालू करा' : 'Turn on')}
          </Button>
        )}
        {settingError && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.88rem', margin: '10px 0 0' }}>{settingError}</p>}
      </section>

      <ConfirmDialog
        isOpen={confirmMaintenance}
        title={maintenance ? (mr ? 'वेबसाइट पुन्हा खुली करायची?' : 'Reopen the site?') : (mr ? 'वेबसाइट बंद करायची?' : 'Close the site to visitors?')}
        message={maintenance ? (mr ? 'सर्वांना वेबसाइट पुन्हा दिसेल.' : 'Everyone can use the site again.') : (mr ? 'प्रशासक सोडून सर्वांना देखभालीचे पान दिसेल.' : 'Everyone except admins will see a holding page until you turn this off.')}
        confirmLabel={maintenance ? (mr ? 'बंद करा' : 'Turn off') : (mr ? 'चालू करा' : 'Turn on')}
        cancelLabel={mr ? 'रद्द करा' : 'Cancel'}
        busy={settingBusy}
        onConfirm={() => { setConfirmMaintenance(false); void saveSetting('maintenance_mode', !maintenance, mr ? 'बदल जतन केला.' : 'Saved.', () => setMaintenance(!maintenance)); }}
        onCancel={() => setConfirmMaintenance(false)}
      />

      <section style={card}>
        <h2 style={{ fontSize: '1.02rem', margin: '0 0 6px' }}>{mr ? 'याद्या व ठिकाणे' : 'Lists and locations'}</h2>
        <p style={{ margin: '0 0 8px', color: 'var(--color-ink-muted)', fontSize: '0.9rem' }}>
          {mr ? 'जाती, गोत्र, कुलदैवत, रास, नक्षत्र, जिल्हे व गावे.' : 'Castes, gotra, kuldaivat, rashi, nakshatra, districts and villages.'}
        </p>
        <Link to="/admin/settings/lists">{mr ? 'याद्या उघडा' : 'Open lists'}</Link>
      </section>

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
