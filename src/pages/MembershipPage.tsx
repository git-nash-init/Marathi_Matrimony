import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Shield, Info, Crown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import {
  subscriptionService,
  SubscriptionPlan,
  PLAN_DISPLAY_INFO,
  ActiveSubscription,
  localizePlanFeature,
} from '../services/subscription.service';

export const MembershipPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionService.fetchPlans().then(setPlans).finally(() => setLoading(false));
    if (user?.id) subscriptionService.getActiveSubscription(user.id).then(setActiveSub);
  }, [user?.id]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/login', { state: { redirect: `/payment/${plan.slug}` } });
      return;
    }
    navigate(`/payment/${plan.slug}`, { state: { plan } });
  };

  return (
    <div className="section">
      <div className="container">
        <SectionHeading
          badge={t.membership.badge}
          title={t.membership.title}
          subtitle={t.membership.subtitle}
        />

        {/* Informational Banner */}
        <div
          style={{
            background: 'var(--color-secondary-light)',
            border: '1px solid rgba(197, 154, 69, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 20px',
            maxWidth: '860px',
            margin: '0 auto 40px auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--color-dark)'
          }}
        >
          <Info size={20} color="var(--color-secondary-hover)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>
            {t.membership.frontendNotice}
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '60px'
          }}
        >
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="card" style={{ padding: '32px 24px', minHeight: '320px',
                background: 'linear-gradient(90deg,#F0E8DC 25%,#E8DDD0 50%,#F0E8DC 75%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))
          ) : plans.map((plan) => {
            const info = PLAN_DISPLAY_INFO[plan.slug] || PLAN_DISPLAY_INFO['silver'];
            const isDiamond = plan.slug === 'diamond';
            const isCurrentPlan = activeSub?.plan?.slug === plan.slug;
            const planName = language === 'mr' ? (info.label_mr || plan.name) : plan.name;
            return (
            <div
              key={plan.id}
              className="card"
              style={{
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: isDiamond ? `2px solid ${info.borderColor}` : undefined,
                background: isDiamond ? info.bgColor : undefined,
              }}
            >
              {isDiamond && (
                <div
                  style={{
                    position: 'absolute', top: '-14px', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1E40AF', color: '#fff',
                    fontSize: '0.8rem', fontWeight: 800,
                    padding: '4px 16px', borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Sparkles size={12} />
                  <span>{language === 'mr' ? 'सर्वात लोकप्रिय' : 'Most Popular'}</span>
                </div>
              )}
              {isCurrentPlan && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#DCFCE7', color: '#15803D',
                  fontSize: '0.7rem', fontWeight: 800,
                  padding: '3px 10px', borderRadius: '20px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Crown size={11} /> {language === 'mr' ? 'सक्रिय' : 'ACTIVE'}
                </div>
              )}

              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>{info.emoji}</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: info.color, marginBottom: '8px' }}>
                  {planName}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-dark)' }}>₹</span>
                  <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-dark)' }}>
                    {plan.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary-hover)', fontWeight: 600 }}>
                  {Math.round(plan.duration_days / 30)} {language === 'mr' ? 'महिने वैधता' : 'Months'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', flexGrow: 1 }}>
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem' }}>
                    <Check size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{localizePlanFeature(feat, language)}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={isDiamond ? 'secondary' : 'primary'}
                fullWidth
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan
                  ? (language === 'mr' ? '✓ सध्याचा प्लॅन' : '✓ Current Plan')
                  : (user
                      ? (language === 'mr' ? `${planName} प्लॅन निवडा` : `Get ${plan.name}`)
                      : (language === 'mr' ? 'सदस्यत्वासाठी लॉगिन करा' : 'Login to Subscribe'))}
              </Button>
            </div>
          );
          })}
        </div>

        {/* Trust Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            textAlign: 'center',
            padding: '30px',
            background: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div>
            <Shield size={28} color="var(--color-primary)" style={{ margin: '0 auto 8px auto' }} />
            <h4 style={{ fontSize: '1rem', color: 'var(--color-dark)', marginBottom: '4px' }}>{t.membership.trustBadge1Title}</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{t.membership.trustBadge1Desc}</p>
          </div>
          <div>
            <Sparkles size={28} color="var(--color-secondary)" style={{ margin: '0 auto 8px auto' }} />
            <h4 style={{ fontSize: '1rem', color: 'var(--color-dark)', marginBottom: '4px' }}>{t.membership.trustBadge2Title}</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{t.membership.trustBadge2Desc}</p>
          </div>
          <div>
            <Check size={28} color="var(--color-success)" style={{ margin: '0 auto 8px auto' }} />
            <h4 style={{ fontSize: '1rem', color: 'var(--color-dark)', marginBottom: '4px' }}>{t.membership.trustBadge3Title}</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{t.membership.trustBadge3Desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
