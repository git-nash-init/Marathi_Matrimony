import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import {
  MarathaCrestIcon,
  HoroscopeScrollIcon,
  MatrimonySearchIcon,
  WeddingUnionIcon
} from '../common/CulturalIcons';
import styles from './HowItWorksSection.module.css';

export const HowItWorksSection: React.FC = () => {
  const { language } = useLanguage();

  const steps = [
    {
      num: '१',
      numEn: '1',
      title: language === 'mr' ? 'मोफत नोंदणी व बायोडाटा' : 'Create Free Profile',
      desc: language === 'mr' ? 'आपली वैयक्तिक माहिती, शिक्षण, नोकरी व कौटुंबिक पार्श्वभूमी भरा.' : 'Register basic biodata, education, occupation, and family background.',
      icon: <MarathaCrestIcon size={26} color="var(--color-primary)" />
    },
    {
      num: '२',
      numEn: '2',
      title: language === 'mr' ? 'पत्रिका व पडताळणी' : 'Verification & Kundli',
      desc: language === 'mr' ? 'ओळखपत्राची पडताळणी पूर्ण करा आणि जन्मकुंडली जोडून विश्वासार्हता वाढवा.' : 'Verify government identity and attach horoscope for authentic trust.',
      icon: <HoroscopeScrollIcon size={26} color="var(--color-antique-gold)" />
    },
    {
      num: '३',
      numEn: '3',
      title: language === 'mr' ? 'अनुरूप स्थळे शोधा' : 'Discover Matches',
      desc: language === 'mr' ? 'वय, शिक्षण, शहर, पोटजात व उत्पन्नानुसार आपल्या पसंतीची स्थळे शोधा.' : 'Search 96 Kuli Maratha profiles by sub-caste, city, education, and profession.',
      icon: <MatrimonySearchIcon size={26} color="var(--color-primary)" />
    },
    {
      num: '४',
      numEn: '4',
      title: language === 'mr' ? 'पसंती कळवा व लग्न ठरवा' : 'Connect & Marry',
      desc: language === 'mr' ? 'पसंती पाठवून दोन्ही कुटुंबांच्या संमतीने थेट संवाद साधा व लग्न ठरवा.' : 'Express interest, connect directly with family consent, and celebrate your union.',
      icon: <WeddingUnionIcon size={26} color="var(--color-antique-gold)" />
    }
  ];

  return (
    <section className={`section ${styles.howItWorksSection}`}>
      <div className="container">
        <SectionHeading
          badge={language === 'mr' ? 'सुलभ पायऱ्या' : 'How It Works'}
          title={language === 'mr' ? 'मराठा लगीनसराई द्वारे विवाह जमवणे सोपे आहे' : '4 Easy Steps to Your Ideal Maratha Match'}
          subtitle={language === 'mr' ? 'नोंदणीपासून विवाह जमण्यापर्यंतचा अत्यंत सोपा व सुरक्षित प्रवास.' : 'A dignified, transparent journey from profile registration to Mangalashtak.'}
        />

        <div className={styles.stepsGrid}>
          {steps.map((step, idx) => (
            <div key={idx} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepNumBadge}>
                  {language === 'mr' ? step.num : step.numEn}
                </div>
                <div className={styles.iconCircle}>{step.icon}</div>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
