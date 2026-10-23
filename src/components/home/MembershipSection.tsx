import React from 'react';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';
import { mockPlans } from '../../data/mockPlans';
import styles from './MembershipSection.module.css';

export const MembershipSection: React.FC = () => {
  const { t, localize } = useLanguage();

  // Show the 3 paid plans or all 4 plans in a clean responsive grid
  const plans = mockPlans;

  return (
    <section className={`section ${styles.membershipSection}`}>
      <div className="container">
        <SectionHeading
          badge={t.membership.badge}
          title={t.membership.title}
          subtitle={t.membership.subtitle}
        />

        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.planCard} ${plan.popular ? styles.popularCard : ''}`}
            >
              {plan.popular && (
                <div className={styles.popularBadge}>
                  <Sparkles size={12} />
                  <span>{localize(plan.badge) || t.membership.popularBadge}</span>
                </div>
              )}

              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{localize(plan.name)}</h3>
                <div className={styles.priceWrap}>
                  <span className={styles.price}>{localize(plan.price)}</span>
                  {plan.originalPrice && (
                    <span className={styles.originalPrice}>{localize(plan.originalPrice)}</span>
                  )}
                </div>
                <span className={styles.duration}>{localize(plan.duration)}</span>
              </div>

              <div className={styles.featuresList}>
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} className={styles.featureItem}>
                    <Check size={16} className={styles.checkIcon} />
                    <span>{localize(feat)}</span>
                  </div>
                ))}
                {plan.nonFeatures?.map((nFeat, nIdx) => (
                  <div key={nIdx} className={`${styles.featureItem} ${styles.disabledFeat}`}>
                    <X size={16} className={styles.xIcon} />
                    <span>{localize(nFeat)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <Button
                  to="/membership"
                  variant={plan.popular ? 'secondary' : 'primary'}
                  fullWidth
                >
                  {localize(plan.buttonText)}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewPlansWrapper}>
          <Button to="/membership" variant="outline" size="lg" icon={<ArrowRight size={18} />}>
            {t.membership.viewPlans}
          </Button>
        </div>
      </div>
    </section>
  );
};
