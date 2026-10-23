import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, SearchFiltersState } from '../types';
import { mockProfiles } from '../data/mockProfiles';
import { interactionService } from './interaction.service';
import { shortlistService } from './shortlist.service';

export interface DiscoveryQueryParams extends Partial<SearchFiltersState> {
  q?: string;
  sortBy?: 'relevance' | 'ageAsc' | 'ageDesc' | 'incomeDesc' | 'newest';
  page?: number;
  pageSize?: number;
  userProfileId?: string;
}

export interface DiscoveryResponse {
  profiles: Profile[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Convert a Supabase DB profile row into application Profile object
function mapDbProfileToProfile(row: any): Profile {
  const birthYear = row.date_of_birth ? new Date(row.date_of_birth).getFullYear() : null;
  const currentYear = new Date().getFullYear();
  const calculatedAge = row.age || (birthYear ? currentYear - birthYear : 26);
  const heightCm = row.height || row.height_cm || 165;
  const heightInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;

  const displayName = row.display_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Marathi Member';

  // Photo resolution: primary photo from joined photos or fallback
  let photoUrl = row.profile_photo_url || '';
  let gallery: string[] = [];
  if (Array.isArray(row.profile_photos) && row.profile_photos.length > 0) {
    const primary = row.profile_photos.find((p: any) => p.is_primary) || row.profile_photos[0];
    if (primary && primary.storage_path) {
      photoUrl = primary.storage_path;
    }
    gallery = row.profile_photos.map((p: any) => p.storage_path).filter(Boolean);
  } else if (photoUrl) {
    gallery = [photoUrl];
  }

  const rawIncome = row.income || row.annual_income;
  const parsedIncomeNum = typeof rawIncome === 'number' ? rawIncome : parseFloat(String(rawIncome || '').replace(/[^0-9.]/g, '')) || 0;

  return {
    id: row.id || row.profile_id,
    profileId: row.profile_id || `MM-${row.id?.substring(0, 5) || '100'}`,
    name: {
      mr: displayName,
      en: displayName,
    },
    gender: row.gender === 'female' ? 'female' : 'male',
    age: calculatedAge,
    height: `${feet} ft ${inches} in / ${heightCm} cm`,
    heightCm: heightCm,
    maritalStatus: {
      mr: row.marital_status === 'never_married' ? 'अविवाहित' : row.marital_status === 'divorced' ? 'घटस्फोटित' : 'विवाहित',
      en: row.marital_status === 'never_married' ? 'Never Married' : row.marital_status === 'divorced' ? 'Divorced' : 'Married',
    },
    religion: {
      mr: row.religion || 'हिंदू',
      en: row.religion || 'Hindu',
    },
    community: {
      mr: row.community || 'मराठा',
      en: row.community || 'Maratha',
    },
    motherTongue: {
      mr: row.mother_tongue || 'मराठी',
      en: row.mother_tongue || 'Marathi',
    },
    city: {
      mr: row.city || 'पुणे',
      en: row.city || 'Pune',
    },
    district: {
      mr: row.district || row.city || 'पुणे',
      en: row.district || row.city || 'Pune',
    },
    state: {
      mr: row.state || 'महाराष्ट्र',
      en: row.state || 'Maharashtra',
    },
    country: {
      mr: row.country || 'भारत',
      en: row.country || 'India',
    },
    education: {
      mr: row.education || 'पदवीधर (Graduate)',
      en: row.education || 'Graduate',
    },
    educationDetail: {
      mr: row.education_detail || row.college || row.education || '',
      en: row.education_detail || row.college || row.education || '',
    },
    occupation: {
      mr: row.occupation || 'व्यावसायिक (Professional)',
      en: row.occupation || 'Professional',
    },
    occupationCategory: 'other',
    employedIn: {
      mr: row.employed_in || row.company || 'खाजगी क्षेत्र',
      en: row.employed_in || row.company || 'Private Sector',
    },
    annualIncome: {
      mr: rawIncome ? (typeof rawIncome === 'number' ? `₹ ${rawIncome} लाख` : rawIncome) : 'माहिती उपलब्ध नाही',
      en: rawIncome ? (typeof rawIncome === 'number' ? `₹ ${rawIncome} LPA` : rawIncome) : 'Not Disclosed',
    },
    annualIncomeValue: parsedIncomeNum,
    photoUrl: photoUrl,
    gallery: gallery,
    isVerified: row.verification_status === 'verified',
    isPremium: false,
    lastActive: {
      mr: 'अलीकडेच सक्रिय',
      en: 'Recently Active',
    },
    aboutMe: {
      mr: row.about_me || 'या सदस्याने अजून माहिती जोडलेली नाही.',
      en: row.about_me || "This member hasn't added an introduction yet.",
    },
    lifestyle: {
      diet: {
        mr: row.diet === 'vegetarian' ? 'शाकाहारी' : 'इतर',
        en: row.diet === 'vegetarian' ? 'Vegetarian' : 'Other',
      },
      smoke: {
        mr: row.smoking === 'no' ? 'नाही' : 'कधीतरी',
        en: row.smoking === 'no' ? 'No' : 'Occasionally',
      },
      drink: {
        mr: row.drinking === 'no' ? 'नाही' : 'कधीतरी',
        en: row.drinking === 'no' ? 'No' : 'Occasionally',
      },
      hobbies: [],
    },
    family: {
      familyType: {
        mr: row.family_type === 'joint' ? 'एकत्र कुटुंब' : 'विभक्त कुटुंब',
        en: row.family_type === 'joint' ? 'Joint Family' : 'Nuclear Family',
      },
      familyStatus: {
        mr: row.family_values || 'मध्यमवर्गीय',
        en: row.family_values || 'Middle Class',
      },
      fatherOccupation: {
        mr: row.father_occupation || '-',
        en: row.father_occupation || '-',
      },
      motherOccupation: {
        mr: row.mother_occupation || '-',
        en: row.mother_occupation || '-',
      },
      brothers: row.brothers_count || 0,
      sisters: row.sisters_count || 0,
      nativePlace: {
        mr: row.native_place || row.city || '-',
        en: row.native_place || row.city || '-',
      },
    },
    partnerPreferences: {
      ageRange: '22 - 32 years',
      heightRange: "5'0\" to 6'0\"",
      maritalStatus: [{ mr: 'अविवाहित', en: 'Never Married' }],
      communities: [{ mr: 'सर्व मराठा', en: 'Any' }],
      education: [{ mr: 'पदवीधर / उच्च पदवीधर', en: 'Graduate / Post Graduate' }],
      occupations: [{ mr: 'नोकरी / व्यवसाय', en: 'Any' }],
      preferredLocations: [{ mr: 'महाराष्ट्र', en: 'Maharashtra' }],
      expectedIncome: { mr: 'लागू नाही', en: 'Any' },
    },
  };
}

export const discoveryService = {
  // Fetch profiles matching discovery parameters with database query & fallback
  async fetchProfiles(params: DiscoveryQueryParams): Promise<DiscoveryResponse> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 12;
    const blockedIds = await interactionService.getBlockedIds(params.userProfileId);

    let dbProfiles: Profile[] = [];

    if (isSupabaseConfigured()) {
      try {
        // Build Supabase SQL Query for approved profiles
        let query = supabase
          .from('profiles')
          .select('*, profile_photos(storage_path, is_primary, approval_status)')
          .eq('profile_status', 'approved');

        // Gender filter
        if (params.gender && params.gender !== 'all') {
          query = query.eq('gender', params.gender);
        }

        // Location filters
        if (params.state && params.state !== 'all') {
          query = query.ilike('state', `%${params.state}%`);
        }
        if (params.city && params.city !== 'all') {
          query = query.ilike('city', `%${params.city}%`);
        }

        // Community filter
        if (params.community && params.community !== 'all') {
          query = query.ilike('community', `%${params.community}%`);
        }

        // Verified only
        if (params.verifiedOnly) {
          query = query.eq('verification_status', 'verified');
        }

        const queryPromise = query;
        const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('DB discovery query timeout')), 3500)
        );
        const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;
        if (!error && data && data.length > 0) {
          dbProfiles = data.map(mapDbProfileToProfile);
        }
      } catch (e) {
        console.warn('Database discovery query fallback to mockProfiles:', e);
      }
    }

    // Merge database profiles with approved mockProfiles ensuring full rich directory
    const combinedPool: Profile[] = [...dbProfiles];
    for (const mock of mockProfiles) {
      if (!combinedPool.some((p) => p.id === mock.id || p.profileId === mock.profileId)) {
        combinedPool.push(mock);
      }
    }

    // Filter out any blocked profiles
    let filtered = combinedPool.filter((p) => !blockedIds.includes(p.id) && !blockedIds.includes(p.profileId));

    // Apply Client-Side & Precise Field Filtering on the combined set
    if (params.q && params.q.trim()) {
      const search = params.q.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        return (
          p.name.en.toLowerCase().includes(search) ||
          p.name.mr.toLowerCase().includes(search) ||
          p.profileId.toLowerCase().includes(search) ||
          p.city.en.toLowerCase().includes(search) ||
          p.city.mr.toLowerCase().includes(search) ||
          p.occupation.en.toLowerCase().includes(search) ||
          p.occupation.mr.toLowerCase().includes(search) ||
          p.education.en.toLowerCase().includes(search) ||
          p.community.en.toLowerCase().includes(search)
        );
      });
    }

    if (params.gender && params.gender !== 'all') {
      filtered = filtered.filter((p) => p.gender === params.gender);
    }

    if (params.minAge) {
      filtered = filtered.filter((p) => p.age >= (params.minAge || 18));
    }

    if (params.maxAge) {
      filtered = filtered.filter((p) => p.age <= (params.maxAge || 60));
    }

    if (params.minHeight) {
      filtered = filtered.filter((p) => p.heightCm >= (params.minHeight || 140));
    }

    if (params.maxHeight) {
      filtered = filtered.filter((p) => p.heightCm <= (params.maxHeight || 210));
    }

    if (params.maritalStatus && params.maritalStatus !== 'all') {
      const ms = params.maritalStatus.toLowerCase();
      filtered = filtered.filter((p) => {
        const enVal = p.maritalStatus.en.toLowerCase();
        const mrVal = p.maritalStatus.mr.toLowerCase();
        return enVal.includes(ms) || mrVal.includes(ms) || (ms === 'never_married' && enVal.includes('never'));
      });
    }

    if (params.religion && params.religion !== 'all') {
      const rel = params.religion.toLowerCase();
      filtered = filtered.filter((p) => p.religion.en.toLowerCase().includes(rel) || p.religion.mr.toLowerCase().includes(rel));
    }

    if (params.community && params.community !== 'all') {
      const comm = params.community.toLowerCase();
      filtered = filtered.filter((p) => p.community.en.toLowerCase().includes(comm) || p.community.mr.toLowerCase().includes(comm));
    }

    if (params.education && params.education !== 'all') {
      const edu = params.education.toLowerCase();
      filtered = filtered.filter((p) => p.education.en.toLowerCase().includes(edu) || p.education.mr.toLowerCase().includes(edu));
    }

    if (params.occupation && params.occupation !== 'all') {
      const occ = params.occupation.toLowerCase();
      filtered = filtered.filter(
        (p) => p.occupationCategory === params.occupation || p.occupation.en.toLowerCase().includes(occ) || p.occupation.mr.toLowerCase().includes(occ)
      );
    }

    if (params.city && params.city !== 'all') {
      const city = params.city.toLowerCase();
      filtered = filtered.filter((p) => p.city.en.toLowerCase().includes(city) || p.city.mr.toLowerCase().includes(city));
    }

    if (params.state && params.state !== 'all') {
      const st = params.state.toLowerCase();
      filtered = filtered.filter((p) => p.state.en.toLowerCase().includes(st) || p.state.mr.toLowerCase().includes(st));
    }

    if (params.minIncome && params.minIncome > 0) {
      filtered = filtered.filter((p) => p.annualIncomeValue >= (params.minIncome || 0));
    }

    if (params.verifiedOnly) {
      filtered = filtered.filter((p) => p.isVerified === true);
    }

    if (params.photoOnly) {
      filtered = filtered.filter((p) => !!p.photoUrl);
    }

    // Sorting
    if (params.sortBy === 'ageAsc') {
      filtered.sort((a, b) => a.age - b.age);
    } else if (params.sortBy === 'ageDesc') {
      filtered.sort((a, b) => b.age - a.age);
    } else if (params.sortBy === 'incomeDesc') {
      filtered.sort((a, b) => b.annualIncomeValue - a.annualIncomeValue);
    }

    const totalCount = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedProfiles = filtered.slice(0, startIndex + pageSize);

    return {
      profiles: paginatedProfiles,
      totalCount,
      page,
      pageSize,
      hasMore: paginatedProfiles.length < totalCount,
    };
  },

  // Fetch full details of a single profile by ID or profileId
  async fetchProfileById(id: string): Promise<Profile | null> {
    // 1. Try fetching from Supabase
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${id},profile_id.eq.${id}`)
        .maybeSingle();

      if (!error && data) {
        return mapDbProfileToProfile(data);
      }
    } catch (err) {
      console.warn('DB single profile fetch error:', err);
    }

    // 2. Fallback to mock profiles
    const found = mockProfiles.find((p) => p.id === id || p.profileId.toLowerCase() === id.toLowerCase());
    return found || null;
  },

  // Get shortlisted profiles array
  async fetchShortlistedProfiles(userProfileId?: string): Promise<Profile[]> {
    const shortIds = await shortlistService.getShortlistedIds(userProfileId);
    const all = await this.fetchProfiles({ pageSize: 100, userProfileId });
    return all.profiles.filter((p) => shortIds.includes(p.id) || shortIds.includes(p.profileId));
  },
};
