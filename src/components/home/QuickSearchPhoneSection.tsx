import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  MatrimonySearchIcon,
  VerifiedShieldIcon,
  MarathaCrestIcon,
  WeddingUnionIcon,
  KalashIcon
} from '../common/CulturalIcons';
import styles from './QuickSearchPhoneSection.module.css';

export const QuickSearchPhoneSection: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Search form state inside the iPhone mockup
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
    <section id="quick-search-phone" className={styles.sectionWrapper}>
      <div className="container">
        <div className={styles.sectionGrid}>
          {/* Left Column: Narrative, Features & Value Props */}
          <div className={styles.textColumn}>
            <div className={styles.pillBadge}>
              <KalashIcon size={16} color="#B6873D" />
              <span>
                {language === 'mr' 
                  ? 'मोबाईल मॅचमेकर • शोध तुमच्या पसंतीचा' 
                  : 'Mobile Matchmaker • Instant Match Search'}
              </span>
            </div>

            <h2 className={styles.heading}>
              {language === 'mr' 
                ? 'तुमच्या पसंतीचे ९६ कुळी मराठा स्थळ त्वरित शोधा' 
                : 'Search Your Match On Any Device'}
            </h2>

            <p className={styles.subheading}>
              {language === 'mr'
                ? 'वय, जात, शिक्षण आणि शहरानुसार हजारो पडताळणी झालेल्या ९६ कुळी मराठा वधू-वरांची माहिती आपल्या स्मार्टफोनवरून त्वरित मिळवा. थेट कुटुंबियांशी संपर्क साधा.'
                : 'Find educated 96 Kuli Maratha brides and grooms across Mumbai, Pune, Western Maharashtra, and abroad. Filter precisely by age, clan, education, and location with 100% verified biodatas.'}
            </p>

            {/* Feature Highlights */}
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <MarathaCrestIcon size={20} color="#7B191E" />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>
                    {language === 'mr' ? '९६ कुळी शाखा व गोत्र निवड' : 'Exact 96 Kuli Clan & Branch Filters'}
                  </h4>
                  <p className={styles.featureDesc}>
                    {language === 'mr' 
                      ? 'कोकणस्थ, देशस्थ व खानदानी मराठा कुळांनुसार अचूक शोध.' 
                      : 'Filter precisely for Kokanastha, Deshastha, and specific 96 Kuli Maratha lineages.'}
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <VerifiedShieldIcon size={20} color="#7B191E" />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>
                    {language === 'mr' ? '१००% पडताळणी झालेले बायोडाटा' : '100% Verified Profiles & Family Contacts'}
                  </h4>
                  <p className={styles.featureDesc}>
                    {language === 'mr'
                      ? 'आधार कार्ड, शिक्षण, नोकरी व कौटुंबिक पार्श्वभूमीची खात्री.'
                      : 'Manual verification of education, professional credentials, and direct parent contacts.'}
                  </p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <WeddingUnionIcon size={20} color="#7B191E" />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>
                    {language === 'mr' ? 'थेट व्हॉट्सअ‍ॅप व कॉल संपर्क' : 'Instant Direct WhatsApp & Call Access'}
                  </h4>
                  <p className={styles.featureDesc}>
                    {language === 'mr'
                      ? 'मध्यस्थ किंवा दलालांशिवाय थेट सन्माननीय मराठा कुटुंबांशी जोडा.'
                      : 'Connect with respected Maratha families without middlemen or agent delays.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Stats Bar */}
            <div className={styles.statsBar}>
              <div className={styles.statBox}>
                <span className={styles.statNumber}>३,०००+</span>
                <span className={styles.statLabel}>{language === 'mr' ? 'यशस्वी विवाह' : 'Happy Marriages'}</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statBox}>
                <span className={styles.statNumber}>१२,५००+</span>
                <span className={styles.statLabel}>{language === 'mr' ? 'सक्रिय स्थळे' : 'Active Profiles'}</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statBox}>
                <span className={styles.statNumber}>१००%</span>
                <span className={styles.statLabel}>{language === 'mr' ? 'पडताळणी' : 'Screened'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic iPhone Mockup with Interactive Search Form */}
          <div className={styles.phoneColumn}>
            {/* iPhone 16 Pro Device Frame */}
            <div className={styles.iphoneWrapper}>
              {/* Hardware Side Buttons */}
              <div className={styles.sideBtnVolumeUp} />
              <div className={styles.sideBtnVolumeDown} />
              <div className={styles.sideBtnPower} />

              {/* iPhone Outer Bezel */}
              <div className={styles.iphoneBezel}>
                {/* iPhone Screen Content */}
                <div className={styles.iphoneScreen}>
                  {/* Status Bar */}
                  <div className={styles.statusBar}>
                    <span className={styles.statusTime}>9:41</span>
                    {/* Dynamic Island */}
                    <div className={styles.dynamicIsland}>
                      <span className={styles.cameraLens} />
                    </div>
                    <div className={styles.statusIcons}>
                      {/* Cellular Signal Bars */}
                      <svg width="15" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden="true">
                        <rect x="0" y="8" width="3" height="3" rx="0.5" />
                        <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.5" />
                        <rect x="9" y="3" width="3" height="8" rx="0.5" />
                        <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                      </svg>
                      {/* Wi-Fi Icon */}
                      <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                        <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4.24-2.83a6 6 0 018.48 0 .8.8 0 001.13-1.13 7.6 7.6 0 00-10.74 0 .8.8 0 001.13 1.13zm-2.83-2.83a10 10 0 0114.14 0 .8.8 0 001.13-1.13 11.6 11.6 0 00-16.4 0 .8.8 0 001.13 1.13z"/>
                      </svg>
                      {/* Battery Icon */}
                      <svg width="22" height="11" viewBox="0 0 25 12" fill="currentColor" aria-hidden="true">
                        <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" fill="none" strokeWidth="1" />
                        <rect x="2.5" y="2.5" width="17" height="7" rx="1.5" />
                        <path d="M23 4v4a1.5 1.5 0 001.5-1.5v-1A1.5 1.5 0 0023 4z" />
                      </svg>
                    </div>
                  </div>

                  {/* App Header Inside Phone */}
                  <div className={styles.appHeader}>
                    <div className={styles.appLogoGroup}>
                      <img 
                        src="/images/brand/logo.png" 
                        alt="Logo" 
                        className={styles.appMiniLogo}
                      />
                      <div>
                        <span className={styles.appName}>
                          {language === 'mr' ? 'सनईबंध' : 'Sanaibandh'}
                        </span>
                        <span className={styles.appBadgeVerified}>
                          ✓ {language === 'mr' ? 'अधिकृत व्यासपीठ' : 'Verified Bureau'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Search Your Match Interactive Form */}
                  <div className={styles.searchCardInPhone}>
                    <div className={styles.searchTitleGroup}>
                      <div className={styles.searchIconBox}>
                        <MatrimonySearchIcon size={18} color="#7B191E" />
                      </div>
                      <div>
                        <h3 className={styles.searchTitle}>
                          {language === 'mr' ? 'पसंतीची स्थळे शोधा' : 'Search Your Match'}
                        </h3>
                        <p className={styles.searchSub}>
                          {language === 'mr' ? 'वय, जात व शहरानुसार शोधा' : 'Filter by age, caste & location'}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleQuickSearch} className={styles.phoneForm}>
                      {/* Looking For Gender Toggle */}
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          {language === 'mr' ? 'मी शोधत आहे' : 'I am looking for'}
                        </label>
                        <div className={styles.genderToggle}>
                          <button
                            type="button"
                            className={`${styles.genderBtn} ${gender === 'female' ? styles.activeGender : ''}`}
                            onClick={() => setGender('female')}
                          >
                            <span>{language === 'mr' ? 'वधू' : 'Bride'}</span>
                          </button>
                          <button
                            type="button"
                            className={`${styles.genderBtn} ${gender === 'male' ? styles.activeGender : ''}`}
                            onClick={() => setGender('male')}
                          >
                            <span>{language === 'mr' ? 'वर' : 'Groom'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Age Range Row */}
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            {language === 'mr' ? 'वय (किमान)' : 'Age (From)'}
                          </label>
                          <select
                            value={ageFrom}
                            onChange={(e) => setAgeFrom(e.target.value)}
                            className={styles.phoneSelect}
                          >
                            {[...Array(25)].map((_, i) => {
                              const age = 18 + i;
                              return (
                                <option key={age} value={age}>
                                  {age} {language === 'mr' ? 'वर्षे' : 'Yrs'}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>
                            {language === 'mr' ? 'वय (कमाल)' : 'Age (To)'}
                          </label>
                          <select
                            value={ageTo}
                            onChange={(e) => setAgeTo(e.target.value)}
                            className={styles.phoneSelect}
                          >
                            {[...Array(25)].map((_, i) => {
                              const age = 22 + i;
                              return (
                                <option key={age} value={age}>
                                  {age} {language === 'mr' ? 'वर्षे' : 'Yrs'}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Caste / Branch Dropdown */}
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          {language === 'mr' ? 'जात / शाखा निवडा' : 'Select Caste / Branch'}
                        </label>
                        <select
                          value={community}
                          onChange={(e) => setCommunity(e.target.value)}
                          className={styles.phoneSelect}
                        >
                          <option value="all">
                            {language === 'mr' ? 'सर्व ९६ कुळी मराठा' : 'All 96 Kuli Maratha'}
                          </option>
                          <option value="96 Kuli Maratha">
                            {language === 'mr' ? '९६ कुळी मराठा (खानदानी)' : '96 Kuli Maratha'}
                          </option>
                          <option value="Kokanastha Maratha">
                            {language === 'mr' ? 'कोकणस्थ मराठा' : 'Kokanastha Maratha'}
                          </option>
                          <option value="Deshastha Maratha">
                            {language === 'mr' ? 'देशस्थ मराठा' : 'Deshastha Maratha'}
                          </option>
                        </select>
                      </div>

                      {/* Location Hub Dropdown */}
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          {language === 'mr' ? 'पसंतीचे शहर / जिल्हा' : 'Select Preferred Location'}
                        </label>
                        <select
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className={styles.phoneSelect}
                        >
                          <option value="all">
                            {language === 'mr' ? 'सर्व ठिकाणे (All Locations)' : 'All Locations'}
                          </option>
                          <option value="Mumbai">
                            {language === 'mr' ? 'मुंबई (Dadar, Borivali)' : 'Mumbai'}
                          </option>
                          <option value="Pune">
                            {language === 'mr' ? 'पुणे (Kothrud, PCMC)' : 'Pune'}
                          </option>
                          <option value="Thane">
                            {language === 'mr' ? 'ठाणे (Thane & Mulund)' : 'Thane'}
                          </option>
                          <option value="Navi Mumbai">
                            {language === 'mr' ? 'नवी मुंबई (Vashi, Kharghar)' : 'Navi Mumbai'}
                          </option>
                          <option value="Kolhapur">
                            {language === 'mr' ? 'कोल्हापूर (Kolhapur)' : 'Kolhapur'}
                          </option>
                          <option value="Satara">
                            {language === 'mr' ? 'सातारा (Satara)' : 'Satara'}
                          </option>
                          <option value="Sangli">
                            {language === 'mr' ? 'सांगली (Sangli)' : 'Sangli'}
                          </option>
                          <option value="Nashik">
                            {language === 'mr' ? 'नाशिक (Nashik)' : 'Nashik'}
                          </option>
                        </select>
                      </div>

                      {/* Big Search Profiles CTA Button */}
                      <button type="submit" className={styles.phoneSearchBtn}>
                        <MatrimonySearchIcon size={18} color="#FFFFFF" />
                        <span>{language === 'mr' ? 'योग्य स्थळे शोधा' : 'Search Profiles'}</span>
                      </button>
                    </form>
                  </div>

                  {/* iOS Home Indicator Bar */}
                  <div className={styles.homeIndicator} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
