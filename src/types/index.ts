export type Language = 'mr' | 'en';

export interface LocalizedString {
  mr: string;
  en: string;
}

export interface Profile {
  id: string;
  profileId: string;
  name: LocalizedString;
  gender: 'male' | 'female';
  age: number;
  height: string; // e.g., "5 ft 8 in / 172 cm"
  heightCm: number;
  maritalStatus: LocalizedString;
  religion: LocalizedString;
  community: LocalizedString; // Caste / Sub-caste
  motherTongue: LocalizedString;
  gothra?: LocalizedString;
  rashi?: LocalizedString;
  nakshatra?: LocalizedString;
  manglik?: LocalizedString;
  
  // Location
  city: LocalizedString;
  district: LocalizedString;
  state: LocalizedString;
  country: LocalizedString;
  
  // Education & Career
  education: LocalizedString;
  educationDetail: LocalizedString;
  occupation: LocalizedString;
  occupationCategory: 'software' | 'doctor' | 'government' | 'engineering' | 'business' | 'banking' | 'teaching' | 'other';
  employedIn: LocalizedString;
  annualIncome: LocalizedString;
  annualIncomeValue: number; // in LPA
  
  // Media
  photoUrl: string;
  gallery: string[];
  photosHidden?: boolean;
  /** 3 = Platinum, 2 = Diamond, 0 = none (set by the database from the active subscription) */
  listingPriority?: number;
  isHighlighted?: boolean;
  isVerified: boolean;
  isPremium: boolean;
  lastActive: LocalizedString;
  
  // Detailed info
  aboutMe: LocalizedString;
  lifestyle: {
    diet: LocalizedString;
    smoke: LocalizedString;
    drink: LocalizedString;
    hobbies: LocalizedString[];
  };
  family: {
    familyType: LocalizedString; // Nuclear / Joint
    familyStatus: LocalizedString; // Middle class / Upper middle class
    fatherOccupation: LocalizedString;
    motherOccupation: LocalizedString;
    brothers: number;
    sisters: number;
    nativePlace: LocalizedString;
  };
  partnerPreferences: {
    ageRange: string;
    heightRange: string;
    maritalStatus: LocalizedString[];
    communities: LocalizedString[];
    education: LocalizedString[];
    occupations: LocalizedString[];
    preferredLocations: LocalizedString[];
    expectedIncome: LocalizedString;
  };
}

export interface SearchFiltersState {
  gender: 'all' | 'male' | 'female';
  minAge: number;
  maxAge: number;
  minHeight: number;
  maxHeight: number;
  maritalStatus: string;
  religion: string;
  community: string;
  education: string;
  occupation: string;
  minIncome: number;
  state: string;
  city: string;
  verifiedOnly: boolean;
  photoOnly: boolean;
}

export interface PricingPlan {
  id: string;
  name: LocalizedString;
  badge?: LocalizedString;
  price: LocalizedString | string;
  originalPrice?: LocalizedString | string;
  duration: LocalizedString;
  popular?: boolean;
  features: LocalizedString[];
  nonFeatures?: LocalizedString[];
  buttonText: LocalizedString;
}

export interface SuccessStory {
  id: string;
  coupleNames: LocalizedString;
  weddingDate: LocalizedString;
  location: LocalizedString;
  story: LocalizedString;
  imageUrl: string;
  quote: LocalizedString;
}

export interface FAQItem {
  id: string;
  category: 'general' | 'registration' | 'privacy' | 'membership';
  question: LocalizedString;
  answer: LocalizedString;
}
