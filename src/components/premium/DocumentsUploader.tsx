import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { storageService } from '../../services/storage.service';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useToast } from '../../context/ToastContext';

type DocType = 'biodata' | 'horoscope' | 'education';

const DOCS: { type: DocType; en: string; mr: string }[] = [
  { type: 'biodata', en: 'Biodata', mr: 'बायोडाटा' },
  { type: 'horoscope', en: 'Horoscope (Kundali)', mr: 'कुंडली' },
  { type: 'education', en: 'Education Certificate', mr: 'शैक्षणिक प्रमाणपत्र' },
];

/** Owner-side upload for the Diamond+ "Documents" section (PDF/JPG/PNG, max 5 MB each). */
export const DocumentsUploader: React.FC = () => {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const toast = useToast();
  const mr = language === 'mr';
  const [files, setFiles] = useState<Partial<Record<DocType, string>>>({});
  const [busy, setBusy] = useState<DocType | null>(null);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase.from('profile_documents').select('doc_type, file_name').eq('profile_id', profile.id);
    const next: Partial<Record<DocType, string>> = {};
    (data ?? []).forEach((d) => { next[d.doc_type as DocType] = d.file_name; });
    setFiles(next);
  }, [profile?.id]);

  useEffect(() => { void load(); }, [load]);

  if (!profile?.id) return null;

  const onPick = async (type: DocType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(type);
    try {
      await storageService.uploadProfileDocument(profile.id, type, file);
      toast.success(mr ? 'दस्तऐवज अपलोड झाला.' : 'Document uploaded.');
      await load();
    } catch (err: any) {
      toast.error(err?.message || (mr ? 'अपलोड अयशस्वी.' : 'Upload failed.'));
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async (type: DocType) => {
    setBusy(type);
    try {
      await storageService.deleteProfileDocument(profile.id, type);
      await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <section style={{ maxWidth: 760, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{mr ? 'कागदपत्रे' : 'Documents'}</h3>
        <p style={{ margin: '4px 0 16px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {mr
            ? 'ही कागदपत्रे फक्त डायमंड/प्लॅटिनम सदस्यांना दिसतात. PDF/JPG/PNG, कमाल ५ MB.'
            : 'Visible only to Diamond and Platinum members. PDF, JPG or PNG, up to 5 MB each.'}
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          {DOCS.map((d) => (
            <div key={d.type} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <FileText size={18} />
              <strong style={{ minWidth: 190 }}>{mr ? d.mr : d.en}</strong>
              <span style={{ flex: 1, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                {files[d.type] || (mr ? 'अपलोड केलेले नाही' : 'Not uploaded')}
              </span>
              <label className="btn btn-outline btn-sm" style={{ cursor: busy ? 'wait' : 'pointer' }}>
                <Upload size={14} /> {files[d.type] ? (mr ? 'बदला' : 'Replace') : (mr ? 'अपलोड' : 'Upload')}
                <input type="file" accept="application/pdf,image/jpeg,image/png" hidden disabled={busy !== null}
                  onChange={(e) => onPick(d.type, e)} />
              </label>
              {files[d.type] && (
                <button type="button" onClick={() => onDelete(d.type)} disabled={busy !== null}
                  aria-label={mr ? 'काढा' : 'Remove'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C' }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
