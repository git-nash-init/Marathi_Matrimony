import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState, SlowNetworkNotice } from '../../components/states/UiStates';
import { useSlowNetwork } from '../../hooks/useNetworkStatus';
import { useAdminSession } from '../adminAccess';
import { sectionFor } from '../navigation';
import styles from './adminPages.module.css';

interface Stats {
  total_users: number;
  new_last_7_days: number;
  male: number;
  female: number;
  active: number;
  blocked: number;
  pending_approvals: number;
  pending_ids: number;
  open_reports: number;
  open_inquiries: number;
  /** Null for roles that may not see money. */
  paid_members: number | null;
  test_members: number | null;
  revenue_total: number | null;
  revenue_this_month: number | null;
  test_payments: number | null;
  generated_at: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const { role } = useAdminSession();
  const mr = language === 'mr';
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const slow = useSlowNetwork(loading);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: rpcError } = await (supabase.rpc as any)('admin_dashboard_stats');
    if (rpcError) {
      setError(rpcError);
    } else {
      setStats(data as Stats);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const number = (n: number) => n.toLocaleString(mr ? 'mr-IN' : 'en-IN');
  const money = (n: number) => new Intl.NumberFormat(mr ? 'mr-IN' : 'en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  // A card only links somewhere this admin's role can actually open.
  const canOpen = (path: string) => Boolean(role && sectionFor(path).roles.includes(role));

  const Card: React.FC<{ label: string; value: string; note?: string; to?: string; section?: string }> = ({ label, value, note, to, section }) => {
    const body = (
      <>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
        {note && <span className={styles.statNote}>{note}</span>}
      </>
    );
    return to && canOpen(section ?? 'users')
      ? <Link to={to} className={styles.statCard}>{body}</Link>
      : <div className={styles.statCard}>{body}</div>;
  };

  if (error && !stats) return <ErrorState error={error} onRetry={() => void load()} />;

  if (!stats) {
    return (
      <div aria-label={mr ? 'लोड होत आहे' : 'Loading'}>
        <Skeleton height={32} width="30%" borderRadius={8} />
        {slow && <SlowNetworkNotice />}
        <div className={styles.statGrid} style={{ marginTop: 18 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} height={88} borderRadius={12} />)}
        </div>
      </div>
    );
  }

  const inactive = Math.max(stats.total_users - stats.active, 0);
  const waiting = [
    { n: stats.pending_approvals, en: 'profiles waiting for approval', mr: 'प्रोफाइल मंजुरीच्या प्रतीक्षेत', to: '/admin/approvals', section: 'approvals' },
    { n: stats.pending_ids, en: 'ID documents to check', mr: 'ओळखपत्रे तपासायची', to: '/admin/verification', section: 'verification' },
    { n: stats.open_reports, en: 'fake profile reports open', mr: 'बनावट प्रोफाइल रिपोर्ट्स', to: '/admin/verification', section: 'verification' },
    { n: stats.open_inquiries, en: 'contact requests open', mr: 'संपर्क विनंत्या', to: '/admin/complaints', section: 'complaints' },
  ].filter((w) => w.n > 0 && canOpen(w.section));

  return (
    <div>
      <div className={styles.cardHead}>
        <div>
          <h1 className={styles.title}>{mr ? 'डॅशबोर्ड' : 'Dashboard'}</h1>
          <p className={styles.subtitle} style={{ marginBottom: 0 }}>
            {mr ? 'अद्ययावत' : 'Updated'} {new Date(stats.generated_at).toLocaleTimeString(mr ? 'mr-IN' : 'en-IN', { timeStyle: 'short' })}
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw size={15} />} disabled={loading} onClick={() => void load()}>
          {loading ? (mr ? 'ताजे होत आहे...' : 'Refreshing...') : (mr ? 'ताजे करा' : 'Refresh')}
        </Button>
      </div>

      <section className={styles.card} style={{ marginTop: 16 }}>
        <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>{mr ? 'आपले लक्ष हवे' : 'Needs your attention'}</h2>
        {waiting.length === 0 ? (
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, color: 'var(--color-ink-muted)' }}>
            <CheckCircle2 size={18} color="#15803D" />
            {mr ? 'सध्या काहीही प्रलंबित नाही.' : 'Nothing is waiting right now.'}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {waiting.map((w) => (
              <li key={w.en}>
                <Link to={w.to} className={styles.nameLink}>{number(w.n)} {mr ? w.mr : w.en}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>{mr ? 'सदस्य' : 'Members'}</h2>
      <div className={styles.statGrid}>
        <Card label={mr ? 'एकूण सदस्य' : 'Total users'} value={number(stats.total_users)} note={`${number(stats.new_last_7_days)} ${mr ? 'गेल्या ७ दिवसांत' : 'in the last 7 days'}`} to="/admin/users" />
        <Card label={mr ? 'वर' : 'Male'} value={number(stats.male)} to="/admin/users?gender=male" />
        <Card label={mr ? 'वधू' : 'Female'} value={number(stats.female)} to="/admin/users?gender=female" />
        <Card label={mr ? 'सक्रिय' : 'Active'} value={number(stats.active)} note={mr ? 'मंजूर व ब्लॉक नसलेले' : 'Approved and not blocked'} to="/admin/users?status=approved" />
        <Card label={mr ? 'निष्क्रिय' : 'Inactive'} value={number(inactive)} note={mr ? 'इतर सर्व' : 'Everyone else'} to="/admin/users?status=inactive" />
        <Card label={mr ? 'ब्लॉक केलेले' : 'Blocked'} value={number(stats.blocked)} to="/admin/users?status=blocked" />
        <Card label={mr ? 'मंजुरीच्या प्रतीक्षेत' : 'Pending approvals'} value={number(stats.pending_approvals)} to="/admin/approvals" section="approvals" />
      </div>

      {stats.revenue_total !== null && (
        <>
          <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>{mr ? 'उत्पन्न' : 'Revenue'}</h2>
          <div className={styles.statGrid}>
            <Card label={mr ? 'सशुल्क सदस्य' : 'Paid members'} value={number(stats.paid_members ?? 0)} />
            <Card label={mr ? 'एकूण उत्पन्न' : 'Total revenue'} value={money(stats.revenue_total)} />
            <Card label={mr ? 'या महिन्याचे उत्पन्न' : 'Revenue this month'} value={money(stats.revenue_this_month ?? 0)} />
          </div>
          {((stats.test_payments ?? 0) > 0 || (stats.test_members ?? 0) > 0) && (
            <p className={styles.muted}>
              {mr
                ? `चाचणी: ${number(stats.test_payments ?? 0)} पेमेंट्स व ${number(stats.test_members ?? 0)} सदस्य वरील आकड्यांत धरलेले नाहीत, कारण खरे पेमेंट अद्याप जोडलेले नाही.`
                : `Not counted above: ${number(stats.test_payments ?? 0)} test payments and ${number(stats.test_members ?? 0)} members on test plans, because real payments are not connected yet.`}
            </p>
          )}
        </>
      )}
    </div>
  );
};
