import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';
import {
  KalashIcon,
  VerifiedShieldIcon,
  WeddingUnionIcon,
  MatrimonySearchIcon,
  MarathaCrestIcon
} from '../common/CulturalIcons';
import styles from './Hero.module.css';

export const Hero: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('30');
  const [community, setCommunity] = useState('all');
  const [location, setLocation] = useState('all');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (gender) params.set('gender', gender);
    if (ageFrom) params.set('minAge', ageFrom);
    if (ageTo) params.set('maxAge', ageTo);
    if (community && community !== 'all') params.set('community', community);
    if (location && location !== 'all') params.set('city', location);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className={styles.heroSection}>
      <div className="container">
        <div className={styles.heroGrid}>
          {/* Left Text & CTAs */}
          <div className={styles.heroContent}>
            <div className={styles.culturalBadge}>
              <KalashIcon size={16} className={styles.badgeIcon} color="var(--color-antique-gold)" />
              <span>{language === 'mr' ? '१०+ वर्षे अखंड सेवेत | ३,०००+ यशस्वी ९६ कुळी मराठा विवाह' : '10+ Years Dedicated Service | 3,000+ Happy Maratha Marriages'}</span>
            </div>

            <h1 className={styles.heroTitle}>
              {language === 'mr' 
                ? '९६ कुळी मराठा समाजातील उच्चशिक्षित वधु-वर शोधा' 
                : 'Premier 96 Kuli Maratha Matrimony & Marriage Bureau'}
            </h1>

            <p className={styles.heroSubtitle}>
              {language === 'mr'
                ? 'मुंबई, ठाणे, नवी मुंबई, पुणे व संपूर्ण महाराष्ट्रातील कोकणस्थ आणि देशस्थ मराठा उच्चशिक्षित स्थळांचे सर्वात मोठे व विश्वासू व्यासपीठ.'
                : 'The premier matrimonial network connecting educated 96 Kuli Maratha brides and grooms across Mumbai, Pune, Thane, Navi Mumbai, and abroad.'}
            </p>

            {/* Main Hero Buttons */}
            <div className={styles.heroBtnGroup}>
              <Button to="/register" variant="primary" size="lg" icon={<WeddingUnionIcon size={18} />}>
                {t.hero.registerBtn}
              </Button>
              <Button to="/search" variant="outline-gold" size="lg" icon={<MatrimonySearchIcon size={18} />}>
                {t.hero.searchBtn}
              </Button>
            </div>

            {/* Trust highlights with verified icons */}
            <div className={styles.heroTrustPills}>
              <div className={styles.trustPill}>
                <VerifiedShieldIcon size={18} className={styles.pillIcon} color="var(--color-primary)" />
                <span>{language === 'mr' ? '१००% पडताळणी केलेली खरी स्थळे' : '100% Genuine & Verified Profiles'}</span>
              </div>
              <div className={styles.trustPill}>
                <MarathaCrestIcon size={18} className={styles.pillIcon} color="var(--color-antique-gold)" />
                <span>{language === 'mr' ? '९६ कुळी कोकणस्थ व देशस्थ मराठा' : 'Kokanastha & Deshastha Maratha'}</span>
              </div>
            </div>
          </div>

          {/* Right Visual & Quick Search Card */}
          <div className={styles.heroVisualCol}>
            <div className={styles.quickSearchCard}>
              <div className={styles.quickSearchHeader}>
                <div className={styles.iconCircle}>
                  <MatrimonySearchIcon size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <h3 className={styles.quickSearchTitle}>
                    {language === 'mr' ? 'पसंतीची स्थळे शोधा' : 'Search Your Match'}
                  </h3>
                  <p className={styles.quickSearchSub}>
                    {language === 'mr' ? 'वय, जात व शहरानुसार त्वरित शोध' : 'Filter by age, caste & location'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleQuickSearch} className={styles.searchForm}>
                {/* Looking for: Bride or Groom */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t.hero.lookingFor}</label>
                  <div className={styles.genderToggle}>
                    <button
                      type="button"
                      className={`${styles.genderBtn} ${gender === 'female' ? styles.activeGender : ''}`}
                      onClick={() => setGender('female')}
                    >
                      {t.hero.bride}
                    </button>
                    <button
                      type="button"
                      className={`${styles.genderBtn} ${gender === 'male' ? styles.activeGender : ''}`}
                      onClick={() => setGender('male')}
                    >
                      {t.hero.groom}
                    </button>
                  </div>
                </div>

                {/* Age Range */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t.hero.ageFrom}</label>
                    <select
                      value={ageFrom}
                      onChange={(e) => setAgeFrom(e.target.value)}
                      className={styles.selectInput}
                    >
                      {[...Array(25)].map((_, i) => {
                        const age = 18 + i;
                        return (
                          <option key={age} value={age}>
                            {age} {t.hero.yearsUnit}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t.hero.ageTo}</label>
                    <select
                      value={ageTo}
                      onChange={(e) => setAgeTo(e.target.value)}
                      className={styles.selectInput}
                    >
                      {[...Array(25)].map((_, i) => {
                        const age = 22 + i;
                        return (
                          <option key={age} value={age}>
                            {age} {t.hero.yearsUnit}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Caste / Community */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'mr' ? 'जात / शाखा निवडा' : 'Select Caste / Branch'}
                  </label>
                  <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="all">{language === 'mr' ? 'सर्व मराठा (All Maratha)' : 'All Maratha'}</option>
                    <option value="96_kuli">{language === 'mr' ? '९६ कुळी मराठा (96 Kuli Maratha)' : '96 Kuli Maratha'}</option>
                    <option value="kokanastha">{language === 'mr' ? 'कोकणस्थ मराठा (Kokanastha Maratha)' : 'Kokanastha Maratha'}</option>
                    <option value="deshashtha">{language === 'mr' ? 'देशस्थ मराठा (Deshastha Maratha)' : 'Deshastha Maratha'}</option>
                  </select>
                </div>

                {/* Location */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'mr' ? 'स्थान / शहर निवडा' : 'Select City / Location'}
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="all">{language === 'mr' ? 'सर्व शहरे (All Locations)' : 'All Locations'}</option>
                    <option value="Mumbai">Mumbai (मुंबई)</option>
                    <option value="Pune">Pune (पुणे)</option>
                    <option value="Thane">Thane (ठाणे)</option>
                    <option value="Navi Mumbai">Navi Mumbai (नवी मुंबई)</option>
                    <option value="Satara">Satara (सातारा)</option>
                    <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
                    <option value="Sangli">Sangli (सांगली)</option>
                    <option value="Ratnagiri">Ratnagiri (रत्नागिरी)</option>
                    <option value="Sindhudurg">Sindhudurg (सिंधुदुर्ग)</option>
                    <option value="Raigad">Raigad (रायगड)</option>
                    <option value="Solapur">Solapur (सोलापूर)</option>
                    <option value="Nashik">Nashik (नाशिक)</option>
                    <option value="Nagar">Ahmednagar (अहमदनगर)</option>
                    <option value="Dhule">Dhule (धुळे)</option>
                    <option value="NRI">NRI / Out of India (परदेश)</option>
                  </select>
                </div>

                {/* Submit Search Button */}
                <button type="submit" className={styles.searchSubmitBtn}>
                  <span>{t.hero.searchNow}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
