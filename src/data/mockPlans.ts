import { PricingPlan } from '../types';

export const mockPlans: PricingPlan[] = [
  {
    id: "free",
    name: { mr: "मोफत (FREE)", en: "FREE" },
    price: { mr: "₹०", en: "₹0" },
    duration: { mr: "कायमस्वरूपी मोफत", en: "Lifetime Free" },
    features: [
      { mr: "मोफत प्रोफाइल नोंदणी", en: "Free Profile Registration" },
      { mr: "अमर्यादित प्रोफाइल शोध", en: "Unlimited Profile Browsing" },
      { mr: "५ फोटो अपलोड करण्याची मुभा", en: "Upload up to 5 Photos" },
      { mr: "पसंती (Express Interest) पाठवा", en: "Send Express Interests" },
      { mr: "मूलभूत शोध फिल्टर्स", en: "Basic Search Filters" }
    ],
    nonFeatures: [
      { mr: "थेट फोन नंबर व ई-मेल पाहणे", en: "Direct Phone & Email Access" },
      { mr: "थेट चॅट संदेश पाठवणे", en: "Direct Instant Messaging" },
      { mr: "पत्रिका (कुंडली) जुळवणी रिपोर्ट", en: "Detailed Kundali Matching Report" },
      { mr: "प्रोफाइल हायलाइट व प्राधान्य", en: "Profile Highlight & Boost" }
    ],
    buttonText: { mr: "मोफत सुरू करा", en: "Start Free" }
  },
  {
    id: "silver",
    name: { mr: "सिल्व्हर (SILVER)", en: "SILVER" },
    price: { mr: "₹४९९", en: "₹499" },
    originalPrice: { mr: "₹९९९", en: "₹999" },
    duration: { mr: "३ महिने वैधता", en: "3 Months Validity" },
    features: [
      { mr: "मोफत योजनेतील सर्व वैशिष्ट्ये", en: "All Free Plan Features" },
      { mr: "२५ पडताळणी केलेले संपर्क क्रमांक पहा", en: "View 25 Verified Phone Numbers" },
      { mr: "थेट व्हॉट्सअ‍ॅप व ई-मेल संपर्क", en: "Direct WhatsApp & Email Contact" },
      { mr: "प्रगत जात, पगार व रास फिल्टर्स", en: "Advanced Caste, Salary & Horoscope Filters" },
      { mr: "माझे प्रोफाइल कोणास आवडले ते पहा", en: "See Who Viewed Your Profile" },
      { mr: "ई-मेल व एसएमएस सूचना", en: "Instant SMS & Email Alerts" }
    ],
    nonFeatures: [
      { mr: "अमर्यादित संपर्क क्रमांक", en: "Unlimited Contact Numbers" },
      { mr: "वैयक्तिक मॅचमेकर सहाय्य", en: "Personal Relationship Manager" }
    ],
    buttonText: { mr: "सिल्व्हर प्लॅन निवडा", en: "Choose Silver" }
  },
  {
    id: "gold",
    name: { mr: "गोल्ड (GOLD)", en: "GOLD" },
    popular: true,
    badge: { mr: "सर्वाधिक लोकप्रिय", en: "Most Popular" },
    price: { mr: "₹९९९", en: "₹999" },
    originalPrice: { mr: "₹१,९९९", en: "₹1,999" },
    duration: { mr: "६ महिने वैधता", en: "6 Months Validity" },
    features: [
      { mr: "सिल्व्हर योजनेतील सर्व वैशिष्ट्ये", en: "All Silver Plan Features" },
      { mr: "६० पडताळणी केलेले संपर्क क्रमांक पहा", en: "View 60 Verified Phone Numbers" },
      { mr: "अमर्यादित थेट संदेश व चॅट", en: "Unlimited Direct Messages & Chat" },
      { mr: "सविस्तर गुणमेलन व कुंडली रिपोर्ट", en: "Detailed Gun Milan & Kundali Report" },
      { mr: "प्रोफाइलला सर्च रिझल्टमध्ये अग्रस्थान", en: "Top Priority Placement in Search" },
      { mr: "कॉल व व्हॉट्सअ‍ॅप सपोर्ट", en: "Priority Call & WhatsApp Support" }
    ],
    nonFeatures: [
      { mr: "वैयक्तिक मॅचमेकर सहाय्य", en: "Personal Relationship Manager" }
    ],
    buttonText: { mr: "गोल्ड प्लॅन निवडा", en: "Choose Gold" }
  },
  {
    id: "premium",
    name: { mr: "प्रीमियम (PREMIUM)", en: "PREMIUM" },
    price: { mr: "₹१,४९९", en: "₹1,499" },
    originalPrice: { mr: "₹२,९९९", en: "₹2,999" },
    duration: { mr: "१ वर्ष वैधता", en: "1 Year Validity" },
    features: [
      { mr: "गोल्ड योजनेतील सर्व सुविधा", en: "All Gold Plan Features" },
      { mr: "१५० पडताळणी केलेले संपर्क क्रमांक", en: "View 150 Verified Contacts" },
      { mr: "गोल्डन बॅज व प्रोफाइल हायलाइटर", en: "Golden Verified Badge & VIP Highlight" },
      { mr: "अमर्यादित पत्रिका गुणमेलन", en: "Unlimited Kundali Horoscope Matches" },
      { mr: "गोपनीयता सेटिंग्जवर १००% नियंत्रण", en: "Complete Privacy & Visibility Control" },
      { mr: "२४/७ समर्पित ग्राहक सेवा", en: "24/7 Dedicated Support" }
    ],
    buttonText: { mr: "प्रीमियम प्लॅन निवडा", en: "Choose Premium" }
  }
];
