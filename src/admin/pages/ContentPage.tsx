import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormTextarea } from '../../components/common/FormTextarea';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { describeError, ErrorState, NoResults } from '../../components/states/UiStates';
import { ContentRow, contentService, EDITABLE_SECTIONS, listSlots, Slot } from '../../services/content.service';
import styles from './adminPages.module.css';

export const ContentPage: React.FC = () => {
  const { language } = useLanguage();
  const { success } = useToast();
  const mr = language === 'mr';
  const slots = useMemo(listSlots, []);
  const [rows, setRows] = useState<Record<string, ContentRow>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [section, setSection] = useState(EDITABLE_SECTIONS[0].key);
  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState<Slot | null>(null);
  const [en, setEn] = useState('');
  const [marathi, setMarathi] = useState('');
  const [touched, setTouched] = useState(false);
  const [history, setHistory] = useState<{ id: string; en: string | null; mr: string | null; created_at: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await contentService.list();
      setRows(Object.fromEntries(list.map((r) => [r.key, r])));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const open = (slot: Slot) => {
    const row = rows[slot.key];
    setEditing(slot);
    setEn(row?.draft_en ?? row?.en ?? slot.en);
    setMarathi(row?.draft_mr ?? row?.mr ?? slot.mr);
    setTouched(false);
    setFailure(null);
    setHistory(null);
    contentService.history(slot.key).then(setHistory).catch(() => setHistory([]));
  };

  const failureText = (err: unknown) => {
    const message = (err as { message?: string })?.message;
    if ((err as { code?: string })?.code === '22023' && message) return message;
    const generic = describeError(err, language);
    return `${generic.what} ${generic.fix}`;
  };

  const linkError = editing?.isLink && en.trim() && !/^https:\/\/\S+$/i.test(en.trim())
    ? (mr ? 'दुवा https:// ने सुरू व्हायला हवा.' : 'A link must start with https://') : undefined;
  const emptyError = touched && !en.trim() && !marathi.trim()
    ? (mr ? 'किमान एका भाषेत मजकूर लिहा.' : 'Please enter the text in at least one language.') : undefined;

  const run = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setFailure(null);
    try {
      await work();
      success(done);
      setEditing(null);
      void load();
    } catch (err) {
      setFailure(failureText(err));
    } finally {
      setBusy(false);
    }
  };

  const valid = () => {
    setTouched(true);
    return Boolean((en.trim() || marathi.trim()) && !linkError);
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString(mr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const q = search.trim().toLowerCase();
  const visible = slots.filter((s) => (q
    ? [s.key, s.en, s.mr, rows[s.key]?.en, rows[s.key]?.mr].some((v) => v?.toLowerCase().includes(q))
    : s.section === section));

  if (error) return <ErrorState error={error} onRetry={() => void load()} />;

  return (
    <div>
      <h1 className={styles.title}>{mr ? 'वेबसाइट मजकूर' : 'Website Content'}</h1>
      <p className={styles.subtitle}>
        {mr
          ? 'बदल आधी मसुदा म्हणून जतन होतो, प्रकाशित केल्यावरच सर्वांना दिसतो. जुना मजकूर परत आणता येतो.'
          : 'A change is saved as a draft, and visitors only see it once you publish. Earlier text can always be brought back.'}
      </p>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <input className={styles.input} type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={mr ? 'सर्व मजकुरात शोधा' : 'Search all text'} aria-label={mr ? 'मजकूर शोधा' : 'Search text'} />
        </div>
        <select className={styles.select} value={section} disabled={Boolean(q)} aria-label={mr ? 'विभाग' : 'Section'} onChange={(e) => setSection(e.target.value)}>
          {EDITABLE_SECTIONS.map((s) => <option key={s.key} value={s.key}>{mr ? s.mr : s.en}</option>)}
        </select>
      </div>

      {loading && Object.keys(rows).length === 0 ? (
        <div style={{ display: 'grid', gap: 8 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={64} borderRadius={10} />)}</div>
      ) : visible.length === 0 ? (
        <NoResults query={search.trim()} onClear={() => setSearch('')} />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {visible.map((slot) => {
            const row = rows[slot.key];
            const live = (mr ? row?.mr : row?.en) || (mr ? slot.mr : slot.en);
            const hasDraft = Boolean(row && (row.draft_en !== null || row.draft_mr !== null));
            const changed = Boolean(row && (row.en || row.mr));
            return (
              <div key={slot.key} className={styles.card} style={{ marginBottom: 0, padding: 12, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', overflowWrap: 'anywhere' }}>{live.length > 180 ? `${live.slice(0, 180)}…` : live}</div>
                  <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {hasDraft && <span className={`${styles.badge} ${styles.badgeWarn}`}>{mr ? 'मसुदा' : 'Draft waiting'}</span>}
                    {changed && <span className={`${styles.badge} ${styles.badgeInfo}`}>{mr ? 'बदललेले' : 'Edited'}</span>}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => open(slot)}>{mr ? 'संपादित' : 'Edit'}</Button>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={mr ? 'मजकूर संपादित करा' : 'Edit text'}>
        {editing && (
          <div>
            <div style={{ display: 'grid', gap: 12 }}>
              <FormTextarea id="content-en" label="English" rows={4} value={en} error={linkError ?? emptyError} onChange={(e) => setEn(e.target.value)} />
              {!editing.isLink && <FormTextarea id="content-mr" label="मराठी" rows={4} value={marathi} onChange={(e) => setMarathi(e.target.value)} />}
            </div>
            <p className={styles.muted} style={{ marginBottom: 0 }}>
              {mr ? 'मूळ मजकूर' : 'Original text'}: {mr ? editing.mr : editing.en}
            </p>
            {failure && <p role="alert" className={styles.formError}>{failure}</p>}
            <div className={styles.formActions}>
              <Button
                variant="primary"
                size="sm"
                disabled={busy}
                onClick={() => {
                  if (!valid()) return;
                  const slot = editing;
                  void run(async () => {
                    await contentService.saveDraft(slot.key, en.trim(), (slot.isLink ? en : marathi).trim());
                    await contentService.publish(slot.key);
                  }, mr ? 'प्रकाशित केले. पुढील भेटीपासून सर्वांना दिसेल.' : 'Published. Visitors see it the next time a page loads.');
                }}
              >
                {busy ? (mr ? 'प्रकाशित होत आहे...' : 'Publishing...') : (mr ? 'प्रकाशित करा' : 'Publish')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => {
                  if (!valid()) return;
                  const slot = editing;
                  void run(() => contentService.saveDraft(slot.key, en.trim(), (slot.isLink ? en : marathi).trim()),
                    mr ? 'मसुदा जतन केला. अजून कोणालाही दिसत नाही.' : 'Draft saved. Nobody else can see it yet.');
                }}
              >
                {mr ? 'मसुदा जतन करा' : 'Save draft'}
              </Button>
              {rows[editing.key] && (rows[editing.key].en || rows[editing.key].mr) && (
                <Button variant="outline" size="sm" disabled={busy}
                  onClick={() => { const slot = editing; void run(() => contentService.reset(slot.key), mr ? 'मूळ मजकूर परत आला.' : 'Back to the original text.'); }}>
                  {mr ? 'मूळ मजकूर वापरा' : 'Use original'}
                </Button>
              )}
            </div>

            {history && history.length > 0 && (
              <section style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: '0.95rem', margin: '0 0 8px' }}>{mr ? 'जुन्या आवृत्त्या' : 'Earlier versions'}</h3>
                <ul className={styles.history}>
                  {history.map((h) => (
                    <li key={h.id}>
                      <div className={styles.muted}>{fmt(h.created_at)}</div>
                      <div>{(mr ? h.mr : h.en) || (mr ? 'मूळ मजकूर' : 'Original text')}</div>
                      <button type="button" className={styles.nameLink} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        onClick={() => { setEn(h.en ?? editing.en); setMarathi(h.mr ?? editing.mr); }}>
                        {mr ? 'ही आवृत्ती वापरा' : 'Use this version'}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
