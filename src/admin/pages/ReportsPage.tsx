import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState, SlowNetworkNotice } from '../../components/states/UiStates';
import { useSlowNetwork } from '../../hooks/useNetworkStatus';
import { formatMoney } from '../../services/billing.service';
import { exportReportExcel, exportReportPdf, ReportData } from '../reportExport';
import styles from './adminPages.module.css';

const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);

/** India calendar date, however far the admin's computer is from India. */
const istDate = (offsetDays = 0) => {
  const now = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
};

// Passes the palette check for a single series; the darker brand red is below the lightness floor for marks.
const MARK = 'var(--color-vermilion)';

interface Point { label: string; value: number; display: string }

const ChartFrame: React.FC<{ title: string; note?: string; points: Point[]; empty: string; children: React.ReactNode; mr: boolean; valueHeader: string }> = ({ title, note, points, empty, children, mr, valueHeader }) => {
  const [asTable, setAsTable] = useState(false);
  const hasData = points.some((p) => p.value > 0);
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>{title}</h2>
          {note && <div className={styles.muted}>{note}</div>}
        </div>
        {hasData && (
          <button type="button" className={styles.nameLink} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.84rem' }} onClick={() => setAsTable((v) => !v)}>
            {asTable ? (mr ? 'आलेख दाखवा' : 'Show chart') : (mr ? 'तक्ता दाखवा' : 'Show table')}
          </button>
        )}
      </div>
      {!hasData ? (
        <p className={styles.muted} style={{ margin: 0 }}>{empty}</p>
      ) : asTable ? (
        <div style={{ maxHeight: 260, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead><tr><th scope="col" style={{ textAlign: 'left' }}>{mr ? 'कालावधी' : 'Period'}</th><th scope="col" style={{ textAlign: 'right' }}>{valueHeader}</th></tr></thead>
            <tbody>{points.map((p) => <tr key={p.label}><td>{p.label}</td><td style={{ textAlign: 'right' }}>{p.display}</td></tr>)}</tbody>
          </table>
        </div>
      ) : children}
    </section>
  );
};

const AxisEnds: React.FC<{ points: Point[] }> = ({ points }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--color-ink-muted)', marginTop: 4 }}>
    <span>{points[0]?.label}</span>
    {points.length > 1 && <span>{points[points.length - 1]?.label}</span>}
  </div>
);

const Tooltip: React.FC<{ point: Point | null; xPercent: number }> = ({ point, xPercent }) => (point ? (
  <div role="status" style={{ position: 'absolute', top: 0, left: `${Math.min(Math.max(xPercent, 12), 88)}%`, transform: 'translateX(-50%)', background: 'var(--color-ink)', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: '0.76rem', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 1 }}>
    {point.label}: {point.display}
  </div>
) : null);

const Bars: React.FC<{ points: Point[] }> = ({ points }) => {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <>
      <div style={{ position: 'relative', height: 170 }} onMouseLeave={() => setActive(null)}>
        <Tooltip point={active === null ? null : points[active]} xPercent={active === null ? 0 : ((active + 0.5) / points.length) * 100} />
        <span style={{ position: 'absolute', top: 0, left: 0, fontSize: '0.74rem', color: 'var(--color-ink-muted)' }}>{points.reduce((top, p) => (p.value > top.value ? p : top), points[0])?.display}</span>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: '100%', borderBottom: '1px solid var(--color-border)' }}>
          {points.map((p, i) => (
            // The hit area is the full column, so a very short bar is still easy to hover.
            <div key={p.label} tabIndex={0} aria-label={`${p.label}: ${p.display}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
              style={{ flex: '1 1 0', minWidth: 0, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', outline: 'none' }}>
              <div style={{ width: '100%', maxWidth: 44, height: p.value > 0 ? `max(3px, ${(p.value / max) * 88}%)` : 0, background: MARK, borderRadius: '4px 4px 0 0', opacity: active === null || active === i ? 1 : 0.55 }} />
            </div>
          ))}
        </div>
      </div>
      <AxisEnds points={points} />
    </>
  );
};

const Line: React.FC<{ points: Point[] }> = ({ points }) => {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...points.map((p) => p.value), 1);
  const x = (i: number) => (points.length === 1 ? 50 : (i / (points.length - 1)) * 100);
  const y = (v: number) => 96 - (v / max) * 84;
  return (
    <>
      <div style={{ position: 'relative', height: 170, borderBottom: '1px solid var(--color-border)' }} onMouseLeave={() => setActive(null)}>
        <Tooltip point={active === null ? null : points[active]} xPercent={active === null ? 0 : x(active)} />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true" style={{ display: 'block' }}>
          <polyline fill="none" stroke={MARK} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"
            points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')} />
          {active !== null && <line x1={x(active)} x2={x(active)} y1="0" y2="100" stroke="var(--color-border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {points.map((p, i) => (
            <div key={p.label} tabIndex={0} aria-label={`${p.label}: ${p.display}`} style={{ flex: 1, outline: 'none' }} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} />
          ))}
        </div>
      </div>
      <AxisEnds points={points} />
    </>
  );
};

export const ReportsPage: React.FC = () => {
  const { language } = useLanguage();
  const { success, error: toastError } = useToast();
  const mr = language === 'mr';
  const [from, setFrom] = useState(() => istDate(-180));
  const [to, setTo] = useState(() => istDate());
  const [preset, setPreset] = useState('180');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const slow = useSlowNetwork(loading);

  const rangeError = from && to && from > to ? (mr ? 'सुरुवात शेवटाआधी हवी.' : 'The start date must be before the end date.') : undefined;

  const load = useCallback(async () => {
    if (!from || !to || from > to) return;
    setLoading(true);
    const { data: res, error: e } = await rpc('admin_reports', { p_from: from, p_to: to });
    if (e) setError(e);
    else {
      setData(res as ReportData);
      setError(null);
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => { void load(); }, [load]);

  const choose = (days: string) => {
    setPreset(days);
    if (days !== 'custom') {
      setFrom(istDate(-Number(days)));
      setTo(istDate());
    }
  };

  const num = (n: number) => n.toLocaleString(mr ? 'mr-IN' : 'en-IN');
  const monthLabel = (ym: string) => new Date(`${ym}-01T00:00:00`).toLocaleDateString(mr ? 'mr-IN' : 'en-IN', { month: 'short', year: 'numeric' });
  const dayLabel = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString(mr ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short' });

  const charts = useMemo(() => {
    if (!data) return null;
    return {
      daily: data.daily_registrations.map((d) => ({ label: dayLabel(d.day), value: d.count, display: num(d.count) })),
      monthlyReg: data.monthly.map((m) => ({ label: monthLabel(m.month), value: m.registrations, display: num(m.registrations) })),
      revenue: data.monthly.map((m) => ({ label: monthLabel(m.month), value: Number(m.revenue), display: formatMoney(Number(m.revenue), 'INR', mr) })),
      growth: data.monthly.map((m) => ({ label: monthLabel(m.month), value: m.total_users, display: num(m.total_users) })),
    };
    // Labels depend only on the data and language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mr]);

  const runExport = async (format: 'excel' | 'pdf') => {
    if (!data) return;
    setExporting(format);
    try {
      // Logged first: if the log cannot be written, the export does not happen.
      const { error: e } = await rpc('admin_log_export', { p_format: format, p_from: from, p_to: to });
      if (e) throw e;
      if (format === 'excel') await exportReportExcel(data);
      else await exportReportPdf(data);
      success(mr ? 'डाउनलोड झाले.' : 'Downloaded. Keep this file private, as it is business data.');
    } catch {
      toastError(mr ? 'फाइल तयार झाली नाही. पुन्हा प्रयत्न करा.' : 'The file could not be created. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  if (error && !data) return <ErrorState error={error} onRetry={() => void load()} />;

  const testSales = data?.subscription_sales.reduce((a, s) => a + s.test_sold, 0) ?? 0;

  return (
    <div>
      <div className={styles.cardHead}>
        <div>
          <h1 className={styles.title}>{mr ? 'अहवाल' : 'Reports'}</h1>
          <p className={styles.subtitle} style={{ marginBottom: 0 }}>{mr ? 'सर्व दिनांक भारतीय वेळेनुसार. चाचणी पेमेंट्स उत्पन्नात धरलेली नाहीत.' : 'All dates are India time. Test payments are not counted as revenue.'}</p>
        </div>
        <span style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" icon={<Download size={15} />} disabled={!data || Boolean(exporting)} onClick={() => void runExport('excel')}>{exporting === 'excel' ? (mr ? 'तयार होत आहे...' : 'Preparing...') : 'Excel'}</Button>
          <Button variant="outline" size="sm" icon={<Download size={15} />} disabled={!data || Boolean(exporting)} onClick={() => void runExport('pdf')}>{exporting === 'pdf' ? (mr ? 'तयार होत आहे...' : 'Preparing...') : 'PDF'}</Button>
        </span>
      </div>

      <div className={styles.toolbar} style={{ marginTop: 14, alignItems: 'flex-start' }}>
        <select className={styles.select} value={preset} aria-label={mr ? 'कालावधी' : 'Period'} onChange={(e) => choose(e.target.value)}>
          <option value="30">{mr ? 'गेले ३० दिवस' : 'Last 30 days'}</option>
          <option value="90">{mr ? 'गेले ९० दिवस' : 'Last 90 days'}</option>
          <option value="180">{mr ? 'गेले ६ महिने' : 'Last 6 months'}</option>
          <option value="365">{mr ? 'गेले वर्ष' : 'Last year'}</option>
          <option value="custom">{mr ? 'तारखा निवडा' : 'Choose dates'}</option>
        </select>
        {preset === 'custom' && (
          <>
            <FormInput id="report-from" label={mr ? 'पासून' : 'From'} type="date" value={from} error={rangeError} onChange={(e) => setFrom(e.target.value)} />
            <FormInput id="report-to" label={mr ? 'पर्यंत' : 'To'} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        )}
      </div>

      {slow && <SlowNetworkNotice />}

      {!data || !charts ? (
        <div style={{ display: 'grid', gap: 12 }} aria-label={mr ? 'लोड होत आहे' : 'Loading'}>
          <Skeleton height={230} borderRadius={14} />
          <Skeleton height={230} borderRadius={14} />
        </div>
      ) : (
        <div style={{ opacity: loading ? 0.6 : 1 }}>
          <ChartFrame mr={mr} valueHeader={mr ? 'नोंदणी' : 'Registrations'} title={mr ? 'दैनंदिन नोंदणी' : 'Daily registrations'} note={data.daily_registrations.length >= 90 ? (mr ? 'शेवटचे ९० दिवस' : 'The most recent 90 days') : undefined} points={charts.daily} empty={mr ? 'या काळात नोंदणी नाही.' : 'No registrations in this period.'}>
            <Bars points={charts.daily} />
          </ChartFrame>
          <ChartFrame mr={mr} valueHeader={mr ? 'नोंदणी' : 'Registrations'} title={mr ? 'मासिक नोंदणी' : 'Monthly registrations'} points={charts.monthlyReg} empty={mr ? 'या काळात नोंदणी नाही.' : 'No registrations in this period.'}>
            <Bars points={charts.monthlyReg} />
          </ChartFrame>
          <ChartFrame mr={mr} valueHeader={mr ? 'उत्पन्न' : 'Revenue'} title={mr ? 'मासिक उत्पन्न' : 'Monthly revenue'} points={charts.revenue} empty={mr ? 'अद्याप खरे उत्पन्न नाही. खरे पेमेंट जोडल्यानंतर येथे दिसेल.' : 'No real revenue yet. It appears here once real payments are connected.'}>
            <Bars points={charts.revenue} />
          </ChartFrame>
          <ChartFrame mr={mr} valueHeader={mr ? 'एकूण सदस्य' : 'Total users'} title={mr ? 'सदस्य वाढ' : 'User growth'} note={mr ? 'प्रत्येक महिन्याअखेरचे एकूण सदस्य' : 'Total members at the end of each month'} points={charts.growth} empty={mr ? 'अद्याप सदस्य नाहीत.' : 'No members yet.'}>
            <Line points={charts.growth} />
          </ChartFrame>

          <section className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>{mr ? 'सदस्यता विक्री' : 'Subscription sales'}</h2>
            {data.subscription_sales.length === 0 ? (
              <p className={styles.muted} style={{ margin: 0 }}>{mr ? 'या काळात विक्री नाही.' : 'No sales in this period.'}</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead><tr>
                  <th scope="col" style={{ textAlign: 'left' }}>{mr ? 'योजना' : 'Plan'}</th>
                  <th scope="col" style={{ textAlign: 'right' }}>{mr ? 'विक्री' : 'Sold'}</th>
                  <th scope="col" style={{ textAlign: 'right' }}>{mr ? 'रक्कम' : 'Amount'}</th>
                  {testSales > 0 && <th scope="col" style={{ textAlign: 'right' }}>{mr ? 'चाचणी' : 'Test'}</th>}
                </tr></thead>
                <tbody>{data.subscription_sales.map((s) => (
                  <tr key={s.plan}>
                    <td>{s.plan}</td>
                    <td style={{ textAlign: 'right' }}>{num(s.sold)}</td>
                    <td style={{ textAlign: 'right' }}>{formatMoney(Number(s.amount), 'INR', mr)}</td>
                    {testSales > 0 && <td style={{ textAlign: 'right' }}>{num(s.test_sold)}</td>}
                  </tr>
                ))}</tbody>
              </table>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 10 }}>{mr ? 'सर्वाधिक पाहिलेल्या प्रोफाइल्स' : 'Most viewed profiles'}</h2>
            {data.most_viewed.length === 0 ? (
              <p className={styles.muted} style={{ margin: 0 }}>{mr ? 'या काळात भेटी नाहीत.' : 'No profile visits in this period.'}</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead><tr>
                  <th scope="col" style={{ textAlign: 'left' }}>{mr ? 'आयडी' : 'Member ID'}</th>
                  <th scope="col" style={{ textAlign: 'left' }}>{mr ? 'शहर' : 'City'}</th>
                  <th scope="col" style={{ textAlign: 'right' }}>{mr ? 'भेटी' : 'Views'}</th>
                </tr></thead>
                <tbody>{data.most_viewed.map((v) => (
                  <tr key={v.user_id}>
                    <td><Link to={`/admin/users/${v.user_id}`} className={styles.nameLink}>{v.profile_code ?? '—'}</Link></td>
                    <td>{v.city ?? '—'}</td>
                    <td style={{ textAlign: 'right' }}>{num(v.views)}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {!data && !loading && !error && (
        <p className={styles.muted}><BarChart3 size={15} /> {mr ? 'कालावधी निवडा.' : 'Choose a period.'}</p>
      )}
    </div>
  );
};
