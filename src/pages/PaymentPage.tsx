import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Lock,
  ChevronRight,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  subscriptionService,
  SubscriptionPlan,
  PLAN_DISPLAY_INFO,
  localizePlanFeature,
} from '../services/subscription.service';
import styles from './PaymentPage.module.css';

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

const BANKS = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Bank of Baroda', 'Punjab National Bank', 'Union Bank'];
const WALLETS = ['PhonePe', 'Google Pay', 'Paytm', 'Amazon Pay', 'BHIM'];

export const PaymentPage: React.FC = () => {
  const { planSlug } = useParams<{ planSlug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(location.state?.plan || null);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(!plan);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // UPI field
  const [upiId, setUpiId] = useState('');

  // Netbanking
  const [selectedBank, setSelectedBank] = useState('');

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState('');

  // Load plan if not passed via state
  useEffect(() => {
    if (!plan && planSlug) {
      subscriptionService.fetchPlans().then((plans) => {
        const found = plans.find((p) => p.slug === planSlug);
        if (found) setPlan(found);
        else navigate('/membership', { replace: true });
        setLoadingPlan(false);
      });
    }
  }, [plan, planSlug, navigate]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { redirect: `/payment/${planSlug}` } });
    }
  }, [user, planSlug, navigate]);

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const handlePay = async () => {
    if (!plan || !user) return;
    setProcessing(true);

    // Simulate network delay (dummy payment)
    await new Promise((res) => setTimeout(res, 2200));

    const result = await subscriptionService.processPayment({
      userId: user.id,
      planId: plan.id,
      planSlug: plan.slug,
      amount: plan.price,
      paymentMethod: method,
      durationDays: plan.duration_days,
    });

    setProcessing(false);

    if (result.success) {
      navigate('/payment/success', {
        replace: true,
        state: {
          plan,
          subscriptionId: result.subscriptionId,
          method,
        },
      });
    } else {
      alert(`Payment failed: ${result.error}`);
    }
  };

  const info = plan ? (PLAN_DISPLAY_INFO[plan.slug] || PLAN_DISPLAY_INFO['silver']) : null;
  const months = plan ? Math.round(plan.duration_days / 30) : 0;
  const planName = plan ? (language === 'mr' ? (info?.label_mr || plan.name) : plan.name) : '';

  if (loadingPlan || !plan) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back */}
        <Link to="/membership" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>{language === 'mr' ? 'मागे योजनांकडे' : 'Back to Plans'}</span>
        </Link>

        <div className={styles.layout}>
          {/* ── LEFT: Payment Form ───────────────────────── */}
          <div className={styles.formCol}>
            <div className={styles.formCard}>
              <h1 className={styles.formTitle}>
                {language === 'mr' ? 'पेमेंट पूर्ण करा' : 'Complete Payment'}
              </h1>
              <p className={styles.formSubtitle}>
                {language === 'mr'
                  ? 'खालीलपैकी आपली पसंतीची सुरक्षित देय पद्धत निवडा'
                  : 'Choose your preferred payment method below'}
              </p>

              {/* Method Tabs */}
              <div className={styles.methodTabs}>
                {(
                  [
                    { key: 'card', label: language === 'mr' ? 'कार्ड' : 'Card', Icon: CreditCard },
                    { key: 'upi', label: 'UPI', Icon: Smartphone },
                    { key: 'netbanking', label: language === 'mr' ? 'नेट बँकिंग' : 'Net Banking', Icon: Building2 },
                    { key: 'wallet', label: language === 'mr' ? 'वॉलेट' : 'Wallet', Icon: Wallet },
                  ] as { key: PaymentMethod; label: string; Icon: any }[]
                ).map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    className={`${styles.methodTab} ${method === key ? styles.methodTabActive : ''}`}
                    onClick={() => setMethod(key)}
                    type="button"
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* ── Card Form ─────────────────────────────── */}
              {method === 'card' && (
                <div className={styles.methodForm}>
                  <div className={styles.cardPreview}>
                    <div className={styles.cardChip} />
                    <div className={styles.cardNumberDisplay}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className={styles.cardBottomRow}>
                      <div>
                        <div className={styles.cardPreviewLabel}>
                          {language === 'mr' ? 'कार्ड धारक' : 'Card Holder'}
                        </div>
                        <div className={styles.cardPreviewVal}>
                          {cardName || (language === 'mr' ? 'तुमचे नाव' : 'YOUR NAME')}
                        </div>
                      </div>
                      <div>
                        <div className={styles.cardPreviewLabel}>
                          {language === 'mr' ? 'वैधता' : 'Expires'}
                        </div>
                        <div className={styles.cardPreviewVal}>{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {language === 'mr' ? 'कार्ड क्रमांक' : 'Card Number'}
                    </label>
                    <input
                      className={styles.formInput}
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      inputMode="numeric"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {language === 'mr' ? 'कार्डवरील नाव' : 'Name on Card'}
                    </label>
                    <input
                      className={styles.formInput}
                      type="text"
                      placeholder={language === 'mr' ? 'कार्डवर छापल्याप्रमाणे' : 'As printed on card'}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        {language === 'mr' ? 'अंतिम मुदत (महिना/वर्ष)' : 'Expiry Date'}
                      </label>
                      <input
                        className={styles.formInput}
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        inputMode="numeric"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>CVV</label>
                      <input
                        className={styles.formInput}
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── UPI Form ──────────────────────────────── */}
              {method === 'upi' && (
                <div className={styles.methodForm}>
                  <div className={styles.qrBox}>
                    <div className={styles.qrPlaceholder}>
                      <div className={styles.qrGrid}>
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div
                            key={i}
                            className={styles.qrCell}
                            style={{ opacity: Math.random() > 0.5 ? 1 : 0 }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className={styles.qrLabel}>
                      {language === 'mr' ? 'कोणत्याही UPI अ‍ॅपने QR कोड स्कॅन करा' : 'Scan QR with any UPI app'}
                    </p>
                    <p className={styles.qrAmount}>₹{plan.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className={styles.orDivider}>
                    <span>{language === 'mr' ? 'किंवा UPI ID टाका' : 'OR enter UPI ID'}</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>UPI ID</label>
                    <input
                      className={styles.formInput}
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                  <div className={styles.upiApps}>
                    {['PhonePe', 'GPay', 'Paytm', 'BHIM'].map((app) => (
                      <div key={app} className={styles.upiApp}>{app}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Net Banking ───────────────────────────── */}
              {method === 'netbanking' && (
                <div className={styles.methodForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {language === 'mr' ? 'आपली बँक निवडा' : 'Select Your Bank'}
                    </label>
                    <select
                      className={styles.formInput}
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="">{language === 'mr' ? '-- बँक निवडा --' : '-- Select Bank --'}</option>
                      {BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.bankGrid}>
                    {BANKS.slice(0, 4).map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`${styles.bankBtn} ${selectedBank === b ? styles.bankBtnActive : ''}`}
                        onClick={() => setSelectedBank(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {selectedBank && (
                    <div className={styles.bankSelectedNote}>
                      <Info size={13} />
                      <span>
                        {language === 'mr'
                          ? `सुरक्षित पेमेंट पूर्ण करण्यासाठी आपल्याला ${selectedBank} च्या पोर्टलवर पुनर्निर्देशित केले जाईल.`
                          : `You will be redirected to ${selectedBank} portal to complete payment securely.`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Wallet ────────────────────────────────── */}
              {method === 'wallet' && (
                <div className={styles.methodForm}>
                  <div className={styles.walletGrid}>
                    {WALLETS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        className={`${styles.walletBtn} ${selectedWallet === w ? styles.walletBtnActive : ''}`}
                        onClick={() => setSelectedWallet(w)}
                      >
                        <Wallet size={18} />
                        <span>{w}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                className={styles.payBtn}
                onClick={handlePay}
                disabled={processing}
                type="button"
              >
                {processing ? (
                  <span className={styles.payBtnProcessing}>
                    <span className={styles.paySpinner} />
                    {language === 'mr' ? 'पेमेंट प्रक्रिया सुरू आहे...' : 'Processing Payment...'}
                  </span>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>
                      {language === 'mr'
                        ? `₹${plan.price.toLocaleString('en-IN')} सुरक्षितपणे भरा`
                        : `Pay ₹${plan.price.toLocaleString('en-IN')} Securely`}
                    </span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              {/* Security row */}
              <div className={styles.securityRow}>
                <Shield size={13} />
                <span>
                  {language === 'mr'
                    ? '२५६-बिट SSL एन्क्रिप्शन • १००% सुरक्षित पेमेंट'
                    : '256-bit SSL Encrypted • PCI DSS Compliant • 100% Secure'}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ──────────────────────── */}
          <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>
                {language === 'mr' ? 'ऑर्डर तपशील' : 'Order Summary'}
              </h2>

              <div
                className={styles.planBadge}
                style={{ background: info?.bgColor, borderColor: info?.borderColor }}
              >
                <span className={styles.planBadgeEmoji}>{info?.emoji}</span>
                <div>
                  <div className={styles.planBadgeName} style={{ color: info?.color }}>
                    {planName}
                  </div>
                  <div className={styles.planBadgeDuration}>
                    {months} {language === 'mr' ? 'महिने सदस्यत्व' : 'Months Membership'}
                  </div>
                </div>
              </div>

              <div className={styles.summaryLines}>
                <div className={styles.summaryLine}>
                  <span>{language === 'mr' ? 'प्लॅन किंमत' : 'Plan Price'}</span>
                  <span>₹{plan.price.toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>GST (18%)</span>
                  <span style={{ color: '#6B7280' }}>
                    {language === 'mr' ? 'समाविष्ट' : 'Included'}
                  </span>
                </div>
                <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
                  <span>{language === 'mr' ? 'एकूण रक्कम' : 'Total'}</span>
                  <span>₹{plan.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className={styles.featuresTitle}>
                {language === 'mr' ? 'प्लॅनचे प्रमुख फायदे' : 'What You Get'}
              </div>
              <ul className={styles.featureList}>
                {plan.features.map((feat, i) => (
                  <li key={i}>
                    <CheckCircle2 size={14} />
                    <span>{localizePlanFeature(feat, language)}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.validityNote}>
                <Info size={13} />
                <span>
                  {language === 'mr'
                    ? `खरेदीच्या तारखेपासून ${months} महिने वैध. कोणतेही छुपे शुल्क नाही.`
                    : `Valid for ${months} months from date of purchase. Auto-renewal off.`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
