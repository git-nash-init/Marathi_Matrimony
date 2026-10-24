import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SearchFiltersState } from '../../types';
import {
  MARATHI_COMMUNITIES,
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  MAHARASHTRA_CITIES,
  OptionItem,
} from '../../data/profileOptions';
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  ShieldCheck,
  Camera,
  ChevronDown,
  X,
} from 'lucide-react';
import styles from './SearchFilters.module.css';

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  onReset: () => void;
  onApply?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChange,
  onReset,
  onApply,
  onClose,
  isMobile = false,
}) => {
  const { language } = useLanguage();

  const handleFieldChange = (field: keyof SearchFiltersState, value: any) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const maritalStatusOptions = [
    { value: 'all', labelMr: 'सर्व वैवाहिक स्थिती', labelEn: 'All Marital Status' },
    { value: 'never_married', labelMr: 'अविवाहित', labelEn: 'Never Married' },
    { value: 'divorced', labelMr: 'घटस्फोटित', labelEn: 'Divorced' },
    { value: 'widowed', labelMr: 'विधवा / विधुर', labelEn: 'Widowed' },
  ];

  const religionOptions = [
    { value: 'all', labelMr: 'सर्व धर्म', labelEn: 'All Religions' },
    { value: 'Hindu', labelMr: 'हिंदू', labelEn: 'Hindu' },
    { value: 'Jain', labelMr: 'जैन', labelEn: 'Jain' },
    { value: 'Buddhist', labelMr: 'बौद्ध', labelEn: 'Buddhist' },
    { value: 'Lingayat', labelMr: 'लिंगायत', labelEn: 'Lingayat' },
  ];

  return (
    <div className={`${styles.filterPanel} ${isMobile ? styles.mobilePanel : ''}`}>
      {/* Header */}
      <div className={styles.filterHeader}>
        <div className={styles.headerTitleGroup}>
          <SlidersHorizontal size={18} className={styles.filterIcon} />
          <h2 className={styles.filterHeading}>
            {language === 'mr' ? 'शोध फिल्टर्स' : 'Search Filters'}
          </h2>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={onReset} className={styles.resetBtn}>
            <RotateCcw size={13} />
            <span>{language === 'mr' ? 'रीसेट' : 'Reset'}</span>
          </button>
          {isMobile && onClose && (
            <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close filters">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.filterSections}>
        {/* 1. GENDER */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>
            {language === 'mr' ? 'लिंग / जोडीदार शोध' : 'Looking For'}
          </label>
          <div className={styles.segmentedGroup}>
            {[
              { val: 'all', mr: 'सर्व', en: 'All' },
              { val: 'female', mr: 'वधू', en: 'Brides' },
              { val: 'male', mr: 'वर', en: 'Grooms' },
            ].map((g) => (
              <button
                key={g.val}
                type="button"
                className={`${styles.segmentedBtn} ${filters.gender === g.val ? styles.activeSegment : ''}`}
                onClick={() => handleFieldChange('gender', g.val)}
              >
                {language === 'mr' ? g.mr : g.en}
              </button>
            ))}
          </div>
        </div>

        {/* 2. AGE RANGE */}
        <div className={styles.section}>
          <div className={styles.rangeHeader}>
            <label className={styles.sectionLabel}>{language === 'mr' ? 'वय मर्यादा' : 'Age Range'}</label>
            <span className={styles.rangeValues}>
              {filters.minAge} – {filters.maxAge} {language === 'mr' ? 'वर्षे' : 'yrs'}
            </span>
          </div>
          <div className={styles.rangeInputsRow}>
            <input
              type="range"
              min="18"
              max="60"
              value={filters.minAge}
              onChange={(e) => handleFieldChange('minAge', Math.min(Number(e.target.value), filters.maxAge - 1))}
              className={styles.rangeSlider}
            />
            <input
              type="range"
              min="18"
              max="60"
              value={filters.maxAge}
              onChange={(e) => handleFieldChange('maxAge', Math.max(Number(e.target.value), filters.minAge + 1))}
              className={styles.rangeSlider}
            />
          </div>
        </div>

        {/* 3. HEIGHT RANGE */}
        <div className={styles.section}>
          <div className={styles.rangeHeader}>
            <label className={styles.sectionLabel}>{language === 'mr' ? 'उंची मर्यादा' : 'Height Range'}</label>
            <span className={styles.rangeValues}>
              {Math.floor(filters.minHeight / 30.48)}'{Math.round((filters.minHeight % 30.48) / 2.54)}" –{' '}
              {Math.floor(filters.maxHeight / 30.48)}'{Math.round((filters.maxHeight % 30.48) / 2.54)}"
            </span>
          </div>
          <div className={styles.rangeInputsRow}>
            <input
              type="range"
              min="140"
              max="210"
              value={filters.minHeight}
              onChange={(e) => handleFieldChange('minHeight', Math.min(Number(e.target.value), filters.maxHeight - 2))}
              className={styles.rangeSlider}
            />
            <input
              type="range"
              min="140"
              max="210"
              value={filters.maxHeight}
              onChange={(e) => handleFieldChange('maxHeight', Math.max(Number(e.target.value), filters.minHeight + 2))}
              className={styles.rangeSlider}
            />
          </div>
        </div>

        {/* 4. MARITAL STATUS */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>{language === 'mr' ? 'वैवाहिक स्थिती' : 'Marital Status'}</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.maritalStatus}
              onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
              className={styles.selectInput}
            >
              {maritalStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {language === 'mr' ? opt.labelMr : opt.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className={styles.chevronIcon} />
          </div>
        </div>

        {/* 5. COMMUNITY / CASTE */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>{language === 'mr' ? 'जात / समाज' : 'Community / Caste'}</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.community}
              onChange={(e) => handleFieldChange('community', e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">{language === 'mr' ? 'सर्व समाज' : 'All Communities'}</option>
              {MARATHI_COMMUNITIES.map((c: OptionItem) => (
                <option key={c.id} value={c.id}>
                  {language === 'mr' ? c.mr : c.en}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className={styles.chevronIcon} />
          </div>
        </div>

        {/* 6. RELIGION */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>{language === 'mr' ? 'धर्म' : 'Religion'}</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.religion}
              onChange={(e) => handleFieldChange('religion', e.target.value)}
              className={styles.selectInput}
            >
              {religionOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {language === 'mr' ? r.labelMr : r.labelEn}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className={styles.chevronIcon} />
          </div>
        </div>

        {/* 7. LOCATION / CITY */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>{language === 'mr' ? 'जिल्हा / शहर' : 'City / District'}</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">{language === 'mr' ? 'सर्व शहरे' : 'All Cities'}</option>
              {MAHARASHTRA_CITIES.map((d: OptionItem) => (
                <option key={d.id} value={d.id}>
                  {language === 'mr' ? d.mr : d.en}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className={styles.chevronIcon} />
          </div>
        </div>

        {/* 8. EDUCATION */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>{language === 'mr' ? 'शिक्षण' : 'Education'}</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.education}
              onChange={(e) => handleFieldChange('education', e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">{language === 'mr' ? 'सर्व शिक्षण' : 'All Education'}</option>
              {EDUCATION_OPTIONS.map((e: OptionItem) => (
                <option key={e.id} value={e.id}>
                  {language === 'mr' ? e.mr : e.en}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className={styles.chevronIcon} />
          </div>
        </div>

        {/* 9. OCCUPATION */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>{language === 'mr' ? 'व्यवसाय / नोकरी' : 'Occupation'}</label>
          <div className={styles.selectWrapper}>
            <select
              value={filters.occupation}
              onChange={(e) => handleFieldChange('occupation', e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">{language === 'mr' ? 'सर्व व्यवसाय' : 'All Occupations'}</option>
              {OCCUPATION_OPTIONS.map((o: OptionItem) => (
                <option key={o.id} value={o.id}>
                  {language === 'mr' ? o.mr : o.en}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className={styles.chevronIcon} />
          </div>
        </div>

        {/* 10. VERIFICATION & PHOTO TOGGLES */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>{language === 'mr' ? 'विशेष निकष' : 'Profile Quality'}</label>
          <div className={styles.toggleList}>
            <label className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => handleFieldChange('verifiedOnly', e.target.checked)}
                className={styles.checkboxInput}
              />
              <div className={styles.checkboxContent}>
                <ShieldCheck size={16} color="#16A34A" />
                <span>{language === 'mr' ? 'फक्त पडताळणी झालेले प्रोफाइल' : 'Verified Profiles Only'}</span>
              </div>
            </label>

            <label className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={filters.photoOnly}
                onChange={(e) => handleFieldChange('photoOnly', e.target.checked)}
                className={styles.checkboxInput}
              />
              <div className={styles.checkboxContent}>
                <Camera size={16} color="var(--color-primary, #7A1F3D)" />
                <span>{language === 'mr' ? 'फक्त फोटो असलेले प्रोफाइल' : 'Profiles with Photo'}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Mobile Footer Apply Button */}
      {isMobile && onApply && (
        <div className={styles.mobileFooter}>
          <button type="button" onClick={onReset} className={styles.mobileResetBtn}>
            {language === 'mr' ? 'सर्व हटवा' : 'Clear All'}
          </button>
          <button type="button" onClick={onApply} className={styles.mobileApplyBtn}>
            <Check size={16} />
            <span>{language === 'mr' ? 'फिल्टर्स लावा' : 'Apply Filters'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
