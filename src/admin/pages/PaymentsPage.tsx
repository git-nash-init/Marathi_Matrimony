import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Crown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { EmptyState, NoResults } from '../../components/states/UiStates';
import { AdminPayment, AdminSubscription, billingService, formatMoney } from '../../services/billing.service';
import { DataColumn, DataTable } from '../components/DataTable';
import styles from './adminPages.module.css';

const PAGE_SIZE = 20;

const PAYMENT_TABS = [
  { key: 'all', en: 'All', mr: 'सर्व' },
  { key: 'captured', en: 'Successful', mr: 'यशस्वी' },
  { key: 'failed', en: 'Failed', mr: 'अयशस्वी' },
  { key: 'pending', en: 'Pending', mr: 'प्रलंबित' },
];
const SUB_TABS = [
  { key: 'active', en: 'Active', mr: 'सक्रिय' },
  { key: 'expired', en: 'Expired', mr: 'संपलेले' },
];

const TestBadge: React.FC<{ mr: boolean }> = ({ mr }) => (
  <span className={`${styles.badge} ${styles.badgeWarn}`}>{mr ? 'चाचणी' : 'Test'}</span>
);

const Member: React.FC<{ row: { user_id: string | null; first_name: string | null; last_name: string | null; email: string | null; profile_code: string | null }; mr: boolean }> = ({ row, mr }) => {
  const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email;
  return (
    <>
      {row.user_id && name
        ? <Link to={`/admin/users/${row.user_id}`} className={styles.nameLink}>{name}</Link>
        : <span className={styles.muted}>{mr ? 'खाते काढले' : 'Account removed'}</span>}
      {row.profile_code && <div className={styles.muted}>{row.profile_code}</div>}
    </>
  );
};

const useQueue = <T,>(fetcher: (tab: string, search: string, page: number) => Promise<{ total: number; counts: Record<string, number>; items: T[] } & Record<string, unknown>>, initialTab: string) => {
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ total: number; counts: Record<string, number>; items: T[] } & Record<string, unknown>>({ total: 0, counts: {}, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const request = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const thisRequest = ++request.current;
    setLoading(true);
    try {
      const res = await fetcher(tab, debounced, page);
      if (thisRequest !== request.current) return;
      setData(res);
      setError(null);
    } catch (err) {
      if (thisRequest === request.current) setError(err);
    } finally {
      if (thisRequest === request.current) setLoading(false);
    }
    // The fetcher is a stable module function wrapped once per component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debounced, page]);

  useEffect(() => { void load(); }, [load]);
  return { tab, setTab: (t: string) => { setTab(t); setPage(0); }, search, setSearch, debounced, page, setPage, data, loading, error, load };
};

const fetchPayments = (tab: string, search: string, page: number) => billingService.listPayments(tab, search, page, PAGE_SIZE) as never;
const fetchSubs = (tab: string, search: string, page: number) => billingService.listSubscriptions(tab, search, page, PAGE_SIZE) as never;

const Payments: React.FC = () => {
  const { language } = useLanguage();
  const { error: toastError } = useToast();
  const mr = language === 'mr';
  const q = useQueue<AdminPayment>(fetchPayments, 'all');
  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
  const collected = Number(q.data.collected ?? 0);
  const allCount = Object.values(q.data.counts).reduce((a, b) => a + b, 0);

  const receipt = (p: AdminPayment) => {
    billingService.downloadReceipt(p).catch(() => toastError(mr ? 'पावती तयार झाली नाही. पुन्हा प्रयत्न करा.' : 'The receipt could not be created. Please try again.'));
  };

  const columns: DataColumn<AdminPayment>[] = [
    { key: 'member', header: mr ? 'सदस्य' : 'Member', render: (r) => <Member row={r} mr={mr} /> },
    { key: 'plan', header: mr ? 'योजना' : 'Plan', render: (r) => r.plan_name ?? '—' },
    {
      key: 'amount',
      header: mr ? 'रक्कम' : 'Amount',
      render: (r) => (
        <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {formatMoney(Number(r.amount), r.currency ?? 'INR', mr)} {r.is_test && <TestBadge mr={mr} />}
        </span>
      ),
    },
    { key: 'status', header: mr ? 'स्थिती' : 'Status', render: (r) => <span className={`${styles.badge} ${r.status === 'captured' ? styles.badgeGood : r.status === 'failed' ? styles.badgeBad : ''}`}>{r.status === 'captured' ? (mr ? 'यशस्वी' : 'Successful') : r.status}</span> },
    { key: 'txn', header: mr ? 'व्यवहार क्र.' : 'Transaction ID', render: (r) => <span className={`${styles.muted} ${styles.breakAll}`}>{r.gateway_payment_id ?? r.gateway_order_id ?? '—'}</span> },
    { key: 'date', header: mr ? 'दिनांक' : 'Date', render: (r) => fmt(r.paid_at ?? r.created_at) },
    { key: 'receipt', header: '', width: '100px', render: (r) => <Button variant="outline" size="sm" onClick={() => receipt(r)}>{mr ? 'पावती' : 'Receipt'}</Button> },
  ];

  return (
    <>
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>{mr ? 'एकूण जमा' : 'Total collected'}</span>
          <span className={styles.statValue}>{formatMoney(collected, 'INR', mr)}</span>
          <span className={styles.statNote}>{mr ? 'चाचणी पेमेंट्स वगळून' : 'Test payments are not counted'}</span>
        </div>
      </div>
      <div className={styles.tabs} role="tablist">
        {PAYMENT_TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={q.tab === t.key} className={`${styles.tab} ${q.tab === t.key ? styles.tabActive : ''}`} onClick={() => q.setTab(t.key)}>
            {mr ? t.mr : t.en} ({t.key === 'all' ? allCount : q.data.counts[t.key] ?? 0})
          </button>
        ))}
      </div>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <input className={styles.input} type="search" value={q.search} onChange={(e) => q.setSearch(e.target.value)} placeholder={mr ? 'नाव, ईमेल, आयडी किंवा व्यवहार क्र.' : 'Search name, email, ID or transaction'} aria-label={mr ? 'पेमेंट शोधा' : 'Search payments'} />
        </div>
      </div>
      <DataTable
        caption={mr ? 'पेमेंट्स' : 'Payments'}
        columns={columns}
        rows={q.data.items}
        rowKey={(r) => r.id}
        loading={q.loading}
        error={q.error}
        onRetry={() => void q.load()}
        page={q.page}
        pageSize={PAGE_SIZE}
        total={q.data.total}
        onPageChange={q.setPage}
        empty={q.debounced.trim()
          ? <NoResults query={q.debounced.trim()} onClear={() => q.setSearch('')} />
          : <EmptyState icon={<CreditCard size={30} />} title={mr ? 'अद्याप पेमेंट नाही' : 'No payments here yet'} description={mr ? 'सदस्यांनी योजना घेतल्यावर येथे दिसतील.' : 'Payments appear here when members buy a plan.'} />}
      />
    </>
  );
};

const Subscriptions: React.FC = () => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const q = useQueue<AdminSubscription>(fetchSubs, 'active');
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium' });

  const columns: DataColumn<AdminSubscription>[] = [
    { key: 'member', header: mr ? 'सदस्य' : 'Member', render: (r) => <Member row={r} mr={mr} /> },
    { key: 'plan', header: mr ? 'योजना' : 'Plan', render: (r) => <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>{r.plan_name} {r.is_test && <TestBadge mr={mr} />}</span> },
    { key: 'start', header: mr ? 'सुरुवात' : 'Started', render: (r) => fmt(r.start_date) },
    { key: 'end', header: q.tab === 'active' ? (mr ? 'संपेल' : 'Ends') : (mr ? 'संपले' : 'Ended'), render: (r) => fmt(r.end_date) },
  ];

  return (
    <>
      <div className={styles.tabs} role="tablist">
        {SUB_TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={q.tab === t.key} className={`${styles.tab} ${q.tab === t.key ? styles.tabActive : ''}`} onClick={() => q.setTab(t.key)}>
            {mr ? t.mr : t.en} ({q.data.counts[t.key] ?? 0})
          </button>
        ))}
      </div>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <input className={styles.input} type="search" value={q.search} onChange={(e) => q.setSearch(e.target.value)} placeholder={mr ? 'नाव, ईमेल किंवा आयडी शोधा' : 'Search name, email or ID'} aria-label={mr ? 'सदस्यता शोधा' : 'Search subscriptions'} />
        </div>
      </div>
      <DataTable
        caption={mr ? 'सदस्यता' : 'Subscriptions'}
        columns={columns}
        rows={q.data.items}
        rowKey={(r) => r.id}
        loading={q.loading}
        error={q.error}
        onRetry={() => void q.load()}
        page={q.page}
        pageSize={PAGE_SIZE}
        total={q.data.total}
        onPageChange={q.setPage}
        empty={q.debounced.trim()
          ? <NoResults query={q.debounced.trim()} onClear={() => q.setSearch('')} />
          : <EmptyState icon={<Crown size={30} />} title={mr ? 'काही नाही' : 'Nothing here yet'} description={mr ? 'सदस्यांनी योजना घेतल्यावर येथे दिसतील.' : 'Subscriptions appear here when members buy a plan.'} />}
      />
    </>
  );
};

export const PaymentsPage: React.FC = () => {
  const { language } = useLanguage();
  const mr = language === 'mr';
  const [section, setSection] = useState<'payments' | 'subscriptions'>('payments');
  return (
    <div>
      <h1 className={styles.title}>{mr ? 'पेमेंट्स' : 'Payments'}</h1>
      <p className={styles.notice} role="status">
        {mr
          ? 'खरे पेमेंट अद्याप जोडलेले नाही. सध्याच्या नोंदी चाचणीच्या आहेत आणि त्यांतून कोणतेही पैसे जमा झालेले नाहीत.'
          : 'Real payments are not connected yet. Entries marked Test are from the test checkout, and no money was collected for them.'}
      </p>
      <div className={styles.toolbar}>
        <Button variant={section === 'payments' ? 'primary' : 'outline'} size="sm" onClick={() => setSection('payments')}>{mr ? 'पेमेंट्स' : 'Payments'}</Button>
        <Button variant={section === 'subscriptions' ? 'primary' : 'outline'} size="sm" onClick={() => setSection('subscriptions')}>{mr ? 'सदस्यता' : 'Subscriptions'}</Button>
      </div>
      {section === 'payments' ? <Payments /> : <Subscriptions />}
    </div>
  );
};
