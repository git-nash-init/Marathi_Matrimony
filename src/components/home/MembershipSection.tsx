import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';
import { subscriptionService, SubscriptionPlan, PLAN_DISPLAY_INFO, localizePlanFeature } from '../../services/subscription.service';
import { MarathaCrestIcon, VerifiedShieldIcon } from '../common/CulturalIcons';
import styles from './MembershipSection.module.css';

export const MembershipSection: React.FC = () => {
  const { language } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  // Same source as the Membership page: subscription_plans (with an identical offline fallback).
  useEffect(() => {
    let mounted = true;
    subscriptionService.fetchPlans().then((p) => { if (mounted) setPlans(p); });
    return () => { mounted = false; };
  }, []);

  return (
    <section className={`section ${styles.membershipSection}`}>
      <div className="container">
        <SectionHeading
          badge={language === 'mr' ? 'सदस्यत्व योजना' : 'Membership Plans'}
          title={language === 'mr' ? 'आपल्या सोयीनुसार योग्य योजना निवडा' : 'Transparent Membership Plans for Every Family'}
          subtitle={language === 'mr' ? 'कोणतेही छुपे शुल्क नाही. १००% पडताळणी केलेले संपर्क क्रमांक मिळवा.' : 'Zero hidden charges. Direct verified family contact unlocks.'}
        />

        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`${styles.planCard} ${plan.slug === 'diamond' ? styles.popularCard : ''}`}
            >
              {plan.slug === 'diamond' && (
                <div className={styles.popularBadge}>
                  <VerifiedShieldIcon size={13} color="var(--color-primary)" />
                  <span>{language === 'mr' ? 'सर्वाधिक लोकप्रिय' : 'Most Popular'}</span>
                </div>
              )}

              <div className={styles.planHeader}>
                <div className={styles.planBadgeIcon}>
                  <MarathaCrestIcon size={24} color={plan.slug === 'diamond' ? 'var(--color-oxblood)' : 'var(--color-antique-gold)'} />
                </div>
                <h3 className={styles.planName}>{language === 'mr' ? (PLAN_DISPLAY_INFO[plan.slug]?.label_mr || plan.name) : plan.name}</h3>
                <div className={styles.priceWrap}>
                  <span className={styles.price}>₹{(plan.discounted_price ?? plan.price).toLocaleString('en-IN')}</span>
                  {plan.discounted_price && (
                    <span className={styles.originalPrice}>₹{plan.price.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <span className={styles.duration}>{language === 'mr' ? `${Math.round(plan.duration_days / 30)} महिने वैधता` : `${Math.round(plan.duration_days / 30)} Months Validity`}</span>
              </div>

              <div className={styles.featuresList}>
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} className={styles.featureItem}>
                    <span className={styles.featureBullet}>•</span>
                    <span>{localizePlanFeature(feat, language)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <Button
                  to="/membership"
                  variant={plan.slug === 'diamond' ? 'primary' : 'outline-gold'}
                  fullWidth
                >
                  {language === 'mr' ? 'योजना निवडा' : 'Choose Plan'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewPlansWrapper}>
          <Button to="/membership" variant="outline-gold" size="lg">
            <span>{language === 'mr' ? 'सर्व योजनांची सविस्तर तुलना पहा' : 'View Detailed Plan Comparison'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
};
