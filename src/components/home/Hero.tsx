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
      mr: '३,०००+ आनंदी व यशस्वी विवाह गाथा',
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

  // Auto-advance Carousel every 5.0 seconds
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
      }, 5000);
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

  const scrollToQuickSearch = () => {
    const el = document.getElementById('quick-search-phone');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/search');
    }
  };

  return (
    <section
      className={styles.heroSection}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Carousel Banner"
    >
      {/* Background Cinematic Image Carousel with Crossfade - spans 100% full screen behind navbar */}
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

      {/* Main Content Layer Overlaid On Carousel - Centered/Left Layout with unobstructed photography */}
      <div className={`container ${styles.heroContainer}`}>
        <div className={styles.heroContentWrapper}>
          <div className={styles.heroContentCard}>
            {/* 1. Cultural Trust Badge */}
            <div className={styles.culturalBadge}>
              <KalashIcon size={16} className={styles.badgeIcon} color="#DFC17B" />
              <span>
                {language === 'mr' 
                  ? '१०+ वर्षे अखंड सेवेत | ३,०००+ आनंदी ९६ कुळी मराठा विवाह' 
                  : '10+ Years Dedicated Service | 3,000+ Happy Maratha Marriages'}
              </span>
            </div>

            {/* 2. Main Headline */}
            <h1 className={styles.heroTitle}>
              {language === 'mr' 
                ? '९६ कुळी मराठा समाजातील अग्रगण्य मॅट्रिमोनी व विवाह मंडळ' 
                : 'Premier 96 Kuli Maratha Matrimony & Marriage Bureau'}
            </h1>

            {/* 3. Subtitle */}
            <p className={styles.heroSubtitle}>
              {language === 'mr'
                ? 'मुंबई, ठाणे, नवी मुंबई, पुणे व संपूर्ण महाराष्ट्रातील कोकणस्थ आणि देशस्थ मराठा उच्चशिक्षित स्थळांचे सर्वात मोठे व विश्वासू व्यासपीठ.'
                : 'The premier matrimonial network connecting educated 96 Kuli Maratha brides and grooms across Mumbai, Pune, Thane, Navi Mumbai, and abroad.'}
            </p>

            {/* 4. Current Slide Cultural Micro-Caption Badge */}
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

            {/* 5. Main Action Buttons with Glassmorphism Hover Effects */}
            <div className={styles.heroBtnGroup}>
              <Button 
                to="/register" 
                variant="primary" 
                size="lg" 
                icon={<WeddingUnionIcon size={18} />}
                className={styles.registerCta}
              >
                {t.hero.registerBtn || (language === 'mr' ? 'मोफत नोंदणी करा' : 'Register Free')}
              </Button>

              <button 
                type="button"
                onClick={scrollToQuickSearch}
                className={styles.searchGlassBtn}
              >
                <MatrimonySearchIcon size={18} color="#DFC17B" />
                <span>{t.hero.searchBtn || (language === 'mr' ? 'स्थळे शोधा' : 'Search Profiles')}</span>
              </button>
            </div>

            {/* 6. Dual Trust Badges */}
            <div className={styles.heroTrustPills}>
              <div className={styles.trustPill}>
                <VerifiedShieldIcon size={17} className={styles.pillIcon} color="#DFC17B" />
                <span>
                  {language === 'mr' 
                    ? '१००% खरी व पडताळणी झालेली स्थळे' 
                    : '100% Genuine & Verified Profiles'}
                </span>
              </div>
              <div className={styles.trustPill}>
                <MarathaCrestIcon size={17} className={styles.pillIcon} color="#DFC17B" />
                <span>
                  {language === 'mr' 
                    ? 'कोकणस्थ व देशस्थ मराठा' 
                    : 'Kokanastha & Deshastha Maratha'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Bottom Controls & Indicators */}
        <div className={styles.carouselBottomBar}>
          <button
            type="button"
            className={styles.carouselNavBtn}
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
          >
            ‹
          </button>

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

          <button
            type="button"
            className={styles.carouselNavBtn}
            onClick={handleNextSlide}
            aria-label="Next Slide"
          >
            ›
          </button>
        </div>

        {/* Subtle Animated Scroll Down Indicator to Quick Search */}
        <div 
          className={styles.scrollDownIndicator}
          onClick={scrollToQuickSearch}
          title={language === 'mr' ? 'खाली शोधा' : 'Scroll down to search'}
        >
          <span className={styles.scrollText}>
            {language === 'mr' ? 'त्वरित स्थळ शोधा' : 'Search Matches Below'}
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.scrollChevron}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </section>
  );
};
