import React, { useState, useEffect, useRef } from 'react';
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

interface CarouselSlide {
  id: number;
  image: string;
  tagline: {
    mr: string;
    en: string;
  };
  caption: {
    mr: string;
    en: string;
  };
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    image: '/images/hero/hero-slide-1.jpg',
    tagline: {
      mr: 'पवित्र विवाह संस्कार व मंगलाष्टक',
      en: 'Sacred Rituals & Royal Maratha Union'
    },
    caption: {
      mr: 'हळद, सीमांतपूजन व सप्तपदीच्या पवित्र साक्षीने',
      en: 'Embracing timeless Maharashtrian wedding traditions'
    }
  },
  {
    id: 2,
    image: '/images/hero/hero-slide-2.jpg',
    tagline: {
      mr: 'पारंपरिक नऊवारी पैठणी व कोल्हापूरी साज',
      en: 'Graceful Maharashtrian Bride in Nauvari'
    },
    caption: {
      mr: 'खानदानी कुळे व उच्चशिक्षित ९६ कुळी मराठा वधू',
      en: 'Educated brides from respected 96 Kuli families'
    }
  },
  {
    id: 3,
    image: '/images/hero/hero-slide-3.jpg',
    tagline: {
      mr: 'रुबाबदार पेशवे फेटा व चंद्रकोर टिळक',
      en: 'Dignified 96 Kuli Maratha Grooms'
    },
    caption: {
      mr: 'इंजिनिअर, डॉक्टर व व्यावसायिक मराठा वर',
      en: 'Engineers, doctors, and established professionals'
    }
  },
  {
    id: 4,
    image: '/images/hero/hero-slide-4.jpg',
    tagline: {
      mr: '३,०००+ यशस्वी आनंदी विवाह गाथा',
      en: '3,000+ Celebrated Success Stories'
    },
    caption: {
      mr: 'वैभव व मृणाली - बोरिवली व सातारा',
      en: 'Vaibhav & Mrunali - Borivali & Satara'
    }
  },
  {
    id: 5,
    image: '/images/hero/hero-slide-5.jpg',
    tagline: {
      mr: 'साखरपुडा ते सप्तपदी अखंड विश्वासू मार्गदर्शन',
      en: 'End-to-End Dedicated Matchmaking Support'
    },
    caption: {
      mr: 'सागर व अश्विनी - ठाणे व कोल्हापूर',
      en: 'Sagar & Ashwini - Thane & Kolhapur'
    }
  },
  {
    id: 6,
    image: '/images/hero/hero-slide-6.jpg',
    tagline: {
      mr: 'मुंबई, पुणे, ठाणे व नाशिक मधील अग्रगण्य व्यासपीठ',
      en: 'Maharashtra\'s Premier Maratha Matrimony'
    },
    caption: {
      mr: 'पराग व प्रियांका - दादर व पुणे',
      en: 'Parag & Priyanka - Dadar & Pune'
    }
  }
];

export const Hero: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Quick Search Form State
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [ageFrom, setAgeFrom] = useState('21');
  const [ageTo, setAgeTo] = useState('30');
  const [community, setCommunity] = useState('all');
  const [location, setLocation] = useState('all');

  // Auto-advance Carousel every 4.5 seconds
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
      }, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

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
    <section
      className={styles.heroSection}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Carousel Banner"
    >
      {/* Background Cinematic Image Carousel with Crossfade */}
      <div className={styles.carouselContainer}>
        {CAROUSEL_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`${styles.carouselSlide} ${isActive ? styles.activeSlide : ''}`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.tagline[language]}
                className={styles.slideImage}
              />
              <div className={styles.slideOverlay} />
            </div>
          );
        })}
      </div>

      {/* Main Content Layer Overlaid On Carousel */}
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroGrid}>
          {/* Left Text, Cultural Trust Badges & Main CTAs */}
          <div className={styles.heroContent}>
            {/* Trust badge */}
            <div className={styles.culturalBadge}>
              <KalashIcon size={16} className={styles.badgeIcon} color="var(--color-antique-gold, #B6873D)" />
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

            {/* Current Slide Cultural Micro-Caption */}
            <div className={styles.currentSlideBadge}>
              <span className={styles.slideDotIndicator}></span>
              <span className={styles.slideTaglineText}>
                {CAROUSEL_SLIDES[currentSlide].tagline[language]}
              </span>
              <span className={styles.slideDivider}>•</span>
              <span className={styles.slideCaptionText}>
                {CAROUSEL_SLIDES[currentSlide].caption[language]}
              </span>
            </div>

            {/* Main Action Buttons with Hover Effects */}
            <div className={styles.heroBtnGroup}>
              <Button to="/register" variant="primary" size="lg" icon={<WeddingUnionIcon size={18} />}>
                {t.hero.registerBtn}
              </Button>
              <Button to="/search" variant="outline-gold" size="lg" icon={<MatrimonySearchIcon size={18} />}>
                {t.hero.searchBtn}
              </Button>
            </div>

            {/* Trust highlights */}
            <div className={styles.heroTrustPills}>
              <div className={styles.trustPill}>
                <VerifiedShieldIcon size={18} className={styles.pillIcon} color="var(--color-oxblood, #7B191E)" />
                <span>{language === 'mr' ? '१००% पडताळणी केलेली खरी स्थळे' : '100% Genuine & Verified Profiles'}</span>
              </div>
              <div className={styles.trustPill}>
                <MarathaCrestIcon size={18} className={styles.pillIcon} color="var(--color-antique-gold, #B6873D)" />
                <span>{language === 'mr' ? '९६ कुळी कोकणस्थ व देशस्थ मराठा' : 'Kokanastha & Deshastha Maratha'}</span>
              </div>
            </div>
          </div>

          {/* Right Frosted Glassmorphism Quick Search Card */}
          <div className={styles.heroVisualCol}>
            <div className={styles.quickSearchCard}>
              <div className={styles.quickSearchHeader}>
                <div className={styles.iconCircle}>
                  <MatrimonySearchIcon size={20} color="var(--color-oxblood, #7B191E)" />
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
                {/* Looking for: Bride or Groom Toggle */}
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
                    <option value="all">{language === 'mr' ? 'सर्व ९६ कुळी मराठा' : 'All 96 Kuli Maratha'}</option>
                    <option value="96 Kuli Maratha">{language === 'mr' ? '९६ कुळी मराठा (96 Kuli Maratha)' : '96 Kuli Maratha'}</option>
                    <option value="Kokanastha Maratha">{language === 'mr' ? 'कोकणस्थ मराठा (Kokanastha Maratha)' : 'Kokanastha Maratha'}</option>
                    <option value="Deshastha Maratha">{language === 'mr' ? 'देशस्थ मराठा (Deshastha Maratha)' : 'Deshastha Maratha'}</option>
                    <option value="Maratha 96 Kuli">{language === 'mr' ? 'खानदानी मराठा (Khandani Maratha)' : 'Khandani Maratha'}</option>
                  </select>
                </div>

                {/* Location Hub */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {language === 'mr' ? 'स्थान / शहर निवडा' : 'Select Preferred Location'}
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={styles.selectInput}
                  >
                    <option value="all">{language === 'mr' ? 'सर्व शहरे (All Maharashtra)' : 'All Locations'}</option>
                    <option value="Mumbai">{language === 'mr' ? 'मुंबई (Mumbai - Dadar, Borivali, Parel)' : 'Mumbai'}</option>
                    <option value="Pune">{language === 'mr' ? 'पुणे (Pune - Dhankawadi, Pimpri, Kothrud)' : 'Pune'}</option>
                    <option value="Thane">{language === 'mr' ? 'ठाणे (Thane - Ghodbunder, Mulund)' : 'Thane'}</option>
                    <option value="Navi Mumbai">{language === 'mr' ? 'नवी मुंबई (Navi Mumbai - Vashi, Kharghar)' : 'Navi Mumbai'}</option>
                    <option value="Kolhapur">{language === 'mr' ? 'कोल्हापूर (Kolhapur)' : 'Kolhapur'}</option>
                    <option value="Satara">{language === 'mr' ? 'सातारा (Satara)' : 'Satara'}</option>
                    <option value="Sangli">{language === 'mr' ? 'सांगली (Sangli)' : 'Sangli'}</option>
                    <option value="Nashik">{language === 'mr' ? 'नाशिक (Nashik)' : 'Nashik'}</option>
                  </select>
                </div>

                {/* Submit Search Button */}
                <button type="submit" className={styles.submitBtn}>
                  <MatrimonySearchIcon size={18} />
                  <span>{language === 'mr' ? 'योग्य स्थळे शोधा' : 'Search Profiles'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Carousel Bottom Controls & Indicators */}
        <div className={styles.carouselBottomBar}>
          {/* Previous Arrow */}
          <button
            type="button"
            className={styles.carouselNavBtn}
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
          >
            ‹
          </button>

          {/* Dots Indicator */}
          <div className={styles.carouselDots}>
            {CAROUSEL_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`${styles.carouselDot} ${idx === currentSlide ? styles.activeDot : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            className={styles.carouselNavBtn}
            onClick={handleNextSlide}
            aria-label="Next Slide"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};
