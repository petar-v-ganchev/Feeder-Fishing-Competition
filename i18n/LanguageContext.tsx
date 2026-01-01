import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { LanguageCode, translations } from './translations';

interface LanguageContextType {
  locale: LanguageCode;
  setLocale: (code: LanguageCode) => void;
  t: (key: string, params?: Record<string, string>) => string;
  formatCurrency: (amount: number) => string;
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

    const formatCurrency = (amount: number): string => {
      const symbol = '€';
      const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
      
      // Handle symbol placement based on common European/English standards
      const trailingSymbolLocales = ['de', 'fr', 'es', 'pt', 'ro', 'it', 'bg', 'pl', 'cz', 'hu'];
      
      if (trailingSymbolLocales.includes(locale)) {
        return `${formattedAmount}\u00A0${symbol}`;
      }
      return `${symbol}${formattedAmount}`;
    };

    return { locale, setLocale, t, formatCurrency };
  }, [locale]);

  return (
    <div className="contents">
      <LanguageContext.Provider value={contextValue}>
        {children}
      </LanguageContext.Provider>
    </div>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};