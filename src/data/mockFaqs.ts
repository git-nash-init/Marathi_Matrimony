import { FAQItem } from '../types';

export const mockFaqs: FAQItem[] = [
  {
    id: "faq-1",
    category: "registration",
    question: {
      mr: "सनईबंध वर नोंदणी करणे मोफत आहे का?",
      en: "Is registration free on Sanaibandh?"
    },
    answer: {
      mr: "होय, सनईबंध वर नोंदणी पूर्णपणे मोफत आहे. आपण आपले मूलभूत प्रोफाइल तयार करू शकता, फोटो अपलोड करू शकता आणि हजारो वधू-वरांचे प्रोफाइल शोधू शकता.",
      en: "Yes, registering on Sanaibandh is 100% free. You can create your comprehensive profile, upload photos, and search thousands of verified brides and grooms."
    }
  },
  {
    id: "faq-2",
    category: "privacy",
    question: {
      mr: "माझा मोबाईल नंबर आणि फोटो सुरक्षित राहतील का?",
      en: "Will my mobile number and photos remain safe and private?"
    },
    answer: {
      mr: "होय, १००% सुरक्षित. आम्ही प्रगत गोपनीयता नियंत्रणे देतो. आपण आपला संपर्क क्रमांक आणि फोटो कोणाला दाखवायचा हे ठरवू शकता. आपल्या संमतीशिवाय कोणीही आपला फोन नंबर पाहू शकत नाही.",
      en: "Yes, 100% secure. We provide strict privacy controls allowing you to decide who can view your photo and contact information. Your number is only shared upon your mutual acceptance."
    }
  },
  {
    id: "faq-3",
    category: "general",
    question: {
      mr: "प्रोफाइल पडताळणी (Verification) कशी केली जाते?",
      en: "How is profile verification conducted?"
    },
    answer: {
      mr: "प्रत्येक प्रोफाइलची सरकारी ओळखपत्र (आधार/पॅन), मोबाईल ओटीपी आणि ईमेलद्वारे पडताळणी केली जाते. आमची मॉडरेटर टीम प्रोफाइलमधील माहितीची खात्री करते ज्यामुळे खोट्या प्रोफाइलला आळा बसतो.",
      en: "Every profile undergoes government ID check, mobile OTP validation, and email verification. Our dedicated moderation team reviews the submitted details to prevent fake or duplicate profiles."
    }
  },
  {
    id: "faq-4",
    category: "membership",
    question: {
      mr: "सिल्व्हर, गोल्ड आणि प्रीमियम योजनांमध्ये काय फरक आहे?",
      en: "What is the difference between Silver, Gold, and Premium plans?"
    },
    answer: {
      mr: "सिल्व्हर प्लॅनमध्ये २५ संपर्क क्रमांक आणि ३ महिने वैधता मिळते. गोल्ड प्लॅन हा सर्वाधिक लोकप्रिय असून त्यात ६० संपर्क, थेट चॅट आणि ६ महिने वैधता मिळते. प्रीमियम प्लॅनमध्ये १ वर्षासाठी १५० संपर्क आणि व्हीआयपी प्राधान्य दिले जाते.",
      en: "Silver offers 25 verified contact views for 3 months. Gold is our most popular plan with 60 contacts, direct messaging, and 6 months validity. Premium gives you 150 contact unlocks and VIP priority placement for 1 full year."
    }
  },
  {
    id: "faq-5",
    category: "general",
    question: {
      mr: "पालक आपल्या पाल्यासाठी प्रोफाइल तयार करू शकतात का?",
      en: "Can parents create and manage a profile on behalf of their son or daughter?"
    },
    answer: {
      mr: "नक्कीच! बहुतांश प्रोफाइल पालक किंवा भावंडांद्वारेच तयार केली जातात. नोंदणी करताना 'Profile Created By: Parent' हा पर्याय निवडून आपण सर्व व्यवस्थापन सुलभपणे करू शकता.",
      en: "Absolutely! Many profiles on our platform are managed by loving parents or siblings. You can select 'Profile for: Son/Daughter' during registration and easily communicate with matching families."
    }
  },
  {
    id: "faq-6",
    category: "privacy",
    question: {
      mr: "एखाद्या प्रोफाइलवर संशय आल्यास किंवा अनुचित वर्तन आढळल्यास काय करावे?",
      en: "What should I do if I encounter a suspicious profile or inappropriate behavior?"
    },
    answer: {
      mr: "प्रत्येक प्रोफाइल पानावर 'Report Profile' आणि 'Block' चे पर्याय उपलब्ध आहेत. तक्रार येताच आमची सुरक्षा टीम २४ तासांत चौकशी करून योग्य ती कडक कारवाई करते.",
      en: "Every profile page has one-click 'Report Profile' and 'Block' options. Our safety and trust team reviews all flagged cases promptly within 24 hours."
    }
  }
];
