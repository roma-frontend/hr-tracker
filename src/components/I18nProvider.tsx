'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // On client-side, detect and apply saved language
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('i18nextLng');
      console.log('🔄 I18nProvider: saved language =', savedLang, ', current =', i18n.language);
      if (savedLang && savedLang !== i18n.language) {
        console.log('🔄 Changing language to:', savedLang);
        i18n.changeLanguage(savedLang);
      }
    }
    setIsReady(true);
  }, [i18n]);

  // Prevent hydration mismatch by not rendering until language is set
  if (!isReady) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
