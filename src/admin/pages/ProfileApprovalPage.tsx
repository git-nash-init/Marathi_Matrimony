import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormTextarea } from '../../components/common/FormTextarea';
import { Modal } from '../../components/common/Modal';
import { describeError, EmptyState, NoResults } from '../../components/states/UiStates';
import { moderationService, QueueProfile } from '../../services/moderation.service';
import { DataColumn, DataTable } from '../components/DataTable';
import { StatusBadges } from '../components/StatusBadges';
import styles from './adminPages.module.css';

const PAGE_SIZE = 20;

const TABS = [
  { key: 'pending', en: 'Waiting for review', mr: 'तपासणीसाठी' },
  { key: 'correction', en: 'Sent back', mr: 'परत पाठवलेले' },
  { key: 'rejected', en: 'Rejected', mr: 'नाकारलेले' },
  { key: 'approved', en: 'Approved', mr: 'मंजूर' },
  { key: 'draft', en: 'Not submitted', mr: 'मसुदा' },
];

export const CORRECTION_FIELDS = [
  { key: 'photos', en: 'Photos', mr: 'फोटो' },
  { key: 'name', en: 'Name', mr: 'नाव' },
  { key: 'date_of_birth', en: 'Date of birth', mr: 'जन्मतारीख' },
  { key: 'community', en: 'Caste', mr: 'जात' },
  { key: 'education', en: 'Education', mr: 'शिक्षण' },
  { key: 'occupation', en: 'Occupation', mr: 'व्यवसाय' },
  { key: 'family', en: 'Family details', mr: 'कुटुंब' },
  { key: 'location', en: 'Location', mr: 'ठिकाण' },
  { key: 'about_me', en: 'About', mr: 'माहिती' },
  { key: 'contact', en: 'Contact details', mr: 'संपर्क' },
];

type Decision = 'review' | 'reject' | 'correction' | 'photo';

export const ProfileApprovalPage: React.FC = () => {
  const { language } = useLanguage();
  const { success, error: toastError } = useToast();
  const mr = language === 'mr';

  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<QueueProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const request = useRef(0);

  const [current, setCurrent] = useState<QueueProfile | null>(null);
  const [decision, setDecision] = useState<Decision>('review');
  const [note, setNote] = useState('');
  const [noteTouched, setNoteTouched] = useState(false);
  const [fields, setFields] = useState<string[]>([]);
  const [fieldsTouched, setFieldsTouched] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const thisRequest = ++request.current;
    setLoading(true);
    try {
      const res = await moderationService.approvalQueue(tab, debounced, page, PAGE_SIZE);
      if (thisRequest !== request.current) return;
      setRows(res.items);
      setTotal(res.total);
      setCounts(res.counts);
      setError(null);
    } catch (err) {
      if (thisRequest === request.current) setError(err);
    } finally {
      if (thisRequest === request.current) setLoading(false);
    }
  }, [tab, debounced, page]);

  useEffect(() => { void load(); }, [load]);

  const open = (profile: QueueProfile) => {
    setCurrent(profile);
    switchTo('review');
  };
  const switchTo = (next: Decision) => {
    setDecision(next);
    setNote('');
    setNoteTouched(false);
    setFields([]);
    setFieldsTouched(false);
    setFailure(null);
  };
  const close = () => { setCurrent(null); setPhotoUrl(null); };

  const failureText = (err: unknown) => {
    const message = (err as { message?: string })?.message;
    if ((err as { code?: string })?.code === '22023' && message) return message;
    const generic = describeError(err, language);
    return `${generic.what} ${generic.fix}`;
  };

  const act = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setFailure(null);
    try {
      await work();
      success(done);
      close();
      void load();
    } catch (err) {
      setFailure(failureText(err));
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    if (!current || !photoUrl) return;
    setNoteTouched(true);
    if (note.trim().length < 3) return;
    setBusy(true);
    setFailure(null);
    try {
      const { fileCleared } = await moderationService.removePhoto(current.id, photoUrl, note.trim());
      const remaining = (current.photos ?? []).filter((p) => p !== photoUrl);
      setCurrent({ ...current, photos: remaining, avatar_url: current.avatar_url === photoUrl ? remaining[0] ?? null : current.avatar_url });
      setPhotoUrl(null);
      switchTo('review');
      void load();
      if (fileCleared) {
        success(mr ? 'फोटो काढला. सदस्याला कळवले आहे.' : 'Photo taken down. The member has been told why.');
      } else {
        toastError(mr
          ? 'प्रोफाइलवरून फोटो काढला, पण फाइल साठवणुकीतून काढता आली नाही. पुन्हा प्रयत्न करा.'
          : 'The photo is off the profile, but its file could not be cleared from storage. Please tell your technical contact.');
      }
    } catch (err) {
      setFailure(failureText(err));
    } finally {
      setBusy(false);
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium' });
  const nameOf = (p: QueueProfile) => [p.first_name, p.last_name].filter(Boolean).join(' ') || (mr ? 'नाव नाही' : 'No name');
  const photosOf = (p: QueueProfile) => {
    const all = [p.avatar_url, ...(p.photos ?? [])].filter(Boolean) as string[];
    return [...new Set(all)];
  };
  const noteError = noteTouched && note.trim().length < 3
    ? (mr ? 'कृपया कारण लिहा (किमान ३ अक्षरे).' : 'Please write a short reason (at least 3 characters).') : undefined;
  const fieldsError = fieldsTouched && fields.length === 0
    ? (mr ? 'किमान एक भाग निवडा.' : 'Choose at least one part.') : undefined;

  const columns: DataColumn<QueueProfile>[] = [
    {
      key: 'member',
      header: mr ? 'सदस्य' : 'Member',
      render: (r) => (
        <>
          <Link to={`/admin/users/${r.user_id}`} className={styles.nameLink}>{nameOf(r)}</Link>
          <div className={styles.muted}>
            {[r.profile_id, r.gender === 'female' ? (mr ? 'वधू' : 'Bride') : r.gender === 'male' ? (mr ? 'वर' : 'Groom') : null, r.age, r.city]
              .filter(Boolean).join(' • ')}
          </div>
        </>
      ),
    },
    {
      key: 'photos',
      header: mr ? 'फोटो' : 'Photos',
      width: '180px',
      render: (r) => {
        const photos = photosOf(r);
        if (photos.length === 0) return <span className={styles.muted}>{mr ? 'फोटो नाही' : 'No photos'}</span>;
        return (
          <span style={{ display: 'flex', gap: 4 }}>
            {photos.slice(0, 3).map((url) => (
              <img key={url} src={url} alt="" width={40} height={40} style={{ borderRadius: 6, objectFit: 'cover' }} />
            ))}
            {photos.length > 3 && <span className={styles.muted}>+{photos.length - 3}</span>}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: mr ? 'स्थिती' : 'Status',
      render: (r) => (
        <>
          <StatusBadges row={r} />
          {r.rejection_reason && <div className={styles.muted} style={{ marginTop: 4 }}>{r.rejection_reason}</div>}
        </>
      ),
    },
    { key: 'date', header: mr ? 'अद्ययावत' : 'Updated', width: '120px', render: (r) => fmt(r.updated_at) },
    {
      key: 'action',
      header: '',
      width: '110px',
      render: (r) => (
        <Button variant={tab === 'pending' ? 'primary' : 'outline'} size="sm" onClick={() => open(r)}>
          {mr ? 'तपासा' : 'Review'}
        </Button>
      ),
    },
  ];

  const canApprove = current && ['pending_approval', 'rejected'].includes(current.profile_status);
  const canSendBack = current && ['pending_approval', 'approved'].includes(current.profile_status);

  return (
    <div>
      <h1 className={styles.title}>{mr ? 'प्रोफाइल मंजुरी' : 'Profile Approval'}</h1>
      <p className={styles.subtitle}>
        {mr ? 'मंजूर प्रोफाइल इतर सदस्यांना दिसते. ओळख पडताळणी स्वतंत्र आहे.' : 'An approved profile becomes visible to other members. Identity is checked separately under Verification.'}
      </p>

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => { setTab(t.key); setPage(0); }}
          >
            {mr ? t.mr : t.en} ({counts[t.key] ?? 0})
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <input
            className={styles.input}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={mr ? 'नाव, आयडी किंवा शहर शोधा' : 'Search name, ID or city'}
            aria-label={mr ? 'प्रोफाइल शोधा' : 'Search profiles'}
          />
        </div>
      </div>

      <DataTable
        caption={mr ? 'प्रोफाइल्स' : 'Profiles'}
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={() => void load()}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        empty={debounced.trim() ? (
          <NoResults query={debounced.trim()} onClear={() => setSearch('')} />
        ) : (
          <EmptyState
            icon={<ShieldCheck size={30} />}
            title={tab === 'pending' ? (mr ? 'सर्व तपासणी पूर्ण' : 'All caught up') : (mr ? 'या विभागात काही नाही' : 'Nothing here')}
            description={tab === 'pending'
              ? (mr ? 'सदस्य प्रोफाइल सादर केल्यावर ती येथे दिसेल.' : 'New profiles appear here when members submit them.')
              : (mr ? 'या स्थितीची कोणतीही प्रोफाइल नाही.' : 'No profiles have this status right now.')}
            action={tab !== 'pending' ? { label: mr ? 'तपासणीसाठीच्या पहा' : 'See profiles waiting for review', onClick: () => setTab('pending') } : undefined}
          />
        )}
      />

      <Modal isOpen={Boolean(current)} onClose={close} title={current ? nameOf(current) : ''}>
        {current && (
          <div>
            {decision === 'review' && (
              <>
                <p className={styles.muted} style={{ marginTop: 0 }}>
                  {[current.profile_id, current.age, current.marital_status?.replace('_', ' '), current.community, current.education, current.occupation, [current.city, current.state].filter(Boolean).join(', ')]
                    .filter(Boolean).join(' • ')}
                </p>
                {current.about_me && <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.92rem' }}>{current.about_me}</p>}
                <p className={styles.muted}>
                  {current.aadhaar_last4
                    ? `${mr ? 'ओळखपत्र शेवटचे अंक' : 'ID ending'}: •••• ${current.aadhaar_last4}`
                    : (mr ? 'ओळखपत्र तपशील दिलेला नाही' : 'No ID details given')}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '12px 0' }}>
                  {photosOf(current).length === 0 && <span className={styles.muted}>{mr ? 'फोटो नाही' : 'No photos uploaded'}</span>}
                  {photosOf(current).map((url) => (
                    <div key={url} style={{ position: 'relative' }}>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="" width={110} height={110} style={{ borderRadius: 8, objectFit: 'cover', display: 'block' }} />
                      </a>
                      <button
                        type="button"
                        aria-label={mr ? 'हा फोटो काढा' : 'Take down this photo'}
                        title={mr ? 'हा फोटो काढा' : 'Take down this photo'}
                        className={styles.dangerButton}
                        style={{ position: 'absolute', top: 4, right: 4, padding: '3px 6px' }}
                        onClick={() => { setPhotoUrl(url); switchTo('photo'); }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {failure && <p role="alert" className={styles.formError}>{failure}</p>}
                <div className={styles.formActions}>
                  {canApprove && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={busy}
                      onClick={() => void act(() => moderationService.approve(current.id), mr ? 'मंजूर केले. सदस्याला कळवले आहे.' : 'Approved. The profile is now visible and the member has been told.')}
                    >
                      {busy ? (mr ? 'मंजूर होत आहे...' : 'Approving...') : (mr ? 'मंजूर करा' : 'Approve')}
                    </Button>
                  )}
                  {canSendBack && (
                    <Button variant="outline" size="sm" disabled={busy} onClick={() => switchTo('correction')}>
                      {mr ? 'बदलांसाठी परत पाठवा' : 'Ask for changes'}
                    </Button>
                  )}
                  {canSendBack && (
                    <button type="button" className={styles.dangerButton} disabled={busy} onClick={() => switchTo('reject')}>
                      {mr ? 'नाकारा' : 'Reject'}
                    </button>
                  )}
                  {!canApprove && !canSendBack && (
                    <span className={styles.muted}>{mr ? 'सदस्याने प्रोफाइल सादर केल्यावर निर्णय घेता येईल.' : 'A decision can be made once the member submits this profile.'}</span>
                  )}
                </div>
              </>
            )}

            {decision === 'correction' && (
              <>
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 12px' }}>
                  <legend style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>{mr ? 'काय बदलायचे?' : 'What needs changing?'}</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
                    {CORRECTION_FIELDS.map((f) => (
                      <label key={f.key} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={fields.includes(f.key)}
                          onChange={(e) => {
                            setFieldsTouched(true);
                            setFields((all) => e.target.checked ? [...all, f.key] : all.filter((k) => k !== f.key));
                          }}
                        />
                        {mr ? f.mr : f.en}
                      </label>
                    ))}
                  </div>
                  {fieldsError && <p role="alert" className={styles.formError}>{fieldsError}</p>}
                </fieldset>
                <FormTextarea
                  id="correction-note"
                  label={mr ? 'सदस्याला संदेश' : 'Message to the member'}
                  required
                  rows={3}
                  value={note}
                  error={noteError}
                  onBlur={() => setNoteTouched(true)}
                  onChange={(e) => setNote(e.target.value)}
                />
                {failure && <p role="alert" className={styles.formError}>{failure}</p>}
                <div className={styles.formActions}>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setNoteTouched(true);
                      setFieldsTouched(true);
                      if (note.trim().length < 3 || fields.length === 0) return;
                      void act(() => moderationService.requestCorrection(current.id, fields, note.trim()),
                        mr ? 'परत पाठवले. सदस्याला काय बदलायचे ते दिसेल.' : 'Sent back. The member can see what to change and resubmit.');
                    }}
                  >
                    {busy ? (mr ? 'पाठवत आहे...' : 'Sending...') : (mr ? 'परत पाठवा' : 'Send back')}
                  </Button>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => switchTo('review')}>{mr ? 'मागे' : 'Back'}</Button>
                </div>
              </>
            )}

            {decision === 'reject' && (
              <>
                <p className={styles.muted} style={{ marginTop: 0 }}>
                  {mr ? 'प्रोफाइल इतरांना दिसणार नाही. कारण सदस्याला दिसेल.' : 'The profile will not be visible to others. The member sees this reason, so write it for them.'}
                </p>
                <FormTextarea
                  id="reject-reason"
                  label={mr ? 'कारण' : 'Reason'}
                  required
                  rows={3}
                  value={note}
                  error={noteError}
                  onBlur={() => setNoteTouched(true)}
                  onChange={(e) => setNote(e.target.value)}
                />
                {failure && <p role="alert" className={styles.formError}>{failure}</p>}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={`${styles.dangerButton} ${styles.dangerFill}`}
                    disabled={busy}
                    onClick={() => {
                      setNoteTouched(true);
                      if (note.trim().length < 3) return;
                      void act(() => moderationService.reject(current.id, note.trim()),
                        mr ? 'नाकारले. सदस्याला कारण कळवले आहे.' : 'Rejected. The member has been told why.');
                    }}
                  >
                    {busy ? (mr ? 'नाकारत आहे...' : 'Rejecting...') : (mr ? 'नाकारा' : 'Reject profile')}
                  </button>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => switchTo('review')}>{mr ? 'मागे' : 'Back'}</Button>
                </div>
              </>
            )}

            {decision === 'photo' && photoUrl && (
              <>
                <img src={photoUrl} alt="" width={160} height={160} style={{ borderRadius: 8, objectFit: 'cover', display: 'block', marginBottom: 12 }} />
                <p className={styles.muted} style={{ marginTop: 0 }}>
                  {mr ? 'फोटो कायमचा काढला जाईल. सदस्याला हे कारण दिसेल.' : 'The photo is taken down for good. The member sees this reason.'}
                </p>
                <FormTextarea
                  id="photo-reason"
                  label={mr ? 'कारण' : 'Reason'}
                  required
                  rows={2}
                  value={note}
                  error={noteError}
                  onBlur={() => setNoteTouched(true)}
                  onChange={(e) => setNote(e.target.value)}
                />
                {failure && <p role="alert" className={styles.formError}>{failure}</p>}
                <div className={styles.formActions}>
                  <button type="button" className={`${styles.dangerButton} ${styles.dangerFill}`} disabled={busy} onClick={() => void removePhoto()}>
                    {busy ? (mr ? 'काढत आहे...' : 'Taking down...') : (mr ? 'फोटो काढा' : 'Take down photo')}
                  </button>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => { setPhotoUrl(null); switchTo('review'); }}>{mr ? 'मागे' : 'Back'}</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
