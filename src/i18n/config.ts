import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import hyTranslations from './locales/hy.json';
import ruTranslations from './locales/ru.json';

export const defaultNS = 'translation';

export const resources = {
  en: {
    translation: enTranslations,
  },
  hy: {
    translation: hyTranslations,
  },
  ru: {
    translation: ruTranslations,
  },
} as const;

// Only use LanguageDetector on client side
if (typeof window !== 'undefined') {
  i18n.use(LanguageDetector);
}

i18n
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en',
    lng: 'en', // Default language for SSR
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // Client-side language detection
    detection: typeof window !== 'undefined' ? {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    } : undefined,
    
    // SSR support
    react: {
      useSuspense: false, // Disable Suspense for SSR compatibility
    },
  });

export default i18n;
