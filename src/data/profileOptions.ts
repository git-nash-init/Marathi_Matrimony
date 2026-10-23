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
  createOption('self', 'स्वतःसाठी (Self)', 'Self'),
  createOption('son', 'मुलासाठी (Son)', 'Son'),
  createOption('daughter', 'मुलीसाठी (Daughter)', 'Daughter'),
  createOption('brother', 'भावासाठी (Brother)', 'Brother'),
  createOption('sister', 'बहिणीसाठी (Sister)', 'Sister'),
  createOption('relative', 'नातेवाईक (Relative/Friend)', 'Relative / Friend'),
];

export const GENDER_OPTIONS: OptionItem[] = [
  createOption('female', 'वधू / मुलगी (Bride)', 'Bride / Female'),
  createOption('male', 'वर / मुलगा (Groom)', 'Groom / Male'),
];

export const MARATHI_COMMUNITIES: OptionItem[] = [
  createOption('maratha_96k', '९६ कुळी मराठा (96 Kuli Maratha)', '96 Kuli Maratha'),
  createOption('maratha', 'मराठा (Maratha)', 'Maratha'),
  createOption('deshastha_brahmin', 'देशस्थ ब्राह्मण (Deshastha Brahmin)', 'Deshastha Brahmin'),
  createOption('kokanastha_brahmin', 'कोकणस्थ ब्राह्मण (Kokanastha Brahmin)', 'Kokanastha Brahmin'),
  createOption('karhade_brahmin', 'कर्‍हाडे ब्राह्मण (Karhade Brahmin)', 'Karhade Brahmin'),
  createOption('ckp', 'चांद्रसेनीय कायस्थ प्रभू (CKP)', 'CKP (Kayastha Prabhu)'),
  createOption('kunbi_maratha', 'कुणबी मराठा (Kunbi Maratha)', 'Kunbi Maratha'),
  createOption('mali', 'माळी समाज (Mali)', 'Mali'),
  createOption('sonar', 'सोनार / दैवज्ञ (Sonar)', 'Sonar / Daivadnya'),
  createOption('vanjari', 'वंजारी (Vanjari)', 'Vanjari'),
  createOption('dhangar', 'धनगर (Dhangar)', 'Dhangar'),
  createOption('chambhar', 'चांभार समाज (Chambhar)', 'Chambhar'),
  createOption('matang', 'मातंग समाज (Matang)', 'Matang'),
  createOption('agri', 'आगरी समाज (Agri)', 'Agri'),
  createOption('bhandari', 'भंडारी समाज (Bhandari)', 'Bhandari'),
  createOption('lingayat', 'लिंगायत (Lingayat)', 'Lingayat'),
  createOption('gurav', 'गुरव (Gurav)', 'Gurav'),
  createOption('sutar', 'सुतार / विश्वकर्मा (Sutar)', 'Sutar / Vishwakarma'),
  createOption('teli', 'तेली समाज (Teli)', 'Teli'),
  createOption('koshti', 'कोष्टी / देवांग (Koshti)', 'Koshti'),
  createOption('nhavi', 'न्हावी / सेना (Nhavi)', 'Nhavi'),
  createOption('jain_marathi', 'जैन (Jain - Marathi)', 'Jain (Marathi)'),
  createOption('buddhist', 'बौद्ध (Buddhist)', 'Buddhist'),
  createOption('other', 'इतर सर्व समाज (Other Communities)', 'Other Communities'),
];
export const COMMUNITY_OPTIONS = MARATHI_COMMUNITIES;

export const MARITAL_STATUS_OPTIONS: OptionItem[] = [
  createOption('never_married', 'अविवाहित (Never Married)', 'Never Married'),
  createOption('divorced', 'घटस्फोटित (Divorced)', 'Divorced'),
  createOption('widowed', 'विधूर / विधवा (Widowed)', 'Widowed'),
  createOption('awaiting_divorce', 'घटस्फोट प्रतीक्षेत (Awaiting Divorce)', 'Awaiting Divorce'),
];

export const MANGLIK_OPTIONS: OptionItem[] = [
  createOption('no', 'नाही (Non-Manglik)', 'No (Non-Manglik)'),
  createOption('yes', 'होय (Manglik)', 'Yes (Manglik)'),
  createOption('anshik', 'आंशिक / सौम्य मंगळ (Anshik Manglik)', 'Anshik / Mild Manglik'),
  createOption('dont_know', 'माहिती नाही (Don\'t Know)', 'Don\'t Know'),
];

export const MOTHER_TONGUE_OPTIONS: OptionItem[] = [
  createOption('Marathi', 'मराठी (Marathi)', 'Marathi'),
  createOption('Hindi', 'हिंदी (Hindi)', 'Hindi'),
  createOption('Gujarati', 'गुजराती (Gujarati)', 'Gujarati'),
  createOption('Kannada', 'कन्नड (Kannada)', 'Kannada'),
  createOption('Konkani', 'कोंकणी (Konkani)', 'Konkani'),
  createOption('English', 'इंग्रजी (English)', 'English'),
  createOption('Telugu', 'तेलगू (Telugu)', 'Telugu'),
  createOption('Other', 'इतर (Other)', 'Other'),
];

export const RELIGION_OPTIONS: OptionItem[] = [
  createOption('Hindu', 'हिंदू (Hindu)', 'Hindu'),
  createOption('Jain', 'जैन (Jain)', 'Jain'),
  createOption('Buddhist', 'बौद्ध (Buddhist)', 'Buddhist'),
  createOption('Sikh', 'शीख (Sikh)', 'Sikh'),
  createOption('Other', 'इतर (Other)', 'Other'),
];

export const EDUCATION_OPTIONS: OptionItem[] = [
  createOption('BE_BTech', 'B.E. / B.Tech (इंजिनिअरिंग)', 'B.E. / B.Tech (Engineering)'),
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
  createOption('BPharm_MPharm', 'B.Pharm / M.Pharm (फार्मसी)', 'B.Pharm / M.Pharm'),
  createOption('BArch_MArch', 'B.Arch / M.Arch (वास्तुशास्त्र)', 'B.Arch / M.Arch'),
  createOption('Diploma', 'डिप्लोमा (Polytechnic / Diploma)', 'Diploma / Polytechnic'),
  createOption('PhD_Doctorate', 'Ph.D / Doctorate', 'Ph.D / Doctorate'),
  createOption('Other', 'इतर पदवी / शिक्षण (Other)', 'Other Degree'),
];

export const OCCUPATION_OPTIONS: OptionItem[] = [
  createOption('software_it', 'सॉफ्टवेअर इंजिनिअर / आयटी (Software / IT Professional)', 'Software Engineer / IT Professional'),
  createOption('doctor_healthcare', 'डॉक्टर / वैद्यकीय व्यावसायिक (Doctor / Medical)', 'Doctor / Medical Professional'),
  createOption('govt_civil_services', 'शासकीय सेवा / क्लास १/२ अधिकारी (Govt / Civil Services)', 'Government / Civil Services (MPSC/UPSC)'),
  createOption('banking_finance', 'बँकिंग / वित्त / सीए (Banking / Finance / CA)', 'Banking / Finance / CA'),
  createOption('business_entrepreneur', 'व्यवसाय / उद्योजक (Business / Entrepreneur)', 'Business / Entrepreneur'),
  createOption('engineer_core', 'मेकॅनिकल / सिव्हिल / इलेक्ट्रिकल इंजिनिअर', 'Mechanical / Civil / Electrical Engineer'),
  createOption('teacher_professor', 'प्राध्यापक / शिक्षक (Professor / Teacher)', 'Professor / Lecturer / Teacher'),
  createOption('advocate_legal', 'वकील / विधी सल्लागार (Advocate / Legal)', 'Advocate / Legal Professional'),
  createOption('defense_police', 'संरक्षण दल / पोलीस (Defense / Police)', 'Defense Forces / Police Officer'),
  createOption('pharma_biotech', 'फार्मा / बायोटेक (Pharma / Healthcare)', 'Pharma / Biotech Professional'),
  createOption('marketing_sales', 'मार्केटिंग / विक्री (Marketing / Sales)', 'Marketing / Corporate Sales'),
  createOption('architecture_design', 'आर्किटेक्ट / डिझायनर (Architect / Designer)', 'Architect / Interior Designer'),
  createOption('agriculture', 'शेती / कृषी व्यवसाय (Agriculture / Farming)', 'Agriculture / Modern Farming'),
  createOption('self_employed', 'स्वयंरोजगार / कन्सल्टंट (Self-Employed / Consultant)', 'Self-Employed / Consultant'),
  createOption('not_working', 'सध्या कार्यरत नाही (Not Working)', 'Not Working'),
  createOption('other', 'इतर व्यवसाय (Other)', 'Other Occupation'),
];

export const EMPLOYMENT_TYPE_OPTIONS: OptionItem[] = [
  createOption('private', 'खाजगी कंपनी (Private Sector / MNC)', 'Private Sector / MNC'),
  createOption('government', 'शासकीय नोकरी (Government / PSU)', 'Government / PSU'),
  createOption('business', 'स्वतःचा व्यवसाय (Business / Self-Employed)', 'Business / Self-Employed'),
  createOption('defense', 'संरक्षण दल (Defense / Paramilitary)', 'Defense Forces'),
  createOption('not_working', 'कार्यरत नाही (Not Working)', 'Not Working'),
];

export const ANNUAL_INCOME_RANGES: OptionItem[] = [
  createOption('below_3_lakhs', '₹३ लाखांपेक्षा कमी (Below ₹3 LPA)', 'Below ₹3 LPA'),
  createOption('3_5_lakhs', '₹३ ते ५ लाख प्रतिवर्ष (₹3 - 5 LPA)', '₹3 - 5 LPA'),
  createOption('5_7_lakhs', '₹५ ते ७ लाख प्रतिवर्ष (₹5 - 7 LPA)', '₹5 - 7 LPA'),
  createOption('7_10_lakhs', '₹७ ते १० लाख प्रतिवर्ष (₹7 - 10 LPA)', '₹7 - 10 LPA'),
  createOption('10_15_lakhs', '₹१० ते १५ लाख प्रतिवर्ष (₹10 - 15 LPA)', '₹10 - 15 LPA'),
  createOption('15_25_lakhs', '₹१५ ते २५ लाख प्रतिवर्ष (₹15 - 25 LPA)', '₹15 - 25 LPA'),
  createOption('25_50_lakhs', '₹२५ ते ५० लाख प्रतिवर्ष (₹25 - 50 LPA)', '₹25 - 50 LPA'),
  createOption('above_50_lakhs', '₹५० लाखांपेक्षा जास्त (Above ₹50 LPA)', 'Above ₹50 LPA'),
  createOption('not_disclosed', 'प्रकट केलेले नाही (Not Disclosed)', 'Not Disclosed'),
];

export const DIET_OPTIONS: OptionItem[] = [
  createOption('vegetarian', 'शाकाहारी (Vegetarian)', 'Vegetarian'),
  createOption('non_vegetarian', 'मांसाहारी (Non-Vegetarian)', 'Non-Vegetarian'),
  createOption('eggetarian', 'अंडाहारी (Eggetarian)', 'Eggetarian'),
  createOption('jain', 'जैन शाकाहारी (Jain Vegetarian)', 'Jain Vegetarian'),
  createOption('vegan', 'शाकाहारी / व्हेगन (Vegan)', 'Vegan'),
];

export const SMOKING_OPTIONS: OptionItem[] = [
  createOption('no', 'नाही (No / Never)', 'No / Never'),
  createOption('occasionally', 'कधीतरी (Occasionally)', 'Occasionally'),
  createOption('yes', 'होय (Regularly)', 'Regularly'),
];

export const DRINKING_OPTIONS: OptionItem[] = [
  createOption('no', 'नाही (No / Never)', 'No / Never'),
  createOption('occasionally', 'कधीतरी (Occasionally)', 'Occasionally'),
  createOption('yes', 'होय (Regularly)', 'Regularly'),
];
export const SMOKING_DRINKING_OPTIONS = SMOKING_OPTIONS;

export const FAMILY_TYPES: OptionItem[] = [
  createOption('nuclear', 'विभक्त कुटुंब (Nuclear Family)', 'Nuclear Family'),
  createOption('joint', 'एकत्र कुटुंब (Joint Family)', 'Joint Family'),
];
export const FAMILY_TYPE_OPTIONS = FAMILY_TYPES;

export const FAMILY_VALUES: OptionItem[] = [
  createOption('traditional', 'पारंपारिक (Traditional)', 'Traditional'),
  createOption('moderate', 'मध्यममार्गी (Moderate / Balanced)', 'Moderate / Balanced'),
  createOption('liberal', 'आधुनिक / पुरोगामी (Liberal / Progressive)', 'Liberal / Progressive'),
];
export const FAMILY_VALUES_OPTIONS = FAMILY_VALUES;

export const FAMILY_STATUS_OPTIONS: OptionItem[] = [
  createOption('middle_class', 'मध्यमवर्गीय (Middle Class)', 'Middle Class'),
  createOption('upper_middle_class', 'उच्च मध्यमवर्गीय (Upper Middle Class)', 'Upper Middle Class'),
  createOption('affluent', 'श्रीमंत / संपन्न (Affluent / Rich)', 'Affluent / Rich'),
];

export const MAHARASHTRA_CITIES: OptionItem[] = [
  createOption('Pune', 'पुणे (Pune)', 'Pune'),
  createOption('Mumbai', 'मुंबई (Mumbai)', 'Mumbai'),
  createOption('Thane', 'ठाणे (Thane)', 'Thane'),
  createOption('Navi Mumbai', 'नवी मुंबई (Navi Mumbai)', 'Navi Mumbai'),
  createOption('Nashik', 'नाशिक (Nashik)', 'Nashik'),
  createOption('Nagpur', 'नागपूर (Nagpur)', 'Nagpur'),
  createOption('Chhatrapati Sambhajinagar', 'छत्रपती संभाजीनगर (Aurangabad)', 'Chhatrapati Sambhajinagar (Aurangabad)'),
  createOption('Kolhapur', 'कोल्हापूर (Kolhapur)', 'Kolhapur'),
  createOption('Solapur', 'सोलापूर (Solapur)', 'Solapur'),
  createOption('Satara', 'सातारा (Satara)', 'Satara'),
  createOption('Sangli', 'सांगली (Sangli)', 'Sangli'),
  createOption('Ahmednagar', 'अहमदनगर / अहिल्यानगर (Ahmednagar)', 'Ahmednagar / Ahilyanagar'),
  createOption('Jalgaon', 'जळगाव (Jalgaon)', 'Jalgaon'),
  createOption('Amravati', 'अमरावती (Amravati)', 'Amravati'),
  createOption('Nanded', 'नांदेड (Nanded)', 'Nanded'),
  createOption('Ratnagiri', 'रत्नागिरी (Ratnagiri)', 'Ratnagiri'),
  createOption('Sindhudurg', 'सिंधुदुर्ग (Sindhudurg)', 'Sindhudurg'),
  createOption('Latur', 'लातूर (Latur)', 'Latur'),
  createOption('Dhule', 'धुळे (Dhule)', 'Dhule'),
  createOption('Chandrapur', 'चंद्रपूर (Chandrapur)', 'Chandrapur'),
  createOption('Raigad', 'रायगड / अलिबाग (Raigad)', 'Raigad'),
  createOption('Beed', 'बीड (Beed)', 'Beed'),
  createOption('Yavatmal', 'यवतमाळ (Yavatmal)', 'Yavatmal'),
  createOption('Wardha', 'वर्धा (Wardha)', 'Wardha'),
  createOption('Jalna', 'जालना (Jalna)', 'Jalna'),
  createOption('Dharashiv', 'धाराशिव / उस्मानाबाद (Dharashiv)', 'Dharashiv / Osmanabad'),
  createOption('Buldhana', 'बुलढाणा (Buldhana)', 'Buldhana'),
  createOption('Akola', 'अकोला (Akola)', 'Akola'),
  createOption('Other_India', 'महाराष्ट्राबाहेरील शहर (Outside Maharashtra)', 'Other City in India'),
  createOption('International', 'परदेशात (Abroad / International)', 'Abroad / International'),
];

export const HOBBIES_LIST: OptionItem[] = [
  createOption('classical_music', 'शास्त्रीय संगीत (Classical Music)', 'Classical Music'),
  createOption('reading', 'वाचन (Reading Books)', 'Reading Books'),
  createOption('trekking', 'सह्याद्री ट्रेकिंग (Trekking)', 'Sahyadri Trekking'),
  createOption('cooking', 'पाककला (Cooking / Food)', 'Cooking & Culinary'),
  createOption('photography', 'छायाचित्रण (Photography)', 'Photography'),
  createOption('traveling', 'पर्यटन (Traveling & Exploring)', 'Traveling & Exploring'),
  createOption('yoga_fitness', 'योगा व व्यायाम (Yoga & Fitness)', 'Yoga & Fitness'),
  createOption('natak_theatre', 'मराठी नाटक व चित्रपट (Theater & Movies)', 'Theater & Movies'),
  createOption('gardening', 'बागकाम (Gardening)', 'Gardening & Nature'),
  createOption('painting_art', 'चित्रकला / हस्तकला (Painting & Art)', 'Painting & Art'),
  createOption('sports_cricket', 'खेळ / क्रिकेट (Sports / Cricket)', 'Sports & Badminton'),
  createOption('writing', 'लेखन व कविता (Writing & Poetry)', 'Writing & Poetry'),
  createOption('swimming', 'पो‍हणे (Swimming)', 'Swimming'),
  createOption('cycling', 'सायकलिंग (Cycling)', 'Cycling'),
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
