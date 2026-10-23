import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import {
  VerifiedShieldIcon,
  PrivacyLockIcon,
  MarathaCrestIcon
} from '../common/CulturalIcons';
import styles from './SafetySection.module.css';

export const SafetySection: React.FC = () => {
  const { language } = useLanguage();

  const safetyPoints = [
    {
      icon: <VerifiedShieldIcon size={24} color="var(--color-primary)" />,
      title: language === 'mr' ? '१००% शासकीय ओळखपत्र पडताळणी' : '100% Government ID Verification',
      desc: language === 'mr' ? 'प्रत्येक सदस्याचे आधार / पॅन कार्ड व फोटो मॅचिंग द्वारे अधिकृत प्रमाणीकरण.' : 'Every profile is reviewed against official identity and address records.'
    },
    {
      icon: <PrivacyLockIcon size={24} color="var(--color-antique-gold)" />,
      title: language === 'mr' ? 'संपर्क क्रमांकांची १००% गोपनीयता' : 'Quarantined Contact Privacy',
      desc: language === 'mr' ? 'आपला फोन नंबर आणि पत्ता परस्पर संमती किंवा अधिकृत अनलॉकिंग शिवाय कोणासही दिसत नाही.' : 'Your phone and address remain confidential and revealed only with your consent.'
    },
    {
      icon: <MarathaCrestIcon size={24} color="var(--color-primary)" />,
      title: language === 'mr' ? 'कुटुंब-केंद्रीत सुरक्षित संभाषण' : 'Family-Centered Safe Environment',
      desc: language === 'mr' ? 'पालकांच्या सक्रिय सहभागामुळे सुरक्षित, मर्यादित व सुसंस्कृत वातावरण.' : 'Encouraging family elder participation ensures dignified and safe interactions.'
    },
    {
      icon: <VerifiedShieldIcon size={24} color="var(--color-antique-gold)" />,
      title: language === 'mr' ? 'संशयास्पद प्रोफाइलवर तत्काळ बंदी' : 'Zero Tolerance for Fake Profiles',
      desc: language === 'mr' ? 'अयोग्य किंवा खोटी माहिती आढळल्यास प्रोफाइल २४ तासांत ब्लॉक केली जाते.' : 'Automated safety filters and human moderation swiftly eliminate unverified profiles.'
    }
  ];

  return (
    <section className={`section ${styles.safetySection}`}>
      <div className="container">
        <SectionHeading
          badge={language === 'mr' ? 'सुरक्षा व विश्वास' : 'Trust & Security'}
          title={language === 'mr' ? 'मराठा कुटुंबांसाठी १००% सुरक्षित व विश्वासू वातावरण' : '100% Safe & Trusted Environment for Maratha Families'}
          subtitle={language === 'mr' ? 'आमचे प्राधान्य तुमच्या गोपनीयतेला आणि सुरक्षिततेला आहे.' : 'Your privacy, dignity, and peace of mind are our foremost commitments.'}
        />

        <div className={styles.safetyGrid}>
          {safetyPoints.map((point, idx) => (
            <div key={idx} className={styles.safetyCard}>
              <div className={styles.iconCircle}>{point.icon}</div>
              <div className={styles.textWrap}>
                <h3 className={styles.pointTitle}>{point.title}</h3>
                <p className={styles.pointDesc}>{point.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
