import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { locationHubs, LocationHub } from '../data/locationHubs';
import { discoveryService } from '../services/discovery.service';
import { Profile } from '../types';
import { ProfileCard } from '../components/profile/ProfileCard';
import { ProfileCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import {
  KalashIcon,
  LocationPinIcon,
  WhatsAppCrestIcon,
  MarathaCrestIcon,
  MatrimonySearchIcon,
  WeddingUnionIcon
} from '../components/common/CulturalIcons';
import styles from './LocationLandingPage.module.css';

export const LocationLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const { language, brandName } = useLanguage();

  // Determine current hub by explicit slug or direct URL pathname
  const currentPath = location.pathname.replace(/^\//, '');
  const hub: LocationHub = locationHubs[slug || ''] || locationHubs[currentPath] || locationHubs['maratha-marriage-bureau-borivali'];

  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set SEO metadata and Schema.org structured data
  useEffect(() => {
    document.title = `${hub.title[language]} | ${brandName}`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', hub.metaDescription[language]);
    }

    // Add JSON-LD Structured Data
    const scriptId = 'location-hub-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LocalBusiness',
          'name': `${brandName} - ${hub.name.en}`,
          'url': window.location.href,
          'telephone': hub.helplinePhone,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': hub.officeArea,
            'addressRegion': 'Maharashtra',
            'addressCountry': 'IN'
          },
          'description': hub.metaDescription.en
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': window.location.origin
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Maratha Matrimony',
              'item': `${window.location.origin}/search`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': hub.name.en,
              'item': window.location.href
            }
          ]
        }
      ]
    });

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };
  }, [hub, language]);

  // Fetch profiles matching this regional hub
  useEffect(() => {
    let isMounted = true;
    const loadProfiles = async () => {
      setIsLoading(true);
      try {
        const queryParams: any = {
          pageSize: 6,
          city: hub.region === 'pune' ? 'Pune' : 'Mumbai'
        };
        if (genderFilter !== 'all') {
          queryParams.gender = genderFilter;
        }

        const res = await discoveryService.fetchProfiles(queryParams);
        if (isMounted) {
          setProfiles(res.profiles || []);
        }
      } catch (err) {
        console.error('Failed to load hub profiles:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfiles();
    return () => { isMounted = false; };
  }, [hub, genderFilter]);

  // Sibling regional hubs for cross-linking
  const siblingHubs = Object.values(locationHubs).filter(h => h.slug !== hub.slug);

  return (
    <div className={styles.page}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbWrap}>
        <div className="container">
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link to="/" className={styles.breadcrumbLink}>
              {language === 'mr' ? 'मुख्यपृष्ठ' : 'Home'}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <Link to="/search" className={styles.breadcrumbLink}>
              {language === 'mr' ? 'मराठा वधु-वर' : 'Maratha Matrimonial'}
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.currentBreadcrumb}>
              {hub.name[language]}
            </span>
          </nav>
        </div>
      </div>

      {/* Regional Hero Banner */}
      <section className={styles.hubHero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.culturalBadge}>
              <KalashIcon size={16} color="var(--color-antique-gold)" />
              <span>{language === 'mr' ? '१०+ वर्षे विश्वासू मराठा विवाह संस्था' : '10+ Years Dedicated Matchmaking'}</span>
            </div>

            <h1 className={styles.hubTitle}>{hub.title[language]}</h1>
            <p className={styles.hubIntro}>{hub.intro[language]}</p>

            <div className={styles.actionRow}>
              <Button to="/register" variant="primary" size="lg" icon={<WeddingUnionIcon size={18} />}>
                {language === 'mr' ? 'मोफत नोंदणी करा' : 'Register Free in ' + hub.name.en}
              </Button>
              <a
                href={`https://wa.me/917208659356?text=${encodeURIComponent(`Hello ${brandName}, I am looking for 96 Kuli Maratha matches in ${hub.name.en}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '12px 22px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none'
                }}
              >
                <WhatsAppCrestIcon size={18} color="#FFFFFF" />
                <span>{language === 'mr' ? 'बायोडाटा व्हॉट्सअ‍ॅप करा' : 'WhatsApp Biodata'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-areas & Native Districts Covered */}
      <section className={styles.metaSection}>
        <div className="container">
          <div className={styles.metaGrid}>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaBlockTitle}>
                <LocationPinIcon size={18} color="var(--color-primary)" />
                <span>{language === 'mr' ? `${hub.name.mr} व परिसरातील प्रमुख उपनगरे` : `Localities Covered in ${hub.name.en}`}</span>
              </h3>
              <div className={styles.chipList}>
                {hub.subAreas.map((area, idx) => (
                  <span key={idx} className={styles.chip}>{area}</span>
                ))}
              </div>
            </div>

            <div className={styles.metaBlock}>
              <h3 className={styles.metaBlockTitle}>
                <MarathaCrestIcon size={18} color="var(--color-antique-gold)" />
                <span>{language === 'mr' ? 'स्थानिक सभासदांचे मूळ जिल्हे' : 'Native Districts Represented'}</span>
              </h3>
              <div className={styles.chipList}>
                {hub.nativeDistricts.map((district, idx) => (
                  <span key={idx} className={styles.chip}>{district}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Profiles in this Region */}
      <section className={styles.profilesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                {language === 'mr' ? `${hub.name.mr} मधील ९६ कुळी मराठा वधू व वर` : `96 Kuli Maratha Grooms & Brides in ${hub.name.en}`}
              </h2>
              <p className={styles.sectionSub}>
                {language === 'mr' ? 'पडताळणी केलेली, उच्चशिक्षित व सक्रिय मराठा स्थळे' : 'Verified, educated, and authentic Maratha matrimonial profiles'}
              </p>
            </div>

            {/* Quick Gender Filter Switch */}
            <div style={{ display: 'flex', gap: '8px', background: 'var(--color-ivory)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={() => setGenderFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  background: genderFilter === 'all' ? 'var(--color-oxblood)' : 'transparent',
                  color: genderFilter === 'all' ? '#FFFFFF' : 'var(--color-ink)'
                }}
              >
                {language === 'mr' ? 'सर्व स्थळे' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('female')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  background: genderFilter === 'female' ? 'var(--color-oxblood)' : 'transparent',
                  color: genderFilter === 'female' ? '#FFFFFF' : 'var(--color-ink)'
                }}
              >
                {language === 'mr' ? 'मराठा वधू' : 'Brides'}
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('male')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  background: genderFilter === 'male' ? 'var(--color-oxblood)' : 'transparent',
                  color: genderFilter === 'male' ? '#FFFFFF' : 'var(--color-ink)'
                }}
              >
                {language === 'mr' ? 'मराठा वर' : 'Grooms'}
              </button>
            </div>
          </div>

          {/* Profiles Grid */}
          {isLoading ? (
            <div className={styles.profilesGrid}>
              {[...Array(4)].map((_, i) => (
                <ProfileCardSkeleton key={i} />
              ))}
            </div>
          ) : profiles.length > 0 ? (
            <div className={styles.profilesGrid}>
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--color-ivory)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <MarathaCrestIcon size={36} color="var(--color-antique-gold)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-ink)', marginBottom: '8px' }}>
                {language === 'mr' ? 'या विभागात सध्या नवीन स्थळे जोडली जात आहेत' : 'New profiles are currently being verified for this location'}
              </h3>
              <p style={{ color: 'var(--color-ink-muted)', marginBottom: '20px', fontSize: '0.92rem' }}>
                {language === 'mr' ? 'आपले प्रोफाईल आजच मोफत नोंदवून अग्रस्थान मिळवा.' : 'Register your profile free today to be featured.'}
              </p>
              <Button to="/register" variant="primary">
                {language === 'mr' ? 'मोफत नोंदणी करा' : 'Register Free'}
              </Button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Button
              to={`/search?city=${hub.region === 'pune' ? 'Pune' : 'Mumbai'}`}
              variant="outline-gold"
              size="lg"
            >
              <span>{language === 'mr' ? `${hub.name.mr} व परिसरातील सर्व स्थळे पहा` : `View All Matches in ${hub.name.en}`}</span>
              <MatrimonySearchIcon size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* Sibling Regional Hubs for SEO and Cross-Discovery */}
      <section className={styles.siblingSection}>
        <div className="container">
          <h3 className={styles.siblingTitle}>
            {language === 'mr' ? 'महाराष्ट्रातील इतर प्रमुख मराठा वधु-वर सूचक केंद्रे' : 'Other Regional Maratha Matrimonial Hubs'}
          </h3>
          <div className={styles.siblingGrid}>
            {siblingHubs.map((sHub) => (
              <Link key={sHub.slug} to={`/${sHub.slug}`} className={styles.siblingCard}>
                <span className={styles.siblingName}>{sHub.name[language]}</span>
                <span className={styles.siblingDesc}>
                  {language === 'mr' ? '९६ कुळी मराठा विवाह मंडळ' : '96 Kuli Maratha Bureau'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
