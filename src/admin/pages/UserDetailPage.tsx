import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FormInput } from '../../components/common/FormInput';
import { FormTextarea } from '../../components/common/FormTextarea';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { calculateAgeFromDob } from '../../data/profileOptions';
import { describeError, ErrorState } from '../../components/states/UiStates';
import { AdminUserDetail, adminUsersService } from '../../services/adminUsers.service';
import { useAdminSession } from '../adminAccess';
import { EditField, EditSection } from '../components/EditSection';
import { StatusBadges } from '../components/StatusBadges';
import styles from './adminPages.module.css';

const PROFILE_FIELDS: EditField[] = [
  { key: 'first_name', en: 'First name', mr: 'नाव', required: true },
  { key: 'last_name', en: 'Surname', mr: 'आडनाव' },
  { key: 'gender', en: 'Bride / groom', mr: 'वधू / वर', type: 'select', required: true, options: [
    { value: 'female', en: 'Bride', mr: 'वधू' }, { value: 'male', en: 'Groom', mr: 'वर' },
  ] },
  { key: 'date_of_birth', en: 'Date of birth', mr: 'जन्मतारीख', type: 'date', validate: (value, all, mr) => {
    if (!value) return null;
    const age = calculateAgeFromDob(String(value));
    const minimum = all.gender === 'male' ? 21 : 18;
    if (age === null || age < minimum) return mr ? `वय किमान ${minimum} वर्षे हवे.` : `Must be at least ${minimum} years old.`;
    return null;
  } },
  { key: 'age', en: 'Age (from date of birth)', mr: 'वय (जन्मतारखेवरून)', readOnly: true },
  { key: 'marital_status', en: 'Marital status', mr: 'वैवाहिक स्थिती', type: 'select', required: true, options: [
    { value: 'never_married', en: 'Never married', mr: 'अविवाहित' }, { value: 'divorced', en: 'Divorced', mr: 'घटस्फोटित' },
    { value: 'widowed', en: 'Widowed', mr: 'विधवा / विधुर' }, { value: 'awaiting_divorce', en: 'Awaiting divorce', mr: 'घटस्फोट प्रलंबित' },
  ] },
  { key: 'height', en: 'Height (cm)', mr: 'उंची (सेमी)', type: 'number', min: 100, max: 250 },
  { key: 'religion', en: 'Religion', mr: 'धर्म' },
  { key: 'community', en: 'Caste', mr: 'जात' },
  { key: 'sub_community', en: 'Sub-caste', mr: 'पोटजात' },
  { key: 'gothra', en: 'Gotra', mr: 'गोत्र' },
  { key: 'mother_tongue', en: 'Mother tongue', mr: 'मातृभाषा' },
  { key: 'education', en: 'Education', mr: 'शिक्षण' },
  { key: 'education_detail', en: 'Education details', mr: 'शिक्षण तपशील' },
  { key: 'college', en: 'College', mr: 'महाविद्यालय' },
  { key: 'occupation', en: 'Occupation', mr: 'व्यवसाय' },
  { key: 'employed_in', en: 'Employed in', mr: 'नोकरीचा प्रकार' },
  { key: 'company', en: 'Company', mr: 'कंपनी' },
  { key: 'income', en: 'Income', mr: 'उत्पन्न' },
  { key: 'work_location', en: 'Work location', mr: 'कामाचे ठिकाण' },
  { key: 'city', en: 'City', mr: 'शहर' },
  { key: 'state', en: 'State', mr: 'राज्य' },
  { key: 'country', en: 'Country', mr: 'देश' },
  { key: 'diet', en: 'Diet', mr: 'आहार' },
  { key: 'smoking', en: 'Smoking', mr: 'धूम्रपान' },
  { key: 'drinking', en: 'Drinking', mr: 'मद्यपान' },
  { key: 'family_type', en: 'Family type', mr: 'कुटुंब प्रकार' },
  { key: 'family_status', en: 'Family status', mr: 'कुटुंब स्थिती' },
  { key: 'father_occupation', en: "Father's occupation", mr: 'वडिलांचा व्यवसाय' },
  { key: 'mother_occupation', en: "Mother's occupation", mr: 'आईचा व्यवसाय' },
  { key: 'brothers_count', en: 'Brothers', mr: 'भाऊ', type: 'number', min: 0, max: 20 },
  { key: 'sisters_count', en: 'Sisters', mr: 'बहिणी', type: 'number', min: 0, max: 20 },
  { key: 'about_me', en: 'About', mr: 'माहिती', type: 'textarea' },
];

const CONTACT_FIELDS: EditField[] = [
  { key: 'phone_number', en: 'Phone', mr: 'फोन', type: 'tel' },
  { key: 'whatsapp_number', en: 'WhatsApp', mr: 'व्हॉट्सअ‍ॅप', type: 'tel' },
  { key: 'email', en: 'Contact email', mr: 'संपर्क ईमेल', type: 'email' },
  { key: 'contact_person', en: 'Contact person', mr: 'संपर्क व्यक्ती' },
  { key: 'convenient_time_to_call', en: 'Best time to call', mr: 'फोनसाठी योग्य वेळ' },
  { key: 'address_line', en: 'Address', mr: 'पत्ता', type: 'textarea' },
];

const PREFERENCE_FIELDS: EditField[] = [
  { key: 'min_age', en: 'Minimum age', mr: 'किमान वय', type: 'number', min: 18, max: 80 },
  { key: 'max_age', en: 'Maximum age', mr: 'कमाल वय', type: 'number', min: 18, max: 80, validate: (value, all, mr) =>
    value !== null && all.min_age !== null && Number(value) < Number(all.min_age)
      ? (mr ? 'कमाल वय किमान वयापेक्षा कमी असू शकत नाही.' : 'Must not be below the minimum age.') : null },
  { key: 'min_height', en: 'Minimum height (cm)', mr: 'किमान उंची', type: 'number', min: 100, max: 250 },
  { key: 'max_height', en: 'Maximum height (cm)', mr: 'कमाल उंची', type: 'number', min: 100, max: 250, validate: (value, all, mr) =>
    value !== null && all.min_height !== null && Number(value) < Number(all.min_height)
      ? (mr ? 'कमाल उंची किमान उंचीपेक्षा कमी असू शकत नाही.' : 'Must not be below the minimum height.') : null },
  { key: 'preferred_community', en: 'Castes', mr: 'जाती', type: 'list' },
  { key: 'preferred_cities', en: 'Cities', mr: 'शहरे', type: 'list' },
  { key: 'preferred_education', en: 'Education', mr: 'शिक्षण', type: 'list' },
  { key: 'preferred_occupation', en: 'Occupations', mr: 'व्यवसाय', type: 'list' },
  { key: 'other_preferences', en: 'Other notes', mr: 'इतर नोंदी', type: 'textarea' },
];

const ACTION_LABELS: Record<string, { en: string; mr: string }> = {
  profile_edited: { en: 'Profile edited', mr: 'प्रोफाइल संपादित' },
  contacts_edited: { en: 'Contact details edited', mr: 'संपर्क तपशील संपादित' },
  preferences_edited: { en: 'Preferences edited', mr: 'प्राधान्ये संपादित' },
  verification_changed: { en: 'Verification changed', mr: 'पडताळणी बदलली' },
  account_blocked: { en: 'Account blocked', mr: 'खाते ब्लॉक' },
  account_unblocked: { en: 'Account unblocked', mr: 'खाते अनब्लॉक' },
  password_reset_sent: { en: 'Password reset sent', mr: 'पासवर्ड रीसेट पाठवला' },
  profile_approved: { en: 'Profile approved', mr: 'प्रोफाइल मंजूर' },
  profile_rejected: { en: 'Profile rejected', mr: 'प्रोफाइल नाकारली' },
};

export const UserDetailPage: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const { language } = useLanguage();
  const { success, error: toastError } = useToast();
  const { role } = useAdminSession();
  const navigate = useNavigate();
  const mr = language === 'mr';

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [dialog, setDialog] = useState<'block' | 'unblock' | 'reset' | 'remove' | null>(null);
  const [reason, setReason] = useState('');
  const [reasonTouched, setReasonTouched] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialogFailure, setDialogFailure] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUser(await adminUsersService.getUser(userId));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const closeDialog = () => {
    setDialog(null);
    setReason('');
    setReasonTouched(false);
    setConfirmText('');
    setDialogFailure(null);
  };

  const failureText = (err: unknown) => {
    const message = (err as { message?: string })?.message;
    const generic = describeError(err, language);
    return message && !/fetch|network|edge function/i.test(message) ? message : `${generic.what} ${generic.fix}`;
  };

  const run = async (work: () => Promise<unknown>, done: string, after: () => void = () => void load()) => {
    setBusy(true);
    setDialogFailure(null);
    try {
      await work();
      closeDialog();
      success(done);
      after();
    } catch (err) {
      setDialogFailure(failureText(err));
    } finally {
      setBusy(false);
    }
  };

  const setVerification = async (status: string) => {
    if (!user?.profile) return;
    setBusy(true);
    try {
      await adminUsersService.setVerification(user.profile.id, status);
      success(status === 'verified'
        ? (mr ? 'प्रोफाइल पडताळले. सदस्याला Verified बॅज दिसेल.' : 'Marked as verified. The member now shows the Verified badge.')
        : (mr ? 'पडताळणी स्थिती बदलली.' : 'Verification status changed.'));
      void load();
    } catch (err) {
      toastError(failureText(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading && !user) {
    return (
      <div style={{ display: 'grid', gap: 12 }} aria-label={mr ? 'लोड होत आहे' : 'Loading'}>
        <Skeleton height={32} width="40%" borderRadius={8} />
        <Skeleton height={220} borderRadius={14} />
        <Skeleton height={160} borderRadius={14} />
      </div>
    );
  }
  if (error && !user) return <ErrorState error={error} onRetry={() => void load()} />;
  if (!user) return null;

  const canEdit = role === 'super_admin' || role === 'admin';
  const canVerify = canEdit || role === 'moderator';
  const canRemove = role === 'super_admin';
  const name = [user.profile?.first_name, user.profile?.last_name].filter(Boolean).join(' ') || user.email || '—';
  const fmt = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
  const reasonError = reasonTouched && reason.trim().length < 3
    ? (mr ? 'ब्लॉक करण्याचे कारण लिहा (किमान ३ अक्षरे).' : 'Please give a reason (at least 3 characters).') : undefined;
  const confirmTarget = user.profile?.profile_id || user.email || '';
  const confirmMatches = confirmText.trim().toLowerCase() === String(confirmTarget).toLowerCase() && confirmText.trim() !== '';

  return (
    <div>
      <Link to="/admin/users" className={styles.backLink}><ArrowLeft size={15} /> {mr ? 'सर्व सदस्य' : 'All members'}</Link>
      <div className={styles.headerRow}>
        <h1 className={styles.title} style={{ margin: 0 }}>{name}</h1>
        <StatusBadges row={{ profile_status: user.profile?.profile_status, verification_status: user.profile?.verification_status, blocked: Boolean(user.block), admin_role: user.admin_role }} />
      </div>
      <p className={styles.subtitle}>{[user.profile?.profile_id, user.email].filter(Boolean).join(' • ')}</p>

      {user.block && (
        <div className={styles.notice} role="status">
          <strong>{mr ? 'हे खाते ब्लॉक आहे.' : 'This account is blocked.'}</strong>{' '}
          {mr ? 'कारण' : 'Reason'}: {user.block.reason} ({fmt(user.block.blocked_at)})
        </div>
      )}

      <div className={styles.layout}>
        <div>
          <EditSection
            title={mr ? 'प्रोफाइल' : 'Profile'}
            fields={PROFILE_FIELDS}
            values={user.profile}
            canEdit={canEdit}
            onSave={(changes) => adminUsersService.updateProfile(user.profile!.id, changes)}
            onSaved={() => void load()}
            emptyText={mr ? 'या सदस्याने अद्याप प्रोफाइल तयार केलेली नाही.' : 'This member has not created a profile yet.'}
          />
          {user.profile && (
            <>
              <EditSection
                title={mr ? 'संपर्क तपशील' : 'Contact details'}
                fields={CONTACT_FIELDS}
                values={user.contacts ?? {}}
                canEdit={canEdit}
                onSave={(changes) => adminUsersService.updateContacts(user.profile!.id, changes)}
                onSaved={() => void load()}
              />
              <EditSection
                title={mr ? 'जोडीदार प्राधान्ये' : 'Partner preferences'}
                fields={PREFERENCE_FIELDS}
                values={user.preferences ?? {}}
                canEdit={canEdit}
                onSave={(changes) => adminUsersService.updatePreferences(user.profile!.id, changes)}
                onSaved={() => void load()}
              />
            </>
          )}
        </div>

        <aside>
          <section className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 12 }}>{mr ? 'कृती' : 'Actions'}</h2>
            <div className={styles.actionStack}>
              {user.profile && (
                <Button to={`/profile/${user.profile.id}`} variant="outline" size="sm">{mr ? 'सदस्याला दिसणारी प्रोफाइल' : 'View public profile'}</Button>
              )}
              {canVerify && user.profile && (user.profile.verification_status === 'verified' ? (
                <Button variant="outline" size="sm" disabled={busy} onClick={() => void setVerification('unverified')}>{mr ? 'पडताळणी काढा' : 'Remove verification'}</Button>
              ) : (
                <Button variant="primary" size="sm" disabled={busy} onClick={() => void setVerification('verified')}>{mr ? 'प्रोफाइल पडताळा' : 'Verify profile'}</Button>
              ))}
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => setDialog('reset')}>{mr ? 'पासवर्ड रीसेट लिंक पाठवा' : 'Send password reset'}</Button>
              )}
              {canEdit && (user.block ? (
                <Button variant="outline" size="sm" onClick={() => setDialog('unblock')}>{mr ? 'अनब्लॉक करा' : 'Unblock account'}</Button>
              ) : (
                <button type="button" className={styles.dangerButton} onClick={() => setDialog('block')}>{mr ? 'खाते ब्लॉक करा' : 'Block account'}</button>
              ))}
              {canRemove && (
                <button type="button" className={styles.dangerButton} onClick={() => setDialog('remove')}>{mr ? 'खाते काढून टाका' : 'Remove account'}</button>
              )}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 12 }}>{mr ? 'खाते' : 'Account'}</h2>
            <dl className={styles.facts} style={{ gridTemplateColumns: '1fr' }}>
              <div><dt>{mr ? 'नोंदणी' : 'Joined'}</dt><dd>{fmt(user.created_at)}</dd></div>
              <div><dt>{mr ? 'शेवटचे लॉगिन' : 'Last sign-in'}</dt><dd>{fmt(user.last_sign_in_at)}</dd></div>
              <div><dt>{mr ? 'ईमेल पुष्टी' : 'Email confirmed'}</dt><dd>{user.email_confirmed_at ? (mr ? 'होय' : 'Yes') : (mr ? 'नाही' : 'No')}</dd></div>
              <div><dt>{mr ? 'योजना' : 'Plan'}</dt><dd>{user.subscription ? `${user.subscription.plan} (${fmt(user.subscription.end_date)})` : '—'}</dd></div>
              {user.profile && 'aadhaar_last4' in user.profile && (
                <div><dt>{mr ? 'ओळखपत्र शेवटचे अंक' : 'ID ending'}</dt><dd>{user.profile.aadhaar_last4 ? `•••• ${user.profile.aadhaar_last4}` : '—'}</dd></div>
              )}
            </dl>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 12 }}>{mr ? 'इतिहास' : 'History'}</h2>
            {user.history.length === 0 ? (
              <p className={styles.muted}>{mr ? 'अद्याप कोणतीही प्रशासकीय कृती नाही.' : 'No admin actions yet.'}</p>
            ) : (
              <ul className={styles.history}>
                {user.history.map((h, i) => {
                  const label = ACTION_LABELS[h.action];
                  const changed = h.details?.changes ? Object.keys(h.details.changes).join(', ') : h.details?.reason;
                  return (
                    <li key={i}>
                      <strong>{label ? (mr ? label.mr : label.en) : h.action}</strong>
                      {changed && <div className={styles.muted}>{changed}</div>}
                      <div className={styles.muted}>{fmt(h.created_at)}{h.actor_role ? ` • ${h.actor_role.replace('_', ' ')}` : ''}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <Modal isOpen={dialog === 'block'} onClose={closeDialog} title={mr ? 'खाते ब्लॉक करायचे?' : 'Block this account?'}>
        <p className={styles.muted} style={{ marginTop: 0 }}>
          {mr
            ? 'हा सदस्य लॉगिन करू शकणार नाही आणि इतर कोणालाही दिसणार नाही. नंतर अनब्लॉक केल्यावर पूर्वीची स्थिती परत येईल.'
            : 'This member cannot sign in and disappears for everyone, straight away. Unblocking later restores their previous status.'}
        </p>
        <FormTextarea
          id="block-reason"
          label={mr ? 'कारण' : 'Reason'}
          required
          rows={3}
          value={reason}
          error={reasonError}
          onBlur={() => setReasonTouched(true)}
          onChange={(e) => setReason(e.target.value)}
        />
        {dialogFailure && <p role="alert" className={styles.formError}>{dialogFailure}</p>}
        <div className={styles.formActions} style={{ justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" disabled={busy} onClick={closeDialog}>{mr ? 'रद्द करा' : 'Cancel'}</Button>
          <button
            type="button"
            className={`${styles.dangerButton} ${styles.dangerFill}`}
            disabled={busy}
            onClick={() => {
              setReasonTouched(true);
              if (reason.trim().length < 3) return;
              void run(() => adminUsersService.block(userId, reason.trim()), mr ? 'खाते ब्लॉक केले.' : 'Account blocked. The member has lost access.');
            }}
          >
            {busy ? (mr ? 'ब्लॉक होत आहे...' : 'Blocking...') : (mr ? 'ब्लॉक करा' : 'Block account')}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={dialog === 'unblock'}
        title={mr ? 'अनब्लॉक करायचे?' : 'Unblock this account?'}
        message={dialogFailure ?? (mr ? 'सदस्य पुन्हा लॉगिन करू शकेल आणि पूर्वीची स्थिती परत येईल.' : 'The member can sign in again, and their previous status is restored.')}
        confirmLabel={mr ? 'अनब्लॉक करा' : 'Unblock'}
        cancelLabel={mr ? 'रद्द करा' : 'Cancel'}
        busy={busy}
        onConfirm={() => void run(() => adminUsersService.unblock(userId), mr ? 'खाते अनब्लॉक केले.' : 'Account unblocked.')}
        onCancel={closeDialog}
      />

      <ConfirmDialog
        isOpen={dialog === 'reset'}
        title={mr ? 'पासवर्ड रीसेट लिंक पाठवायची?' : 'Send a password reset link?'}
        message={dialogFailure ?? (mr ? `${user.email ?? ''} वर ईमेल जाईल. प्रशासकांना पासवर्ड दिसत नाही.` : `An email goes to ${user.email ?? 'this member'}. Admins never see or set the password.`)}
        confirmLabel={mr ? 'लिंक पाठवा' : 'Send link'}
        cancelLabel={mr ? 'रद्द करा' : 'Cancel'}
        busy={busy}
        onConfirm={() => void run(() => adminUsersService.sendPasswordReset(userId), mr ? 'रीसेट लिंक पाठवली.' : 'Reset link sent. The member can choose a new password from that email.')}
        onCancel={closeDialog}
      />

      <Modal isOpen={dialog === 'remove'} onClose={closeDialog} title={mr ? 'खाते कायमचे काढायचे?' : 'Permanently remove this account?'}>
        <p className={styles.muted} style={{ marginTop: 0 }}>
          {mr
            ? 'प्रोफाइल, फोटो, कागदपत्रे, पसंती व संदेश कायमचे जातील. हे परत आणता येणार नाही. पेमेंट नोंदी सदस्याशी जोडल्याशिवाय जतन राहतात. तात्पुरते थांबवायचे असल्यास त्याऐवजी ब्लॉक करा.'
            : 'The profile, photos, documents, interests and messages are gone for good and cannot be brought back. Payment records are kept without any link to this person. To stop access for now, block the account instead.'}
        </p>
        <FormInput
          id="remove-confirm"
          label={mr ? `पुष्टीसाठी ${confirmTarget} टाइप करा` : `Type ${confirmTarget} to confirm`}
          value={confirmText}
          autoComplete="off"
          onChange={(e) => setConfirmText(e.target.value)}
        />
        {dialogFailure && <p role="alert" className={styles.formError}>{dialogFailure}</p>}
        <div className={styles.formActions} style={{ justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" disabled={busy} onClick={closeDialog}>{mr ? 'रद्द करा' : 'Cancel'}</Button>
          <button
            type="button"
            className={`${styles.dangerButton} ${styles.dangerFill}`}
            disabled={busy || !confirmMatches}
            onClick={() => void run(
              () => adminUsersService.remove(userId, confirmText.trim()),
              mr ? 'खाते काढून टाकले.' : 'Account removed.',
              () => navigate('/admin/users', { replace: true }),
            )}
          >
            {busy ? (mr ? 'काढत आहे...' : 'Removing...') : (mr ? 'कायमचे काढा' : 'Remove permanently')}
          </button>
        </div>
      </Modal>
    </div>
  );
};
