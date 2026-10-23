export interface BrandConfig {
  name: {
    mr: string;
    en: string;
  };
  tagline: {
    mr: string;
    en: string;
  };
  phone: string;
  helplines: {
    primary: string;
    secondary: string;
    office: string;
  };
  email: string;
  address: {
    mr: string;
    en: string;
  };
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
  };
  colors: {
    oxblood: string;
    vermilion: string;
    antiqueGold: string;
    warmParchment: string;
    softIvory: string;
    deepInk: string;
  };
  year: number;
}

export const brandConfig: BrandConfig = {
  name: {
    mr: "मराठा लगीनसराई",
    en: "Maratha Laginsarai"
  },
  tagline: {
    mr: "९६ कुळी मराठा वधु-वर सूचक आणि विवाह मंडळ (कोकणस्थ व देशस्थ मराठा)",
    en: "Premier 96 Kuli Maratha Matrimony & Marriage Bureau"
  },
  phone: "+91 72086 59356",
  helplines: {
    primary: "+91 72086 59356",
    secondary: "+91 95949 28780",
    office: "+91 98216 75567"
  },
  email: "contact@marathalaginsarai.com",
  address: {
    mr: "मुंबई कार्यालय: दादर व बोरिवली | पुणे कार्यालय: धनकवडी व पिंपरी-चिंचवड, महाराष्ट्र",
    en: "Mumbai: Dadar & Borivali | Pune: Dhankawadi & Pimpri-Chinchwad, Maharashtra"
  },
  social: {
    facebook: "https://facebook.com/marathalaginsarai",
    instagram: "https://instagram.com/marathalaginsarai",
    youtube: "https://youtube.com/@marathalaginsarai",
    whatsapp: "https://wa.me/917208659356"
  },
  colors: {
    oxblood: "#7B191E",
    vermilion: "#C63828",
    antiqueGold: "#B6873D",
    warmParchment: "#F5EBDD",
    softIvory: "#FBF5EB",
    deepInk: "#30241F"
  },
  year: new Date().getFullYear()
};
