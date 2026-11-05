import React, { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { SearchFiltersState, Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import { discoveryService, MatchBand } from '../services/discovery.service';
import { EmptyState, ErrorState, NoResults } from '../components/states/UiStates';
import { ProfileCard, ProfileCardSkeleton } from '../components/profile/ProfileCard';
import { SearchFilters } from '../components/search/SearchFilters';
import { Modal } from '../components/common/Modal';
import {
  MatrimonySearchIcon,
  KalashIcon
} from '../components/common/CulturalIcons';
import {
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  ChevronDown,
  Users,
} from 'lucide-react';
import styles from './SearchPage.module.css';

const DEFAULT_FILTERS: SearchFiltersState = {
  gender: 'all',
  minAge: 18,
  maxAge: 60,
  minHeight: 140,
  maxHeight: 200,
  maritalStatus: 'all',
  religion: 'all',
  community: 'all',
  education: 'all',
  occupation: 'all',
  minIncome: 0,
  state: 'all',
  city: 'all',
  rashi: 'all',
  manglik: 'all',
  district: 'all',
  nativeDistrict: 'all',
  verifiedOnly: false,
  photoOnly: false,
  showAllAges: false,
};

export const SearchPage: React.FC = () => {
  const { language } = useLanguage();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeParams = useParams<{ category?: string; location?: string }>();
  const [, startTransition] = useTransition();

  // Determine user gender and enforce strict opposite gender matching
  const userGender = profile?.gender || (user?.user_metadata?.gender as 'male' | 'female' | undefined);
  const targetOppositeGender: 'male' | 'female' | undefined =
    userGender === 'male' ? 'female' : userGender === 'female' ? 'male' : undefined;

  // Route-based default inference (only used if guest)
  const inferredGender = targetOppositeGender || (
    routeParams.category === 'groom' || routeParams.category === 'var'
      ? 'male'
      : routeParams.category === 'bride' || routeParams.category === 'vadhu'
      ? 'female'
      : DEFAULT_FILTERS.gender
  );

  const inferredCity = routeParams.location
    ? routeParams.location.charAt(0).toUpperCase() + routeParams.location.slice(1).toLowerCase()
    : DEFAULT_FILTERS.city;

  // Search text & debounce state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '');

  // Filter state
  const [filters, setFilters] = useState<SearchFiltersState>(() => ({
    gender: targetOppositeGender || (searchParams.get('gender') as any) || inferredGender,
    minAge: Number(searchParams.get('minAge')) || DEFAULT_FILTERS.minAge,
    maxAge: Number(searchParams.get('maxAge')) || DEFAULT_FILTERS.maxAge,
    minHeight: Number(searchParams.get('minHeight')) || DEFAULT_FILTERS.minHeight,
    maxHeight: Number(searchParams.get('maxHeight')) || DEFAULT_FILTERS.maxHeight,
    maritalStatus: searchParams.get('maritalStatus') || DEFAULT_FILTERS.maritalStatus,
    religion: searchParams.get('religion') || DEFAULT_FILTERS.religion,
    community: searchParams.get('community') || DEFAULT_FILTERS.community,
    education: searchParams.get('education') || DEFAULT_FILTERS.education,
    occupation: searchParams.get('occupation') || DEFAULT_FILTERS.occupation,
    minIncome: Number(searchParams.get('minIncome')) || DEFAULT_FILTERS.minIncome,
    state: searchParams.get('state') || DEFAULT_FILTERS.state,
    city: searchParams.get('city') || inferredCity,
    rashi: searchParams.get('rashi') || DEFAULT_FILTERS.rashi,
    manglik: searchParams.get('manglik') || DEFAULT_FILTERS.manglik,
    district: searchParams.get('district') || DEFAULT_FILTERS.district,
    nativeDistrict: searchParams.get('nativeDistrict') || DEFAULT_FILTERS.nativeDistrict,
    verifiedOnly: searchParams.get('verified') === 'true',
    photoOnly: searchParams.get('photoOnly') === 'true',
    showAllAges: searchParams.get('allAges') === 'true',
  }));

  const [sortBy, setSortBy] = useState<'relevance' | 'ageAsc' | 'ageDesc' | 'incomeDesc'>('relevance');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const [band, setBand] = useState<MatchBand | null>(null);
  const requestId = useRef(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(
    (currentFilters: SearchFiltersState, query: string, sort: string) => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (currentFilters.gender !== 'all') params.set('gender', currentFilters.gender);
      if (currentFilters.minAge !== 18) params.set('minAge', String(currentFilters.minAge));
      if (currentFilters.maxAge !== 60) params.set('maxAge', String(currentFilters.maxAge));
      if (currentFilters.minHeight !== 140) params.set('minHeight', String(currentFilters.minHeight));
      if (currentFilters.maxHeight !== 200) params.set('maxHeight', String(currentFilters.maxHeight));
      if (currentFilters.maritalStatus !== 'all') params.set('maritalStatus', currentFilters.maritalStatus);
      if (currentFilters.community !== 'all') params.set('community', currentFilters.community);
      if (currentFilters.religion !== 'all') params.set('religion', currentFilters.religion);
      if (currentFilters.city !== 'all') params.set('city', currentFilters.city);
      if (currentFilters.education !== 'all') params.set('education', currentFilters.education);
      if (currentFilters.occupation !== 'all') params.set('occupation', currentFilters.occupation);
      if (currentFilters.rashi !== 'all') params.set('rashi', currentFilters.rashi);
      if (currentFilters.manglik !== 'all') params.set('manglik', currentFilters.manglik);
      if (currentFilters.district !== 'all') params.set('district', currentFilters.district);
      if (currentFilters.nativeDistrict !== 'all') params.set('nativeDistrict', currentFilters.nativeDistrict);
      if (currentFilters.verifiedOnly) params.set('verified', 'true');
      if (currentFilters.photoOnly) params.set('photoOnly', 'true');
      if (currentFilters.showAllAges) params.set('allAges', 'true');
      if (sort !== 'relevance') params.set('sortBy', sort);

      startTransition(() => {
        setSearchParams(params, { replace: true });
      });
    },
    [setSearchParams]
  );

  // Fetch profiles matching current parameters
  const loadProfiles = useCallback(
    async (currentPage = 1, append = false) => {
      const thisRequest = ++requestId.current;
      if (currentPage === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        // The database shows men and women the opposite gender whatever is sent here.
        const res = await discoveryService.fetchProfiles({
          q: debouncedSearch,
          ...filters,
          sortBy,
          page: currentPage,
          pageSize: 12,
        });
        if (thisRequest !== requestId.current) return; // A newer search has started.

        if (append) {
          setProfiles((prev) => [...prev, ...res.profiles]);
        } else {
          setProfiles(res.profiles);
        }
        setTotalCount(res.totalCount);
        setHasMore(res.hasMore);
      } catch (err) {
        if (thisRequest === requestId.current) setError(err);
      } finally {
        if (thisRequest === requestId.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [debouncedSearch, filters, sortBy]
  );

  // Trigger search on filter / query / sort change
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    setPage(1);
    loadProfiles(1, false);
    updateUrlParams(filters, debouncedSearch, sortBy);
  }, [authLoading, isAuthenticated, debouncedSearch, filters, sortBy, loadProfiles, updateUrlParams]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    discoveryService.getMatchBand().then(setBand);
  }, [authLoading, isAuthenticated, profile?.date_of_birth, profile?.gender]);

  const handleResetFilters = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      gender: targetOppositeGender || DEFAULT_FILTERS.gender,
    });
    setSearchTerm('');
    setDebouncedSearch('');
    setSortBy('relevance');
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProfiles(nextPage, true);
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'gender' || k === 'maritalStatus' || k === 'religion' || k === 'community' || k === 'rashi' || k === 'manglik' || k === 'district' || k === 'nativeDistrict' || k === 'education' || k === 'occupation' || k === 'state' || k === 'city') {
      return v !== 'all';
    }
    if (k === 'minAge') return v !== 18;
    if (k === 'maxAge') return v !== 60;
    if (k === 'minHeight') return v !== 140;
    if (k === 'maxHeight') return v !== 200;
    if (k === 'verifiedOnly' || k === 'photoOnly') return v === true;
    return false;
  }).length;

  const getBannerTitle = () => {
    if (filters.gender === 'female') {
      return filters.city !== 'all'
        ? (language === 'mr' ? `${filters.city} मधील ९६ कुळी मराठा वधू` : `96 Kuli Maratha Brides in ${filters.city}`)
        : (language === 'mr' ? '९६ कुळी मराठा वधू शोधा' : '96 Kuli Maratha Brides');
    }
    if (filters.gender === 'male') {
      return filters.city !== 'all'
        ? (language === 'mr' ? `${filters.city} मधील ९६ कुळी मराठा वर` : `96 Kuli Maratha Grooms in ${filters.city}`)
        : (language === 'mr' ? '९६ कुळी मराठा वर शोधा' : '96 Kuli Maratha Grooms');
    }
    if (filters.city !== 'all') {
      return language === 'mr' ? `${filters.city} मधील मराठा वैवाहिक प्रोफाइल` : `Maratha Matrimony Profiles in ${filters.city}`;
    }
    return language === 'mr' ? '९६ कुळी मराठा जोडीदार शोधा' : 'Find Your 96 Kuli Maratha Match';
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon={<Users size={30} />}
          title={language === 'mr' ? 'स्थळे पाहण्यासाठी लॉगिन करा' : 'Sign in to see profiles'}
          description={language === 'mr'
            ? 'सदस्यांच्या गोपनीयतेसाठी प्रोफाइल्स फक्त नोंदणीकृत सदस्यांना दिसतात. नोंदणी मोफत आहे.'
            : 'To protect members\' privacy, profiles are shown only to registered members. Registering is free.'}
          action={{ label: language === 'mr' ? 'मोफत नोंदणी करा' : 'Register free', to: '/register' }}
          secondaryAction={{ label: language === 'mr' ? 'लॉगिन करा' : 'Sign in', to: '/login' }}
        />
      </div>
    );
  }

  const bandActive = Boolean(band?.applies && !filters.showAllAges);
  const seeking = band?.target_gender === 'female'
    ? (language === 'mr' ? 'वधू' : 'women')
    : (language === 'mr' ? 'वर' : 'men');

  return (
    <div className={styles.container}>
      {/* Page Title & Subtitle Banner */}
      <div className={styles.pageBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerTag}>
            <KalashIcon size={16} />
            <span>{language === 'mr' ? '९६ कुळी मराठा जीवनसाथी शोध' : '96 Kuli Maratha Matchmaking'}</span>
          </div>
          <h1 className={styles.pageTitle}>
            {getBannerTitle()}
          </h1>
          <p className={styles.pageSubtitle}>
            {language === 'mr'
              ? '१००% पडताळणी झालेले कोकणस्थ व देशस्थ ९६ कुळी मराठा स्थळे. खानदानी कुळे, शिक्षण व मूल्यांनुसार शोधा.'
              : '100% verified Kokanastha & Deshastha 96 Kuli Maratha profiles filtered by education, gotra, and values.'}
          </p>
        </div>

        {/* Prominent Search Bar */}
        <div className={styles.searchBarWrapper}>
          <div className={styles.searchBar}>
            <MatrimonySearchIcon size={20} className={styles.searchIcon} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                language === 'mr'
                  ? 'नाव, शहर, शिक्षण, कुळ, उपजात किंवा प्रोफाइल आयडी ने शोधा...'
                  : 'Search by Name, City, Education, Gotra, or Profile ID...'
              }
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className={styles.clearSearchBtn}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className={styles.mainLayout}>
        {/* Desktop Left Filter Panel */}
        <aside className={styles.desktopFilters}>
          <SearchFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            targetGender={targetOppositeGender}
          />
        </aside>

        {/* Right Content Area */}
        <main className={styles.resultsArea}>
          {/* Results Bar: Count, Mobile Filter Trigger & Sorting */}
          <div className={styles.resultsControlBar}>
            <div className={styles.countBadgeGroup}>
              <span className={styles.resultsCount}>
                {isLoading ? (
                  language === 'mr' ? 'शोधत आहे...' : 'Searching...'
                ) : (
                  <>
                    <strong className={styles.countHighlight}>{totalCount}</strong>{' '}
                    {language === 'mr' ? 'प्रोफाइल उपलब्ध' : 'profiles found'}
                  </>
                )}
              </span>

              {activeFilterCount > 0 && (
                <button type="button" onClick={handleResetFilters} className={styles.activeFiltersTag}>
                  <RotateCcw size={12} />
                  <span>
                    {activeFilterCount} {language === 'mr' ? 'फिल्टर्स लागू (हटवा)' : 'Active Filters (Clear)'}
                  </span>
                </button>
              )}
            </div>

            <div className={styles.rightControls}>
              {/* Mobile Filter Button */}
              <button
                type="button"
                className={styles.mobileFilterBtn}
                onClick={() => setMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span>{language === 'mr' ? 'फिल्टर्स' : 'Filters'}</span>
                {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
              </button>

              {/* Sort Selector */}
              <div className={styles.sortWrapper}>
                <ArrowUpDown size={15} className={styles.sortIcon} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={styles.sortSelect}
                  aria-label="Sort profiles"
                >
                  <option value="relevance">{language === 'mr' ? 'सुसंगतता' : 'Relevance'}</option>
                  <option value="ageAsc">{language === 'mr' ? 'वय: कमी ते जास्त' : 'Age: Low to High'}</option>
                  <option value="ageDesc">{language === 'mr' ? 'वय: जास्त ते कमी' : 'Age: High to Low'}</option>
                  <option value="incomeDesc">{language === 'mr' ? 'उत्पन्न: जास्त ते कमी' : 'Income: High to Low'}</option>
                </select>
                <ChevronDown size={15} className={styles.sortChevron} />
              </div>
            </div>
          </div>

          {/* Marriage age group */}
          {band?.applies && (
            <div className={styles.ageBand}>
              <span>
                {filters.showAllAges
                  ? (language === 'mr'
                      ? 'सर्व वयोगट दाखवत आहे. आपल्या वयोगटाबाहेरील स्थळे चिन्हांकित आहेत.'
                      : 'Showing all ages. Members outside your age group are marked.')
                  : (language === 'mr'
                      ? `${band.min_age}–${band.max_age} वयोगटातील ${seeking} दाखवत आहे (आपला विवाह वयोगट).`
                      : `Showing ${seeking} aged ${band.min_age}–${band.max_age}, your marriage age group.`)}
              </span>
              <label className={styles.ageBandToggle}>
                <input
                  type="checkbox"
                  checked={filters.showAllAges}
                  onChange={(e) => setFilters({ ...filters, showAllAges: e.target.checked })}
                />
                {language === 'mr' ? 'सर्व वयोगट दाखवा' : 'Show all ages'}
              </label>
            </div>
          )}
          {band && !band.applies && band.reason !== 'not_applicable' && (
            <div className={styles.ageBand}>
              <span>
                {band.reason === 'no_profile'
                  ? (language === 'mr' ? 'आपल्या वयोगटातील स्थळे पाहण्यासाठी प्रोफाइल तयार करा.' : 'Create your profile to see members in your age group.')
                  : (language === 'mr' ? 'आपल्या वयोगटातील स्थळे पाहण्यासाठी जन्मतारीख द्या.' : 'Add your date of birth to see members in your age group.')}
              </span>
              <Link to={band.reason === 'no_profile' ? '/profile/create' : '/profile/edit'} className={styles.ageBandLink}>
                {band.reason === 'no_profile'
                  ? (language === 'mr' ? 'प्रोफाइल तयार करा' : 'Create profile')
                  : (language === 'mr' ? 'जन्मतारीख द्या' : 'Add date of birth')}
              </Link>
            </div>
          )}

          {/* Results Grid / Loading / Empty / Error States */}
          {isLoading || authLoading ? (
            <div className={styles.profilesGrid}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProfileCardSkeleton key={idx} />
              ))}
            </div>
          ) : error && profiles.length === 0 ? (
            <ErrorState error={error} onRetry={() => loadProfiles(1, false)} />
          ) : profiles.length === 0 ? (
            debouncedSearch.trim() ? (
              <NoResults query={debouncedSearch.trim()} onClear={() => setSearchTerm('')} />
            ) : (
              <EmptyState
                icon={<MatrimonySearchIcon size={30} />}
                title={language === 'mr' ? 'जुळणारे प्रोफाइल सापडले नाही' : 'No matching profiles yet'}
                description={bandActive
                  ? (language === 'mr'
                      ? 'आपल्या वयोगटात सध्या कोणी नाही. सर्व वयोगट पाहू शकता किंवा फिल्टर बदलू शकता.'
                      : 'Nobody in your age group matches right now. You can look at all ages or change your filters.')
                  : (language === 'mr'
                      ? 'फिल्टर्स बदलून पुन्हा प्रयत्न करा.'
                      : 'Try changing your filters.')}
                action={bandActive
                  ? { label: language === 'mr' ? 'सर्व वयोगट दाखवा' : 'Show all ages', onClick: () => setFilters({ ...filters, showAllAges: true }) }
                  : undefined}
                secondaryAction={{ label: language === 'mr' ? 'सर्व फिल्टर्स हटवा' : 'Clear all filters', onClick: handleResetFilters }}
              />
            )
          ) : (
            <>
              <div className={styles.profilesGrid}>
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onBlock={(blockedId: string) => {
                      setProfiles((prev) => prev.filter((p) => p.id !== blockedId));
                      setTotalCount((prev) => Math.max(0, prev - 1));
                    }}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className={styles.loadMoreWrapper}>
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className={styles.loadMoreBtn}
                  >
                    {isLoadingMore
                      ? language === 'mr'
                        ? 'लोड करत आहे...'
                        : 'Loading more profiles...'
                      : language === 'mr'
                      ? 'अधिक प्रोफाइल पहा'
                      : 'Load More Profiles'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer / Modal */}
      <Modal
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title={language === 'mr' ? 'फिल्टर्स निवडा' : 'Filter Profiles'}
      >
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          onApply={() => setMobileFilterOpen(false)}
          onClose={() => setMobileFilterOpen(false)}
          targetGender={targetOppositeGender}
          isMobile
        />
      </Modal>
    </div>
  );
};
