import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { LanguageCode, translations } from './translations';

interface LanguageContextType {
  locale: LanguageCode;
  setLocale: (code: LanguageCode) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('appLocale');
    return (saved as LanguageCode) || 'en';
  });

  const setLocale = (code: LanguageCode) => {
    setLocaleState(code);
    localStorage.setItem('appLocale', code);
  };

  const contextValue = useMemo(() => {
    const t = (key: string, params?: Record<string, string>): string => {
      // Direct access to translations[locale] should be safe because we populated them via spread
      let text = (translations[locale] && translations[locale][key]) 
                 || (translations['en'] && translations['en'][key]) 
                 || key;
                 
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, v);
        });
      }
      return text;
    };

    return { locale, setLocale, t };
  }, [locale]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};