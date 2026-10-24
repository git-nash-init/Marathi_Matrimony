import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/common/Button';
import {
  KalashIcon,
  WeddingUnionIcon,
  WhatsAppCrestIcon
} from '../components/common/CulturalIcons';

interface ServiceCategory {
  id: string;
  name: { mr: string; en: string };
  desc: { mr: string; en: string };
  features: { mr: string[]; en: string[] };
}

export const WeddingServicesPage: React.FC = () => {
  const { language } = useLanguage();
  const { success, error } = useToast();

  const [selectedService, setSelectedService] = useState<string>('all');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const services: ServiceCategory[] = [
    {
      id: 'photography',
      name: { mr: 'मराठा विवाह फोटोग्राफी व सिनेमॅटोग्राफी', en: 'Traditional Wedding Photography & Films' },
      desc: {
        mr: 'साखरपुडा, हळद, संगीत, सीमांतपूजन, मंगलाष्टक व सत्यनारायण पूजेचे उत्कृष्ट छायाचित्रण.',
        en: 'Capturing sacred Maharashtrian wedding rituals: Sakharpuda, Haldi, Seemant Pujan, and Mangalashtak.'
      },
      features: {
        mr: ['४K सिनेमॅटिक लग्न चित्रफीत', 'पारंपरिक व कॅन्डिड फोटोग्राफी', 'ड्रोन शूट व प्री-वेडिंग कव्हरेज', 'प्रीमियम अल्बम व फोटो फ्रेम्स'],
        en: ['4K Cinematic Wedding Films', 'Traditional & Candid Photography', 'Drone & Pre-Wedding Shoots', 'Handcrafted Premium Albums']
      }
    },
    {
      id: 'catering',
      name: { mr: 'अस्सल महाराष्ट्रीयन केटरिंग व जेवणावळी', en: 'Authentic Maharashtrian Wedding Catering' },
      desc: {
        mr: 'मराठा परंपरेनुसार शुद्ध शाकाहारी व मांसाहारी जेवणावळींची चवदार व स्वच्छ व्यवस्था.',
        en: 'Traditional Maharashtrian feast with authentic flavors, hygienic preparation, and royal hospitality.'
      },
      features: {
        mr: ['पुरणपोळी, श्रीखंड, बासुंदी मिष्ठान्न', 'कोल्हापुरी तांबडा-पांढरा रस्सा व मटण थाळी', 'हळदी व पूजेसाठी विशेष फराळ', 'स्वच्छ व शिस्तबद्ध वाढपी व्यवस्था'],
        en: ['Traditional Puran Poli & Basundi Sweets', 'Kolhapuri Authentic Feast Specialties', 'Haldi & Ritual Special Menus', 'Polite & Uniformed Catering Staff']
      }
    },
    {
      id: 'hall',
      name: { mr: 'मंगल कार्यालय व विवाह हॉल बुकिंग', en: 'Mangal Karyalaya & AC Banquet Halls' },
      desc: {
        mr: 'मुंबई, पुणे, ठाणे व नवी मुंबई परिसरातील सर्वोत्तम मंगल कार्यालयांची माहिती व विशेष सवलतीत बुकिंग.',
        en: 'Prime wedding hall recommendations and prioritized bookings across Mumbai, Pune, Thane, and Navi Mumbai.'
      },
      features: {
        mr: ['५०० ते २००० क्षमतेचे भव्य हॉल्स', 'वातानुकूलित (AC) व हिरवळ लॉन्स', 'वधू-वरांसाठी स्वतंत्र सुसज्ज खोल्या', 'पार्किंग व जनरेटरची पूर्ण सोय'],
        en: ['500 to 2000 Capacity Royal Venues', 'AC Banquets & Sprawling Lawns', 'Executive Bridal & Groom Suites', 'Dedicated Valet Parking & Backup']
      }
    },
    {
      id: 'makeup',
      name: { mr: 'ब्रायडल मेकअप व नवरी साज (Makeup Artist)', en: 'Bridal Makeup & Styling' },
      desc: {
        mr: 'पारंपरिक नऊवारी साडी ड्रेपिंग, पेशवाई दागिने मॅचिंग आणि आधुनिक एचडी मेकअप आर्टिस्ट.',
        en: 'Expert Nauvari saree draping, authentic Peshwai jewelry coordination, and HD bridal makeup.'
      },
      features: {
        mr: ['एचडी व एअरब्रश ब्रायडल मेकअप', 'ब्राह्मणी व पेशवाई नऊवारी ड्रेपिंग', 'पारंपरिक केसांची खोपा व गजरा रचना', 'मुहूर्तावर वेळेत सेवा'],
        en: ['HD & Airbrush Bridal Looks', 'Traditional Nauvari Draping', 'Bridal Hair Styling & Gajra Art', 'Punctual On-Venue Availability']
      }
    }
  ];

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      error(language === 'mr' ? 'कृपया आपले नाव आणि संपर्क क्रमांक भरा.' : 'Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured()) {
        const { error: dbError } = await supabase.from('contact_inquiries').insert({
          name: name.trim(),
          phone: phone.trim(),
          email: `${phone.trim()}@wedding-lead.local`,
          subject: `Wedding Service Enquiry: ${selectedService} (${city})`,
          message: `Service Requested: ${selectedService}\nCity: ${city}\nNotes: ${message}`,
          status: 'pending'
        } as any);

        if (dbError) {
          console.warn('Database inquiry insert notice:', dbError);
        }
      }

      setIsSuccess(true);
      success(language === 'mr' ? 'आपली चौकशी नोंदवली गेली आहे! आमचे प्रतिनिधी लवकरच संपर्क करतील.' : 'Enquiry submitted successfully! Our wedding coordinator will call you shortly.');
      setName('');
      setPhone('');
      setCity('');
      setMessage('');
    } catch (err: any) {
      error(language === 'mr' ? 'तांत्रिक त्रुटी. कृपया व्हॉट्सअ‍ॅपवर संपर्क साधा.' : 'Submission error. Please reach out via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', padding: '48px 0 80px 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-gold-light)',
            border: '1px solid var(--color-antique-gold)',
            padding: '4px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--color-oxblood-dark)',
            marginBottom: '14px'
          }}>
            <KalashIcon size={16} color="var(--color-antique-gold)" />
            <span>{language === 'mr' ? 'मराठा लग्न सोहळा सेवा' : 'Maratha Wedding Services'}</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            color: 'var(--color-oxblood)',
            lineHeight: 1.25,
            marginBottom: '16px'
          }}>
            {language === 'mr' ? 'मराठा विवाह सेवा व नियोजन' : 'Complete Maratha Wedding Planning Services'}
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--color-ink-muted)', lineHeight: 1.6 }}>
            {language === 'mr'
              ? 'सनईबंध द्वारे विवाह जमवण्यासोबतच लग्न सोहळा दिमाखदार करण्यासाठी नामांकित व खात्रीशीर सेवा पुरवठादार.'
              : 'End-to-end trusted vendor partnerships ensuring a joyous and regal Maharashtrian wedding celebration.'}
          </p>
        </div>

        {/* Services Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '60px'
        }}>
          {services.map((svc) => (
            <div
              key={svc.id}
              style={{
                background: 'var(--color-ivory)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-gold-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <WeddingUnionIcon size={26} color="var(--color-oxblood)" />
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--color-oxblood)',
                  marginBottom: '10px'
                }}>
                  {svc.name[language]}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {svc.desc[language]}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {svc.features[language].map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--color-ink)' }}>
                      <span style={{ color: 'var(--color-antique-gold)', fontWeight: 'bold' }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedService(svc.id);
                  const formEl = document.getElementById('wedding-enquiry-form');
                  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-antique-gold)',
                  background: selectedService === svc.id ? 'var(--color-oxblood)' : 'transparent',
                  color: selectedService === svc.id ? '#FFFFFF' : 'var(--color-oxblood)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                {language === 'mr' ? 'या सेवेबद्दल चौकशी करा' : 'Enquire for this Service'}
              </button>
            </div>
          ))}
        </div>

        {/* Direct WhatsApp Consultation Banner */}
        <div style={{
          background: 'var(--color-oxblood)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '56px',
          border: '1px solid var(--color-antique-gold)'
        }}>
          <div style={{ maxWidth: '640px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFFFFF', marginBottom: '8px' }}>
              {language === 'mr' ? 'थेट व्हॉट्सअ‍ॅप वर लग्न सेवा मार्गदर्शन मिळवा' : 'Get Instant Wedding Consultation on WhatsApp'}
            </h3>
            <p style={{ color: 'var(--color-gold-light)', fontSize: '0.96rem', margin: 0 }}>
              {language === 'mr'
                ? 'हॉल बुकिंग, बजेट केटरिंग आणि फोटोग्राफी पॅकेजसाठी आमच्या प्रतिनिधींशी थेट बोला.'
                : 'Connect directly with our dedicated wedding coordinators for packages and availability.'}
            </p>
          </div>

          <a
            href="https://wa.me/917208659356?text=Hello%20Sanaibandh,%20I%20need%20assistance%20with%20Wedding%20Services"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#25D366',
              color: '#FFFFFF',
              padding: '14px 28px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none'
            }}
          >
            <WhatsAppCrestIcon size={20} color="#FFFFFF" />
            <span>+91 72086 59356</span>
          </a>
        </div>

        {/* Direct Service Enquiry Form */}
        <div id="wedding-enquiry-form" style={{
          maxWidth: '680px',
          margin: '0 auto',
          background: 'var(--color-ivory)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '36px 32px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-oxblood)', marginBottom: '6px' }}>
              {language === 'mr' ? 'विवाह सेवा चौकशी फॉर्म' : 'Wedding Service Enquiry Form'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)' }}>
              {language === 'mr' ? 'आपली माहिती भरा, आम्ही एका तासात संपर्क करू.' : 'Fill your requirements and we will contact you within an hour.'}
            </p>
          </div>

          {isSuccess && (
            <div style={{
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              color: '#15803D',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 18px',
              marginBottom: '20px',
              fontSize: '0.92rem',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              ✓ {language === 'mr' ? 'आपली चौकशी यशस्वीपणे नोंदवली गेली आहे. आमची टीम लवकरच संपर्क करेल.' : 'Your enquiry has been received successfully. Our team will contact you shortly.'}
            </div>
          )}

          <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="wedding-name">
                {language === 'mr' ? 'आपले पूर्ण नाव' : 'Full Name'} <span className="required-star">*</span>
              </label>
              <input
                id="wedding-name"
                type="text"
                required
                className="form-input"
                style={{ paddingLeft: '16px' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'mr' ? 'उदा. राजेश कदम' : 'e.g. Rajesh Kadam'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="wedding-phone">
                  {language === 'mr' ? 'मोबाईल / व्हॉट्सअ‍ॅप नंबर' : 'Phone / WhatsApp'} <span className="required-star">*</span>
                </label>
                <input
                  id="wedding-phone"
                  type="tel"
                  required
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="wedding-city">
                  {language === 'mr' ? 'लग्न ठरलेले शहर' : 'Wedding City / Location'}
                </label>
                <input
                  id="wedding-city"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '16px' }}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={language === 'mr' ? 'उदा. मुंबई / पुणे' : 'e.g. Mumbai / Pune'}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="wedding-service">
                {language === 'mr' ? 'अपेक्षित सेवा निवडा' : 'Service Required'}
              </label>
              <select
                id="wedding-service"
                className="form-input"
                style={{ paddingLeft: '16px', cursor: 'pointer' }}
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="all">{language === 'mr' ? 'सर्व सेवा (संपूर्ण विवाह पॅकेज)' : 'All Services (Full Wedding Package)'}</option>
                <option value="photography">{language === 'mr' ? 'फोटोग्राफी व सिनेमा' : 'Photography & Cinematography'}</option>
                <option value="catering">{language === 'mr' ? 'केटरिंग व जेवण' : 'Catering & Food'}</option>
                <option value="hall">{language === 'mr' ? 'मंगल कार्यालय व हॉल' : 'Wedding Hall / Banquets'}</option>
                <option value="makeup">{language === 'mr' ? 'ब्रायडल मेकअप आर्टिस्ट' : 'Bridal Makeup Artist'}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="wedding-message">
                {language === 'mr' ? 'काही विशेष सूचना / तारीख' : 'Additional Notes / Wedding Date'}
              </label>
              <textarea
                id="wedding-message"
                rows={3}
                className="form-input"
                style={{
                  height: 'auto',
                  minHeight: '90px',
                  padding: '12px 16px',
                  resize: 'vertical'
                }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={language === 'mr' ? 'लग्नाची तारीख, पाहुण्यांची संख्या, विशेष अपेक्षा...' : 'Approximate date, guest count, budget...'}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (language === 'mr' ? 'नोंदणी होत आहे...' : 'Submitting...')
                : (language === 'mr' ? 'चौकशी पाठवा' : 'Submit Enquiry')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
