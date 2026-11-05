import { supabase } from '../lib/supabase';
import { PROFILE_COLUMNS } from '../lib/profileColumns';
import { LocalizedString, Profile, SearchFiltersState } from '../types';
import { LookupOption, lookupsService } from './lookups.service';
import { isLowData } from '../lib/lowData';
import { MANGLIK_OPTIONS } from '../data/profileOptions';
import { shortlistService } from './shortlist.service';

export interface DiscoveryQueryParams extends Partial<SearchFiltersState> {
  q?: string;
  sortBy?: 'relevance' | 'ageAsc' | 'ageDesc' | 'incomeDesc' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface DiscoveryResponse {
  profiles: Profile[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** The signed-in member's marriage age group, decided by the database. */
export interface MatchBand {
  applies: boolean;
  reason?: 'no_profile' | 'not_applicable' | 'dob_missing';
  viewer_age?: number;
  gap?: number;
  target_gender?: 'male' | 'female';
  min_age?: number;
  max_age?: number;
}

const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOT_GIVEN: LocalizedString = { mr: '—', en: '—' };

const same = (value: unknown): LocalizedString =>
  value ? { mr: String(value), en: String(value) } : NOT_GIVEN;

const MARITAL_LABELS: Record<string, LocalizedString> = {
  never_married: { mr: 'अविवाहित', en: 'Never Married' },
  divorced: { mr: 'घटस्फोटित', en: 'Divorced' },
  widowed: { mr: 'विधवा / विधुर', en: 'Widowed' },
  awaiting_divorce: { mr: 'घटस्फोट प्रलंबित', en: 'Awaiting Divorce' },
};

const NO_PREFERENCES: Profile['partnerPreferences'] = {
  ageRange: '—',
  heightRange: '—',
  maritalStatus: [],
  communities: [],
  education: [],
  occupations: [],
  preferredLocations: [],
  expectedIncome: NOT_GIVEN,
};

function mapPreferences(row: any): Profile['partnerPreferences'] {
  if (!row) return NO_PREFERENCES;
  const list = (values: unknown): LocalizedString[] => (Array.isArray(values) ? values.map(same) : []);
  return {
    ageRange: row.min_age && row.max_age ? `${row.min_age} - ${row.max_age}` : '—',
    heightRange: row.min_height && row.max_height ? `${row.min_height} - ${row.max_height} cm` : '—',
    maritalStatus: Array.isArray(row.preferred_marital_status)
      ? row.preferred_marital_status.map((m: string) => MARITAL_LABELS[m] ?? same(m))
      : [],
    communities: list(row.preferred_community),
    education: list(row.preferred_education),
    occupations: list(row.preferred_occupation),
    preferredLocations: list(row.preferred_cities),
    expectedIncome: same(row.min_income),
  };
}

// Convert a profile row into the app's Profile. Anything the member hasn't filled in shows as a
// dash: a real person's profile must never show invented details.
function mapDbProfileToProfile(row: any): Profile {
  const heightCm = Number(row.height) || 0;
  const heightInches = Math.round(heightCm / 2.54);
  const displayName = `${row.first_name || ''}`.trim() || '—';

  // `photos` holds only the extra photos; the profile picture always leads the gallery.
  const photoUrl: string = row.avatar_url || '';
  let gallery: string[] = Array.isArray(row.photos) ? row.photos.filter(Boolean) : [];
  if (photoUrl) gallery = [photoUrl, ...gallery.filter((url) => url !== photoUrl)];

  const rawIncome = row.income;
  const incomeValue = parseFloat(String(rawIncome || '').replace(/[^0-9.]/g, '')) || 0;

  return {
    id: row.id,
    profileId: row.profile_id || '—',
    name: { mr: displayName, en: displayName },
    gender: row.gender === 'female' ? 'female' : 'male',
    age: Number(row.age) || 0,
    ageInRange: typeof row.age_in_range === 'boolean' ? row.age_in_range : undefined,
    height: heightCm ? `${Math.floor(heightInches / 12)} ft ${heightInches % 12} in / ${heightCm} cm` : '—',
    heightCm,
    maritalStatus: MARITAL_LABELS[row.marital_status] ?? NOT_GIVEN,
    religion: same(row.religion),
    community: same(row.community),
    motherTongue: same(row.mother_tongue),
    city: same(row.city),
    district: same(row.district || row.city),
    gothra: row.gothra ? same(row.gothra) : undefined,
    rashi: row.rashi ? same(row.rashi) : undefined,
    nakshatra: row.nakshatra ? same(row.nakshatra) : undefined,
    manglik: row.manglik ? same(row.manglik) : undefined,
    kuldaivat: row.kuldaivat ? same(row.kuldaivat) : undefined,
    state: same(row.state),
    country: same(row.country),
    education: same(row.education),
    educationDetail: same(row.education_detail || row.college || row.education),
    occupation: same(row.occupation),
    occupationCategory: 'other',
    employedIn: same(row.employed_in || row.company),
    annualIncome: rawIncome ? same(rawIncome) : { mr: 'माहिती उपलब्ध नाही', en: 'Not Disclosed' },
    annualIncomeValue: incomeValue,
    photoUrl,
    gallery,
    photosHidden: Boolean(row.photos_hidden),
    listingPriority: Number(row.listing_priority) || 0,
    isHighlighted: Number(row.listing_priority) >= 3,
    isVerified: row.verification_status === 'verified',
    isPremium: false,
    lastActive: NOT_GIVEN,
    aboutMe: {
      mr: row.about_me || 'या सदस्याने अजून माहिती जोडलेली नाही.',
      en: row.about_me || "This member hasn't added an introduction yet.",
    },
    lifestyle: {
      diet: same(row.diet),
      smoke: same(row.smoking),
      drink: same(row.drinking),
      hobbies: Array.isArray(row.hobbies) ? row.hobbies.map(same) : [],
    },
    family: {
      familyType: same(row.family_type),
      familyStatus: same(row.family_status),
      fatherOccupation: same(row.father_occupation),
      motherOccupation: same(row.mother_occupation),
      brothers: Number(row.brothers_count) || 0,
      sisters: Number(row.sisters_count) || 0,
      nativePlace: same([row.native_taluka, row.native_district].filter(Boolean).join(', ') || row.family_location || row.city),
    },
    partnerPreferences: NO_PREFERENCES,
  };
}

type Labels = Record<'community' | 'rashi' | 'nakshatra', LookupOption[]>;

const loadLabels = async (): Promise<Labels> => {
  const list = (kind: 'community' | 'rashi' | 'nakshatra') => lookupsService.list(kind).catch(() => [] as LookupOption[]);
  const [community, rashi, nakshatra] = await Promise.all([list('community'), list('rashi'), list('nakshatra')]);
  return { community, rashi, nakshatra };
};

// Profiles store a list entry's value; people read its label. A value no longer on the list shows as stored.
const labelled = (current: LocalizedString | undefined, options: { value: string; en: string; mr: string }[]) => {
  const match = current && options.find((o) => o.value === current.en);
  return match ? { en: match.en, mr: match.mr } : current;
};

const MANGLIK = MANGLIK_OPTIONS.map((o) => ({ value: o.id, en: o.en, mr: o.mr }));

const applyLabels = (profile: Profile, labels: Labels): Profile => ({
  ...profile,
  ...(isLowData() ? { photoUrl: '', gallery: [] } : {}),
  community: labelled(profile.community, labels.community) ?? profile.community,
  rashi: labelled(profile.rashi, labels.rashi),
  nakshatra: labelled(profile.nakshatra, labels.nakshatra),
  manglik: labelled(profile.manglik, MANGLIK),
});

export const discoveryService = {
  /**
   * Search members. The database applies gender, age group, blocks, early access and every filter,
   * and returns one page. Failures throw, so the page can show a real error.
   */
  async fetchProfiles(params: DiscoveryQueryParams): Promise<DiscoveryResponse> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 12;

    const { data, error } = await supabase.rpc('search_profiles', {
      p_filters: {
        q: params.q?.trim() || null,
        gender: params.gender ?? null,
        show_all_ages: Boolean(params.showAllAges),
        min_age: params.minAge ?? null,
        max_age: params.maxAge ?? null,
        min_height: params.minHeight ?? null,
        max_height: params.maxHeight ?? null,
        marital_status: params.maritalStatus ?? null,
        religion: params.religion ?? null,
        community: params.community ?? null,
        education: params.education ?? null,
        occupation: params.occupation ?? null,
        city: params.city ?? null,
        rashi: params.rashi ?? null,
        manglik: params.manglik ?? null,
        district: params.district ?? null,
        native_district: params.nativeDistrict ?? null,
        state: params.state ?? null,
        min_income: params.minIncome ?? null,
        verified_only: Boolean(params.verifiedOnly),
        photo_only: Boolean(params.photoOnly),
        sort: params.sortBy ?? 'relevance',
      },
      p_limit: pageSize,
      p_offset: (page - 1) * pageSize,
    });
    if (error) throw error;

    const result = data as unknown as { total: number; items: unknown[] };
    const labels = await loadLabels();
    const profiles = (result.items ?? []).map((row) => applyLabels(mapDbProfileToProfile(row), labels));
    const totalCount = Number(result.total) || 0;
    return { profiles, totalCount, page, pageSize, hasMore: page * pageSize < totalCount };
  },

  /** The caller's age group, or null if it could not be read. */
  async getMatchBand(): Promise<MatchBand | null> {
    const { data, error } = await supabase.rpc('get_my_match_band');
    if (error) return null;
    return data as unknown as MatchBand;
  },

  /** One member's full profile, by id or public profile code. Null means not available to this member. */
  async fetchProfileById(id: string): Promise<Profile | null> {
    const column = UUID_FORMAT.test(id) ? 'id' : 'profile_id';
    const { data, error } = await (supabase.from('profiles') as any)
      .select(PROFILE_COLUMNS)
      .eq(column, id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const profile = applyLabels(mapDbProfileToProfile(data), await loadLabels());
    const { data: preferences } = await (supabase.from('partner_preferences') as any)
      .select('*')
      .eq('profile_id', data.id)
      .maybeSingle();
    return { ...profile, partnerPreferences: mapPreferences(preferences) };
  },

  /** Specific members, for the shortlist. Anyone blocked or no longer approved is simply left out. */
  async fetchProfilesByIds(ids: string[]): Promise<Profile[]> {
    const uuids = ids.filter((id) => UUID_FORMAT.test(id));
    if (uuids.length === 0) return [];
    const { data, error } = await (supabase.from('profiles') as any)
      .select(PROFILE_COLUMNS)
      .in('id', uuids);
    if (error) throw error;
    const labels = await loadLabels();
    return (data ?? []).map((row: any) => applyLabels(mapDbProfileToProfile(row), labels));
  },

  async fetchShortlistedProfiles(userProfileId?: string): Promise<Profile[]> {
    return this.fetchProfilesByIds(await shortlistService.getShortlistedIds(userProfileId));
  },
};
