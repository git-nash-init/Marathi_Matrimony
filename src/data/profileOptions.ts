export interface OptionItem {
  id: string;
  value: string;
  mr: string;
  en: string;
  label: {
    mr: string;
    en: string;
  };
}

const createOption = (id: string, mr: string, en: string): OptionItem => ({
  id,
  value: id,
  mr,
  en,
  label: { mr, en },
});

export const PROFILE_FOR_OPTIONS: OptionItem[] = [
  createOption('self', 'स्वतःसाठी', 'Self'),
  createOption('son', 'मुलासाठी', 'Son'),
  createOption('daughter', 'मुलीसाठी', 'Daughter'),
  createOption('brother', 'भावासाठी', 'Brother'),
  createOption('sister', 'बहिणीसाठी', 'Sister'),
  createOption('relative', 'नातेवाईक', 'Relative / Friend'),
];

export const GENDER_OPTIONS: OptionItem[] = [
  createOption('female', 'वधू / मुलगी', 'Bride / Female'),
  createOption('male', 'वर / मुलगा', 'Groom / Male'),
];

export const MARATHI_COMMUNITIES: OptionItem[] = [
  createOption('maratha_96k', '९६ कुळी मराठा', '96 Kuli Maratha'),
  createOption('maratha', 'मराठा', 'Maratha'),
  createOption('deshastha_brahmin', 'देशस्थ ब्राह्मण', 'Deshastha Brahmin'),
  createOption('kokanastha_brahmin', 'कोकणस्थ ब्राह्मण', 'Kokanastha Brahmin'),
  createOption('karhade_brahmin', 'कर्‍हाडे ब्राह्मण', 'Karhade Brahmin'),
  createOption('ckp', 'चांद्रसेनीय कायस्थ प्रभू', 'CKP (Kayastha Prabhu)'),
  createOption('kunbi_maratha', 'कुणबी मराठा', 'Kunbi Maratha'),
  createOption('mali', 'माळी समाज', 'Mali'),
  createOption('sonar', 'सोनार / दैवज्ञ', 'Sonar / Daivadnya'),
  createOption('vanjari', 'वंजारी', 'Vanjari'),
  createOption('dhangar', 'धनगर', 'Dhangar'),
  createOption('chambhar', 'चांभार समाज', 'Chambhar'),
  createOption('matang', 'मातंग समाज', 'Matang'),
  createOption('agri', 'आगरी समाज', 'Agri'),
  createOption('bhandari', 'भंडारी समाज', 'Bhandari'),
  createOption('lingayat', 'लिंगायत', 'Lingayat'),
  createOption('gurav', 'गुरव', 'Gurav'),
  createOption('sutar', 'सुतार / विश्वकर्मा', 'Sutar / Vishwakarma'),
  createOption('teli', 'तेली समाज', 'Teli'),
  createOption('koshti', 'कोष्टी / देवांग', 'Koshti'),
  createOption('nhavi', 'न्हावी / सेना', 'Nhavi'),
  createOption('jain_marathi', 'जैन (मराठी)', 'Jain (Marathi)'),
  createOption('buddhist', 'बौद्ध', 'Buddhist'),
  createOption('other', 'इतर सर्व समाज', 'Other Communities'),
];
export const COMMUNITY_OPTIONS = MARATHI_COMMUNITIES;

export const MARITAL_STATUS_OPTIONS: OptionItem[] = [
  createOption('never_married', 'अविवाहित', 'Never Married'),
  createOption('divorced', 'घटस्फोटित', 'Divorced'),
  createOption('widowed', 'विधूर / विधवा', 'Widowed'),
  createOption('awaiting_divorce', 'घटस्फोट प्रतीक्षेत', 'Awaiting Divorce'),
];

export const MANGLIK_OPTIONS: OptionItem[] = [
  createOption('no', 'नाही (मंगळ नाही)', 'No (Non-Manglik)'),
  createOption('yes', 'होय (मांगलिक)', 'Yes (Manglik)'),
  createOption('anshik', 'आंशिक / सौम्य मंगळ', 'Anshik / Mild Manglik'),
  createOption('dont_know', 'माहिती नाही', 'Don\'t Know'),
];

export const MOTHER_TONGUE_OPTIONS: OptionItem[] = [
  createOption('Marathi', 'मराठी', 'Marathi'),
  createOption('Hindi', 'हिंदी', 'Hindi'),
  createOption('Gujarati', 'गुजराती', 'Gujarati'),
  createOption('Kannada', 'कन्नड', 'Kannada'),
  createOption('Konkani', 'कोंकणी', 'Konkani'),
  createOption('English', 'इंग्रजी', 'English'),
  createOption('Telugu', 'तेलगू', 'Telugu'),
  createOption('Other', 'इतर', 'Other'),
];

export const RELIGION_OPTIONS: OptionItem[] = [
  createOption('Hindu', 'हिंदू', 'Hindu'),
  createOption('Jain', 'जैन', 'Jain'),
  createOption('Buddhist', 'बौद्ध', 'Buddhist'),
  createOption('Sikh', 'शीख', 'Sikh'),
  createOption('Other', 'इतर', 'Other'),
];

export const EDUCATION_OPTIONS: OptionItem[] = [
  createOption('BE_BTech', 'B.E. / B.Tech (अभियांत्रिकी)', 'B.E. / B.Tech (Engineering)'),
  createOption('ME_MTech', 'M.E. / M.Tech / MS', 'M.E. / M.Tech / MS'),
  createOption('MBA_PGDM', 'MBA / PGDM (व्यवस्थापन)', 'MBA / PGDM'),
  createOption('MBBS_MD_MS', 'MBBS / MD / MS (वैद्यकीय)', 'MBBS / MD / MS (Doctor)'),
  createOption('BDS_MDS', 'BDS / MDS (दंतवैद्यकीय)', 'BDS / MDS (Dental)'),
  createOption('BAMS_BHMS', 'BAMS / BHMS (आयुर्वेद / होमिओपॅथी)', 'BAMS / BHMS'),
  createOption('CA_CS_ICWA', 'CA / CS / CFA / ICWA', 'CA / CS / CFA / ICWA'),
  createOption('BCA_MCA_BSC_IT', 'BCA / MCA / B.Sc IT / M.Sc IT', 'BCA / MCA / B.Sc IT / M.Sc IT'),
  createOption('BCom_MCom', 'B.Com / M.Com (वाणिज्य)', 'B.Com / M.Com'),
  createOption('BSc_MSc', 'B.Sc / M.Sc (विज्ञान)', 'B.Sc / M.Sc'),
  createOption('BA_MA', 'B.A / M.A (कला)', 'B.A / M.A'),
  createOption('LLB_LLM', 'LLB / LLM (विधी / कायदा)', 'LLB / LLM (Law)'),
  createOption('BPharm_MPharm', 'B.Pharm / M.Pharm (औषधनिर्माण)', 'B.Pharm / M.Pharm'),
  createOption('BArch_MArch', 'B.Arch / M.Arch (वास्तुशास्त्र)', 'B.Arch / M.Arch'),
  createOption('Diploma', 'पॉलिटेक्निक / डिप्लोमा', 'Diploma / Polytechnic'),
  createOption('PhD_Doctorate', 'पीएच.डी / डॉक्टरेट', 'Ph.D / Doctorate'),
  createOption('Other', 'इतर पदवी / शिक्षण', 'Other Degree'),
];

export const OCCUPATION_OPTIONS: OptionItem[] = [
  createOption('software_it', 'सॉफ्टवेअर इंजिनिअर / आयटी', 'Software Engineer / IT Professional'),
  createOption('doctor_healthcare', 'डॉक्टर / वैद्यकीय व्यावसायिक', 'Doctor / Medical Professional'),
  createOption('govt_civil_services', 'शासकीय सेवा / वर्ग १/२ अधिकारी', 'Government / Civil Services (MPSC/UPSC)'),
  createOption('banking_finance', 'बँकिंग / वित्त / सीए', 'Banking / Finance / CA'),
  createOption('business_entrepreneur', 'व्यवसाय / उद्योजक', 'Business / Entrepreneur'),
  createOption('engineer_core', 'मेकॅनिकल / सिव्हिल / इलेक्ट्रिकल इंजिनिअर', 'Mechanical / Civil / Electrical Engineer'),
  createOption('teacher_professor', 'प्राध्यापक / शिक्षक', 'Professor / Lecturer / Teacher'),
  createOption('advocate_legal', 'वकील / विधी सल्लागार', 'Advocate / Legal Professional'),
  createOption('defense_police', 'संरक्षण दल / पोलीस', 'Defense Forces / Police Officer'),
  createOption('pharma_biotech', 'फार्मा / बायोटेक', 'Pharma / Biotech Professional'),
  createOption('marketing_sales', 'मार्केटिंग / विक्री', 'Marketing / Corporate Sales'),
  createOption('architecture_design', 'आर्किटेक्ट / डिझायनर', 'Architect / Interior Designer'),
  createOption('agriculture', 'शेती / कृषी व्यवसाय', 'Agriculture / Modern Farming'),
  createOption('self_employed', 'स्वयंरोजगार / सल्लागार', 'Self-Employed / Consultant'),
  createOption('not_working', 'सध्या कार्यरत नाही', 'Not Working'),
  createOption('other', 'इतर व्यवसाय', 'Other Occupation'),
];

export const EMPLOYMENT_TYPE_OPTIONS: OptionItem[] = [
  createOption('private', 'खाजगी कंपनी', 'Private Sector / MNC'),
  createOption('government', 'शासकीय नोकरी', 'Government / PSU'),
  createOption('business', 'स्वतःचा व्यवसाय', 'Business / Self-Employed'),
  createOption('defense', 'संरक्षण दल', 'Defense Forces'),
  createOption('not_working', 'कार्यरत नाही', 'Not Working'),
];

export const ANNUAL_INCOME_RANGES: OptionItem[] = [
  createOption('below_3_lakhs', '₹३ लाखांपेक्षा कमी', 'Below ₹3 LPA'),
  createOption('3_5_lakhs', '₹३ ते ५ लाख प्रतिवर्ष', '₹3 - 5 LPA'),
  createOption('5_7_lakhs', '₹५ ते ७ लाख प्रतिवर्ष', '₹5 - 7 LPA'),
  createOption('7_10_lakhs', '₹७ ते १० लाख प्रतिवर्ष', '₹7 - 10 LPA'),
  createOption('10_15_lakhs', '₹१० ते १५ लाख प्रतिवर्ष', '₹10 - 15 LPA'),
  createOption('15_25_lakhs', '₹१५ ते २५ लाख प्रतिवर्ष', '₹15 - 25 LPA'),
  createOption('25_50_lakhs', '₹२५ ते ५० लाख प्रतिवर्ष', '₹25 - 50 LPA'),
  createOption('above_50_lakhs', '₹५० लाखांपेक्षा जास्त', 'Above ₹50 LPA'),
  createOption('not_disclosed', 'प्रकट केलेले नाही', 'Not Disclosed'),
];

export const DIET_OPTIONS: OptionItem[] = [
  createOption('vegetarian', 'शाकाहारी', 'Vegetarian'),
  createOption('non_vegetarian', 'मांसाहारी', 'Non-Vegetarian'),
  createOption('eggetarian', 'अंडाहारी', 'Eggetarian'),
  createOption('jain', 'जैन शाकाहारी', 'Jain Vegetarian'),
  createOption('vegan', 'शाकाहारी / व्हेगन', 'Vegan'),
];

export const SMOKING_OPTIONS: OptionItem[] = [
  createOption('no', 'नाही', 'No / Never'),
  createOption('occasionally', 'कधीतरी', 'Occasionally'),
  createOption('yes', 'होय', 'Regularly'),
];

export const DRINKING_OPTIONS: OptionItem[] = [
  createOption('no', 'नाही', 'No / Never'),
  createOption('occasionally', 'कधीतरी', 'Occasionally'),
  createOption('yes', 'होय', 'Regularly'),
];
export const SMOKING_DRINKING_OPTIONS = SMOKING_OPTIONS;

export const FAMILY_TYPES: OptionItem[] = [
  createOption('nuclear', 'विभक्त कुटुंब', 'Nuclear Family'),
  createOption('joint', 'एकत्र कुटुंब', 'Joint Family'),
];
export const FAMILY_TYPE_OPTIONS = FAMILY_TYPES;

export const FAMILY_VALUES: OptionItem[] = [
  createOption('traditional', 'पारंपारिक', 'Traditional'),
  createOption('moderate', 'मध्यममार्गी', 'Moderate / Balanced'),
  createOption('liberal', 'आधुनिक / पुरोगामी', 'Liberal / Progressive'),
];
export const FAMILY_VALUES_OPTIONS = FAMILY_VALUES;

export const FAMILY_STATUS_OPTIONS: OptionItem[] = [
  createOption('middle_class', 'मध्यमवर्गीय', 'Middle Class'),
  createOption('upper_middle_class', 'उच्च मध्यमवर्गीय', 'Upper Middle Class'),
  createOption('affluent', 'श्रीमंत / संपन्न', 'Affluent / Rich'),
];

export const MAHARASHTRA_CITIES: OptionItem[] = [
  createOption('Pune', 'पुणे', 'Pune'),
  createOption('Mumbai', 'मुंबई', 'Mumbai'),
  createOption('Thane', 'ठाणे', 'Thane'),
  createOption('Navi Mumbai', 'नवी मुंबई', 'Navi Mumbai'),
  createOption('Nashik', 'नाशिक', 'Nashik'),
  createOption('Nagpur', 'नागपूर', 'Nagpur'),
  createOption('Chhatrapati Sambhajinagar', 'छत्रपती संभाजीनगर', 'Chhatrapati Sambhajinagar (Aurangabad)'),
  createOption('Kolhapur', 'कोल्हापूर', 'Kolhapur'),
  createOption('Solapur', 'सोलापूर', 'Solapur'),
  createOption('Satara', 'सातारा', 'Satara'),
  createOption('Sangli', 'सांगली', 'Sangli'),
  createOption('Ahmednagar', 'अहमदनगर / अहिल्यानगर', 'Ahmednagar / Ahilyanagar'),
  createOption('Jalgaon', 'जळगाव', 'Jalgaon'),
  createOption('Amravati', 'अमरावती', 'Amravati'),
  createOption('Nanded', 'नांदेड', 'Nanded'),
  createOption('Ratnagiri', 'रत्नागिरी', 'Ratnagiri'),
  createOption('Sindhudurg', 'सिंधुदुर्ग', 'Sindhudurg'),
  createOption('Latur', 'लातूर', 'Latur'),
  createOption('Dhule', 'धुळे', 'Dhule'),
  createOption('Chandrapur', 'चंद्रपूर', 'Chandrapur'),
  createOption('Raigad', 'रायगड / अलिबाग', 'Raigad'),
  createOption('Beed', 'बीड', 'Beed'),
  createOption('Yavatmal', 'यवतमाळ', 'Yavatmal'),
  createOption('Wardha', 'वर्धा', 'Wardha'),
  createOption('Jalna', 'जालना', 'Jalna'),
  createOption('Dharashiv', 'धाराशिव / उस्मानाबाद', 'Dharashiv / Osmanabad'),
  createOption('Buldhana', 'बुलढाणा', 'Buldhana'),
  createOption('Akola', 'अकोला', 'Akola'),
  createOption('Other_India', 'महाराष्ट्राबाहेरील शहर', 'Other City in India'),
  createOption('International', 'परदेशात', 'Abroad / International'),
];

export const HOBBIES_LIST: OptionItem[] = [
  createOption('classical_music', 'शास्त्रीय संगीत', 'Classical Music'),
  createOption('reading', 'वाचन', 'Reading Books'),
  createOption('trekking', 'सह्याद्री ट्रेकिंग', 'Sahyadri Trekking'),
  createOption('cooking', 'पाककला', 'Cooking & Culinary'),
  createOption('photography', 'छायाचित्रण', 'Photography'),
  createOption('traveling', 'पर्यटन', 'Traveling & Exploring'),
  createOption('yoga_fitness', 'योगा व व्यायाम', 'Yoga & Fitness'),
  createOption('natak_theatre', 'मराठी नाटक व चित्रपट', 'Theater & Movies'),
  createOption('gardening', 'बागकाम', 'Gardening & Nature'),
  createOption('painting_art', 'चित्रकला / हस्तकला', 'Painting & Art'),
  createOption('sports_cricket', 'खेळ / क्रिकेट', 'Sports & Badminton'),
  createOption('writing', 'लेखन व कविता', 'Writing & Poetry'),
  createOption('swimming', 'पो‍हणे', 'Swimming'),
  createOption('cycling', 'सायकलिंग', 'Cycling'),
];

// Helper: Calculate age from YYYY-MM-DD
export const calculateAgeFromDob = (dobString: string): number | null => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

// Helper: Height cm to feet-inches display string
export const cmToFeetInches = (cm: number | null | undefined): string => {
  if (!cm || cm <= 0) return '';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet} ft ${inches} in (${cm} cm)`;
};
