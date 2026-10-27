import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LocalizedString } from '../types';
import { translations, TranslationType } from './translations';
import { brandConfig } from '../config/brand.config';

type CallableTranslation = TranslationType & ((keyPath: string, params?: Record<string, any>) => string);

const mrDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export const toMarathiDigits = (val: string | number): string => {
  return String(val).replace(/[0-9]/g, (d) => mrDigits[parseInt(d, 10)]);
};

export const toEnglishDigits = (val: string | number): string => {
  return String(val).replace(/[०-९]/g, (d) => {
    const idx = mrDigits.indexOf(d);
    return idx !== -1 ? String(idx) : d;
  });
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: CallableTranslation;
  brandName: string;
  brandTagline: string;
  localize: (obj: LocalizedString | string | undefined | null) => string;
  formatDigits: (val: string | number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language') as Language | null;
    return saved === 'en' ? 'en' : 'mr'; // Default Marathi
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'mr' ? 'en' : 'mr');
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');
  }, [language]);

  const rawTranslations = translations[language];
  const brandName = brandConfig.name[language];
  const brandTagline = brandConfig.tagline[language];

  // Create robust dual callable + object translation helper with automatic fallback
  const translateFn = (keyPath: string, params?: Record<string, any>): string => {
    if (!keyPath) return '';
    const keys = keyPath.split('.');
    
    // 1. Try active language
    let current: any = rawTranslations;
    let found = true;
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        found = false;
        break;
      }
    }

    // 2. Fallback to alternative language (English or Marathi)
    if (!found || current === undefined || current === null) {
      const fallbackDict = (translations as any)[language === 'mr' ? 'en' : 'mr'];
      let fbCurrent: any = fallbackDict;
      let fbFound = true;
      for (const k of keys) {
        if (fbCurrent && typeof fbCurrent === 'object' && k in fbCurrent) {
          fbCurrent = fbCurrent[k];
        } else {
          fbFound = false;
          break;
        }
      }
      if (fbFound && fbCurrent !== undefined && fbCurrent !== null) {
        current = fbCurrent;
        found = true;
      }
    }

    // 3. If found string, replace params
    if (found && typeof current === 'string') {
      if (params) {
        return Object.entries(params).reduce(
          (acc, [pk, pv]) => acc.replace(new RegExp(`\\{${pk}\\}`, 'g'), String(pv)),
          current
        );
      }
      return current;
    }

    if (found && typeof current === 'number') {
      return String(current);
    }

    // 4. Safe human-readable fallback (NEVER expose raw key "profileBuilder.xyz" in UI)
    if (import.meta.env.DEV) {
      console.warn(`[i18n Warning] Missing translation key: "${keyPath}" for language: "${language}"`);
    }
    const lastKey = keys[keys.length - 1] || keyPath;
    return lastKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const t = new Proxy(translateFn, {
    get: (_target, prop: string | symbol) => {
      if (typeof prop === 'string' && prop in rawTranslations) {
        return (rawTranslations as any)[prop];
      }
      return (_target as any)[prop];
    },
  }) as CallableTranslation;

  const formatDigits = (val: string | number): string => {
    return language === 'mr' ? toMarathiDigits(val) : toEnglishDigits(val);
  };

  const localize = (obj: LocalizedString | string | undefined | null): string => {
    if (!obj) return '';
    if (typeof obj === 'string') {
      return language === 'en' ? toEnglishDigits(obj) : toMarathiDigits(obj);
    }
    const text = obj[language] || obj['en'] || obj['mr'] || '';
    if (language === 'en') {
      return toEnglishDigits(text);
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        brandName,
        brandTagline,
        localize,
        formatDigits,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
