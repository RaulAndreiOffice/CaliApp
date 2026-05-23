/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type Language = 'ro' | 'en';

import { dictionaries, interpolate, type TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'caliapp_lang';
const hasWindow = globalThis.window !== undefined;

function readInitialLanguage(): Language {
  if (!hasWindow) return 'ro';
  const saved = globalThis.localStorage.getItem(STORAGE_KEY);
  return saved === 'ro' || saved === 'en' ? saved : 'ro';
}

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [language, setLanguage] = useState<Language>(readInitialLanguage);

  const persistLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    if (hasWindow) {
      globalThis.localStorage.setItem(STORAGE_KEY, lang);
      globalThis.document.documentElement.lang = lang;
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dict = dictionaries[language];
      const template = dict[key];
      // Strict mode: if a key is missing in the active dictionary, surface the
      // raw key so the gap is obvious instead of silently rendering Romanian.
      if (template === undefined) return key;
      return interpolate(template, vars);
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage: persistLanguage, t }),
    [language, persistLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
