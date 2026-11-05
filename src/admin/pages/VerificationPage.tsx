import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormTextarea } from '../../components/common/FormTextarea';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { describeError, EmptyState, ErrorState } from '../../components/states/UiStates';
import { adminUsersService } from '../../services/adminUsers.service';
import { moderationService, ReportItem, VerificationItem } from '../../services/moderation.service';
import { useAdminSession } from '../adminAccess';
import { DataColumn, DataTable } from '../components/DataTable';
import styles from './adminPages.module.css';

const PAGE_SIZE = 20;

const failureText = (err: unknown, language: string) => {
  const message = (err as { message?: string })?.message;
  if ((err as { code?: string })?.code === '22023' && message) return message;
  const generic = describeError(err, language as 'en' | 'mr');
  return `${generic.what} ${generic.fix}`;
};

// ─── ID documents ───────────────────────────────────────────────────────────
const ID_TABS = [
  { key: 'pending', en: 'Waiting', mr: 'प्रतीक्षेत' },
  { key: 'verified', en: 'Verified', mr: 'पडताळलेले' },
  { key: 'rejected', en: 'Not accepted', mr: 'स्वीकारले नाही' },
];

const IdDocuments: React.FC = () => {
  const { language } = useLanguage();
  const { success } = useToast();
  const mr = language === 'mr';
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<VerificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const request = useRef(0);

  const [current, setCurrent] = useState<VerificationItem | null>(null);
  const [documents, setDocuments] = useState<{ path: string; url: string; isPdf: boolean }[] | null>(null);
  const [docError, setDocError] = useState<unknown>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [noteTouched, setNoteTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const load = useCallback(async () => {
    const thisRequest = ++request.current;
    setLoading(true);
    try {
      const res = await moderationService.verificationQueue(status, page, PAGE_SIZE);
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
  }, [status, page]);

  useEffect(() => { void load(); }, [load]);

  const openDocuments = async (item: VerificationItem) => {
    setDocuments(null);
    setDocError(null);
    try {
      setDocuments(await moderationService.openDocuments(item.id));
    } catch (err) {
      setDocError(err);
    }
  };

  const open = (item: VerificationItem) => {
    setCurrent(item);
    setRejecting(false);
    setNote('');
    setNoteTouched(false);
    setFailure(null);
    void openDocuments(item);
  };
  const close = () => { setCurrent(null); setDocuments(null); };

  const review = async (approve: boolean) => {
    if (!current) return;
    if (!approve) {
      setNoteTouched(true);
      if (note.trim().length < 3) return;
    }
    setBusy(true);
    setFailure(null);
    try {
      await moderationService.reviewVerification(current.id, approve, approve ? undefined : note.trim());
      success(approve
        ? (mr ? 'पडताळले. सदस्याला Verified बॅज मिळाला.' : 'Verified. The member now shows the Verified badge.')
        : (mr ? 'स्वीकारले नाही. सदस्य पुन्हा अपलोड करू शकतो.' : 'Not accepted. The member has been told why and can upload again.'));
      close();
      void load();
    } catch (err) {
      setFailure(failureText(err, language));
    } finally {
      setBusy(false);
    }
  };

  const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium' }) : '—';
  const nameOf = (r: VerificationItem) => [r.first_name, r.last_name].filter(Boolean).join(' ') || (mr ? 'नाव नाही' : 'No name');

  const columns: DataColumn<VerificationItem>[] = [
    {
      key: 'member',
      header: mr ? 'सदस्य' : 'Member',
      render: (r) => (
        <>
          <Link to={`/admin/users/${r.user_id}`} className={styles.nameLink}>{nameOf(r)}</Link>
          <div className={styles.muted}>{[r.profile_code, r.age, r.city].filter(Boolean).join(' • ')}</div>
        </>
      ),
    },
    { key: 'last4', header: mr ? 'शेवटचे अंक' : 'ID ending', render: (r) => (r.aadhaar_last4 ? `•••• ${r.aadhaar_last4}` : '—') },
    { key: 'date', header: mr ? 'सादर' : 'Submitted', render: (r) => fmt(r.submitted_at) },
    { key: 'note', header: mr ? 'नोंद' : 'Note', render: (r) => r.notes ?? '—' },
    {
      key: 'action',
      header: '',
      width: '110px',
      render: (r) => (
        <Button variant={status === 'pending' ? 'primary' : 'outline'} size="sm" onClick={() => open(r)}>
          {status === 'pending' ? (mr ? 'तपासा' : 'Review') : (mr ? 'पहा' : 'View')}
        </Button>
      ),
    },
  ];

  const noteError = noteTouched && note.trim().length < 3
    ? (mr ? 'सदस्याला काय चुकले ते लिहा.' : 'Tell the member what was wrong, so they can try again.') : undefined;

  return (
    <>
      <div className={styles.tabs} role="tablist">
        {ID_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={status === t.key}
            className={`${styles.tab} ${status === t.key ? styles.tabActive : ''}`}
            onClick={() => { setStatus(t.key); setPage(0); }}
          >
            {mr ? t.mr : t.en} ({counts[t.key] ?? 0})
          </button>
        ))}
      </div>
      <DataTable
        caption={mr ? 'ओळखपत्र विनंत्या' : 'ID requests'}
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
        empty={
          <EmptyState
            icon={<ShieldCheck size={30} />}
            title={status === 'pending' ? (mr ? 'सर्व तपासणी पूर्ण' : 'All caught up') : (mr ? 'काही नाही' : 'Nothing here')}
            description={mr ? 'सदस्य ओळखपत्र अपलोड केल्यावर ते येथे दिसेल.' : 'When a member uploads an ID from their dashboard, it appears here.'}
          />
        }
      />

      <Modal isOpen={Boolean(current)} onClose={close} title={current ? nameOf(current) : ''}>
        {current && (
          <div>
            <p className={styles.muted} style={{ marginTop: 0 }}>
              {[current.profile_code, current.date_of_birth, current.aadhaar_last4 ? `•••• ${current.aadhaar_last4}` : null].filter(Boolean).join(' • ')}
              <br />
              {mr ? 'नाव, जन्मतारीख व शेवटचे अंक कागदपत्राशी जुळतात का ते तपासा. ही पाहणी नोंदवली जाते.' : 'Check the name, date of birth and last digits match the document. Opening this is recorded in the log.'}
            </p>

            {docError ? (
              <ErrorState error={docError} onRetry={() => void openDocuments(current)} />
            ) : documents === null ? (
              <Skeleton height={220} borderRadius={10} />
            ) : documents.length === 0 ? (
              <p className={styles.notice}>{mr ? 'कागदपत्र सापडले नाही.' : 'The document could not be found. Reject this so the member can upload it again.'}</p>
            ) : (
              <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
                {documents.map((d) => d.isPdf ? (
                  <a key={d.path} href={d.url} target="_blank" rel="noopener noreferrer" className={styles.nameLink}>
                    {mr ? 'PDF उघडा (५ मिनिटे वैध)' : 'Open PDF (link lasts 5 minutes)'}
                  </a>
                ) : (
                  <a key={d.path} href={d.url} target="_blank" rel="noopener noreferrer">
                    <img src={d.url} alt={mr ? 'ओळखपत्र' : 'ID document'} style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 8, display: 'block' }} />
                  </a>
                ))}
              </div>
            )}

            {current.status === 'pending' && (
              rejecting ? (
                <>
                  <FormTextarea
                    id="id-reject-note"
                    label={mr ? 'सदस्याला कारण' : 'Reason for the member'}
                    required
                    rows={3}
                    value={note}
                    error={noteError}
                    onBlur={() => setNoteTouched(true)}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  {failure && <p role="alert" className={styles.formError}>{failure}</p>}
                  <div className={styles.formActions}>
                    <button type="button" className={`${styles.dangerButton} ${styles.dangerFill}`} disabled={busy} onClick={() => void review(false)}>
                      {busy ? (mr ? 'पाठवत आहे...' : 'Sending...') : (mr ? 'स्वीकारू नका' : 'Do not accept')}
                    </button>
                    <Button variant="outline" size="sm" disabled={busy} onClick={() => setRejecting(false)}>{mr ? 'मागे' : 'Back'}</Button>
                  </div>
                </>
              ) : (
                <>
                  {failure && <p role="alert" className={styles.formError}>{failure}</p>}
                  <div className={styles.formActions}>
                    <Button variant="primary" size="sm" disabled={busy || !documents?.length} onClick={() => void review(true)}>
                      {busy ? (mr ? 'पडताळत आहे...' : 'Verifying...') : (mr ? 'ओळख पडताळली' : 'Mark as verified')}
                    </Button>
                    <button type="button" className={styles.dangerButton} disabled={busy} onClick={() => setRejecting(true)}>
                      {mr ? 'स्वीकारू नका' : 'Do not accept'}
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

// ─── Member reports ─────────────────────────────────────────────────────────
const REPORT_TABS = [
  { key: 'open', en: 'New', mr: 'नवीन' },
  { key: 'reviewing', en: 'Looking into it', mr: 'तपासणी सुरू' },
  { key: 'resolved', en: 'Resolved', mr: 'निकाली' },
  { key: 'dismissed', en: 'Dismissed', mr: 'फेटाळले' },
];

const REASONS: Record<string, { en: string; mr: string }> = {
  fake_profile: { en: 'Fake profile or false photos', mr: 'बनावट प्रोफाइल / खोटे फोटो' },
  incorrect_information: { en: 'Incorrect details', mr: 'चुकीची माहिती' },
  inappropriate_content: { en: 'Inappropriate content', mr: 'अनुचित सामग्री' },
  harassment: { en: 'Harassment', mr: 'त्रास' },
  other: { en: 'Other', mr: 'इतर' },
};

const MemberReports: React.FC = () => {
  const { language } = useLanguage();
  const { success, error: toastError } = useToast();
  const { role } = useAdminSession();
  const mr = language === 'mr';
  const canBlock = role === 'super_admin' || role === 'admin';
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const request = useRef(0);

  const [current, setCurrent] = useState<ReportItem | null>(null);
  const [note, setNote] = useState('');
  const [noteTouched, setNoteTouched] = useState(false);
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const load = useCallback(async () => {
    const thisRequest = ++request.current;
    setLoading(true);
    try {
      const res = await moderationService.listReports(status, page, PAGE_SIZE);
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
  }, [status, page]);

  useEffect(() => { void load(); }, [load]);

  const open = (item: ReportItem) => {
    setCurrent(item);
    setNote(item.admin_notes ?? '');
    setNoteTouched(false);
    setAlsoBlock(false);
    setFailure(null);
  };

  const startLooking = async (item: ReportItem) => {
    try {
      await moderationService.resolveReport(item.id, 'reviewing', '', null);
      void load();
    } catch (err) {
      toastError(failureText(err, language));
    }
  };

  const finish = async (next: 'resolved' | 'dismissed') => {
    if (!current) return;
    setNoteTouched(true);
    if (note.trim().length < 3) return;
    setBusy(true);
    setFailure(null);
    try {
      // Block first: if it fails, the report stays open rather than claiming an action that never happened.
      if (next === 'resolved' && alsoBlock && current.target_user_id && !current.target_blocked) {
        await adminUsersService.block(current.target_user_id, note.trim());
      }
      await moderationService.resolveReport(current.id, next, note.trim(), next === 'resolved' && alsoBlock ? 'blocked' : 'none');
      success(next === 'resolved'
        ? (alsoBlock ? (mr ? 'निकाली काढले आणि खाते ब्लॉक केले.' : 'Resolved, and the account is blocked.') : (mr ? 'निकाली काढले.' : 'Resolved. The person who reported it has been thanked.'))
        : (mr ? 'फेटाळले.' : 'Dismissed. The person who reported it has been thanked.'));
      setCurrent(null);
      void load();
    } catch (err) {
      setFailure(failureText(err, language));
    } finally {
      setBusy(false);
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleDateString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium' });
  const targetName = (r: ReportItem) => [r.target_first_name, r.target_last_name].filter(Boolean).join(' ') || (mr ? 'खाते काढले' : 'Account removed');
  const reasonLabel = (r: ReportItem) => {
    const known = REASONS[r.reason];
    return known ? (mr ? known.mr : known.en) : r.reason;
  };

  const columns: DataColumn<ReportItem>[] = [
    {
      key: 'target',
      header: mr ? 'तक्रार कोणाविरुद्ध' : 'Reported member',
      render: (r) => (
        <>
          {r.target_user_id
            ? <Link to={`/admin/users/${r.target_user_id}`} className={styles.nameLink}>{targetName(r)}</Link>
            : targetName(r)}
          <div className={styles.muted}>
            {r.target_code}
            {r.target_report_count > 1 && ` • ${r.target_report_count} ${mr ? 'रिपोर्ट्स' : 'reports in total'}`}
          </div>
          {r.target_blocked && <span className={`${styles.badge} ${styles.badgeBad}`}>{mr ? 'ब्लॉक' : 'Blocked'}</span>}
        </>
      ),
    },
    {
      key: 'reason',
      header: mr ? 'कारण' : 'Reason',
      render: (r) => (
        <>
          <strong>{reasonLabel(r)}</strong>
          {r.details && <div className={styles.muted} style={{ whiteSpace: 'pre-wrap' }}>{r.details}</div>}
          {r.admin_notes && <div className={styles.muted} style={{ marginTop: 4 }}>{mr ? 'नोंद' : 'Note'}: {r.admin_notes}</div>}
        </>
      ),
    },
    { key: 'from', header: mr ? 'पाठवणारे' : 'From', width: '140px', render: (r) => <span className={styles.muted}>{[r.reporter_name, r.reporter_code].filter(Boolean).join(' • ') || '—'}</span> },
    { key: 'date', header: mr ? 'दिनांक' : 'Date', width: '110px', render: (r) => fmt(r.created_at) },
    {
      key: 'action',
      header: '',
      width: '170px',
      render: (r) => (['open', 'reviewing'].includes(r.status) ? (
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {r.status === 'open' && <Button variant="outline" size="sm" onClick={() => void startLooking(r)}>{mr ? 'तपासणी सुरू' : 'Start'}</Button>}
          <Button variant="primary" size="sm" onClick={() => open(r)}>{mr ? 'निर्णय' : 'Decide'}</Button>
        </span>
      ) : null),
    },
  ];

  const noteError = noteTouched && note.trim().length < 3
    ? (mr ? 'काय आढळले ते लिहा.' : 'Please note what you found.') : undefined;

  return (
    <>
      <div className={styles.tabs} role="tablist">
        {REPORT_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={status === t.key}
            className={`${styles.tab} ${status === t.key ? styles.tabActive : ''}`}
            onClick={() => { setStatus(t.key); setPage(0); }}
          >
            {mr ? t.mr : t.en} ({counts[t.key] ?? 0})
          </button>
        ))}
      </div>
      <DataTable
        caption={mr ? 'सदस्यांचे रिपोर्ट्स' : 'Member reports'}
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
        empty={
          <EmptyState
            icon={<Flag size={30} />}
            title={status === 'open' ? (mr ? 'नवीन रिपोर्ट नाही' : 'No new reports') : (mr ? 'काही नाही' : 'Nothing here')}
            description={mr ? 'सदस्य एखादी प्रोफाइल रिपोर्ट केल्यावर ती येथे दिसेल.' : 'When a member reports a profile, it appears here.'}
          />
        }
      />

      <Modal isOpen={Boolean(current)} onClose={() => setCurrent(null)} title={current ? targetName(current) : ''}>
        {current && (
          <div>
            <p style={{ marginTop: 0 }}><strong>{reasonLabel(current)}</strong></p>
            {current.details && <p className={styles.muted} style={{ whiteSpace: 'pre-wrap' }}>{current.details}</p>}
            <FormTextarea
              id="report-note"
              label={mr ? 'आपल्याला काय आढळले?' : 'What did you find?'}
              required
              rows={3}
              value={note}
              error={noteError}
              onBlur={() => setNoteTouched(true)}
              onChange={(e) => setNote(e.target.value)}
            />
            {canBlock && current.target_user_id && !current.target_blocked && (
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '10px 0', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} />
                {mr ? 'हे खातेही ब्लॉक करा' : 'Also block this account'}
              </label>
            )}
            {!canBlock && (
              <p className={styles.muted}>{mr ? 'खाते ब्लॉक करण्यासाठी प्रशासकाला सांगा.' : 'To block this account, ask an admin. Moderators cannot block.'}</p>
            )}
            {failure && <p role="alert" className={styles.formError}>{failure}</p>}
            <div className={styles.formActions}>
              <Button variant="primary" size="sm" disabled={busy} onClick={() => void finish('resolved')}>
                {busy ? (mr ? 'जतन होत आहे...' : 'Saving...') : (mr ? 'निकाली काढा' : 'Resolve')}
              </Button>
              <Button variant="outline" size="sm" disabled={busy || alsoBlock} onClick={() => void finish('dismissed')}>
                {mr ? 'फेटाळा' : 'Dismiss'}
              </Button>
              {current.target_user_id && (
                <Link to={`/admin/users/${current.target_user_id}`} className={styles.nameLink}>{mr ? 'पूर्ण प्रोफाइल पहा' : 'Open full member page'}</Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

/** Identity documents and reports about members: the two checks on whether someone is genuine. */
export const VerificationPage: React.FC = () => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const [section, setSection] = useState<'id' | 'reports'>('id');

  return (
    <div>
      <h1 className={styles.title}>{mr ? 'पडताळणी' : 'Verification'}</h1>
      <p className={styles.subtitle}>{mr ? 'ओळखपत्रे व सदस्यांनी केलेले रिपोर्ट्स.' : 'Identity documents, and reports members have made about profiles.'}</p>
      <div className={styles.toolbar}>
        <Button variant={section === 'id' ? 'primary' : 'outline'} size="sm" onClick={() => setSection('id')}>{mr ? 'ओळखपत्रे' : 'ID documents'}</Button>
        <Button variant={section === 'reports' ? 'primary' : 'outline'} size="sm" onClick={() => setSection('reports')}>{mr ? 'बनावट प्रोफाइल रिपोर्ट्स' : 'Fake profile reports'}</Button>
      </div>
      {section === 'id' ? <IdDocuments /> : <MemberReports />}
    </div>
  );
};
