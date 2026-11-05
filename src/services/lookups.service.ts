import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type LookupKind = 'rashi' | 'nakshatra' | 'community' | 'gotra' | 'kuldaivat';

export interface LookupOption {
  id?: string;
  value: string;
  en: string;
  mr: string;
}

export interface LookupRow {
  id: string;
  kind: LookupKind;
  value: string;
  label_en: string;
  label_mr: string;
  sort_order: number;
  is_active: boolean;
}

export interface Place {
  id: string;
  name_en: string;
  name_mr: string | null;
}

const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);

async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(fn, args);
  if (error) throw error;
  return data as T;
}

const lookupCache = new Map<LookupKind, Promise<LookupOption[]>>();
let districtCache: Promise<Place[]> | null = null;
const talukaCache = new Map<string, Promise<Place[]>>();

export const lookupsService = {
  /** Active entries of a list. Cached for the visit, because forms and profile pages all ask. */
  list(kind: LookupKind): Promise<LookupOption[]> {
    let cached = lookupCache.get(kind);
    if (!cached) {
      cached = (async () => {
        const { data, error } = await (supabase as any).from('lookup_options')
          .select('value, label_en, label_mr')
          .eq('kind', kind)
          .order('sort_order')
          .order('label_en');
        if (error) throw error;
        return (data ?? []).map((r: any) => ({ value: r.value, en: r.label_en, mr: r.label_mr }));
      })();
      // A failed read must not be remembered, or the form stays on its fallback all visit.
      cached.catch(() => lookupCache.delete(kind));
      lookupCache.set(kind, cached);
    }
    return cached;
  },

  /** Turns a stored value into its label, in both languages. Unknown values show as they are. */
  async labelFor(kind: LookupKind, value: string | null | undefined): Promise<{ en: string; mr: string } | undefined> {
    if (!value) return undefined;
    const options = await this.list(kind).catch(() => [] as LookupOption[]);
    const match = options.find((o) => o.value === value);
    return match ? { en: match.en, mr: match.mr } : { en: value, mr: value };
  },

  districts(): Promise<Place[]> {
    if (!districtCache) {
      districtCache = (async () => {
        const { data, error } = await (supabase as any).from('districts').select('id, name_en, name_mr').order('name_en');
        if (error) throw error;
        return data ?? [];
      })();
      districtCache.catch(() => { districtCache = null; });
    }
    return districtCache;
  },

  talukas(districtId: string): Promise<Place[]> {
    let cached = talukaCache.get(districtId);
    if (!cached) {
      cached = (async () => {
        const { data, error } = await (supabase as any).from('talukas')
          .select('id, name_en, name_mr').eq('district_id', districtId).order('name_en');
        if (error) throw error;
        return data ?? [];
      })();
      cached.catch(() => talukaCache.delete(districtId));
      talukaCache.set(districtId, cached);
    }
    return cached;
  },

  searchVillages: (talukaId: string, q: string) =>
    call<{ name_en: string; name_mr: string | null }[]>('search_villages', { p_taluka: talukaId, p_q: q }),

  // Admin
  adminList: (kind: LookupKind) => call<LookupRow[]>('admin_list_lookups', { p_kind: kind }),
  async adminSave(row: { id?: string; kind: LookupKind; label_en: string; label_mr: string; sort_order?: number; is_active?: boolean }) {
    const id = await call<string>('admin_save_lookup', {
      p_id: row.id ?? null, p_kind: row.kind, p_value: null, p_label_en: row.label_en, p_label_mr: row.label_mr,
      p_sort: row.sort_order ?? 0, p_active: row.is_active ?? true,
    });
    lookupCache.delete(row.kind);
    return id;
  },
  locationSummary: () => call<{ districts: number; talukas: number; villages: number }>('admin_location_summary'),
  async saveLocation(level: 'district' | 'taluka' | 'village', parent: string | null, id: string | null, nameEn: string, nameMr: string) {
    const saved = await call<string>('admin_save_location', { p_level: level, p_id: id, p_parent: parent, p_name_en: nameEn, p_name_mr: nameMr });
    districtCache = null;
    talukaCache.clear();
    return saved;
  },
  importVillages: (rows: Record<string, string>[]) =>
    call<{ read: number; added: number; skipped: number; unknown: string[] }>('admin_import_villages', { p_rows: rows }),
};

/**
 * The editable list for a form. `fallback` shows until the database answers, and stays if it cannot
 * be reached, so a form is never left with an empty dropdown.
 */
export const useLookup = (kind: LookupKind, fallback: LookupOption[] = []): LookupOption[] => {
  const [options, setOptions] = useState<LookupOption[]>(fallback);
  useEffect(() => {
    let active = true;
    lookupsService.list(kind).then((rows) => { if (active && rows.length) setOptions(rows); }).catch(() => undefined);
    return () => { active = false; };
    // The fallback is a constant at each call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);
  return options;
};

export const usePlaces = () => {
  const [districts, setDistricts] = useState<Place[]>([]);
  useEffect(() => {
    let active = true;
    lookupsService.districts().then((rows) => { if (active) setDistricts(rows); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return districts;
};

/** Talukas for a district chosen by name, which is how profiles store it. */
export const useTalukas = (districtName: string | undefined, districts: Place[]): Place[] => {
  const [talukas, setTalukas] = useState<Place[]>([]);
  const district = districts.find((d) => d.name_en === districtName);
  const districtId = district?.id;
  useEffect(() => {
    if (!districtId) { setTalukas([]); return; }
    let active = true;
    lookupsService.talukas(districtId).then((rows) => { if (active) setTalukas(rows); }).catch(() => { if (active) setTalukas([]); });
    return () => { active = false; };
  }, [districtId]);
  return talukas;
};
