"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, toBengaliDigits, formatCurrencyValue } from '@/i18n/translations';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  isBangla: false,
  t: (key, fallback) => fallback || key,
  toDigits: (val) => val,
  formatCurrency: (amount, prefix) => `${prefix || ''}BDT ${amount}`,
  dict: translations.en
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('bapl_lang');
      if (savedLang === 'bn' || savedLang === 'en') {
        setLangState(savedLang);
        document.documentElement.setAttribute('lang', savedLang);
        document.documentElement.setAttribute('data-lang', savedLang);
      } else {
        document.documentElement.setAttribute('lang', 'en');
        document.documentElement.setAttribute('data-lang', 'en');
      }
    } catch (e) {
      // Ignore storage errors
    }
    setMounted(true);
  }, []);

  const setLang = (newLang) => {
    if (newLang !== 'en' && newLang !== 'bn') return;
    setLangState(newLang);
    try {
      localStorage.setItem('bapl_lang', newLang);
      document.documentElement.setAttribute('lang', newLang);
      document.documentElement.setAttribute('data-lang', newLang);
    } catch (e) {
      // Ignore storage errors
    }
  };

  const toggleLang = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const isBangla = lang === 'bn';
  const dict = translations[lang] || translations.en;

  const t = (key, fallback = '') => {
    if (!key) return fallback;
    
    // Support dot-notation: e.g. "months.november"
    const keys = key.split('.');
    let result = dict;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result !== undefined && typeof result === 'string') {
      return result;
    }

    // Fallback to English dictionary if missing in current
    let enResult = translations.en;
    for (const k of keys) {
      if (enResult && typeof enResult === 'object' && k in enResult) {
        enResult = enResult[k];
      } else {
        enResult = undefined;
        break;
      }
    }

    if (enResult !== undefined && typeof enResult === 'string') {
      return enResult;
    }

    return fallback || key;
  };

  const toDigits = (val) => {
    if (!isBangla) return val;
    return toBengaliDigits(val);
  };

  const formatCurrency = (amount, prefix = '') => {
    return formatCurrencyValue(amount, lang, prefix);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        isBangla,
        t,
        toDigits,
        formatCurrency,
        dict
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
