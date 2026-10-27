import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Crown,
  LayoutDashboard,
  Home,
  Download,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  SubscriptionPlan,
  PLAN_DISPLAY_INFO,
  localizePlanFeature,
} from '../services/subscription.service';
import styles from './PaymentSuccessPage.module.css';

export const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const plan: SubscriptionPlan | undefined = location.state?.plan;
  const method: string = location.state?.method || 'card';
  const [showContent, setShowContent] = useState(false);

  // If no plan data, redirect
  useEffect(() => {
    if (!plan) {
      navigate('/membership', { replace: true });
      return;
    }
    // Trigger entrance animation
    const t = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t);
  }, [plan, navigate]);

  if (!plan) return null;

  const info = PLAN_DISPLAY_INFO[plan.slug] || PLAN_DISPLAY_INFO['silver'];
  const months = Math.round(plan.duration_days / 30);
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + plan.duration_days * 86400000);
  const planName = language === 'mr' ? (info.label_mr || plan.name) : plan.name;

  const txnId = `TXN${Date.now().toString().slice(-10)}`;

  const formatDate = (d: Date) =>
    d.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const methodLabel: Record<string, string> = {
    card: language === 'mr' ? 'क्रेडिट / डेबिट कार्ड' : 'Credit / Debit Card',
    upi: 'UPI',
    netbanking: language === 'mr' ? 'नेट बँकिंग' : 'Net Banking',
    wallet: language === 'mr' ? 'डिजिटल वॉलेट' : 'Digital Wallet',
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${showContent ? styles.visible : ''}`}>
        {/* Animated Check */}
        <div className={styles.checkWrapper}>
          <div className={styles.checkCircle}>
            <CheckCircle2 size={52} strokeWidth={2} />
          </div>
          <div className={styles.ripple} />
          <div className={styles.ripple2} />
        </div>

        <h1 className={styles.title}>
          {language === 'mr' ? 'पेमेंट यशस्वी झाले!' : 'Payment Successful!'}
        </h1>
        <p className={styles.subtitle}>
          {language === 'mr' ? (
            <>
              तुमचा <strong>{planName}</strong> आता सक्रिय झाला आहे. सनईबंध परिवारात आपले सहर्ष स्वागत!
            </>
          ) : (
            <>
              Your <strong>{plan.name}</strong> is now active. Welcome to Sanaibandh Premium!
            </>
          )}
        </p>

        {/* Plan Card */}
        <div
          className={styles.planCard}
          style={{ borderColor: info.borderColor, background: info.bgColor }}
        >
          <div className={styles.planEmoji}>{info.emoji}</div>
          <div>
            <div className={styles.planName} style={{ color: info.color }}>{planName}</div>
            <div className={styles.planDuration}>
              {months} {language === 'mr' ? 'महिने सक्रिय' : 'Months Active'}
            </div>
          </div>
          <div className={styles.planActive}>
            <Crown size={14} />
            <span>{language === 'mr' ? 'सक्रिय' : 'ACTIVE'}</span>
          </div>
        </div>

        {/* Transaction Details */}
        <div className={styles.detailsCard}>
          <h3 className={styles.detailsTitle}>
            {language === 'mr' ? 'व्यवहार तपशील' : 'Transaction Details'}
          </h3>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {language === 'mr' ? 'व्यवहार आयडी' : 'Transaction ID'}
            </span>
            <span className={styles.detailVal} style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>
              {txnId}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {language === 'mr' ? 'भरलेली रक्कम' : 'Amount Paid'}
            </span>
            <span className={styles.detailVal} style={{ fontWeight: 800, color: '#16A34A' }}>
              ₹{plan.price.toLocaleString('en-IN')}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {language === 'mr' ? 'पेमेंट पद्धत' : 'Payment Method'}
            </span>
            <span className={styles.detailVal}>{methodLabel[method] || method}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Calendar size={13} style={{ marginRight: 4 }} />
              {language === 'mr' ? 'सुरुवात तारीख' : 'Valid From'}
            </span>
            <span className={styles.detailVal}>{formatDate(startDate)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Calendar size={13} style={{ marginRight: 4 }} />
              {language === 'mr' ? 'अंतिम मुदत' : 'Valid Until'}
            </span>
            <span className={styles.detailVal} style={{ color: '#7B191E', fontWeight: 700 }}>
              {formatDate(endDate)}
            </span>
          </div>
        </div>

        {/* Features unlocked */}
        <div className={styles.unlockedBanner}>
          <div className={styles.unlockedTitle}>
            {language === 'mr' ? '🎉 अनलॉक झालेल्या सुविधा' : '🎉 Features Now Unlocked'}
          </div>
          <ul className={styles.unlockedList}>
            {plan.features.map((feat, i) => (
              <li key={i}>
                <CheckCircle2 size={13} />
                <span>{localizePlanFeature(feat, language)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className={styles.ctaRow}>
          <Link to="/dashboard" className={styles.ctaPrimary}>
            <LayoutDashboard size={16} />
            <span>{language === 'mr' ? 'डॅशबोर्डवर जा' : 'Go to Dashboard'}</span>
          </Link>
          <Link to="/search" className={styles.ctaSecondary}>
            <Home size={16} />
            <span>{language === 'mr' ? 'स्थळे शोधा' : 'Browse Matches'}</span>
          </Link>
        </div>

        {/* Download Receipt */}
        <button
          className={styles.receiptBtn}
          onClick={() =>
            alert(
              language === 'mr'
                ? 'पावती पुढील २४ तासांत आपल्या नोंदणीकृत ईमेलवर पाठवली जाईल.'
                : 'Receipt download will be available via email within 24 hours.'
            )
          }
        >
          <Download size={14} />
          <span>{language === 'mr' ? 'पावती डाउनलोड करा' : 'Download Receipt'}</span>
        </button>

        <p className={styles.supportNote}>
          {language === 'mr' ? (
            <>
              काही अडचण असल्यास संपर्क करा:{' '}
              <a href="mailto:contact@sanaibandh.com">contact@sanaibandh.com</a>
            </>
          ) : (
            <>
              For any queries, contact us at{' '}
              <a href="mailto:contact@sanaibandh.com">contact@sanaibandh.com</a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
