import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionHeading } from '../components/common/SectionHeading';
import { Button } from '../components/common/Button';
import { brandConfig } from '../config/brand.config';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ContactPage: React.FC = () => {
  const { t, brandName, localize, language } = useLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSupabaseConfigured()) {
      // `priority` is stamped by a database trigger for Platinum members; the client cannot set it.
      const { error } = await supabase.from('contact_inquiries').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.mobile.trim(),
        subject: formData.subject.trim() || 'Website enquiry',
        message: formData.message.trim(),
        status: 'pending',
      });
      if (error) console.warn('Contact inquiry insert notice:', error.message);
    }
    setFormSubmitted(true);
  };

  return (
    <div className="section">
      <div className="container">
        <SectionHeading
          badge={t.contactPage.badge}
          title={language === 'mr' ? `${brandName} शी संपर्क साधा` : `Contact ${brandName}`}
          subtitle={t.contactPage.subtitle}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            maxWidth: '1080px',
            margin: '0 auto'
          }}
        >
          {/* Left: Contact Info */}
          <div className="card" style={{ padding: '36px 30px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '18px' }}>
              {t.contactPage.officeTitle}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '28px', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {t.contactPage.officeDesc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600 }}>{t.contactPage.helplineLabel}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-dark)' }}>{brandConfig.phone}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600 }}>{t.contactPage.emailLabel}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-dark)' }}>{brandConfig.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', fontWeight: 600 }}>{t.contactPage.addressLabel}</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--color-dark)', lineHeight: '1.4' }}>
                    {localize(brandConfig.address)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '36px', padding: '16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: '4px' }}>{t.contactPage.workingHoursTitle}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t.contactPage.workingHoursVal}</p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="card auth-card" style={{ padding: '36px 30px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '18px' }}>
              {t.contactPage.formTitle}
            </h3>

            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 16px auto' }} />
                <h4 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
                  {t.contactPage.successTitle}
                </h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
                  {t.contactPage.successDesc}
                </p>
                <Button variant="outline" size="sm" onClick={() => setFormSubmitted(false)}>
                  {t.contactPage.sendAnother}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">
                    {t.contactPage.nameLabel.replace(/\s*\*/, '')} <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      id="contact-name"
                      type="text"
                      required
                      className="form-input"
                      placeholder={t.contactPage.namePlaceholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">
                      {language === 'mr' ? 'ईमेल पत्ता' : 'Email Address'} <span className="required-star">*</span>
                    </label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input
                        id="contact-email"
                        type="email"
                        required
                        className="form-input"
                        placeholder={t.contactPage.emailPlaceholder}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-mobile">
                      {t.auth.mobile} <span className="required-star">*</span>
                    </label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <input
                        id="contact-mobile"
                        type="tel"
                        required
                        className="form-input"
                        placeholder={t.contactPage.mobilePlaceholder}
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-subject">
                    {t.contactPage.subjectLabel}
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="contact-subject"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '16px' }}
                      placeholder={t.contactPage.subjectPlaceholder}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-message">
                    {t.contactPage.messageLabel.replace(/\s*\*/, '')} <span className="required-star">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    className="form-input"
                    style={{
                      height: 'auto',
                      minHeight: '110px',
                      padding: '12px 16px',
                      resize: 'vertical'
                    }}
                    placeholder={t.contactPage.messagePlaceholder}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" icon={<Send size={18} />}>
                  {t.contactPage.submitBtn}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
