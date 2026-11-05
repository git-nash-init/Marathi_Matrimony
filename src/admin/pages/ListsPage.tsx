import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ListChecks } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { Modal } from '../../components/common/Modal';
import { describeError, EmptyState, UploadProgress } from '../../components/states/UiStates';
import { LookupKind, LookupRow, lookupsService } from '../../services/lookups.service';
import { useAdminSession } from '../adminAccess';
import { DataColumn, DataTable } from '../components/DataTable';
import styles from './adminPages.module.css';

const KINDS: { key: LookupKind; en: string; mr: string }[] = [
  { key: 'community', en: 'Castes', mr: 'जाती' },
  { key: 'gotra', en: 'Gotra', mr: 'गोत्र' },
  { key: 'kuldaivat', en: 'Kuldaivat', mr: 'कुलदैवत' },
  { key: 'rashi', en: 'Rashi', mr: 'रास' },
  { key: 'nakshatra', en: 'Nakshatra', mr: 'नक्षत्र' },
];

const BATCH = 1000;

/** Reads "district,taluka,village[,village in Marathi]". Handles quoted cells and a header row. */
export const parseVillageCsv = (text: string): Record<string, string>[] => {
  const cells = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const c = line[i];
      if (c === '"' && quoted && line[i + 1] === '"') { cur += '"'; i += 1; }
      else if (c === '"') quoted = !quoted;
      else if (c === ',' && !quoted) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const rows = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim()).map(cells);
  if (rows[0]?.[0]?.toLowerCase() === 'district') rows.shift();
  return rows.map(([district, taluka, village, village_mr]) => ({ district, taluka, village, village_mr: village_mr ?? '' }));
};

export const ListsPage: React.FC = () => {
  const { language } = useLanguage();
  const { success } = useToast();
  const { role } = useAdminSession();
  const mr = language === 'mr';
  const canEdit = role === 'super_admin' || role === 'admin';

  const [kind, setKind] = useState<LookupKind>('community');
  const [rows, setRows] = useState<LookupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [summary, setSummary] = useState<{ districts: number; talukas: number; villages: number } | null>(null);

  const [editing, setEditing] = useState<Partial<LookupRow> | null>(null);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const [progress, setProgress] = useState<number | null>(null);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; unknown: string[] } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await lookupsService.adminList(kind));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  const loadSummary = useCallback(() => {
    lookupsService.locationSummary().then(setSummary).catch(() => setSummary(null));
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  const failureText = (err: unknown) => {
    const message = (err as { message?: string })?.message;
    if ((err as { code?: string })?.code === '22023' && message) return message;
    const generic = describeError(err, language);
    return `${generic.what} ${generic.fix}`;
  };

  const save = async (row: Partial<LookupRow>, done: string) => {
    setBusy(true);
    setFailure(null);
    try {
      await lookupsService.adminSave({
        id: row.id, kind, label_en: row.label_en ?? '', label_mr: row.label_mr ?? '',
        sort_order: row.sort_order ?? rows.length + 1, is_active: row.is_active ?? true,
      });
      success(done);
      setEditing(null);
      void load();
    } catch (err) {
      setFailure(failureText(err));
    } finally {
      setBusy(false);
    }
  };

  const importFile = async (file: File) => {
    setImportResult(null);
    setImportError(null);
    if (file.size > 20 * 1024 * 1024) {
      setImportError(mr ? 'फाइल २० MB पेक्षा लहान हवी.' : 'The file must be smaller than 20 MB.');
      return;
    }
    const parsed = parseVillageCsv(await file.text());
    if (parsed.length === 0 || !parsed[0].village) {
      setImportError(mr ? 'फाइल वाचता आली नाही. स्तंभ असे हवेत: district, taluka, village.' : 'This file could not be read. The columns must be: district, taluka, village.');
      return;
    }
    let added = 0;
    let skipped = 0;
    const unknown = new Set<string>();
    setProgress(0);
    try {
      for (let i = 0; i < parsed.length; i += BATCH) {
        const res = await lookupsService.importVillages(parsed.slice(i, i + BATCH));
        added += res.added;
        skipped += res.skipped;
        res.unknown.forEach((u) => unknown.add(u));
        setProgress(Math.round(((i + BATCH) / parsed.length) * 100));
      }
      setImportResult({ added, skipped, unknown: [...unknown] });
      loadSummary();
    } catch (err) {
      setImportError(`${failureText(err)} ${mr ? `आतापर्यंत ${added} गावे जोडली; फाइल पुन्हा अपलोड केल्यास तीच गावे दुबार होणार नाहीत.` : `${added} villages were added before this. Uploading the file again will not duplicate them.`}`);
    } finally {
      setProgress(null);
    }
  };

  const columns: DataColumn<LookupRow>[] = [
    { key: 'en', header: 'English', render: (r) => r.label_en },
    { key: 'mr', header: 'मराठी', render: (r) => r.label_mr },
    {
      key: 'status',
      header: mr ? 'स्थिती' : 'Status',
      render: (r) => (r.is_active
        ? <span className={`${styles.badge} ${styles.badgeGood}`}>{mr ? 'सक्रिय' : 'Active'}</span>
        : <span className={styles.badge}>{mr ? 'लपवलेले' : 'Hidden'}</span>),
    },
    {
      key: 'actions',
      header: '',
      width: '190px',
      render: (r) => (canEdit ? (
        <span style={{ display: 'flex', gap: 6 }}>
          <Button variant="outline" size="sm" onClick={() => { setEditing(r); setTouched(false); setFailure(null); }}>{mr ? 'संपादित' : 'Edit'}</Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void save({ ...r, is_active: !r.is_active }, r.is_active
              ? (mr ? 'लपवले. विद्यमान प्रोफाइल्स बदलत नाहीत.' : 'Hidden from forms. Existing profiles keep this value.')
              : (mr ? 'पुन्हा दिसेल.' : 'Back on the forms.'))}
          >
            {r.is_active ? (mr ? 'लपवा' : 'Hide') : (mr ? 'दाखवा' : 'Show')}
          </Button>
        </span>
      ) : null),
    },
  ];

  const kindLabel = KINDS.find((k) => k.key === kind);
  const enError = touched && !editing?.label_en?.trim() ? (mr ? 'इंग्रजी नाव लिहा.' : 'Please enter the English name.') : undefined;
  const mrError = touched && !editing?.label_mr?.trim() ? (mr ? 'मराठी नाव लिहा.' : 'Please enter the Marathi name.') : undefined;

  return (
    <div>
      <Link to="/admin/settings" className={styles.backLink}><ArrowLeft size={15} /> {mr ? 'सेटिंग्ज' : 'Settings'}</Link>
      <h1 className={styles.title}>{mr ? 'याद्या व ठिकाणे' : 'Lists and locations'}</h1>
      <p className={styles.subtitle}>{mr ? 'प्रोफाइल फॉर्ममध्ये दिसणारे पर्याय.' : 'The choices members see on the profile form.'}</p>

      <div className={styles.tabs} role="tablist">
        {KINDS.map((k) => (
          <button key={k.key} type="button" role="tab" aria-selected={kind === k.key}
            className={`${styles.tab} ${kind === k.key ? styles.tabActive : ''}`} onClick={() => setKind(k.key)}>
            {mr ? k.mr : k.en}
          </button>
        ))}
      </div>

      {canEdit && (
        <div className={styles.toolbar}>
          <Button variant="primary" size="sm" onClick={() => { setEditing({}); setTouched(false); setFailure(null); }}>
            {mr ? 'नवीन नोंद' : 'Add entry'}
          </Button>
        </div>
      )}

      <DataTable
        caption={kindLabel ? (mr ? kindLabel.mr : kindLabel.en) : ''}
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
        empty={
          <EmptyState
            icon={<ListChecks size={30} />}
            title={mr ? 'ही यादी रिकामी आहे' : 'This list is empty'}
            description={mr ? 'नोंद जोडेपर्यंत सदस्य येथे स्वतः मजकूर लिहू शकतात.' : 'Until you add entries, members can type this in themselves.'}
            action={canEdit ? { label: mr ? 'पहिली नोंद जोडा' : 'Add the first entry', onClick: () => { setEditing({}); setTouched(false); } } : undefined}
          />
        }
      />

      <section className={styles.card} style={{ marginTop: 20 }}>
        <h2 className={styles.cardTitle}>{mr ? 'जिल्हे, तालुके व गावे' : 'Districts, talukas and villages'}</h2>
        {summary && (
          <p className={styles.muted}>
            {summary.districts} {mr ? 'जिल्हे' : 'districts'} • {summary.talukas} {mr ? 'तालुके' : 'talukas'} • {summary.villages} {mr ? 'गावे' : 'villages'}
          </p>
        )}
        {summary?.villages === 0 && (
          <p className={styles.notice}>
            {mr
              ? 'गावांची यादी अद्याप आयात केलेली नाही. तोपर्यंत सदस्य गावाचे नाव स्वतः लिहितात.'
              : 'The village list has not been imported yet. Until it is, members type their village name themselves.'}
          </p>
        )}
        {canEdit && (
          <>
            <label htmlFor="village-csv" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: 4 }}>
              {mr ? 'गावांची CSV फाइल (district, taluka, village, मराठी नाव)' : 'Village CSV file (district, taluka, village, Marathi name)'}
            </label>
            <input
              id="village-csv"
              type="file"
              accept=".csv,text/csv"
              disabled={progress !== null}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void importFile(f); e.target.value = ''; }}
            />
            {progress !== null && <div style={{ marginTop: 10 }}><UploadProgress percent={Math.min(progress, 100)} /></div>}
            {importError && <p role="alert" className={styles.formError}>{importError}</p>}
            {importResult && (
              <p role="status" style={{ marginTop: 10, fontSize: '0.9rem' }}>
                {mr ? `${importResult.added} गावे जोडली` : `${importResult.added} villages added`}
                {importResult.skipped > 0 && (mr ? `, ${importResult.skipped} ओळी वगळल्या` : `, ${importResult.skipped} rows skipped`)}
                {importResult.unknown.length > 0 && ` (${mr ? 'अज्ञात जिल्हे' : 'unknown districts'}: ${importResult.unknown.join(', ')})`}.
              </p>
            )}
          </>
        )}
      </section>

      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? (mr ? 'नोंद संपादित करा' : 'Edit entry') : (mr ? 'नवीन नोंद' : 'Add entry')}>
        <div style={{ display: 'grid', gap: 12 }}>
          <FormInput id="lookup-en" label="English" required maxLength={100} value={editing?.label_en ?? ''} error={enError}
            onChange={(e) => setEditing((c) => ({ ...c, label_en: e.target.value }))} />
          <FormInput id="lookup-mr" label="मराठी" required maxLength={100} value={editing?.label_mr ?? ''} error={mrError}
            onChange={(e) => setEditing((c) => ({ ...c, label_mr: e.target.value }))} />
        </div>
        {failure && <p role="alert" className={styles.formError}>{failure}</p>}
        <div className={styles.formActions}>
          <Button
            variant="primary"
            size="sm"
            disabled={busy}
            onClick={() => {
              setTouched(true);
              if (!editing?.label_en?.trim() || !editing?.label_mr?.trim()) return;
              void save(editing, mr ? 'जतन केले. फॉर्ममध्ये लगेच दिसेल.' : 'Saved. It appears on the form straight away.');
            }}
          >
            {busy ? (mr ? 'जतन होत आहे...' : 'Saving...') : (mr ? 'जतन करा' : 'Save')}
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => setEditing(null)}>{mr ? 'रद्द करा' : 'Cancel'}</Button>
        </div>
      </Modal>
    </div>
  );
};
