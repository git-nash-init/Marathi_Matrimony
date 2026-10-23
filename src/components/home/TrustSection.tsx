import React from 'react';
import { ShieldCheck, Lock, ShieldAlert, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './TrustSection.module.css';

export const TrustSection: React.FC = () => {
  const { t } = useLanguage();

  const cards = [
    {
      icon: <ShieldCheck size={32} />,
      title: t.trust.card1Title,
      desc: t.trust.card1Desc
    },
    {
      icon: <Lock size={32} />,
      title: t.trust.card2Title,
      desc: t.trust.card2Desc
    },
    {
      icon: <ShieldAlert size={32} />,
      title: t.trust.card3Title,
      desc: t.trust.card3Desc
    },
    {
      icon: <Users size={32} />,
      title: t.trust.card4Title,
      desc: t.trust.card4Desc
    }
  ];

  return (
    <section className={styles.trustSection}>
      <div className="container">
        <div className={styles.cardsGrid}>
          {cards.map((card, idx) => (
            <div key={idx} className={styles.trustCard}>
              <div className={styles.iconCircle}>{card.icon}</div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
