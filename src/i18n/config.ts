import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import commonEn from './locales/en/common.json';
import commonRu from './locales/ru/common.json';
import commonHy from './locales/hy/common.json';

// Namespaces available in the app
export const allNamespaces = [
  'common',
  'landing',
  'auth',
  'dashboard',
  'leaves',
  'tasks',
  'employees',
  'chat',
  'admin',
  'drivers',
  'settings',
  'modules',
] as const;

export type AppNamespace = (typeof allNamespaces)[number];
export const defaultNS: AppNamespace = 'common';

// Bundled common namespace for instant SSR hydration (only ~30KB per language)
export const resources = {
  en: { common: commonEn },
  ru: { common: commonRu },
  hy: { common: commonHy },
} as const;

// Get language from cookie (SSR-compatible)
const getInitialLanguage = () => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/i18nextLng=(en|hy|ru)/);
    if (match?.[1]) return match[1];
  }
  return 'en';
};

if (!i18n.isInitialized) {
  if (typeof window !== 'undefined') {
    i18n.use(HttpBackend);
    i18n.use(LanguageDetector);
  }

  i18n.use(initReactI18next).init({
    defaultNS,
    ns: allNamespaces as unknown as string[],
    fallbackLng: 'en',
    lng: getInitialLanguage(),
    supportedLngs: ['en', 'hy', 'ru'],
    nonExplicitSupportedLngs: false,
    debug: false,
    interpolation: { escapeValue: false },
    resources,
    partialBundledLanguages: true,
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      lookupCookie: 'i18nextLng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    react: { useSuspense: false },
  });
}

export default i18n;
