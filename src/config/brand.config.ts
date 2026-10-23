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
  year: number;
}

export const brandConfig: BrandConfig = {
  name: {
    mr: "मराठी जीवनसाथी",
    en: "Marathi Jeevansathi"
  },
  tagline: {
    mr: "महाराष्ट्रातील सर्वात विश्वासू वैवाहिक व्यासपीठ",
    en: "Maharashtra's Most Trusted Matrimonial Platform"
  },
  phone: "+91 98220 12345",
  email: "support@marathijeevansathi.com",
  address: {
    mr: "४०२, राजवैभव कॉम्प्लेक्स, एफसी रोड, शिवाजीनगर, पुणे - ४११००५",
    en: "402, Rajvaibhav Complex, FC Road, Shivajinagar, Pune - 411005"
  },
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    whatsapp: "https://wa.me/919822012345"
  },
  year: new Date().getFullYear()
};
