import { supabase } from '../lib/supabase';
import { brandConfig } from '../config/brand.config';
import { translations } from '../i18n/translations';

export interface ContentOverride {
  en: string | null;
  mr: string | null;
}
export type ContentMap = Record<string, ContentOverride>;

export interface ContentRow extends ContentOverride {
  key: string;
  draft_en: string | null;
  draft_mr: string | null;
  published_at: string | null;
}

export interface Slot {
  key: string;
  section: string;
  en: string;
  mr: string;
  isLink?: boolean;
}

export interface Story {
  id: string;
  couple_names_en: string;
  couple_names_mr: string;
  story_en: string;
  story_mr: string;
  location_en: string | null;
  location_mr: string | null;
  wedding_date: string | null;
  photo_url: string | null;
  consent_confirmed: boolean;
  is_published: boolean;
  sort_order: number;
}

const rpc = (fn: string, args?: Record<string, unknown>) => (supabase.rpc as any)(fn, args);
async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await rpc(fn, args);
  if (error) throw error;
  return data as T;
}

const CACHE_KEY = 'site_content_v1';

/** Last published text, so returning visitors see it at once rather than a flash of the old copy. */
export const readCachedContent = (): ContentMap => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') as ContentMap;
  } catch {
    return {};
  }
};

export const fetchPublishedContent = async (): Promise<ContentMap> => {
  const map = await call<ContentMap>('get_site_content');
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or blocked: the site still works, it just refetches next time.
  }
  return map;
};

/** The original site text, kept so "use original" and any lost connection always have something to show. */
const ORIGINAL_BRAND = JSON.parse(JSON.stringify(brandConfig));

const setPath = (root: any, parts: string[], value: unknown) => {
  let node = root;
  for (const part of parts.slice(0, -1)) {
    if (node[part] === null || typeof node[part] !== 'object') return;
    node = node[part];
  }
  const leaf = parts[parts.length - 1];
  if (leaf in node) node[leaf] = value;
};

/** Published text laid over the built-in translations. Unknown or stale keys are ignored. */
export const applyContent = <T,>(base: T, language: 'en' | 'mr', content: ContentMap): T => {
  const keys = Object.keys(content).filter((k) => !k.startsWith('brand.'));
  if (keys.length === 0) return base;
  const copy = JSON.parse(JSON.stringify(base));
  for (const key of keys) {
    const value = content[key]?.[language];
    if (value) setPath(copy, key.split('.'), value);
  }
  return copy;
};

/** Contact details and social links live in brandConfig, which components read directly. */
export const applyBrandContent = (language: 'en' | 'mr', content: ContentMap): void => {
  const pick = (key: string) => content[key]?.[language] || content[key]?.en || content[key]?.mr || null;
  brandConfig.phone = pick('brand.phone') ?? ORIGINAL_BRAND.phone;
  brandConfig.email = pick('brand.email') ?? ORIGINAL_BRAND.email;
  brandConfig.address = {
    en: content['brand.address']?.en || ORIGINAL_BRAND.address.en,
    mr: content['brand.address']?.mr || ORIGINAL_BRAND.address.mr,
  };
  for (const name of ['facebook', 'instagram', 'youtube', 'whatsapp'] as const) {
    brandConfig.social[name] = pick(`brand.social.${name}`) ?? ORIGINAL_BRAND.social[name];
  }
};

// Sections an admin may edit. Sign-in, the profile form and dashboards stay fixed: those labels are tied to how the screens work.
export const EDITABLE_SECTIONS: { key: string; en: string; mr: string }[] = [
  { key: 'hero', en: 'Home: top banner', mr: 'मुखपृष्ठ: मुख्य भाग' },
  { key: 'trust', en: 'Home: trust', mr: 'मुखपृष्ठ: विश्वास' },
  { key: 'howItWorks', en: 'How it works', mr: 'हे कसे चालते' },
  { key: 'whyChooseUs', en: 'Why choose us', mr: 'आम्हालाच का' },
  { key: 'safety', en: 'Safety', mr: 'सुरक्षितता' },
  { key: 'cta', en: 'Home: closing section', mr: 'मुखपृष्ठ: शेवटचा भाग' },
  { key: 'faq', en: 'FAQ', mr: 'प्रश्नोत्तरे' },
  { key: 'successStories', en: 'Success stories page', mr: 'विवाहगाथा पान' },
  { key: 'aboutUsPage', en: 'About us', mr: 'आमच्याबद्दल' },
  { key: 'contactPage', en: 'Contact page', mr: 'संपर्क पान' },
  { key: 'privacyPage', en: 'Privacy policy', mr: 'गोपनीयता धोरण' },
  { key: 'termsPage', en: 'Terms', mr: 'अटी व शर्ती' },
  { key: 'footer', en: 'Footer', mr: 'तळटीप' },
  { key: 'brand', en: 'Contact details and links', mr: 'संपर्क तपशील व दुवे' },
];

const collect = (en: any, mr: any, path: string[], section: string, out: Slot[]) => {
  for (const key of Object.keys(en ?? {})) {
    const next = [...path, key];
    if (typeof en[key] === 'string') {
      out.push({ key: next.join('.'), section, en: en[key], mr: typeof mr?.[key] === 'string' ? mr[key] : '' });
    } else if (en[key] && typeof en[key] === 'object' && !Array.isArray(en[key])) {
      collect(en[key], mr?.[key], next, section, out);
    }
  }
};

/** Every editable text on the site, read from the translations so a new string appears here by itself. */
export const listSlots = (): Slot[] => {
  const out: Slot[] = [];
  for (const { key } of EDITABLE_SECTIONS) {
    if (key === 'brand') continue;
    collect((translations.en as any)[key], (translations.mr as any)[key], [key], key, out);
  }
  out.push(
    { key: 'brand.phone', section: 'brand', en: ORIGINAL_BRAND.phone, mr: ORIGINAL_BRAND.phone },
    { key: 'brand.email', section: 'brand', en: ORIGINAL_BRAND.email, mr: ORIGINAL_BRAND.email },
    { key: 'brand.address', section: 'brand', en: ORIGINAL_BRAND.address.en, mr: ORIGINAL_BRAND.address.mr },
  );
  for (const name of ['facebook', 'instagram', 'youtube', 'whatsapp']) {
    out.push({ key: `brand.social.${name}`, section: 'brand', en: ORIGINAL_BRAND.social[name], mr: ORIGINAL_BRAND.social[name], isLink: true });
  }
  return out;
};

export const contentService = {
  list: () => call<ContentRow[]>('admin_list_content'),
  saveDraft: (key: string, en: string, mr: string) => call<boolean>('admin_save_content_draft', { p_key: key, p_en: en, p_mr: mr }),
  publish: (key: string) => call<boolean>('admin_publish_content', { p_key: key }),
  reset: (key: string) => call<boolean>('admin_reset_content', { p_key: key }),
  history: (key: string) => call<{ id: string; en: string | null; mr: string | null; created_at: string }[]>('admin_content_history', { p_key: key }),
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const storiesService = {
  /** Only published stories can be read here; the database refuses the rest. */
  async listPublished(limit?: number): Promise<Story[]> {
    let query = (supabase as any).from('success_stories').select('*').order('sort_order').order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
  adminList: () => call<Story[]>('admin_list_stories'),
  save: (id: string | null, story: Partial<Story>) => call<string>('admin_save_story', { p_id: id, p: story }),

  photoProblem(file: File, mr: boolean): string | null {
    if (!IMAGE_TYPES.includes(file.type)) return mr ? 'फक्त JPG, PNG किंवा WebP चालेल.' : 'Please use a JPG, PNG or WebP image.';
    if (file.size > 5 * 1024 * 1024) return mr ? 'फोटो ५ MB पेक्षा लहान हवा.' : 'The photo must be smaller than 5 MB.';
    return null;
  },
  async uploadPhoto(file: File): Promise<string> {
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `stories/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('site-media').upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error('UPLOAD_FAILED');
    return supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl;
  },
};

export const settingsService = {
  getPublic: () => call<{ maintenance_mode: boolean }>('get_public_settings'),
  get: () => call<{ match_age_gap: number; maintenance_mode: boolean }>('admin_get_settings'),
  set: (key: string, value: unknown) => call<boolean>('admin_set_setting', { p_key: key, p_value: value }),
};
