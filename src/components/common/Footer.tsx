import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { brandConfig } from '../../config/brand.config';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const { language, t, brandName, brandTagline, localize } = useLanguage();

  return (
    <footer className={styles.footer}>
      {/* Top Banner Ornament */}
      <div className={styles.footerOrnament}></div>

      <div className="container">
        <div className={styles.footerGrid}>
            {/* Column 1: Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.footerLogo}>
              <div className={styles.logoBadge}>
                <img src="/images/brand/logo.png" alt={brandName} className={styles.footerLogoImg} />
              </div>
              <span className={styles.footerBrandName}>{brandName}</span>
            </div>
            <p className={styles.brandTagline}>{brandTagline}</p>
            <p className={styles.brandAbout}>{t.footer.aboutBrand}</p>

            {/* Direct Contact mini info */}
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.contactIcon} aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{brandConfig.phone}</span>
              </div>
              <div className={styles.contactItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.contactIcon} aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <span>{brandConfig.email}</span>
              </div>
              <div className={styles.contactItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.contactIcon} aria-hidden="true">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{localize(brandConfig.address)}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Regional Matrimonial Hubs (Mumbai & Pune) */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>
              {language === 'mr' ? 'प्रमुख शहर व उपनगरे' : 'Regional Matrimony Hubs'}
            </h4>
            <ul className={styles.linksList}>
              <li>
                <Link to="/maratha-marriage-bureau-borivali">
                  {language === 'mr' ? 'बोरिवली मराठा विवाह मंडळ' : 'Borivali Maratha Bureau'}
                </Link>
              </li>
              <li>
                <Link to="/maratha-marriage-bureau-lower-parel">
                  {language === 'mr' ? 'लोअर परळ मराठा विवाह संस्था' : 'Lower Parel Maratha Bureau'}
                </Link>
              </li>
              <li>
                <Link to="/maratha-vadhu-var-suchak-dadar">
                  {language === 'mr' ? 'दादर वधु-वर सूचक केंद्र' : 'Dadar Vadhu Var Suchak'}
                </Link>
              </li>
              <li>
                <Link to="/maratha-vivah-mandal-mulund">
                  {language === 'mr' ? 'मुलुंड मराठा विवाह मंडळ' : 'Mulund Maratha Mandal'}
                </Link>
              </li>
              <li>
                <Link to="/maratha-vadhu-var-suchak-dhankawadi-pune">
                  {language === 'mr' ? 'पुणे धनकवडी वधु-वर केंद्र' : 'Pune Dhankawadi Centre'}
                </Link>
              </li>
              <li>
                <Link to="/maratha-vadhu-var-suchak-pimpri-chinchwad">
                  {language === 'mr' ? 'पिंपरी-चिंचवड मराठा केंद्र' : 'Pimpri-Chinchwad Centre'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Matrimonial Discovery & Services */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>
              {language === 'mr' ? 'शोध व विवाह सेवा' : 'Discovery & Services'}
            </h4>
            <ul className={styles.linksList}>
              <li>
                <Link to="/search?gender=female">
                  {language === 'mr' ? 'मराठा वधू शोधा (Brides)' : 'Find Maratha Brides'}
                </Link>
              </li>
              <li>
                <Link to="/search?gender=male">
                  {language === 'mr' ? 'मराठा वर शोधा (Grooms)' : 'Find Maratha Grooms'}
                </Link>
              </li>
              <li>
                <Link to="/search?community=96_kuli">
                  {language === 'mr' ? '९६ कुळी मराठा स्थळे' : '96 Kuli Maratha Profiles'}
                </Link>
              </li>
              <li>
                <Link to="/membership">{t.footer.membership}</Link>
              </li>
              <li>
                <Link to="/wedding-services">
                  {language === 'mr' ? 'विवाह सेवा (हॉल, केटरिंग, फोटो)' : 'Maratha Wedding Services'}
                </Link>
              </li>
              <li>
                <Link to="/success-stories">{t.footer.successStories}</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support, App & Legal */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>{t.footer.supportCol}</h4>
            <ul className={styles.linksList}>
              <li>
                <Link to="/how-it-works">{t.footer.howItWorks}</Link>
              </li>
              <li>
                <Link to="/about">{t.footer.aboutUs}</Link>
              </li>
              <li>
                <Link to="/contact">{t.footer.contact}</Link>
              </li>
              <li>
                <Link to="/faq">{t.footer.faq}</Link>
              </li>
              <li>
                <Link to="/privacy">{t.footer.privacyPolicy}</Link>
              </li>
              <li>
                <Link to="/terms">{t.footer.terms}</Link>
              </li>
            </ul>

            {/* Official Mobile App Download */}
            <div style={{ marginTop: '16px' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                {language === 'mr' ? 'अधिकृत अँड्रॉइड अ‍ॅप' : 'Official Android App'}
              </span>
              <a
                href="https://play.google.com/store/apps/details?id=com.marathalaginsarai.app&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#3DDC84" aria-hidden="true">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0001s.4482-1.0001.9993-1.0001c.551 0 .9992.4486.9992 1.0001s-.4482 1.0001-.9992 1.0001m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0001s.4482-1.0001.9993-1.0001c.5511 0 .9993.4486.9993 1.0001s-.4482 1.0001-.9993 1.0001m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.081 12 8.081s-3.5902.3306-5.1367.8687L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
                </svg>
                <span>Google Play</span>
              </a>
            </div>

            {/* Language Switcher in Footer */}
            <div className={styles.footerLangWrap}>
              <span className={styles.langLabel}>{t.footer.languageSelect}</span>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>

        {/* Bottom Bar with Copyright & Socials */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {brandConfig.year} {brandName}. {t.footer.allRightsReserved}
          </p>
          <div className={styles.socialPlaceholders}>
            {/* Facebook */}
            <a
              href={brandConfig.social.facebook}
              target="_blank"
              rel="noreferrer"
              className={`${styles.socialLink} ${styles.socialFb}`}
              aria-label="Facebook"
              title="Facebook"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href={brandConfig.social.instagram}
              target="_blank"
              rel="noreferrer"
              className={`${styles.socialLink} ${styles.socialIg}`}
              aria-label="Instagram"
              title="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href={brandConfig.social.youtube}
              target="_blank"
              rel="noreferrer"
              className={`${styles.socialLink} ${styles.socialYt}`}
              aria-label="YouTube"
              title="YouTube"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={brandConfig.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              className={`${styles.socialLink} ${styles.socialWa}`}
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.201.3-.778.978-.954 1.179-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.151-.176.201-.301.301-.502.101-.2.05-.376-.025-.526-.075-.15-.678-1.633-.929-2.235-.245-.587-.494-.507-.678-.517-.176-.01-.377-.01-.578-.01s-.527.075-.803.376c-.276.301-1.054 1.029-1.054 2.509 0 1.48 1.079 2.909 1.229 3.11.15.2 2.124 3.243 5.145 4.549.718.311 1.278.497 1.716.636.723.23 1.38.198 1.9-.12.58-.354 1.78-1.452 2.03-2.128.251-.676.251-1.254.176-1.379-.075-.125-.276-.201-.577-.351zm-5.467 7.424h-.008a9.866 9.866 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.445 4.43-9.875 9.884-9.875 2.637 0 5.117 1.028 6.98 2.894 1.864 1.865 2.89 4.346 2.888 6.983 0 5.447-4.432 9.877-9.878 9.877zm8.332-18.21C18.153 1.398 15.342.33 12.355.33 5.617.33.13 5.817.127 12.556c0 2.152.562 4.254 1.63 6.108L0 24l5.502-1.705a12.185 12.185 0 005.85 1.493h.005c6.738 0 12.226-5.488 12.228-12.228 0-3.264-1.27-6.332-3.578-8.64z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
