import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, X, Check, Sparkles, Shield } from 'lucide-react';
import {
  subscriptionService,
  SubscriptionPlan,
  PLAN_DISPLAY_INFO,
  localizePlanFeature,
} from '../../services/subscription.service';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './SubscriptionGate.module.css';

interface SubscriptionGateProps {
  /** Is the modal open? */
  isOpen: boolean;
  /** Close the modal */
  onClose: () => void;
  /** Optional reason text shown to user */
  reason?: string;
  /** Which feature requires unlock */
  featureLabel?: string;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  isOpen,
  onClose,
  reason,
  featureLabel,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    const data = await subscriptionService.fetchPlans();
    setPlans(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) loadPlans();
  }, [isOpen, loadPlans]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    onClose();
    if (!user) {
      navigate('/login', { state: { redirect: '/membership', planSlug: plan.slug } });
    } else {
      navigate(`/payment/${plan.slug}`, { state: { plan } });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose} aria-label={language === 'mr' ? 'बंद करा' : 'Close'}>
            <X size={20} />
          </button>
          <div className={styles.lockIconWrapper}>
            <Lock size={28} />
          </div>
          <h2 className={styles.title}>
            {language === 'mr' ? 'सदस्यत्व अपग्रेड करा' : 'Upgrade to Access'}
          </h2>
          <p className={styles.subtitle}>
            {reason ||
              (featureLabel
                ? (language === 'mr'
                    ? `"${featureLabel}" पाहण्यासाठी सदस्यत्व योजना आवश्यक आहे.`
                    : `Unlock "${featureLabel}" with a membership plan.`)
                : (language === 'mr'
                    ? 'ही सुविधा किंवा माहिती पाहण्यासाठी सदस्यत्व योजना निवडा.'
                    : 'Subscribe to a plan to unlock this feature.'))}
          </p>
        </div>

        {/* Plans */}
        <div className={styles.plansGrid}>
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.planSkeleton} />
              ))}
            </>
          ) : (
            plans.map((plan) => {
              const info = PLAN_DISPLAY_INFO[plan.slug] || PLAN_DISPLAY_INFO['silver'];
              const isDiamond = plan.slug === 'diamond';
              const planName = language === 'mr' ? (info.label_mr || plan.name) : plan.name;
              return (
                <div
                  key={plan.id}
                  className={`${styles.planCard} ${isDiamond ? styles.planCardPopular : ''}`}
                  style={{
                    borderColor: isDiamond ? info.borderColor : undefined,
                    background: isDiamond ? info.bgColor : undefined,
                  }}
                >
                  {isDiamond && (
                    <div className={styles.popularBadge}>
                      <Sparkles size={11} />
                      <span>{language === 'mr' ? 'सर्वात लोकप्रिय' : 'Most Popular'}</span>
                    </div>
                  )}

                  <div className={styles.planEmoji}>{info.emoji}</div>
                  <div className={styles.planName} style={{ color: info.color }}>
                    {planName}
                  </div>
                  <div className={styles.planPrice}>
                    <span className={styles.planCurrency}>₹</span>
                    <span className={styles.planAmount}>
                      {plan.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={styles.planDuration}>
                    {Math.round(plan.duration_days / 30)} {language === 'mr' ? 'महिने वैधता' : 'Months'}
                  </div>

                  <ul className={styles.planFeatures}>
                    {plan.features.slice(0, 3).map((feat, i) => (
                      <li key={i}>
                        <Check size={13} />
                        <span>{localizePlanFeature(feat, language)}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className={styles.moreFeat}>
                        <span>
                          {language === 'mr'
                            ? `+ आणखी ${plan.features.length - 3} वैशिष्ट्ये`
                            : `+${plan.features.length - 3} more features`}
                        </span>
                      </li>
                    )}
                  </ul>

                  <button
                    className={`${styles.selectBtn} ${isDiamond ? styles.selectBtnPopular : ''}`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {user
                      ? (language === 'mr' ? 'आता खरेदी करा' : 'Buy Now')
                      : (language === 'mr' ? 'सदस्यत्वासाठी लॉगिन करा' : 'Login to Subscribe')}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer note */}
        <div className={styles.footerNote}>
          <Shield size={13} />
          <span>{language === 'mr' ? '१००% सुरक्षित व्यवहार • कधीही रद्द करा.' : '100% secure. Cancel anytime.'}</span>
        </div>
      </div>
    </div>
  );
};
