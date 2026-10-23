export interface LocationHub {
  slug: string;
  name: {
    mr: string;
    en: string;
  };
  region: 'mumbai' | 'pune' | 'thane' | 'navi-mumbai' | 'western-maharashtra' | 'other';
  title: {
    mr: string;
    en: string;
  };
  metaDescription: {
    mr: string;
    en: string;
  };
  intro: {
    mr: string;
    en: string;
  };
  subAreas: string[];
  nativeDistricts: string[];
  helplinePhone: string;
  officeArea: string;
}

export const locationHubs: Record<string, LocationHub> = {
  'maratha-marriage-bureau-borivali': {
    slug: 'maratha-marriage-bureau-borivali',
    name: {
      mr: 'बोरिवली',
      en: 'Borivali'
    },
    region: 'mumbai',
    title: {
      mr: 'मराठा विवाह मंडळ बोरिवली | ९६ कुळी मराठा वधु-वर सूचक',
      en: 'Maratha Marriage Bureau Borivali | 96 Kuli Maratha Vadhu Var Suchak'
    },
    metaDescription: {
      mr: 'बोरिवली, कांदिवली, मालाड व दहिसर मधील ९६ कुळी मराठा वधु-वर सूचक केंद्र. १०+ वर्षे विश्वासू सेवा. आजच मोफत नोंदणी करा.',
      en: 'Trusted 96 Kuli Maratha Marriage Bureau serving Borivali West & East, Kandivali, Malad, Goregaon, and Dahisar. 100% verified profiles.'
    },
    intro: {
      mr: 'मराठा लगीनसराई द्वारे संचालित "मराठा विवाह मंडळ बोरिवली" हे बोरिवली पश्चिम व पूर्व, कांदिवली, मालाड, गोरेगाव, जोगेश्वरी, दहिसर, चारकोप व मीरा रोड परिसरातील मराठा कुटुंबांचे अत्यंत विश्वासू वधु-वर सूचक केंद्र आहे.',
      en: 'Maratha Vivah Mandal Borivali by Maratha Laginsarai is your premier trusted matrimonial bureau serving families in Borivali West & East, Kandivali, Malad, Goregaon, Jogeshwari, Dahisar, Charkop, and Mira Road.'
    },
    subAreas: ['Borivali West', 'Borivali East', 'Kandivali', 'Malad', 'Dahisar', 'Charkop', 'Gorai', 'Shimpoli'],
    nativeDistricts: ['Sindhudurg', 'Ratnagiri', 'Satara', 'Kolhapur', 'Sangli', 'Raigad'],
    helplinePhone: '+91 72086 59356',
    officeArea: 'Borivali West, Mumbai'
  },
  'maratha-marriage-bureau-lower-parel': {
    slug: 'maratha-marriage-bureau-lower-parel',
    name: {
      mr: 'लोअर परळ',
      en: 'Lower Parel'
    },
    region: 'mumbai',
    title: {
      mr: 'मराठा विवाह मंडळ लोअर परळ | ९६ कुळी मराठा वधु-वर केंद्र',
      en: 'Maratha Marriage Bureau Lower Parel | 96 Kuli Maratha Matrimony'
    },
    metaDescription: {
      mr: 'लोअर परळ, परळ, प्रभादेवी, वरळी व माटुंगा मधील ९६ कुळी मराठा वधु-वर सूचक केंद्र. उच्चशिक्षित स्थळे व थेट संपर्क.',
      en: 'Premier Maratha matrimonial bureau serving Lower Parel, Parel, Prabhadevi, Worli, Mahim, and Matunga. Verified 96 Kuli Maratha profiles.'
    },
    intro: {
      mr: 'मराठा लगीनसराई संचलित "मराठा विवाह मंडळ लोअर परळ" हे परळ, लोअर परळ, प्रभादेवी, वरळी, माटुंगा, ताडदेव, भायखळा व करी रोड परिसरातील ९६ कुळी मराठा कुटुंबांचे अग्रगण्य विवाह केंद्र आहे.',
      en: 'Maratha Vivah Mandal Lower Parel by Maratha Laginsarai serves 96 Kuli Maratha families across Parel, Lower Parel, Prabhadevi, Worli, Matunga, Tardeo, and Curry Road with verified educated profiles.'
    },
    subAreas: ['Lower Parel', 'Parel', 'Prabhadevi', 'Worli', 'Curry Road', 'Byculla', 'Mahim', 'Matunga'],
    nativeDistricts: ['Satara', 'Kolhapur', 'Sangli', 'Ratnagiri', 'Sindhudurg', 'Pune'],
    helplinePhone: '+91 72086 59356',
    officeArea: 'Lower Parel, Mumbai'
  },
  'maratha-vadhu-var-suchak-dadar': {
    slug: 'maratha-vadhu-var-suchak-dadar',
    name: {
      mr: 'दादर',
      en: 'Dadar'
    },
    region: 'mumbai',
    title: {
      mr: 'मराठा वधु-वर सूचक दादर | ९६ कुळी मराठा विवाह मंडळ',
      en: 'Maratha Vadhu Var Suchak Dadar | 96 Kuli Maratha Marriage Bureau'
    },
    metaDescription: {
      mr: 'दादर पश्चिम व पूर्व मधील सर्वात जुने व नामांकित मराठा वधु-वर सूचक केंद्र. १०+ वर्षांची अखंड सेवा व ३,०००+ यशस्वी विवाह.',
      en: 'Renowned 96 Kuli Maratha Vadhu Var Suchak in Dadar West & East. Over a decade of dedicated matchmaking excellence and 3,000+ weddings.'
    },
    intro: {
      mr: 'दादर हे मुंबईचे सांस्कृतिक हृदय असून, "मराठा वधु-वर सूचक दादर" गेल्या १० हून अधिक वर्षांपासून दादर, शिवाजी पार्क, प्रभादेवी व मध्य मुंबईतील उच्चशिक्षित ९६ कुळी मराठा उपवधूंना व उपवरांना योग्य जीवनसाथी मिळवून देत आहे.',
      en: 'Dadar is the cultural epicenter of Mumbai. Maratha Vadhu Var Suchak Dadar by Maratha Laginsarai has united thousands of educated 96 Kuli Maratha couples across Dadar, Shivaji Park, Prabhadevi, and central Mumbai.'
    },
    subAreas: ['Dadar West', 'Dadar East', 'Shivaji Park', 'Prabhadevi', 'Hindu Colony', 'Dadar TT', 'Wadala'],
    nativeDistricts: ['Satara', 'Kolhapur', 'Sangli', 'Ratnagiri', 'Sindhudurg', 'Solapur', 'Nashik'],
    helplinePhone: '+91 72086 59356',
    officeArea: 'Dadar West, Mumbai'
  },
  'maratha-vivah-mandal-mulund': {
    slug: 'maratha-vivah-mandal-mulund',
    name: {
      mr: 'मुलुंड',
      en: 'Mulund'
    },
    region: 'mumbai',
    title: {
      mr: 'मराठा विवाह मंडळ मुलुंड | ९६ कुळी मराठा वधु-वर केंद्र',
      en: 'Maratha Vivah Mandal Mulund | 96 Kuli Maratha Marriage Bureau'
    },
    metaDescription: {
      mr: 'मुलुंड, भांडुप, ठाणे व नाहुर परिसरातील ९६ कुळी मराठा वधु-वर सूचक केंद्र. इंजिनिअर, डॉक्टर व व्यावसायिक स्थळांची पडताळणी.',
      en: 'Trusted Maratha matrimonial bureau serving Mulund West & East, Bhandup, Nahur, Kanjurmarg, and Vikhroli. Highly educated 96 Kuli profiles.'
    },
    intro: {
      mr: '"मराठा विवाह मंडळ मुलुंड" हे मुलुंड, भांडुप, नाहुर, कांजूरमार्ग व विक्रोळी भागातील मराठा कुटुंबांचे आवडते विवाह केंद्र आहे. येथे कोकणस्थ व देशस्थ मराठा उच्चशिक्षित स्थळे उपलब्ध आहेत.',
      en: 'Serving Mulund, Bhandup, Nahur, Kanjurmarg, and central suburban Mumbai with verified 96 Kuli Kokanastha & Deshashtha Maratha biodatas.'
    },
    subAreas: ['Mulund West', 'Mulund East', 'Bhandup', 'Nahur', 'Kanjurmarg', 'Vikhroli'],
    nativeDistricts: ['Sindhudurg', 'Ratnagiri', 'Kolhapur', 'Satara', 'Sangli', 'Raigad'],
    helplinePhone: '+91 72086 59356',
    officeArea: 'Mulund West, Mumbai'
  },
  'maratha-vadhu-var-suchak-dhankawadi-pune': {
    slug: 'maratha-vadhu-var-suchak-dhankawadi-pune',
    name: {
      mr: 'धनकवडी, पुणे',
      en: 'Dhankawadi, Pune'
    },
    region: 'pune',
    title: {
      mr: 'मराठा वधु-वर सूचक धनकवडी पुणे | ९६ कुळी मराठा विवाह मंडळ',
      en: 'Maratha Vadhu Var Suchak Dhankawadi Pune | 96 Kuli Matrimony'
    },
    metaDescription: {
      mr: 'पुणे, धनकवडी, कात्रज, सिंहगड रोड व कोथरूड मधील मराठा वधु-वर सूचक केंद्र. आयटी इंजिनिअर, शासकीय अधिकारी व व्यावसायिक स्थळे.',
      en: 'Leading 96 Kuli Maratha marriage bureau in Dhankawadi, Katraj, Sinhagad Road, Kothrud, and Pune city. Verified IT, govt, and business profiles.'
    },
    intro: {
      mr: 'पुण्यातील सांस्कृतिक व आधुनिक मराठा कुटुंबांसाठी "मराठा वधु-वर सूचक धनकवडी" हे धनकवडी, कात्रज, सिंहगड रस्ता, पद्मावती, सहकारनगर व कोथरूड मधील अग्रगण्य विवाह केंद्र आहे.',
      en: 'Located in southern Pune, Maratha Vadhu Var Suchak Dhankawadi serves families in Dhankawadi, Katraj, Sinhagad Road, Padmavati, and Sahakarnagar with verified Maratha IT professionals and entrepreneurs.'
    },
    subAreas: ['Dhankawadi', 'Katraj', 'Bibvewadi', 'Sinhagad Road', 'Sahakarnagar', 'Padmavati', 'Kothrud'],
    nativeDistricts: ['Pune', 'Satara', 'Kolhapur', 'Solapur', 'Sangli', 'Ahmednagar'],
    helplinePhone: '+91 95949 28780',
    officeArea: 'Dhankawadi, Pune'
  },
  'maratha-vadhu-var-suchak-pimpri-chinchwad': {
    slug: 'maratha-vadhu-var-suchak-pimpri-chinchwad',
    name: {
      mr: 'पिंपरी-चिंचवड, पुणे',
      en: 'Pimpri-Chinchwad, Pune'
    },
    region: 'pune',
    title: {
      mr: 'मराठा वधु-वर सूचक पिंपरी चिंचवड | पीसीएमसी ९६ कुळी विवाह मंडळ',
      en: 'Maratha Vadhu Var Suchak Pimpri Chinchwad | PCMC Maratha Bureau'
    },
    metaDescription: {
      mr: 'पिंपरी, चिंचवड, वाकड, हिंजवडी व भोसरी मधील मराठा वधु-वर सूचक केंद्र. ऑटोमोबाईल व आयटी क्षेत्रातील उच्चशिक्षित मराठा स्थळे.',
      en: 'Premier 96 Kuli Maratha matrimonial network in PCMC: Pimpri, Chinchwad, Wakad, Hinjewadi IT Park, Nigdi, and Ravet.'
    },
    intro: {
      mr: 'पिंपरी-चिंचवड (PCMC) व हिंजवडी आयटी पार्क परिसरातील इंजिनिअर, मॅनेजर, व्यावसायिक व शासकीय अधिकाऱ्यांसाठी "मराठा वधु-वर सूचक पिंपरी चिंचवड" हे अग्रगण्य केंद्र आहे.',
      en: 'Covering the vibrant industrial and IT belt of PCMC, including Pimpri, Chinchwad, Wakad, Hinjewadi, Nigdi, and Bhosari with verified 96 Kuli Maratha matches.'
    },
    subAreas: ['Pimpri', 'Chinchwad', 'Wakad', 'Hinjewadi', 'Nigdi', 'Akurdi', 'Ravet', 'Bhosari'],
    nativeDistricts: ['Pune', 'Satara', 'Kolhapur', 'Sangli', 'Ahmednagar', 'Solapur', 'Nashik'],
    helplinePhone: '+91 95949 28780',
    officeArea: 'Chinchwad, Pune'
  },
  'maratha-marriage-bureau-vashi': {
    slug: 'maratha-marriage-bureau-vashi',
    name: {
      mr: 'वाशी, नवी मुंबई',
      en: 'Vashi, Navi Mumbai'
    },
    region: 'navi-mumbai',
    title: {
      mr: 'मराठा विवाह मंडळ वाशी नवी मुंबई | ९६ कुळी मराठा वधु-वर केंद्र',
      en: 'Maratha Marriage Bureau Vashi Navi Mumbai | 96 Kuli Matrimony'
    },
    metaDescription: {
      mr: 'वाशी, कोपरखैरणे, सानपाडा व नेरूळ परिसरातील ९६ कुळी मराठा वधु-वर सूचक. नवी मुंबईतील विश्वासू मराठा विवाह केंद्र.',
      en: 'Trusted 96 Kuli Maratha matrimonial service in Vashi, Sanpada, Nerul, and Koparkhairane Navi Mumbai. Genuine verified profiles.'
    },
    intro: {
      mr: 'नवी मुंबईतील मध्यवर्ती केंद्र वाशी येथे मराठा लगीनसराई चे "मराठा विवाह मंडळ वाशी" वाशी, सानपाडा, नेरूळ, जुईनगर, कोपरखैरणे व ऐरोली भागातील मराठा कुटुंबांना सेवा पुरवत आहे.',
      en: 'Serving the premier commercial hub of Navi Mumbai, connecting educated 96 Kuli Maratha families across Vashi, Sanpada, Nerul, and Koparkhairane.'
    },
    subAreas: ['Vashi', 'Sanpada', 'Nerul', 'Koparkhairane', 'Ghansoli', 'Airoli', 'Juinagar'],
    nativeDistricts: ['Raigad', 'Ratnagiri', 'Sindhudurg', 'Satara', 'Kolhapur', 'Pune'],
    helplinePhone: '+91 72086 59356',
    officeArea: 'Vashi, Navi Mumbai'
  },
  'maratha-matrimony-kharghar': {
    slug: 'maratha-matrimony-kharghar',
    name: {
      mr: 'खारघर, नवी मुंबई',
      en: 'Kharghar, Navi Mumbai'
    },
    region: 'navi-mumbai',
    title: {
      mr: 'मराठा मॅट्रिमोनी खारघर | ९६ कुळी मराठा वधु-वर सूचक',
      en: 'Maratha Matrimony Kharghar | 96 Kuli Maratha Marriage Bureau'
    },
    metaDescription: {
      mr: 'खारघर, पनवेल, सीबीडी बेलापूर व कामोठे मधील मराठा विवाह संस्था. उच्चशिक्षित डॉक्टर, इंजिनिअर व शासकीय स्थळे.',
      en: 'Leading Maratha matrimony platform serving Kharghar, Panvel, CBD Belapur, Kamothe, and Ulwe in Navi Mumbai.'
    },
    intro: {
      mr: 'खारघर, पनवेल व रायगड परिसरातील मराठा समाजातील उच्चशिक्षित वधु-वरांसाठी "मराठा मॅट्रिमोनी खारघर" हे विश्वासू व्यासपीठ आहे.',
      en: 'Connecting Maratha families across the education and residential hub of Kharghar, Kamothe, Panvel, and CBD Belapur.'
    },
    subAreas: ['Kharghar', 'Panvel', 'CBD Belapur', 'Kamothe', 'Khandeshwar', 'Ulwe'],
    nativeDistricts: ['Raigad', 'Ratnagiri', 'Sindhudurg', 'Satara', 'Kolhapur', 'Solapur'],
    helplinePhone: '+91 72086 59356',
    officeArea: 'Kharghar, Navi Mumbai'
  },
  'maratha-vadhu-var-suchak-jogeshwari': {
    slug: 'maratha-vadhu-var-suchak-jogeshwari',
    name: {
      mr: 'जोगेश्वरी, मुंबई',
      en: 'Jogeshwari, Mumbai'
    },
    region: 'mumbai',
    title: {
      mr: 'मराठा वधु-वर सूचक जोगेश्वरी | ९६ कुळी मराठा विवाह मंडळ',
      en: 'Maratha Vadhu Var Suchak Jogeshwari | 96 Kuli Marriage Bureau'
    },
    metaDescription: {
      mr: 'जोगेश्वरी, अंधेरी, गोरेगाव व वर्सोवा मधील ९६ कुळी मराठा वधु-वर केंद्र. १०+ वर्षांची विश्वासू सेवा.',
      en: 'Trusted 96 Kuli Maratha marriage bureau for Jogeshwari East & West, Andheri, Goregaon, and Versova.'
    },
    intro: {
      mr: 'जोगेश्वरी पश्चिम व पूर्व, अंधेरी, विलेपार्ले व गोरेगाव परिसरातील मराठा कुटुंबांसाठी "मराठा वधु-वर सूचक जोगेश्वरी" हे प्रामाणिक सेवेचे केंद्र आहे.',
      en: 'Maratha Vadhu Var Suchak Jogeshwari provides personalized matchmaking for 96 Kuli Maratha families in Jogeshwari, Andheri, and Goregaon.'
    },
    subAreas: ['Jogeshwari East', 'Jogeshwari West', 'Andheri East', 'Andheri West', 'Goregaon East', 'Versova'],
    nativeDistricts: ['Sindhudurg', 'Ratnagiri', 'Kolhapur', 'Satara', 'Sangli', 'Raigad'],
    helplinePhone: '+91 72086 59356',
    officeArea: 'Jogeshwari East, Mumbai'
  },
  'maratha-vadhu-var-suchak-ghodbunder-thane': {
    slug: 'maratha-vadhu-var-suchak-ghodbunder-thane',
    name: {
      mr: 'घोडबंदर, ठाणे',
      en: 'Ghodbunder, Thane'
    },
    region: 'thane',
    title: {
      mr: 'मराठा वधु-वर सूचक घोडबंदर ठाणे | ९६ कुळी मराठा विवाह केंद्र',
      en: 'Maratha Vadhu Var Suchak Ghodbunder Thane | 96 Kuli Bureau'
    },
    metaDescription: {
      mr: 'घोडबंदर रोड, ठाणे पश्चिम, माजिवडा व कासारवडवली मधील ९६ कुळी मराठा वधु-वर सूचक केंद्र.',
      en: 'Premier 96 Kuli Maratha matrimonial services across Ghodbunder Road, Majiwada, Manpada, Kasarvadavali, and Thane West.'
    },
    intro: {
      mr: 'ठाण्यातील वेगाने विकसित होणाऱ्या घोडबंदर रोड, माजिवडा, मानपाडा, कासारवडवली व वागळे इस्टेट मधील मराठा कुटुंबांचे अग्रगण्य विवाह मंडळ.',
      en: 'Dedicated to Maratha families residing along Ghodbunder Road, Majiwada, Manpada, and Thane West with verified profiles.'
    },
    subAreas: ['Ghodbunder Road', 'Majiwada', 'Manpada', 'Kasarvadavali', 'Thane West', 'Wagle Estate', 'Hiranandani Estate'],
    nativeDistricts: ['Satara', 'Kolhapur', 'Sangli', 'Ratnagiri', 'Sindhudurg', 'Pune', 'Solapur'],
    helplinePhone: '+91 72086 59356',
    officeArea: 'Thane West, Thane'
  }
};
