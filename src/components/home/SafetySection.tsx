import React from 'react';
import { ShieldCheck, UserX, AlertTriangle, PhoneOff, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import styles from './SafetySection.module.css';

export const SafetySection: React.FC = () => {
  const { t } = useLanguage();

  const safetyPoints = [
    {
      icon: <ShieldCheck size={26} />,
      title: t.safety.point1Title,
      desc: t.safety.point1Desc
    },
    {
      icon: <AlertTriangle size={26} />,
      title: t.safety.point2Title,
      desc: t.safety.point2Desc
    },
    {
      icon: <UserX size={26} />,
      title: t.safety.point3Title,
      desc: t.safety.point3Desc
    },
    {
      icon: <PhoneOff size={26} />,
      title: t.safety.point4Title,
      desc: t.safety.point4Desc
    },
    {
      icon: <CheckCircle2 size={26} />,
      title: t.safety.point5Title,
      desc: t.safety.point5Desc
    }
  ];

  return (
    <section className={`section ${styles.safetySection}`}>
      <div className="container">
        <SectionHeading
          badge={t.safety.badge}
          title={t.safety.title}
          subtitle={t.safety.subtitle}
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
