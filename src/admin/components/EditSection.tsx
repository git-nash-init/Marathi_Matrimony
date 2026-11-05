import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { FormSelect } from '../../components/common/FormSelect';
import { FormTextarea } from '../../components/common/FormTextarea';
import { describeError } from '../../components/states/UiStates';
import styles from '../pages/adminPages.module.css';

export interface EditField {
  key: string;
  en: string;
  mr: string;
  type?: 'text' | 'number' | 'date' | 'email' | 'tel' | 'select' | 'textarea' | 'list';
  options?: { value: string; en: string; mr: string }[];
  required?: boolean;
  min?: number;
  max?: number;
  /** Shown read-only, never sent. */
  readOnly?: boolean;
  /** Returns an error message, or null when the value is fine. */
  validate?: (value: unknown, all: Record<string, unknown>, mr: boolean) => string | null;
}

const toText = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
};

const toValue = (text: string, field: EditField): unknown => {
  const trimmed = text.trim();
  if (field.type === 'list') return trimmed ? trimmed.split(',').map((s) => s.trim()).filter(Boolean) : [];
  if (!trimmed) return null;
  if (field.type === 'number') return Number(trimmed);
  return trimmed;
};

/** One card of facts with an Edit button. Sends only what changed and checks each field as you go. */
export const EditSection: React.FC<{
  title: string;
  fields: EditField[];
  values: Record<string, any> | null;
  canEdit: boolean;
  onSave: (changes: Record<string, unknown>) => Promise<unknown>;
  onSaved: () => void;
  emptyText?: string;
}> = ({ title, fields, values, canEdit, onSave, onSaved, emptyText }) => {
  const { language } = useLanguage();
  const { success } = useToast();
  const mr = language === 'mr';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const initial = useMemo(() => {
    const out: Record<string, string> = {};
    for (const f of fields) out[f.key] = toText(values?.[f.key]);
    return out;
  }, [fields, values]);

  useEffect(() => {
    if (!editing) setDraft(initial);
  }, [initial, editing]);

  const parsed = useMemo(() => {
    const out: Record<string, unknown> = {};
    for (const f of fields) out[f.key] = toValue(draft[f.key] ?? '', f);
    return out;
  }, [draft, fields]);

  const errorFor = (f: EditField): string | null => {
    const value = parsed[f.key];
    if (f.required && (value === null || value === '')) return mr ? 'हे आवश्यक आहे.' : 'This is required.';
    if (f.type === 'number' && value !== null) {
      if (Number.isNaN(value)) return mr ? 'कृपया संख्या टाका.' : 'Please enter a number.';
      if (f.min !== undefined && (value as number) < f.min) return mr ? `किमान ${f.min}.` : `Must be at least ${f.min}.`;
      if (f.max !== undefined && (value as number) > f.max) return mr ? `कमाल ${f.max}.` : `Must be at most ${f.max}.`;
    }
    if (f.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      return mr ? 'ईमेल योग्य नाही.' : 'This email does not look right.';
    }
    if (f.type === 'tel' && value && !/^\+?[0-9 -]{10,15}$/.test(String(value))) {
      return mr ? 'फोन नंबर योग्य नाही.' : 'Enter a valid phone number.';
    }
    return f.validate ? f.validate(value, parsed, mr) : null;
  };

  const changes = () => {
    const out: Record<string, unknown> = {};
    for (const f of fields) {
      if (!f.readOnly && (draft[f.key] ?? '') !== initial[f.key]) out[f.key] = parsed[f.key];
    }
    return out;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setFailure(null);
    const editable = fields.filter((f) => !f.readOnly);
    const nextTouched: Record<string, boolean> = {};
    editable.forEach((f) => { nextTouched[f.key] = true; });
    setTouched(nextTouched);
    if (editable.some((f) => errorFor(f))) return;

    const pending = changes();
    if (Object.keys(pending).length === 0) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await onSave(pending);
      setEditing(false);
      success(mr ? `${title} जतन केले. बदल इतिहासात नोंदवला आहे.` : `${title} saved. The change is recorded in the history.`);
      onSaved();
    } catch (err) {
      const details = describeError(err, language);
      const message = (err as { message?: string })?.message;
      const isOurs = (err as { code?: string })?.code === '22023';
      setFailure(isOurs && message ? message : `${details.what} ${details.fix}`);
    } finally {
      setBusy(false);
    }
  };

  const label = (f: EditField) => (mr ? f.mr : f.en);
  const display = (f: EditField) => {
    const raw = initial[f.key];
    if (!raw) return '—';
    const option = f.options?.find((o) => o.value === raw);
    return option ? (mr ? option.mr : option.en) : raw;
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {canEdit && !editing && values && (
          <Button variant="outline" size="sm" onClick={() => { setDraft(initial); setTouched({}); setFailure(null); setEditing(true); }}>
            {mr ? 'संपादित करा' : 'Edit'}
          </Button>
        )}
      </div>

      {!values ? (
        <p className={styles.muted}>{emptyText ?? (mr ? 'अद्याप माहिती नाही.' : 'No details yet.')}</p>
      ) : !editing ? (
        <dl className={styles.facts}>
          {fields.map((f) => (
            <div key={f.key} className={f.type === 'textarea' ? styles.factWide : undefined}>
              <dt>{label(f)}</dt>
              <dd>{display(f)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <form onSubmit={save} noValidate>
          <div className={styles.form}>
            {fields.filter((f) => !f.readOnly).map((f) => {
              const id = `edit-${f.key}`;
              const error = touched[f.key] ? errorFor(f) ?? undefined : undefined;
              const common = {
                id,
                label: label(f),
                required: f.required,
                error,
                value: draft[f.key] ?? '',
                onBlur: () => setTouched((t) => ({ ...t, [f.key]: true })),
              };
              const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                setDraft((d) => ({ ...d, [f.key]: e.target.value }));

              if (f.type === 'select') {
                return (
                  <FormSelect
                    key={f.key}
                    {...common}
                    onChange={onChange}
                    options={[{ value: '', label: mr ? 'निवडा' : 'Select' }, ...(f.options ?? []).map((o) => ({ value: o.value, label: mr ? o.mr : o.en }))]}
                  />
                );
              }
              if (f.type === 'textarea') {
                return (
                  <div key={f.key} className={styles.formWide}>
                    <FormTextarea {...common} rows={4} onChange={onChange} />
                  </div>
                );
              }
              return (
                <FormInput
                  key={f.key}
                  {...common}
                  type={f.type === 'list' ? 'text' : f.type ?? 'text'}
                  min={f.min}
                  max={f.max}
                  helperText={f.type === 'list' ? (mr ? 'स्वल्पविरामाने वेगळे करा' : 'Separate with commas') : undefined}
                  onChange={onChange}
                />
              );
            })}
          </div>
          {failure && <p role="alert" className={styles.formError}>{failure}</p>}
          <div className={styles.formActions}>
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {busy ? (mr ? 'जतन होत आहे...' : 'Saving...') : (mr ? 'जतन करा' : 'Save changes')}
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setEditing(false)}>
              {mr ? 'रद्द करा' : 'Cancel'}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
};
