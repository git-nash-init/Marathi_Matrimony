import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, Search, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../common/Button';
import styles from './Hero.module.css';

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('30');
  const [community, setCommunity] = useState('all');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?gender=${gender}&minAge=${ageFrom}&maxAge=${ageTo}&community=${community}`);
  };

  return (
    <section className={styles.heroSection}>
      {/* Background Decorative Patterns */}
      <div className={styles.bgGlow}></div>
      <div className={styles.patternOverlay}></div>

      <div className="container">
        <div className={styles.heroGrid}>
          {/* Left Text & CTAs */}
          <div className={styles.heroContent}>
            <div className={styles.culturalBadge}>
              <Sparkles size={14} className={styles.badgeIcon} />
              <span>{t.hero.trustedBy}</span>
            </div>

            <h1 className={styles.heroTitle}>
              {t.hero.title}
            </h1>

            <p className={styles.heroSubtitle}>
              {t.hero.subtitle}
            </p>

            {/* Main Hero Buttons */}
            <div className={styles.heroBtnGroup}>
              <Button to="/register" variant="primary" size="lg" icon={<Heart size={18} />}>
                {t.hero.registerBtn}
              </Button>
              <Button to="/search" variant="outline-gold" size="lg" icon={<Search size={18} />}>
                {t.hero.searchBtn}
              </Button>
            </div>

            {/* Trust highlights */}
            <div className={styles.heroTrustPills}>
              <div className={styles.trustPill}>
                <ShieldCheck size={16} className={styles.pillIcon} />
                <span>{t.hero.pill1}</span>
              </div>
              <div className={styles.trustPill}>
                <Heart size={16} className={styles.pillIcon} />
                <span>{t.hero.pill2}</span>
              </div>
            </div>
          </div>

          {/* Right Visual & Quick Search Card */}
          <div className={styles.heroVisualCol}>
            {/* Quick Match Filter Box */}
            <div className={styles.quickSearchCard}>
              <div className={styles.quickSearchHeader}>
                <div className={styles.iconCircle}>
                  <Search size={18} />
                </div>
                <div>
                  <h3 className={styles.quickSearchTitle}>{t.hero.quickSearchTitle}</h3>
                  <p className={styles.quickSearchSub}>{t.hero.quickSearchSub}</p>
                </div>
              </div>

              <form onSubmit={handleQuickSearch} className={styles.searchForm}>
                {/* Looking for */}
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

                {/* Community */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t.hero.community}</label>
                  <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="all">{t.hero.allCommunities}</option>
                    <option value="maratha">Maratha / ९६ कुळी मराठा</option>
                    <option value="brahmin">Brahmin / ब्राह्मण</option>
                    <option value="ckp">CKP / चांद्रसेनीय कायस्थ प्रभू</option>
                    <option value="kunbi">Kunbi Maratha / कुणबी</option>
                    <option value="mali">Mali / माळी</option>
                    <option value="sonar">Sonar / सोनार</option>
                  </select>
                </div>

                {/* Submit Search Button */}
                <button type="submit" className={styles.searchSubmitBtn}>
                  <span>{t.hero.searchNow}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
