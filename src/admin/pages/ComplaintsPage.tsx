import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormTextarea } from '../../components/common/FormTextarea';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { describeError, EmptyState, ErrorState, NoResults } from '../../components/states/UiStates';
import { supportService, TicketDetail, TicketRow } from '../../services/support.service';
import { DataColumn, DataTable } from '../components/DataTable';
import styles from './adminPages.module.css';

const PAGE_SIZE = 20;
const TABS = [
  { key: 'open', en: 'Open', mr: 'चालू' },
  { key: 'resolved', en: 'Resolved', mr: 'निकाली' },
  { key: 'spam', en: 'Spam', mr: 'स्पॅम' },
];
const CATEGORY: Record<string, { en: string; mr: string; tone: string }> = {
  complaint: { en: 'Complaint', mr: 'तक्रार', tone: styles.badgeBad },
  contact: { en: 'Question', mr: 'प्रश्न', tone: styles.badgeInfo },
  feedback: { en: 'Feedback', mr: 'अभिप्राय', tone: styles.badgeGood },
};

export const ComplaintsPage: React.FC = () => {
  const { language } = useLanguage();
  const { success } = useToast();
  const mr = language === 'mr';
  const [tab, setTab] = useState('open');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const request = useRef(0);

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [detailError, setDetailError] = useState<unknown>(null);
  const [reply, setReply] = useState('');
  const [replyTouched, setReplyTouched] = useState(false);
  const [notes, setNotes] = useState('');
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
      const res = await supportService.list(tab, category, debounced, page, PAGE_SIZE);
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
  }, [tab, category, debounced, page]);

  useEffect(() => { void load(); }, [load]);

  const loadDetail = useCallback(async (id: string) => {
    setDetailError(null);
    try {
      const d = await supportService.get(id);
      setDetail(d);
      setNotes(d.admin_notes ?? '');
    } catch (err) {
      setDetailError(err);
    }
  }, []);

  const open = (id: string) => {
    setOpenId(id);
    setDetail(null);
    setReply('');
    setReplyTouched(false);
    setFailure(null);
    void loadDetail(id);
  };
  const close = () => { setOpenId(null); setDetail(null); };

  const act = async (work: () => Promise<unknown>, done: string, closeAfter = false) => {
    if (!openId) return;
    setBusy(true);
    setFailure(null);
    try {
      await work();
      success(done);
      void load();
      if (closeAfter) close();
      else await loadDetail(openId);
    } catch (err) {
      const message = (err as { message?: string })?.message;
      if ((err as { code?: string })?.code === '22023' && message) setFailure(message);
      else {
        const generic = describeError(err, language);
        setFailure(`${generic.what} ${generic.fix}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const badge = (c: string) => {
    const known = CATEGORY[c] ?? CATEGORY.contact;
    return <span className={`${styles.badge} ${known.tone}`}>{mr ? known.mr : known.en}</span>;
  };

  const columns: DataColumn<TicketRow>[] = [
    {
      key: 'subject',
      header: mr ? 'विषय' : 'Subject',
      render: (r) => (
        <>
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
            {r.priority && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#C9A227', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px', borderRadius: 12 }}><Crown size={10} /> Platinum</span>}
            {badge(r.category)}
            {r.assigned_to_me && <span className={`${styles.badge} ${styles.badgeInfo}`}>{mr ? 'माझ्याकडे' : 'Mine'}</span>}
          </span>
          <div style={{ fontWeight: 600 }}>{r.subject}</div>
          <div className={styles.muted}>{r.message.length > 110 ? `${r.message.slice(0, 110)}…` : r.message}</div>
        </>
      ),
    },
    {
      key: 'from',
      header: mr ? 'पाठवणारे' : 'From',
      width: '220px',
      render: (r) => (
        <>
          <div>{r.name}</div>
          <div className={`${styles.muted} ${styles.breakAll}`}>{r.email}</div>
        </>
      ),
    },
    { key: 'status', header: mr ? 'स्थिती' : 'Status', width: '110px', render: (r) => (r.status === 'PENDING' ? (mr ? 'नवीन' : 'New') : r.status === 'IN_PROGRESS' ? (mr ? 'चालू' : 'In progress') : r.status === 'RESOLVED' ? (mr ? 'निकाली' : 'Resolved') : (mr ? 'स्पॅम' : 'Spam')) },
    { key: 'date', header: mr ? 'दिनांक' : 'Date', width: '150px', render: (r) => fmt(r.created_at) },
    { key: 'open', header: '', width: '90px', render: (r) => <Button variant={r.status === 'PENDING' ? 'primary' : 'outline'} size="sm" onClick={() => open(r.id)}>{mr ? 'उघडा' : 'Open'}</Button> },
  ];

  const replyError = replyTouched && !reply.trim() ? (mr ? 'उत्तर लिहा.' : 'Please write a reply.') : undefined;

  return (
    <div>
      <h1 className={styles.title}>{mr ? 'तक्रारी व मदत' : 'Complaints & Support'}</h1>
      <p className={styles.subtitle}>{mr ? 'तक्रारी, प्रश्न व अभिप्राय.' : 'Complaints, questions and feedback sent through the website.'}</p>

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => { setTab(t.key); setPage(0); }}>
            {mr ? t.mr : t.en} ({counts[t.key] ?? 0})
          </button>
        ))}
      </div>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <input className={styles.input} type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={mr ? 'नाव, ईमेल, फोन किंवा मजकूर शोधा' : 'Search name, email, phone or text'} aria-label={mr ? 'विनंत्या शोधा' : 'Search requests'} />
        </div>
        <select className={styles.select} value={category} aria-label={mr ? 'प्रकार' : 'Type'} onChange={(e) => { setCategory(e.target.value); setPage(0); }}>
          <option value="all">{mr ? 'सर्व प्रकार' : 'All types'}</option>
          <option value="complaint">{mr ? 'तक्रार' : 'Complaints'}</option>
          <option value="contact">{mr ? 'प्रश्न' : 'Questions'}</option>
          <option value="feedback">{mr ? 'अभिप्राय' : 'Feedback'}</option>
        </select>
      </div>

      <DataTable
        caption={mr ? 'विनंत्या' : 'Requests'}
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
        empty={debounced.trim()
          ? <NoResults query={debounced.trim()} onClear={() => setSearch('')} />
          : <EmptyState icon={<MessageCircle size={30} />} title={tab === 'open' ? (mr ? 'सर्व उत्तरे दिली' : 'All caught up') : (mr ? 'काही नाही' : 'Nothing here')} description={mr ? 'कोणी संपर्क फॉर्म भरल्यावर तो येथे दिसेल.' : 'When someone fills in the contact form, it appears here.'} />}
      />

      <Modal isOpen={Boolean(openId)} onClose={close} title={detail?.subject ?? (mr ? 'विनंती' : 'Request')}>
        {detailError ? (
          <ErrorState error={detailError} onRetry={() => openId && void loadDetail(openId)} />
        ) : !detail ? (
          <Skeleton height={180} borderRadius={10} />
        ) : (
          <div>
            <p className={styles.muted} style={{ marginTop: 0 }}>
              {detail.name} • <a href={`mailto:${detail.email}`}>{detail.email}</a>{detail.phone ? ' • ' : ''}{detail.phone && <a href={`tel:${detail.phone}`}>{detail.phone}</a>}
              <br />{fmt(detail.created_at)}
              {detail.user_id && <> • <Link to={`/admin/users/${detail.user_id}`}>{mr ? 'सदस्य पान' : 'Member page'}</Link></>}
            </p>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.92rem' }}>{detail.message}</p>

            {detail.messages.length > 0 && (
              <ul className={styles.history} style={{ marginBottom: 12 }}>
                {detail.messages.map((m) => (
                  <li key={m.id}>
                    <strong>{m.sender === 'admin' ? (mr ? 'आपले पथक' : 'Our team') : detail.name}</strong> <span className={styles.muted}>{fmt(m.created_at)}</span>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                  </li>
                ))}
              </ul>
            )}

            <FormTextarea id="ticket-reply" label={mr ? 'उत्तर' : 'Reply'} rows={3} maxLength={4000} value={reply} error={replyError} onChange={(e) => setReply(e.target.value)} />
            {!detail.user_id && (
              <p className={styles.notice} style={{ marginTop: 8 }}>
                {mr
                  ? 'हे लॉगिन न करता पाठवले आहे, त्यामुळे उत्तर आपोआप पोहोचणार नाही. कृपया ईमेल किंवा फोनने संपर्क साधा; ईमेल सेवा जोडल्यानंतर हे आपोआप होईल.'
                  : 'This was sent without signing in, so a reply here will not reach them by itself. Please answer by email or phone as well. This becomes automatic once an email service is connected.'}
              </p>
            )}
            <FormTextarea id="ticket-notes" label={mr ? 'अंतर्गत नोंद (सदस्याला दिसत नाही)' : 'Internal note (the member never sees this)'} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            {failure && <p role="alert" className={styles.formError}>{failure}</p>}
            <div className={styles.formActions}>
              <Button variant="primary" size="sm" disabled={busy}
                onClick={() => {
                  setReplyTouched(true);
                  if (!reply.trim()) return;
                  void act(async () => { await supportService.reply(detail.id, reply.trim()); setReply(''); setReplyTouched(false); },
                    detail.user_id ? (mr ? 'पाठवले. सदस्याला सूचना मिळाली.' : 'Sent. The member has been notified.') : (mr ? 'नोंदवले.' : 'Saved to this request.'));
                }}>
                {busy ? (mr ? 'पाठवत आहे...' : 'Sending...') : (mr ? 'उत्तर पाठवा' : 'Send reply')}
              </Button>
              {detail.assigned_to_me
                ? <Button variant="outline" size="sm" disabled={busy} onClick={() => void act(() => supportService.update(detail.id, { assign: 'nobody' }), mr ? 'सोडले.' : 'Unassigned.')}>{mr ? 'सोडा' : 'Unassign'}</Button>
                : <Button variant="outline" size="sm" disabled={busy} onClick={() => void act(() => supportService.update(detail.id, { assign: 'me' }), mr ? 'आपल्याकडे घेतले.' : 'Assigned to you.')}>{mr ? 'मी पाहतो' : 'Assign to me'}</Button>}
              {notes !== (detail.admin_notes ?? '') && (
                <Button variant="outline" size="sm" disabled={busy} onClick={() => void act(() => supportService.update(detail.id, { notes }), mr ? 'नोंद जतन केली.' : 'Note saved.')}>{mr ? 'नोंद जतन करा' : 'Save note'}</Button>
              )}
              {['PENDING', 'IN_PROGRESS'].includes(detail.status) ? (
                <>
                  <Button variant="outline" size="sm" disabled={busy} onClick={() => void act(() => supportService.update(detail.id, { status: 'RESOLVED' }), mr ? 'निकाली काढले.' : 'Marked as resolved.', true)}>{mr ? 'निकाली काढा' : 'Mark resolved'}</Button>
                  <button type="button" className={styles.dangerButton} disabled={busy} onClick={() => void act(() => supportService.update(detail.id, { status: 'SPAM' }), mr ? 'स्पॅम म्हणून नोंदवले.' : 'Marked as spam.', true)}>{mr ? 'स्पॅम' : 'Spam'}</button>
                </>
              ) : (
                <Button variant="outline" size="sm" disabled={busy} onClick={() => void act(() => supportService.update(detail.id, { status: 'IN_PROGRESS' }), mr ? 'पुन्हा उघडले.' : 'Reopened.')}>{mr ? 'पुन्हा उघडा' : 'Reopen'}</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
