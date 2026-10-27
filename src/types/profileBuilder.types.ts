export interface ProfileFormData {
  // Step 1: Basic Details & Photos
  first_name: string;
  last_name: string;
  avatar_url?: string;
  photos?: string[];
  photos_hidden?: boolean;
  profile_for: string;
  gender: string;
  date_of_birth: string;
  height_cm: number | null;
  marital_status: string;
  mother_tongue: string;
  religion: string;
  community: string;
  sub_community: string;
  gothra?: string;
  manglik: string;
  manglik_status?: string;
  horoscope_match_required: boolean;
  horoscope_available?: boolean;

  // Step 2: Education & Career
  highest_education: string;
  education_detail: string;
  college_institution: string;
  occupation: string;
  occupation_detail: string;
  employed_in: string;
  organization_name: string;
  annual_income: string;
  work_location: string;

  // Step 3: Family Details
  father_occupation: string;
  mother_occupation: string;
  family_type: string;
  family_values: string;
  family_status: string;
  brothers_count: number;
  brothers_married: number;
  sisters_count: number;
  sisters_married: number;

  // Step 4: Lifestyle
  diet: string;
  smoking: string;
  drinking: string;
  hobbies: string[];
  personality: string;

  // Step 5: Location
  current_city: string;
  current_district: string;
  current_state: string;
  current_country: string;
  citizenship: string;
  native_place: string;
  native_district: string;

  // Step 6: About Me
  about_me: string;

  // Step 7: Partner Preferences
  partner_min_age: number;
  partner_max_age: number;
  partner_min_height: number;
  partner_max_height: number;
  partner_marital_status: string[];
  partner_religion: string[];
  partner_communities: string[];
  partner_manglik: string;
  partner_education: string[];
  partner_occupation: string[];
  partner_min_income: string;
  partner_diet: string[];
  partner_location: string;
  partner_notes: string;

  // Step 9: Identity Verification
  id_type?: string;
  id_number?: string;
  self_attested?: boolean;
}

export const INITIAL_PROFILE_FORM_DATA: ProfileFormData = {
  first_name: '',
  last_name: '',
  avatar_url: '',
  photos: [],
  photos_hidden: false,
  profile_for: 'self',
  gender: 'female',
  date_of_birth: '',
  height_cm: 165,
  marital_status: 'never_married',
  mother_tongue: 'Marathi',
  religion: 'Hindu',
  community: 'maratha_96k',
  sub_community: '',
  gothra: '',
  manglik: 'no',
  horoscope_match_required: true,

  highest_education: 'BE_BTech',
  education_detail: '',
  college_institution: '',
  occupation: 'software_it',
  occupation_detail: '',
  employed_in: 'private',
  organization_name: '',
  annual_income: '10_15_lakhs',
  work_location: 'Pune',

  father_occupation: '',
  mother_occupation: '',
  family_type: 'nuclear',
  family_values: 'moderate',
  family_status: 'middle_class',
  brothers_count: 0,
  brothers_married: 0,
  sisters_count: 0,
  sisters_married: 0,

  diet: 'vegetarian',
  smoking: 'no',
  drinking: 'no',
  hobbies: ['classical_music', 'reading'],
  personality: '',

  current_city: 'Pune',
  current_district: 'Pune',
  current_state: 'Maharashtra',
  current_country: 'India',
  citizenship: 'Indian',
  native_place: '',
  native_district: '',

  about_me: '',

  partner_min_age: 24,
  partner_max_age: 30,
  partner_min_height: 155,
  partner_max_height: 180,
  partner_marital_status: ['never_married'],
  partner_religion: ['Hindu'],
  partner_communities: ['any'],
  partner_manglik: 'does_not_matter',
  partner_education: ['any'],
  partner_occupation: ['any'],
  partner_min_income: 'any',
  partner_diet: ['any'],
  partner_location: '',
  partner_notes: '',
};

// Calculate profile completion percentage (0 - 100)
export const calculateProfileCompletion = (data: ProfileFormData): number => {
  let score = 0;
  const totalWeight = 100;

  // Step 1: Basic (20 pts)
  if (data.first_name.trim() && data.date_of_birth && data.gender && data.marital_status && data.community) {
    score += 20;
  } else if (data.first_name.trim() && data.date_of_birth) {
    score += 10;
  }

  // Step 2: Education & Career (15 pts)
  if (data.highest_education && data.occupation && data.annual_income) {
    score += 15;
  } else if (data.highest_education || data.occupation) {
    score += 8;
  }

  // Step 3: Family (15 pts)
  if (data.family_type && data.family_values && (data.father_occupation || data.mother_occupation)) {
    score += 15;
  } else if (data.family_type) {
    score += 8;
  }

  // Step 4: Lifestyle (10 pts)
  if (data.diet && data.smoking && data.drinking) {
    score += 10;
  } else if (data.diet) {
    score += 5;
  }

  // Step 5: Location (15 pts)
  if (data.current_city && data.native_place) {
    score += 15;
  } else if (data.current_city) {
    score += 8;
  }

  // Step 6: About Me (15 pts) - Requires min 50 chars for full score
  if (data.about_me && data.about_me.trim().length >= 50) {
    score += 15;
  } else if (data.about_me && data.about_me.trim().length > 0) {
    score += 5;
  }

  // Step 7: Partner Preferences (10 pts)
  if (data.partner_min_age && data.partner_max_age && data.partner_min_height) {
    score += 10;
  } else if (data.partner_min_age) {
    score += 5;
  }

  return Math.min(score, totalWeight);
};
