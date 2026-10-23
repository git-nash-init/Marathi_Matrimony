import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import {
  VerifiedShieldIcon,
  HoroscopeScrollIcon,
  MarathaCrestIcon,
  ExpressInterestIcon,
  KalashIcon,
  WhatsAppCrestIcon
} from '../common/CulturalIcons';
import styles from './WhyChooseUsSection.module.css';

export const WhyChooseUsSection: React.FC = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: <VerifiedShieldIcon size={26} color="var(--color-primary)" />,
      title: language === 'mr' ? 'केवळ पडताळणी केलेली खरी स्थळे' : '100% Genuine & Verified Profiles',
      desc: language === 'mr' ? 'प्रत्येक वधू-वराच्या ओळखपत्राची व कौटुंबिक पार्श्वभूमीची काटेकोर खातरजमा.' : 'Rigorous identity, education, and family verification for complete peace of mind.'
    },
    {
      icon: <MarathaCrestIcon size={26} color="var(--color-antique-gold)" />,
      title: language === 'mr' ? '९६ कुळी कोकणस्थ व देशस्थ मराठा' : '96 Kuli Kokanastha & Deshastha Maratha',
      desc: language === 'mr' ? 'मराठा समाजातील ९६ कुळे, गोत्र, देवक व मूळ गावांचा सखोल डाटाबेस.' : 'Authentic lineage, Gotra, Devak, and native district records exclusively for the Maratha community.'
    },
    {
      icon: <HoroscopeScrollIcon size={26} color="var(--color-primary)" />,
      title: language === 'mr' ? 'पत्रिका व गुणमेलन सुविधा' : 'Kundli & Horoscope Matching',
      desc: language === 'mr' ? 'जन्मकुंडली, मंगळ दोष, राशी, नक्षत्र व ३६ गुणमेलन तपासणीची सुलभ सोय.' : 'Accurate Kundli, Manglik assessment, and Guna Milan matchmaking guidance.'
    },
    {
      icon: <ExpressInterestIcon size={26} color="var(--color-vermilion)" />,
      title: language === 'mr' ? 'त्वरित पसंती व संपर्क सुविधा' : 'Express Interest & Direct Connect',
      desc: language === 'mr' ? 'एका क्लिकवर पसंती कळवा आणि परस्पर संमतीने सुरक्षित संपर्क क्रमांक मिळवा.' : 'Express interest with one touch and connect directly upon mutual family consent.'
    },
    {
      icon: <KalashIcon size={26} color="var(--color-antique-gold)" />,
      title: language === 'mr' ? 'वैयक्तिक समुपदेशन व मार्गदर्शन' : 'Personal Matchmaking Guidance',
      desc: language === 'mr' ? 'अनुभवी समुपदेशकांचे लग्न ठरवण्यासाठी प्रत्यक्ष व फोनवर मार्गदर्शन सत्रे.' : 'Dedicated personal counselors helping families find aligned alliances swiftly.'
    },
    {
      icon: <WhatsAppCrestIcon size={26} color="#25D366" />,
      title: language === 'mr' ? 'व्हॉट्सअ‍ॅप व ई-मेल वर स्थळे' : 'Recommended Matches on WhatsApp',
      desc: language === 'mr' ? 'तुमच्या अपेक्षेनुरूप जुळणारी सुयोग्य स्थळे थेट व्हॉट्सअ‍ॅपवर नियमित मिळवा.' : 'Personalized handpicked matches delivered directly to your WhatsApp and email.'
    }
  ];

  return (
    <section className={`section ${styles.whySection}`}>
      <div className="container">
        <SectionHeading
          badge={language === 'mr' ? 'आमची वैशिष्ट्ये' : 'Why Maratha Laginsarai'}
          title={language === 'mr' ? 'महाराष्ट्रातील नंबर १ मराठा वधु-वर सूचक केंद्र' : 'Best Maratha Marriage Bureau in Maharashtra'}
          subtitle={language === 'mr' ? 'गेल्या १० वर्षांहून अधिक काळ मराठा समाजातील विवाहबंधने जोडणारा विश्वसनीय सेतू.' : 'Connecting trusted Maratha matrimonial alliances across Maharashtra and abroad for over a decade.'}
        />

        <div className={styles.featuresGrid}>
          {features.map((feat, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.iconCircle}>{feat.icon}</div>
              <h3 className={styles.featureTitle}>{feat.title}</h3>
              <p className={styles.featureDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
