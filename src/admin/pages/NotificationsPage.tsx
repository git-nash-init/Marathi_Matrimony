import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FormInput } from '../../components/common/FormInput';
import { FormSelect } from '../../components/common/FormSelect';
import { FormTextarea } from '../../components/common/FormTextarea';
import { describeError, EmptyState } from '../../components/states/UiStates';
import { usePlaces } from '../../services/lookups.service';
import { DataColumn, DataTable } from '../components/DataTable';
import styles from './adminPages.module.css';

const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);
const PAGE_SIZE = 10;

interface Broadcast {
  id: string;
  kind: string;
  title: string;
  message: string;
  action_url: string | null;
  sent_count: number;
  created_at: string;
}

const emptyAudience = { gender: 'all', status: 'all', verification: 'all', plan: 'all', district: 'all' };

export const NotificationsPage: React.FC = () => {
  const { language } = useLanguage();
  const { success } = useToast();
  const mr = language === 'mr';
  const districts = usePlaces();

  const [kind, setKind] = useState('announcement');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('');
  const [audience, setAudience] = useState(emptyAudience);
  const [touched, setTouched] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const [rows, setRows] = useState<Broadcast[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const audienceKey = useMemo(() => JSON.stringify(audience), [audience]);

  useEffect(() => {
    let active = true;
    setCount(null);
    const timer = setTimeout(() => {
      rpc('admin_count_recipients', { p_kind: kind, p_audience: JSON.parse(audienceKey) }).then(({ data, error: e }: any) => {
        if (active && !e) setCount(Number(data));
      });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [kind, audienceKey]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: e } = await rpc('admin_list_broadcasts', { p_limit: PAGE_SIZE, p_offset: page * PAGE_SIZE });
    if (e) setError(e);
    else {
      setRows(data.items);
      setTotal(data.total);
      setError(null);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  const set = (key: keyof typeof emptyAudience) => (e: React.ChangeEvent<HTMLSelectElement>) => setAudience((a) => ({ ...a, [key]: e.target.value }));

  const titleError = touched && !title.trim() ? (mr ? 'शीर्षक लिहा.' : 'Please write a title.') : undefined;
  const messageError = touched && !message.trim() ? (mr ? 'संदेश लिहा.' : 'Please write the message.') : undefined;
  const urlError = url.trim() && !/^\/[a-zA-Z0-9/_?=&-]*$/.test(url.trim())
    ? (mr ? 'या वेबसाइटवरील पान, / ने सुरू.' : 'Use a page on this site, starting with /, such as /membership.') : undefined;

  const review = () => {
    setTouched(true);
    setFailure(null);
    if (!title.trim() || !message.trim() || urlError) return;
    setConfirming(true);
  };

  const send = async () => {
    setConfirming(false);
    setBusy(true);
    const { data, error: e } = await rpc('admin_send_broadcast', {
      p_kind: kind, p_title: title.trim(), p_message: message.trim(), p_url: url.trim() || null, p_audience: audience,
    });
    setBusy(false);
    if (e) {
      if (e.code === '22023' && e.message) setFailure(e.message);
      else {
        const generic = describeError(e, language);
        setFailure(`${generic.what} ${generic.fix}`);
      }
      return;
    }
    success(mr ? `${data.sent} सदस्यांना पाठवले.` : `Sent to ${data.sent} members. They see it in the bell, and as a push if they turned those on.`);
    setTitle('');
    setMessage('');
    setUrl('');
    setTouched(false);
    setPage(0);
    void load();
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const columns: DataColumn<Broadcast>[] = [
    { key: 'title', header: mr ? 'संदेश' : 'Message', render: (r) => (<><strong>{r.title}</strong><div className={styles.muted}>{r.message}</div></>) },
    { key: 'kind', header: mr ? 'प्रकार' : 'Type', width: '120px', render: (r) => (r.kind === 'promotional' ? (mr ? 'जाहिरात' : 'Promotion') : (mr ? 'सूचना' : 'Announcement')) },
    { key: 'sent', header: mr ? 'सदस्य' : 'Sent to', width: '90px', render: (r) => r.sent_count },
    { key: 'date', header: mr ? 'दिनांक' : 'Date', width: '160px', render: (r) => fmt(r.created_at) },
  ];

  return (
    <div>
      <h1 className={styles.title}>{mr ? 'सूचना' : 'Notifications'}</h1>
      <p className={styles.notice} role="status">
        {mr
          ? 'संदेश वेबसाइटवरील घंटेत आणि चालू केलेल्या सदस्यांना पुश सूचना म्हणून जातात. ईमेल व SMS साठी सेवा-प्रदाता जोडणे बाकी आहे.'
          : 'Messages go to the bell on the website, and as a push to members who turned those on. Email and SMS are not connected yet: they need a provider, and Indian SMS also needs DLT registration.'}
      </p>

      <section className={styles.card}>
        <h2 className={styles.cardTitle} style={{ marginBottom: 12 }}>{mr ? 'नवीन संदेश' : 'New message'}</h2>
        <div className={styles.form}>
          <FormSelect id="bc-kind" label={mr ? 'प्रकार' : 'Type'} value={kind} onChange={(e) => setKind(e.target.value)} options={[
            { value: 'announcement', label: mr ? 'महत्त्वाची सूचना (सर्वांना)' : 'Announcement (goes to everyone chosen)' },
            { value: 'promotional', label: mr ? 'जाहिरात (नको असणाऱ्यांना नाही)' : 'Promotion (skips members who opted out)' },
          ]} />
          <FormSelect id="bc-gender" label={mr ? 'कोणाला' : 'Who'} value={audience.gender} onChange={set('gender')} options={[
            { value: 'all', label: mr ? 'वर व वधू' : 'Brides and grooms' }, { value: 'female', label: mr ? 'वधू' : 'Brides' }, { value: 'male', label: mr ? 'वर' : 'Grooms' },
          ]} />
          <FormSelect id="bc-plan" label={mr ? 'योजना' : 'Plan'} value={audience.plan} onChange={set('plan')} options={[
            { value: 'all', label: mr ? 'सर्व' : 'Anyone' }, { value: 'any', label: mr ? 'सशुल्क' : 'On any plan' }, { value: 'none', label: mr ? 'योजना नाही' : 'No plan' },
            { value: 'silver', label: 'Silver' }, { value: 'diamond', label: 'Diamond' }, { value: 'platinum', label: 'Platinum' },
          ]} />
          <FormSelect id="bc-status" label={mr ? 'प्रोफाइल' : 'Profile'} value={audience.status} onChange={set('status')} options={[
            { value: 'all', label: mr ? 'सर्व' : 'Any' }, { value: 'approved', label: mr ? 'मंजूर' : 'Approved' }, { value: 'pending_approval', label: mr ? 'प्रलंबित' : 'Waiting for approval' },
            { value: 'draft', label: mr ? 'अपूर्ण' : 'Not finished' }, { value: 'rejected', label: mr ? 'नाकारलेले' : 'Rejected' },
          ]} />
          <FormSelect id="bc-verification" label={mr ? 'ओळख' : 'Identity'} value={audience.verification} onChange={set('verification')} options={[
            { value: 'all', label: mr ? 'सर्व' : 'Any' }, { value: 'verified', label: mr ? 'पडताळलेले' : 'Verified' }, { value: 'unverified', label: mr ? 'न पडताळलेले' : 'Not verified' },
          ]} />
          <FormSelect id="bc-district" label={mr ? 'जिल्हा' : 'District'} value={audience.district} onChange={set('district')} options={[
            { value: 'all', label: mr ? 'सर्व जिल्हे' : 'All districts' },
            ...districts.map((d) => ({ value: d.name_en, label: mr && d.name_mr ? d.name_mr : d.name_en })),
          ]} />
          <div className={styles.formWide}>
            <FormInput id="bc-title" label={mr ? 'शीर्षक' : 'Title'} required maxLength={120} value={title} error={titleError} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className={styles.formWide}>
            <FormTextarea id="bc-message" label={mr ? 'संदेश' : 'Message'} required rows={3} maxLength={1000} value={message} error={messageError} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className={styles.formWide}>
            <FormInput id="bc-url" label={mr ? 'दुवा (ऐच्छिक)' : 'Link (optional)'} placeholder="/membership" value={url} error={urlError} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>
        {failure && <p role="alert" className={styles.formError}>{failure}</p>}
        <div className={styles.formActions}>
          <Button variant="primary" size="sm" disabled={busy || count === 0} onClick={review}>{busy ? (mr ? 'पाठवत आहे...' : 'Sending...') : (mr ? 'तपासून पाठवा' : 'Review and send')}</Button>
          <span className={styles.muted} role="status">
            {count === null ? (mr ? 'मोजत आहे...' : 'Counting...') : mr ? `${count} सदस्यांपर्यंत पोहोचेल` : `Will reach ${count} ${count === 1 ? 'member' : 'members'}`}
          </span>
        </div>
      </section>

      <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>{mr ? 'पाठवलेले संदेश' : 'Sent messages'}</h2>
      <DataTable
        caption={mr ? 'पाठवलेले संदेश' : 'Sent messages'}
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
        empty={<EmptyState icon={<Bell size={30} />} title={mr ? 'अद्याप संदेश नाहीत' : 'No messages sent yet'} description={mr ? 'पहिला संदेश वर लिहा.' : 'Write your first message above. Subscription reminders go out by themselves, 7 days and 1 day before a plan ends.'} />}
      />

      <ConfirmDialog
        isOpen={confirming}
        title={mr ? `${count ?? 0} सदस्यांना पाठवायचे?` : `Send to ${count ?? 0} members?`}
        message={`${title.trim()}: ${message.trim()}`}
        confirmLabel={mr ? 'पाठवा' : 'Send now'}
        cancelLabel={mr ? 'रद्द करा' : 'Cancel'}
        onConfirm={() => void send()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
};
