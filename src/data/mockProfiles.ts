import { Profile } from '../types';

export const mockProfiles: Profile[] = [
  {
    id: "mm-101",
    profileId: "MM-101",
    name: { mr: "प्राजक्ता जोशी", en: "Prajakta Joshi" },
    gender: "female",
    age: 27,
    height: "5 ft 4 in / 162 cm",
    heightCm: 162,
    maritalStatus: { mr: "अविवाहित", en: "Never Married" },
    religion: { mr: "हिंदू", en: "Hindu" },
    community: { mr: "कोकणस्थ ब्राह्मण", en: "Kokanastha Brahmin" },
    motherTongue: { mr: "मराठी", en: "Marathi" },
    gothra: { mr: "कौशिक", en: "Kaushik" },
    rashi: { mr: "तूळ (Libra)", en: "Libra" },
    nakshatra: { mr: "स्वाती", en: "Swati" },
    manglik: { mr: "नाही (Non-Manglik)", en: "No (Non-Manglik)" },
    city: { mr: "पुणे", en: "Pune" },
    district: { mr: "पुणे", en: "Pune" },
    state: { mr: "महाराष्ट्र", en: "Maharashtra" },
    country: { mr: "भारत", en: "India" },
    education: { mr: "एम.टेक (M.Tech Computer Science)", en: "M.Tech Computer Science" },
    educationDetail: { mr: "सीओईपी (COEP) पुणे येथून एम.टेक", en: "M.Tech from COEP Pune" },
    occupation: { mr: "सीनियर सॉफ्टवेअर इंजिनिअर", en: "Senior Software Engineer" },
    occupationCategory: "software",
    employedIn: { mr: "एमएनसी (MNC), हिंजवडी पुणे", en: "MNC, Hinjawadi Pune" },
    annualIncome: { mr: "₹ १८ ते २२ लाख", en: "₹ 18 - 22 LPA" },
    annualIncomeValue: 20,
    photoUrl: "/images/profiles/prajakta_joshi.jpg",
    gallery: [
      "/images/profiles/prajakta_joshi.jpg"
    ],
    isVerified: true,
    isPremium: true,
    lastActive: { mr: "२ तासांपूर्वी सक्रिय", en: "Active 2 hours ago" },
    aboutMe: {
      mr: "मी एक साधी, सुसंस्कृत आणि आधुनिक विचारांची मुलगी आहे. मला शास्त्रीय संगीत, वाचन आणि ट्रेकिंगची आवड आहे. कुटुंबासोबत वेळ घालवणे आणि नवीन तंत्रज्ञान शिकणे मला मनापासून आवडते.",
      en: "I am a simple, cultured, and progressive woman who values both family traditions and professional growth. I enjoy Indian classical music, reading, and Sahyadri trekking."
    },
    lifestyle: {
      diet: { mr: "शाकाहारी (Vegetarian)", en: "Vegetarian" },
      smoke: { mr: "नाही (No)", en: "No" },
      drink: { mr: "नाही (No)", en: "No" },
      hobbies: [
        { mr: "शास्त्रीय संगीत", en: "Classical Music" },
        { mr: "पुस्तके वाचन", en: "Reading Books" },
        { mr: "ट्रेकिंग", en: "Trekking" },
        { mr: "पाककला", en: "Cooking" }
      ]
    },
    family: {
      familyType: { mr: "एकत्र कुटुंब (Joint Family)", en: "Joint Family" },
      familyStatus: { mr: "मध्यमवर्गीय (Upper Middle Class)", en: "Upper Middle Class" },
      fatherOccupation: { mr: "निवृत्त बँक अधिकारी (SBI)", en: "Retired Bank Officer (SBI)" },
      motherOccupation: { mr: "शिक्षिका (Teacher)", en: "Teacher" },
      brothers: 1,
      sisters: 0,
      nativePlace: { mr: "रत्नागिरी / पुणे", en: "Ratnagiri / Pune" }
    },
    partnerPreferences: {
      ageRange: "28 - 32 years",
      heightRange: "5'7\" to 6'1\"",
      maritalStatus: [{ mr: "अविवाहित", en: "Never Married" }],
      communities: [
        { mr: "कोकणस्थ ब्राह्मण", en: "Kokanastha Brahmin" },
        { mr: "देशस्थ ब्राह्मण", en: "Deshastha Brahmin" }
      ],
      education: [
        { mr: "बी.ई / बी.टेक / एम.टेक / एम.एस", en: "BE / B.Tech / M.Tech / MS" },
        { mr: "सीए / एमबीए", en: "CA / MBA" }
      ],
      occupations: [
        { mr: "आयटी इंजिनिअर / मॅनेजर", en: "IT Engineer / Manager" },
        { mr: "क्लास १ अधिकारी", en: "Class 1 Officer" }
      ],
      preferredLocations: [
        { mr: "पुणे", en: "Pune" },
        { mr: "मुंबई", en: "Mumbai" },
        { mr: "परदेश (विदेश)", en: "Abroad" }
      ],
      expectedIncome: { mr: "₹ २०+ लाख वार्षिक", en: "₹ 20+ LPA" }
    }
  },
  {
    id: "mm-102",
    profileId: "MM-102",
    name: { mr: "रोहन पाटील", en: "Rohan Patil" },
    gender: "male",
    age: 29,
    height: "5 ft 11 in / 180 cm",
    heightCm: 180,
    maritalStatus: { mr: "अविवाहित", en: "Never Married" },
    religion: { mr: "हिंदू", en: "Hindu" },
    community: { mr: "९६ कुळी मराठा", en: "96 Kuli Maratha" },
    motherTongue: { mr: "मराठी", en: "Marathi" },
    gothra: { mr: "कदम", en: "Kadam" },
    rashi: { mr: "सिंह (Leo)", en: "Leo" },
    nakshatra: { mr: "मघा", en: "Magha" },
    manglik: { mr: "नाही (Non-Manglik)", en: "No (Non-Manglik)" },
    city: { mr: "मुंबई", en: "Mumbai" },
    district: { mr: "मुंबई उपनगर", en: "Mumbai Suburban" },
    state: { mr: "महाराष्ट्र", en: "Maharashtra" },
    country: { mr: "भारत", en: "India" },
    education: { mr: "एम.बी.ए (मार्केटिंग) व बी.ई मेकॅनिकल", en: "MBA (Marketing) & B.E Mechanical" },
    educationDetail: { mr: "व्हीजेटीआय मुंबई आणि जमनालाल बजाज (JBIMS)", en: "VJTI Mumbai & JBIMS" },
    occupation: { mr: "प्रॉडक्ट मॅनेजर", en: "Product Manager" },
    occupationCategory: "business",
    employedIn: { mr: "खाजगी कंपनी (Fintech), बीकेसी मुंबई", en: "Fintech Company, BKC Mumbai" },
    annualIncome: { mr: "₹ २५ ते ३० लाख", en: "₹ 25 - 30 LPA" },
    annualIncomeValue: 28,
    photoUrl: "/images/profiles/rohan_patil.jpg",
    gallery: [
      "/images/profiles/rohan_patil.jpg"
    ],
    isVerified: true,
    isPremium: true,
    lastActive: { mr: "आत्ताच सक्रिय", en: "Active Just Now" },
    aboutMe: {
      mr: "मी मुंबईत वाढलेला असून सुशिक्षित मराठा कुटुंबातील आहे. कामासोबतच फिटनेस, सायकलिंग आणि पर्यटन आवडते. मला समजून घेणारी आणि स्वतःचे विचार मांडणारी जोडीदार हवी आहे.",
      en: "Grown up in Mumbai, coming from a well-respected Maratha family. Passionate about product strategy, fitness, cycling, and exploring new destinations."
    },
    lifestyle: {
      diet: { mr: "सर्वसमावेशक (Non-Vegetarian)", en: "Non-Vegetarian" },
      smoke: { mr: "नाही (No)", en: "No" },
      drink: { mr: "कधीकधी (Socially)", en: "Occasionally" },
      hobbies: [
        { mr: "जिम व फिटनेस", en: "Fitness & Gym" },
        { mr: "पर्यटन", en: "Travel" },
        { mr: "छायाचित्रण", en: "Photography" }
      ]
    },
    family: {
      familyType: { mr: "विभक्त कुटुंब (Nuclear Family)", en: "Nuclear Family" },
      familyStatus: { mr: "उच्च मध्यमवर्गीय (Upper Middle Class)", en: "Upper Middle Class" },
      fatherOccupation: { mr: "क्लास १ सरकारी अधिकारी (PWD)", en: "Class 1 Govt Officer (PWD)" },
      motherOccupation: { mr: "गृहगृहिणी (Homemaker)", en: "Homemaker" },
      brothers: 1,
      sisters: 0,
      nativePlace: { mr: "कोल्हापूर / मुंबई", en: "Kolhapur / Mumbai" }
    },
    partnerPreferences: {
      ageRange: "24 - 28 years",
      heightRange: "5'2\" to 5'8\"",
      maritalStatus: [{ mr: "अविवाहित", en: "Never Married" }],
      communities: [
        { mr: "मराठा / ९६ कुळी मराठा", en: "Maratha / 96 Kuli Maratha" }
      ],
      education: [
        { mr: "ग्रॅज्युएट / पोस्ट ग्रॅज्युएट / इंजिनिअर / डॉक्टर", en: "Graduate / Post Graduate / Engineer / Doctor" }
      ],
      occupations: [
        { mr: "नोकरी / व्यवसाय करणारी", en: "Working Professional" }
      ],
      preferredLocations: [
        { mr: "मुंबई", en: "Mumbai" },
        { mr: "पुणे", en: "Pune" },
        { mr: "ठाणे", en: "Thane" }
      ],
      expectedIncome: { mr: "कोणतीही अट नाही", en: "No Constraint" }
    }
  },
  {
    id: "mm-103",
    profileId: "MM-103",
    name: { mr: "डॉ. स्नेहा देशपांडे", en: "Dr. Sneha Deshpande" },
    gender: "female",
    age: 28,
    height: "5 ft 5 in / 165 cm",
    heightCm: 165,
    maritalStatus: { mr: "अविवाहित", en: "Never Married" },
    religion: { mr: "हिंदू", en: "Hindu" },
    community: { mr: "देशस्थ ब्राह्मण (ऋग्वेदी)", en: "Deshastha Brahmin (Rigvedi)" },
    motherTongue: { mr: "मराठी", en: "Marathi" },
    gothra: { mr: "भारद्वाज", en: "Bharadwaj" },
    rashi: { mr: "धनु (Sagittarius)", en: "Sagittarius" },
    nakshatra: { mr: "उत्तराषाढा", en: "Uttarashadha" },
    manglik: { mr: "नाही (Non-Manglik)", en: "No (Non-Manglik)" },
    city: { mr: "नाशिक", en: "Nashik" },
    district: { mr: "नाशिक", en: "Nashik" },
    state: { mr: "महाराष्ट्र", en: "Maharashtra" },
    country: { mr: "भारत", en: "India" },
    education: { mr: "एम.डी (जनरल मेडिसिन) / एम.बी.बी.एस", en: "MD (General Medicine) / MBBS" },
    educationDetail: { mr: "बी.जे. मेडिकल कॉलेज पुणे", en: "BJ Medical College Pune" },
    occupation: { mr: "कन्सल्टंट फिजिशियन (Doctor)", en: "Consultant Physician (Doctor)" },
    occupationCategory: "doctor",
    employedIn: { mr: "सुपरस्पेशालिटी हॉस्पिटल, नाशिक", en: "Superspeciality Hospital, Nashik" },
    annualIncome: { mr: "₹ २० ते २४ लाख", en: "₹ 20 - 24 LPA" },
    annualIncomeValue: 22,
    photoUrl: "/images/profiles/dr_sneha_deshpande.jpg",
    gallery: [
      "/images/profiles/dr_sneha_deshpande.jpg"
    ],
    isVerified: true,
    isPremium: false,
    lastActive: { mr: "५ तासांपूर्वी सक्रिय", en: "Active 5 hours ago" },
    aboutMe: {
      mr: "वैद्यकीय व्यवसायात कार्यरत असून रुग्णांची सेवा करणे हे माझे ध्येय आहे. मोकळ्या वेळेत शास्त्रीय नृत्य (कथ्थक) आणि बागकाम करायला आवडते. समजूतदार आणि सुशिक्षित जोडीदाराचा शोध आहे.",
      en: "Dedicated medical practitioner with a passion for healthcare and Kathak classical dance. Looking for an understanding, well-educated, and supportive partner."
    },
    lifestyle: {
      diet: { mr: "शाकाहारी (Vegetarian)", en: "Vegetarian" },
      smoke: { mr: "नाही (No)", en: "No" },
      drink: { mr: "नाही (No)", en: "No" },
      hobbies: [
        { mr: "कथ्थक नृत्य", en: "Kathak Dance" },
        { mr: "बागकाम", en: "Gardening" },
        { mr: "आरोग्य व योग", en: "Yoga & Wellness" }
      ]
    },
    family: {
      familyType: { mr: "एकत्र कुटुंब (Joint Family)", en: "Joint Family" },
      familyStatus: { mr: "उच्च मध्यमवर्गीय (Upper Middle Class)", en: "Upper Middle Class" },
      fatherOccupation: { mr: "वरिष्ठ वकील (Advocate)", en: "Senior Advocate" },
      motherOccupation: { mr: "प्राध्यापिका (Professor)", en: "Professor" },
      brothers: 0,
      sisters: 1,
      nativePlace: { mr: "नाशिक", en: "Nashik" }
    },
    partnerPreferences: {
      ageRange: "29 - 33 years",
      heightRange: "5'8\" to 6'2\"",
      maritalStatus: [{ mr: "अविवाहित", en: "Never Married" }],
      communities: [
        { mr: "देशस्थ / कोकणस्थ ब्राह्मण", en: "Deshastha / Kokanastha Brahmin" }
      ],
      education: [
        { mr: "एम.डी / एम.एस / एम.बी.बी.एस / आयटी / सीए", en: "MD / MS / MBBS / IT / CA" }
      ],
      occupations: [
        { mr: "डॉक्टर / इंजिनिअर / उद्योजक", en: "Doctor / Engineer / Entrepreneur" }
      ],
      preferredLocations: [
        { mr: "पुणे", en: "Pune" },
        { mr: "मुंबई", en: "Mumbai" },
        { mr: "नाशिक", en: "Nashik" }
      ],
      expectedIncome: { mr: "₹ २०+ लाख", en: "₹ 20+ LPA" }
    }
  },
  {
    id: "mm-104",
    profileId: "MM-104",
    name: { mr: "आदित्य गायकवाड", en: "Aditya Gaikwad" },
    gender: "male",
    age: 30,
    height: "5 ft 10 in / 178 cm",
    heightCm: 178,
    maritalStatus: { mr: "अविवाहित", en: "Never Married" },
    religion: { mr: "हिंदू", en: "Hindu" },
    community: { mr: "मराठा", en: "Maratha" },
    motherTongue: { mr: "मराठी", en: "Marathi" },
    gothra: { mr: "सूर्यवंशी", en: "Suryavanshi" },
    rashi: { mr: "मेष (Aries)", en: "Aries" },
    nakshatra: { mr: "अश्विनी", en: "Ashwini" },
    manglik: { mr: "नाही (Non-Manglik)", en: "No (Non-Manglik)" },
    city: { mr: "पुणे", en: "Pune" },
    district: { mr: "पुणे", en: "Pune" },
    state: { mr: "महाराष्ट्र", en: "Maharashtra" },
    country: { mr: "भारत", en: "India" },
    education: { mr: "बी.ई (सिव्हिल) व एमएस कन्स्ट्रक्शन मॅनेजमेंट", en: "B.E (Civil) & MS Construction Mgmt" },
    educationDetail: { mr: "पुणे युनिव्हर्सिटी", en: "Pune University" },
    occupation: { mr: "बांधकाम व्यावसायिक / बिल्डर", en: "Civil Contractor & Builder" },
    occupationCategory: "business",
    employedIn: { mr: "स्वतःचा रिअल इस्टेट व कन्स्ट्रक्शन व्यवसाय", en: "Self-Owned Construction Firm" },
    annualIncome: { mr: "₹ ३५ ते ४५ लाख", en: "₹ 35 - 45 LPA" },
    annualIncomeValue: 40,
    photoUrl: "/images/profiles/aditya_gaikwad.jpg",
    gallery: [
      "/images/profiles/aditya_gaikwad.jpg"
    ],
    isVerified: true,
    isPremium: true,
    lastActive: { mr: "काल सक्रिय", en: "Active yesterday" },
    aboutMe: {
      mr: "पुण्यात प्रतिष्ठित बांधकाम व्यवसाय सांभाळत आहे. कुटुंबवत्सल, शांत आणि सामाजिक कामांची आवड. पारंपारिक सण आणि कौटुंबिक स्नेह जपणारी सुसंस्कृत जीवनसाथी शोधत आहे.",
      en: "Managing our family construction & infrastructure business in Pune. Deeply respect family roots and looking for a graceful partner to share life's milestones."
    },
    lifestyle: {
      diet: { mr: "सर्वसमावेशक (Non-Vegetarian)", en: "Non-Vegetarian" },
      smoke: { mr: "नाही (No)", en: "No" },
      drink: { mr: "नाही (No)", en: "No" },
      hobbies: [
        { mr: "क्रिकेट", en: "Cricket" },
        { mr: "वाहन चालवणे (Long Drives)", en: "Long Drives" },
        { mr: "संगीत ऐकणे", en: "Listening to Music" }
      ]
    },
    family: {
      familyType: { mr: "एकत्र कुटुंब (Joint Family)", en: "Joint Family" },
      familyStatus: { mr: "श्रीमंत / उच्च वर्ग (Affluent)", en: "Affluent / Upper Class" },
      fatherOccupation: { mr: "उद्योजक / रिअल इस्टेट", en: "Industrialist / Real Estate" },
      motherOccupation: { mr: "गृहगृहिणी", en: "Homemaker" },
      brothers: 1,
      sisters: 1,
      nativePlace: { mr: "सातारा / पुणे", en: "Satara / Pune" }
    },
    partnerPreferences: {
      ageRange: "24 - 28 years",
      heightRange: "5'3\" to 5'8\"",
      maritalStatus: [{ mr: "अविवाहित", en: "Never Married" }],
      communities: [
        { mr: "मराठा / ९६ कुळी", en: "Maratha / 96 Kuli" }
      ],
      education: [
        { mr: "कोणतीही पदवी / पोस्ट ग्रॅज्युएट", en: "Any Graduate / Post Graduate" }
      ],
      occupations: [
        { mr: "नोकरी किंवा गृहिणी (तिची आवड)", en: "Professional or Homemaker (Her Choice)" }
      ],
      preferredLocations: [
        { mr: "पुणे", en: "Pune" },
        { mr: "सातारा", en: "Satara" },
        { mr: "कोल्हापूर", en: "Kolhapur" },
        { mr: "मुंबई", en: "Mumbai" }
      ],
      expectedIncome: { mr: "अपेक्षित नाही", en: "Not Applicable" }
    }
  },
  {
    id: "mm-105",
    profileId: "MM-105",
    name: { mr: "अंकिता प्रभूणे (सीकेपी)", en: "Ankita Prabhune (CKP)" },
    gender: "female",
    age: 26,
    height: "5 ft 3 in / 160 cm",
    heightCm: 160,
    maritalStatus: { mr: "अविवाहित", en: "Never Married" },
    religion: { mr: "हिंदू", en: "Hindu" },
    community: { mr: "चांद्रसेनीय कायस्थ प्रभू (CKP)", en: "CKP (Chandraseniya Kayastha Prabhu)" },
    motherTongue: { mr: "मराठी", en: "Marathi" },
    gothra: { mr: "कश्यप", en: "Kashyap" },
    rashi: { mr: "कर्क (Cancer)", en: "Cancer" },
    nakshatra: { mr: "पुष्य", en: "Pushya" },
    manglik: { mr: "नाही (Non-Manglik)", en: "No (Non-Manglik)" },
    city: { mr: "ठाणे", en: "Thane" },
    district: { mr: "ठाणे", en: "Thane" },
    state: { mr: "महाराष्ट्र", en: "Maharashtra" },
    country: { mr: "भारत", en: "India" },
    education: { mr: "चार्टर्ड अकाउंटंट (CA)", en: "Chartered Accountant (CA)" },
    educationDetail: { mr: "ICAI मुंबई (पहिल्या प्रयत्नात उत्तीर्ण)", en: "ICAI Mumbai (1st Attempt)" },
    occupation: { mr: "फायनान्शिअल अ‍ॅनॅलिस्ट (CA)", en: "Financial Analyst (CA)" },
    occupationCategory: "banking",
    employedIn: { mr: "ग्लोबल इन्व्हेस्टमेंट बँक, मुंबई", en: "Global Investment Bank, Mumbai" },
    annualIncome: { mr: "₹ १६ ते २० लाख", en: "₹ 16 - 20 LPA" },
    annualIncomeValue: 18,
    photoUrl: "/images/profiles/ankita_prabhune.jpg",
    gallery: [
      "/images/profiles/ankita_prabhune.jpg"
    ],
    isVerified: true,
    isPremium: true,
    lastActive: { mr: "आज सक्रिय", en: "Active Today" },
    aboutMe: {
      mr: "मी ठाण्यात वास्तव्यास असून सीकेपी कुटुंबातील आहे. कामातील शिस्त आणि कौटुंबिक सण-उत्सव या दोघांचे महत्त्व जाणते. कला, चित्रपट आणि पर्यटनाची खूप आवड आहे.",
      en: "Practicing CA based in Thane from a warm CKP family. Balances corporate career with an active interest in theater, cinema, culinary arts, and travel."
    },
    lifestyle: {
      diet: { mr: "सर्वसमावेशक (Non-Vegetarian - Fish/CKP Cuisine)", en: "Non-Vegetarian (CKP Cuisine)" },
      smoke: { mr: "नाही (No)", en: "No" },
      drink: { mr: "नाही (No)", en: "No" },
      hobbies: [
        { mr: "नाटके व चित्रपट", en: "Theater & Movies" },
        { mr: "पर्यटन", en: "Traveling" },
        { mr: "पाककला", en: "Cooking" }
      ]
    },
    family: {
      familyType: { mr: "विभक्त कुटुंब (Nuclear Family)", en: "Nuclear Family" },
      familyStatus: { mr: "उच्च मध्यमवर्गीय", en: "Upper Middle Class" },
      fatherOccupation: { mr: "सरकारी महामंडळात अधिकारी", en: "Government Corporation Officer" },
      motherOccupation: { mr: "गृहगृहिणी", en: "Homemaker" },
      brothers: 0,
      sisters: 1,
      nativePlace: { mr: "अलिबाग / ठाणे", en: "Alibaug / Thane" }
    },
    partnerPreferences: {
      ageRange: "27 - 31 years",
      heightRange: "5'6\" to 6'0\"",
      maritalStatus: [{ mr: "अविवाहित", en: "Never Married" }],
      communities: [
        { mr: "सीकेपी (CKP)", en: "CKP" },
        { mr: "सर्व हिंदू समाज (Open to Hindu)", en: "Open to All Hindu" }
      ],
      education: [
        { mr: "सीए / एमबीए / इंजिनिअर / डॉक्टर", en: "CA / MBA / Engineer / Doctor" }
      ],
      occupations: [
        { mr: "कॉर्पोरेट प्रोफेशनल / फायनान्स / आयटी", en: "Corporate / Finance / IT" }
      ],
      preferredLocations: [
        { mr: "मुंबई", en: "Mumbai" },
        { mr: "ठाणे", en: "Thane" },
        { mr: "पुणे", en: "Pune" }
      ],
      expectedIncome: { mr: "₹ १८+ लाख", en: "₹ 18+ LPA" }
    }
  },
  {
    id: "mm-106",
    profileId: "MM-106",
    name: { mr: "स्वप्नील शिंदे", en: "Swapnil Shinde" },
    gender: "male",
    age: 31,
    height: "5 ft 9 in / 175 cm",
    heightCm: 175,
    maritalStatus: { mr: "अविवाहित", en: "Never Married" },
    religion: { mr: "हिंदू", en: "Hindu" },
    community: { mr: "कुणबी मराठा", en: "Kunbi Maratha" },
    motherTongue: { mr: "मराठी", en: "Marathi" },
    gothra: { mr: "शिंदे", en: "Shinde" },
    rashi: { mr: "वृषभ (Taurus)", en: "Taurus" },
    nakshatra: { mr: "रोहिणी", en: "Rohini" },
    manglik: { mr: "नाही (Non-Manglik)", en: "No (Non-Manglik)" },
    city: { mr: "छत्रपती संभाजीनगर", en: "Chhatrapati Sambhajinagar" },
    district: { mr: "छत्रपती संभाजीनगर", en: "Chhatrapati Sambhajinagar" },
    state: { mr: "महाराष्ट्र", en: "Maharashtra" },
    country: { mr: "भारत", en: "India" },
    education: { mr: "एम.एस.सी (अ‍ॅग्रीकल्चर) व एम.बी.ए", en: "M.Sc (Agriculture) & MBA" },
    educationDetail: { mr: "राहुरी कृषी विद्यापीठ", en: "MPKV Rahuri" },
    occupation: { mr: "क्लास १ कृषी अधिकारी (MPSC)", en: "Class 1 Agriculture Officer (MPSC)" },
    occupationCategory: "government",
    employedIn: { mr: "महाराष्ट्र शासन (Govt of Maharashtra)", en: "Government of Maharashtra" },
    annualIncome: { mr: "₹ १२ ते १५ लाख (सरकारी वेतन व शेती)", en: "₹ 12 - 15 LPA + Farm" },
    annualIncomeValue: 14,
    photoUrl: "/images/profiles/swapnil_shinde.jpg",
    gallery: [
      "/images/profiles/swapnil_shinde.jpg"
    ],
    isVerified: true,
    isPremium: false,
    lastActive: { mr: "३ तासांपूर्वी", en: "3 hours ago" },
    aboutMe: {
      mr: "महाराष्ट्र शासनात राजपत्रित अधिकारी पदावर कार्यरत आहे. स्वतःची उत्तम बागायती शेती आहे. साधेपणा, प्रामाणिकपणा आणि कुटुंबमूल्यांना सर्वोच्च प्राधान्य देतो.",
      en: "Gazetted Class 1 Officer in Govt of Maharashtra along with ancestral irrigated farmland. Values simplicity, honesty, and strong family traditions."
    },
    lifestyle: {
      diet: { mr: "सर्वसमावेशक (Non-Vegetarian)", en: "Non-Vegetarian" },
      smoke: { mr: "नाही (No)", en: "No" },
      drink: { mr: "नाही (No)", en: "No" },
      hobbies: [
        { mr: "शेती व निसर्ग", en: "Farming & Nature" },
        { mr: "वाचन", en: "Reading" },
        { mr: "समाजसेवा", en: "Social Service" }
      ]
    },
    family: {
      familyType: { mr: "एकत्र कुटुंब (Joint Family)", en: "Joint Family" },
      familyStatus: { mr: "मध्यमवर्गीय / प्रतिष्ठित शेतकरी", en: "Middle Class / Respected Farming Family" },
      fatherOccupation: { mr: "शेतकरी व माजी सरपंच", en: "Farmer & Ex-Sarpanch" },
      motherOccupation: { mr: "गृहगृहिणी", en: "Homemaker" },
      brothers: 1,
      sisters: 1,
      nativePlace: { mr: "जालना / छत्रपती संभाजीनगर", en: "Jalna / Chhatrapati Sambhajinagar" }
    },
    partnerPreferences: {
      ageRange: "24 - 28 years",
      heightRange: "5'1\" to 5'6\"",
      maritalStatus: [{ mr: "अविवाहित", en: "Never Married" }],
      communities: [
        { mr: "कुणबी / मराठा", en: "Kunbi / Maratha" }
      ],
      education: [
        { mr: "पदवीधर / डी.एड / बी.एड / इंजिनिअर / सरकारी नोकरी", en: "Graduate / D.Ed / B.Ed / Govt Employee" }
      ],
      occupations: [
        { mr: "शिक्षिका / बँक / सरकारी नोकरी / किंवा गृहिणी", en: "Teacher / Bank / Govt Job or Homemaker" }
      ],
      preferredLocations: [
        { mr: "मराठवाडा / पुणे / नाशिक / अहमदनगर", en: "Marathwada / Pune / Nashik / Ahilyanagar" }
      ],
      expectedIncome: { mr: "अट नाही", en: "No Constraint" }
    }
  },
  {
    id: "mm-107",
    profileId: "MM-107",
    name: { mr: "श्रद्धा सोनार", en: "Shraddha Sonar" },
    gender: "female",
    age: 26,
    height: "5 ft 3 in / 160 cm",
    heightCm: 160,
    maritalStatus: { mr: "अविवाहित", en: "Never Married" },
    religion: { mr: "हिंदू", en: "Hindu" },
    community: { mr: "दैवज्ञ ब्राह्मण / सोनार", en: "Daivadnya Brahmin / Sonar" },
    motherTongue: { mr: "मराठी", en: "Marathi" },
    gothra: { mr: "शांडिल्य", en: "Shandilya" },
    rashi: { mr: "कन्या (Virgo)", en: "Virgo" },
    nakshatra: { mr: "हस्त", en: "Hasta" },
    manglik: { mr: "नाही (Non-Manglik)", en: "No (Non-Manglik)" },
    city: { mr: "कोल्हापूर", en: "Kolhapur" },
    district: { mr: "कोल्हापूर", en: "Kolhapur" },
    state: { mr: "महाराष्ट्र", en: "Maharashtra" },
    country: { mr: "भारत", en: "India" },
    education: { mr: "बी.आर्क (आर्किटेक्ट)", en: "B.Arch (Architecture)" },
    educationDetail: { mr: "डी.वाय. पाटील कॉलेज ऑफ आर्किटेक्चर", en: "DY Patil College of Architecture" },
    occupation: { mr: "इंटीरियर डिझायनर व आर्किटेक्ट", en: "Architect & Interior Designer" },
    occupationCategory: "engineering",
    employedIn: { mr: "स्वतःची डिझाइन स्टुडिओ", en: "Self-Employed Design Studio" },
    annualIncome: { mr: "₹ १० ते १४ लाख", en: "₹ 10 - 14 LPA" },
    annualIncomeValue: 12,
    photoUrl: "/images/profiles/shraddha_sonar.jpg",
    gallery: [
      "/images/profiles/shraddha_sonar.jpg"
    ],
    isVerified: true,
    isPremium: false,
    lastActive: { mr: "६ तासांपूर्वी", en: "6 hours ago" },
    aboutMe: {
      mr: "क्रिएटिव्ह आणि निसर्गावर प्रेम करणारी मुलगी. स्वतःचा आर्किटेक्चर व्यवसाय सुरू केला आहे. कोल्हापूरची सुसंस्कृत परंपरा आणि आदरभाव जपणारी आहे.",
      en: "Creative architect passionate about sustainable home design. Enjoys painting, classical heritage tours, and authentic Maharashtrian cuisine."
    },
    lifestyle: {
      diet: { mr: "शाकाहारी (Vegetarian)", en: "Vegetarian" },
      smoke: { mr: "नाही (No)", en: "No" },
      drink: { mr: "नाही (No)", en: "No" },
      hobbies: [
        { mr: "चित्रकला", en: "Painting" },
        { mr: "हेरिटेज प्रवास", en: "Heritage Travel" },
        { mr: "सतार वादन", en: "Sitar Playing" }
      ]
    },
    family: {
      familyType: { mr: "एकत्र कुटुंब", en: "Joint Family" },
      familyStatus: { mr: "मध्यमवर्गीय", en: "Middle Class" },
      fatherOccupation: { mr: "सुवर्ण व्यावसायिक (Jeweller)", en: "Jewellery Business" },
      motherOccupation: { mr: "गृहगृहिणी", en: "Homemaker" },
      brothers: 1,
      sisters: 0,
      nativePlace: { mr: "कोल्हापूर", en: "Kolhapur" }
    },
    partnerPreferences: {
      ageRange: "27 - 31 years",
      heightRange: "5'6\" to 6'0\"",
      maritalStatus: [{ mr: "अविवाहित", en: "Never Married" }],
      communities: [
        { mr: "सोनार / दैवज्ञ / ब्राह्मण / मराठा", en: "Sonar / Daivadnya / Brahmin / Maratha" }
      ],
      education: [
        { mr: "इंजिनिअर / आर्किटेक्ट / व्यावसायिक / डॉक्टर", en: "Engineer / Architect / Business / Doctor" }
      ],
      occupations: [
        { mr: "व्यवसाय किंवा नोकरी", en: "Business or Profession" }
      ],
      preferredLocations: [
        { mr: "कोल्हापूर", en: "Kolhapur" },
        { mr: "पुणे", en: "Pune" },
        { mr: "सांगली", en: "Sangli" }
      ],
      expectedIncome: { mr: "₹ १२+ लाख", en: "₹ 12+ LPA" }
    }
  },
  {
    id: "mm-108",
    profileId: "MM-108",
    name: { mr: "निखिल माळी", en: "Nikhil Mali" },
    gender: "male",
    age: 28,
    height: "5 ft 8 in / 173 cm",
    heightCm: 173,
    maritalStatus: { mr: "अविवाहित", en: "Never Married" },
    religion: { mr: "हिंदू", en: "Hindu" },
    community: { mr: "माळी", en: "Mali" },
    motherTongue: { mr: "मराठी", en: "Marathi" },
    gothra: { mr: "कश्यप", en: "Kashyap" },
    rashi: { mr: "मकर (Capricorn)", en: "Capricorn" },
    nakshatra: { mr: "श्रवण", en: "Shravana" },
    manglik: { mr: "नाही (Non-Manglik)", en: "No (Non-Manglik)" },
    city: { mr: "नागपूर", en: "Nagpur" },
    district: { mr: "नागपूर", en: "Nagpur" },
    state: { mr: "महाराष्ट्र", en: "Maharashtra" },
    country: { mr: "भारत", en: "India" },
    education: { mr: "बी.टेक (आयटी) - व्हीएनआयटी नागपूर", en: "B.Tech (IT) - VNIT Nagpur" },
    educationDetail: { mr: "VNIT नागपूर", en: "VNIT Nagpur" },
    occupation: { mr: "डेटा सायंटिस्ट (Data Scientist)", en: "Data Scientist" },
    occupationCategory: "software",
    employedIn: { mr: "आयटी कंपनी, नागपूर / पुणे (हायब्रिड)", en: "Tech Enterprise (Hybrid)" },
    annualIncome: { mr: "₹ २२ ते २६ लाख", en: "₹ 22 - 26 LPA" },
    annualIncomeValue: 24,
    photoUrl: "/images/profiles/nikhil_mali.jpg",
    gallery: [
      "/images/profiles/nikhil_mali.jpg"
    ],
    isVerified: true,
    isPremium: true,
    lastActive: { mr: "४ तासांपूर्वी", en: "4 hours ago" },
    aboutMe: {
      mr: "नागपूर येथे डेटा सायन्स क्षेत्रात कार्यरत. शांत स्वभावाचा, कुटुंबाला जपणारा आणि प्रामाणिक मुलगी शोधत आहे. कला आणि वाचनाची आवड आहे.",
      en: "Data Science professional working in Nagpur/Pune. Values family bonding, progressive thinking, and lifelong learning."
    },
    lifestyle: {
      diet: { mr: "शाकाहारी (Vegetarian)", en: "Vegetarian" },
      smoke: { mr: "नाही (No)", en: "No" },
      drink: { mr: "नाही (No)", en: "No" },
      hobbies: [
        { mr: "बॅडमिंटन", en: "Badminton" },
        { mr: "तंत्रज्ञान", en: "Tech Gadgets" },
        { mr: "गिटार", en: "Guitar" }
      ]
    },
    family: {
      familyType: { mr: "विभक्त कुटुंब", en: "Nuclear Family" },
      familyStatus: { mr: "मध्यमवर्गीय", en: "Middle Class" },
      fatherOccupation: { mr: "शासकीय नोकरी (निवृत्त)", en: "Retired Govt Official" },
      motherOccupation: { mr: "गृहगृहिणी", en: "Homemaker" },
      brothers: 0,
      sisters: 1,
      nativePlace: { mr: "नागपूर / वर्धा", en: "Nagpur / Wardha" }
    },
    partnerPreferences: {
      ageRange: "24 - 28 years",
      heightRange: "5'1\" to 5'6\"",
      maritalStatus: [{ mr: "अविवाहित", en: "Never Married" }],
      communities: [
        { mr: "माळी / मराठा / सर्व", en: "Mali / Maratha / All" }
      ],
      education: [
        { mr: "इंजिनिअर / पदवीधर / पोस्ट ग्रॅज्युएट", en: "Engineer / Graduate / Post Graduate" }
      ],
      occupations: [
        { mr: "आयटी / बँक / नोकरी किंवा व्यवसाय", en: "IT / Bank / Job or Business" }
      ],
      preferredLocations: [
        { mr: "नागपूर", en: "Nagpur" },
        { mr: "पुणे", en: "Pune" },
        { mr: "अमरावती", en: "Amravati" }
      ],
      expectedIncome: { mr: "₹ ६+ लाख", en: "₹ 6+ LPA" }
    }
  }
];
