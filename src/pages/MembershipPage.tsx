import React, { useState } from 'react';
import { Check, X, Sparkles, Shield, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { mockPlans } from '../data/mockPlans';
import { PricingPlan } from '../types';

export const MembershipPage: React.FC = () => {
  const { t, localize } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
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
          {mockPlans.map((plan) => (
            <div
              key={plan.id}
              className="card"
              style={{
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.popular ? '2px solid var(--color-secondary)' : undefined
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--color-secondary)',
                    color: 'var(--color-dark)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '4px 16px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} />
                  <span>{localize(plan.badge) || t.membership.popularBadge}</span>
                </div>
              )}

              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px' }}>
                  {localize(plan.name)}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                    {localize(plan.price)}
                  </span>
                  {plan.originalPrice && (
                    <span style={{ fontSize: '1.1rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                      {localize(plan.originalPrice)}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary-hover)', fontWeight: 600 }}>
                  {localize(plan.duration)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', flexGrow: 1 }}>
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem' }}>
                    <Check size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{localize(feat)}</span>
                  </div>
                ))}
                {plan.nonFeatures?.map((nFeat, nIdx) => (
                  <div key={nIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                    <X size={16} color="#C0392B" style={{ flexShrink: 0, marginTop: '2px', opacity: 0.5 }} />
                    <span>{localize(nFeat)}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? 'secondary' : 'primary'}
                fullWidth
                onClick={() => handleSelectPlan(plan)}
              >
                {localize(plan.buttonText)}
              </Button>
            </div>
          ))}
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

      {/* Plan Selection Demo Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t.membership.planSelectionTitle}
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ margin: '0 auto 12px auto', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary-hover)' }}>
            <Sparkles size={26} />
          </div>
          <h3 style={{ color: 'var(--color-primary)', marginBottom: '6px' }}>
            {selectedPlan && localize(selectedPlan.name)} - {selectedPlan && localize(selectedPlan.price)}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
            {t.membership.frontendNotice}
          </p>
          <Button variant="primary" size="md" onClick={() => setModalOpen(false)}>
            {t.common.ok}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
