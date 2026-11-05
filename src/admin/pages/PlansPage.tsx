import React, { useCallback, useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { FormSelect } from '../../components/common/FormSelect';
import { FormTextarea } from '../../components/common/FormTextarea';
import { Modal } from '../../components/common/Modal';
import { describeError, EmptyState } from '../../components/states/UiStates';
import { AdminPlan, billingService, formatMoney } from '../../services/billing.service';
import { DataColumn, DataTable } from '../components/DataTable';
import styles from './adminPages.module.css';

interface Draft {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  price: string;
  discounted_price: string;
  duration_days: string;
  features: string;
  tier: string;
  sort_order: string;
  is_active: boolean;
}

const featureList = (features: unknown): string[] =>
  Array.isArray(features) ? features.filter((f): f is string => typeof f === 'string') : [];

const emptyDraft: Draft = { id: null, name: '', slug: '', description: '', price: '', discounted_price: '', duration_days: '', features: '', tier: '', sort_order: '0', is_active: true };

const TIERS = [
  { value: 'silver', en: 'Silver features', mr: 'सिल्व्हर सुविधा' },
  { value: 'diamond', en: 'Diamond features', mr: 'डायमंड सुविधा' },
  { value: 'platinum', en: 'Platinum features', mr: 'प्लॅटिनम सुविधा' },
];

export const PlansPage: React.FC = () => {
  const { language } = useLanguage();
  const { success } = useToast();
  const mr = language === 'mr';
  const [rows, setRows] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await billingService.listPlans());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const open = (plan?: AdminPlan) => {
    setDraft(plan ? {
      id: plan.id, name: plan.name, slug: plan.slug, description: plan.description ?? '', price: String(plan.price),
      discounted_price: plan.discounted_price === null ? '' : String(plan.discounted_price), duration_days: String(plan.duration_days),
      features: featureList(plan.features).join('\n'), tier: plan.tier ?? '', sort_order: String(plan.sort_order), is_active: plan.is_active,
    } : emptyDraft);
    setTouched(false);
    setFailure(null);
  };
  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const problems = (d: Draft) => {
    const price = Number(d.price);
    const offer = d.discounted_price === '' ? null : Number(d.discounted_price);
    const days = Number(d.duration_days);
    return {
      name: !d.name.trim() ? (mr ? 'नाव लिहा.' : 'Please give the plan a name.') : undefined,
      slug: !d.id && !/^[a-z0-9][a-z0-9-]{1,40}$/.test(d.slug.trim()) ? (mr ? 'फक्त लहान अक्षरे, अंक व डॅश.' : 'Use only small letters, numbers and dashes, at least 2 characters.') : undefined,
      price: d.price === '' || Number.isNaN(price) || price < 0 ? (mr ? 'योग्य किंमत टाका.' : 'Please enter a valid price.') : undefined,
      offer: offer !== null && (Number.isNaN(offer) || offer < 0 || offer > price) ? (mr ? 'सवलत किंमत मूळ किमतीपेक्षा जास्त नको.' : 'The offer price cannot be more than the price.') : undefined,
      days: !Number.isInteger(days) || days < 1 || days > 3650 ? (mr ? '१ ते ३६५० दिवस.' : 'Enter from 1 to 3650 days.') : undefined,
      tier: !d.tier ? (mr ? 'सुविधा निवडा.' : 'Please choose which features this plan unlocks.') : undefined,
    };
  };

  const save = async () => {
    if (!draft) return;
    setTouched(true);
    if (Object.values(problems(draft)).some(Boolean)) return;
    setBusy(true);
    setFailure(null);
    try {
      await billingService.savePlan(draft.id, {
        name: draft.name.trim(), slug: draft.slug.trim(), description: draft.description, price: Number(draft.price),
        discounted_price: draft.discounted_price === '' ? null : Number(draft.discounted_price), duration_days: Number(draft.duration_days),
        features: draft.features.split('\n').map((f) => f.trim()).filter(Boolean), tier: draft.tier,
        sort_order: Number(draft.sort_order) || 0, is_active: draft.is_active,
      });
      success(mr ? 'योजना जतन केली. नवीन खरेदीला लागू होईल; सध्याचे सदस्य बदलत नाहीत.' : 'Plan saved. It applies to new purchases; current subscribers are not affected.');
      setDraft(null);
      void load();
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

  const columns: DataColumn<AdminPlan>[] = [
    {
      key: 'name',
      header: mr ? 'योजना' : 'Plan',
      render: (r) => (
        <>
          <strong>{r.name}</strong>
          <div className={styles.muted}>{r.slug}{r.tier ? ` • ${r.tier}` : ''}</div>
        </>
      ),
    },
    {
      key: 'price',
      header: mr ? 'किंमत' : 'Price',
      render: (r) => (
        <>
          {formatMoney(r.discounted_price ?? r.price, 'INR', mr)}
          {r.discounted_price !== null && r.discounted_price !== r.price && <div className={styles.muted} style={{ textDecoration: 'line-through' }}>{formatMoney(r.price, 'INR', mr)}</div>}
        </>
      ),
    },
    { key: 'days', header: mr ? 'कालावधी' : 'Duration', render: (r) => `${r.duration_days} ${mr ? 'दिवस' : 'days'}` },
    { key: 'subs', header: mr ? 'सक्रिय सदस्य' : 'Active subscribers', render: (r) => r.active_subscribers },
    {
      key: 'status',
      header: mr ? 'स्थिती' : 'Status',
      render: (r) => (r.is_active
        ? <span className={`${styles.badge} ${styles.badgeGood}`}>{mr ? 'विक्रीसाठी' : 'On sale'}</span>
        : <span className={styles.badge}>{mr ? 'बंद' : 'Not on sale'}</span>),
    },
    { key: 'edit', header: '', width: '90px', render: (r) => <Button variant="outline" size="sm" onClick={() => open(r)}>{mr ? 'संपादित' : 'Edit'}</Button> },
  ];

  const issue = draft && touched ? problems(draft) : null;

  return (
    <div>
      <div className={styles.cardHead}>
        <div>
          <h1 className={styles.title}>{mr ? 'सदस्यता योजना' : 'Subscription Plans'}</h1>
          <p className={styles.subtitle} style={{ marginBottom: 0 }}>
            {mr ? 'किंमत बदलली तरी सध्याच्या सदस्यांवर परिणाम होत नाही.' : 'Changing a plan never affects people already subscribed to it.'}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => open()}>{mr ? 'नवीन योजना' : 'Add plan'}</Button>
      </div>

      <div style={{ marginTop: 16 }}>
        <DataTable
          caption={mr ? 'योजना' : 'Plans'}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          loading={loading}
          error={error}
          onRetry={() => void load()}
          page={0}
          pageSize={Math.max(rows.length, 1)}
          total={rows.length}
          onPageChange={() => undefined}
          empty={<EmptyState icon={<Crown size={30} />} title={mr ? 'अद्याप योजना नाहीत' : 'No plans yet'} description={mr ? 'पहिली योजना जोडा.' : 'Add the first plan to start selling memberships.'} action={{ label: mr ? 'योजना जोडा' : 'Add plan', onClick: () => open() }} />}
        />
      </div>

      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.id ? (mr ? 'योजना संपादित करा' : 'Edit plan') : (mr ? 'नवीन योजना' : 'Add plan')}>
        {draft && (
          <div style={{ display: 'grid', gap: 12 }}>
            <FormInput id="plan-name" label={mr ? 'नाव' : 'Name'} required maxLength={80} value={draft.name} error={issue?.name} onChange={(e) => set({ name: e.target.value })} />
            {!draft.id && (
              <FormInput id="plan-slug" label={mr ? 'वेब नाव (नंतर बदलत नाही)' : 'Web name (cannot change later)'} required maxLength={41} value={draft.slug} error={issue?.slug} helperText="festive-2026" onChange={(e) => set({ slug: e.target.value.toLowerCase() })} />
            )}
            <FormSelect id="plan-tier" label={mr ? 'कोणत्या सुविधा' : 'Features it unlocks'} required value={draft.tier} error={issue?.tier}
              placeholder={mr ? '-- निवडा --' : '-- Choose --'} onChange={(e) => set({ tier: e.target.value })}
              options={TIERS.map((t) => ({ value: t.value, label: mr ? t.mr : t.en }))} />
            <FormInput id="plan-price" label={mr ? 'किंमत (₹)' : 'Price (₹)'} required type="number" min={0} value={draft.price} error={issue?.price} onChange={(e) => set({ price: e.target.value })} />
            <FormInput id="plan-offer" label={mr ? 'सवलत किंमत (₹)' : 'Offer price (₹)'} type="number" min={0} value={draft.discounted_price} error={issue?.offer} onChange={(e) => set({ discounted_price: e.target.value })} />
            <FormInput id="plan-days" label={mr ? 'कालावधी (दिवस)' : 'Duration (days)'} required type="number" min={1} max={3650} value={draft.duration_days} error={issue?.days} onChange={(e) => set({ duration_days: e.target.value })} />
            <FormTextarea id="plan-description" label={mr ? 'वर्णन' : 'Description'} rows={2} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
            <FormTextarea id="plan-features" label={mr ? 'दिसणारे फायदे (प्रत्येक ओळीत एक)' : 'Benefits shown to members (one per line)'} rows={5} value={draft.features} onChange={(e) => set({ features: e.target.value })} />
            <FormInput id="plan-order" label={mr ? 'क्रम' : 'Display order'} type="number" value={draft.sort_order} onChange={(e) => set({ sort_order: e.target.value })} />
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={draft.is_active} onChange={(e) => set({ is_active: e.target.checked })} />
              {mr ? 'विक्रीसाठी उपलब्ध' : 'On sale to members'}
            </label>
            {failure && <p role="alert" className={styles.formError}>{failure}</p>}
            <div className={styles.formActions} style={{ marginTop: 0 }}>
              <Button variant="primary" size="sm" disabled={busy} onClick={() => void save()}>{busy ? (mr ? 'जतन होत आहे...' : 'Saving...') : (mr ? 'जतन करा' : 'Save plan')}</Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => setDraft(null)}>{mr ? 'रद्द करा' : 'Cancel'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
