'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n/config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // On client-side, detect and apply saved language
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('i18nextLng');
      const currentLang = i18n.language;
      
      console.log('🔄 I18nProvider mounted:');
      console.log('   - localStorage has:', savedLang);
      console.log('   - i18n.language is:', currentLang);
      
      // Check if saved language is valid
      const validLanguages = ['en', 'hy', 'ru'];
      
      if (savedLang && validLanguages.includes(savedLang)) {
        if (savedLang !== currentLang) {
          console.log('🔄 Restoring language from localStorage:', savedLang);
          i18n.changeLanguage(savedLang).then(() => {
            console.log('✅ Language restored successfully:', savedLang);
            // Force re-render by setting ready state
            setIsReady(true);
          });
          return; // Exit early, setIsReady called in promise
        } else {
          console.log('✅ Language already matches localStorage:', savedLang);
        }
      } else if (!savedLang) {
        // If no saved language, save current language
        const langToSave = currentLang || 'en';
        localStorage.setItem('i18nextLng', langToSave);
        console.log('💾 Initialized localStorage with:', langToSave);
      } else {
        console.warn('⚠️ Invalid language in localStorage:', savedLang, '- resetting to en');
        localStorage.setItem('i18nextLng', 'en');
        i18n.changeLanguage('en');
      }
    }
    setIsReady(true);
  }, [i18n]);

  useEffect(() => {
    // Add smooth transition when language changes
    const handleLanguageChange = () => {
      setIsChanging(true);
      // Fade out, wait a bit, then fade in
      setTimeout(() => setIsChanging(false), 200);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Prevent hydration mismatch by not rendering until language is set
  if (!isReady) {
    return <>{children}</>;
  }

  return (
    <div 
      className="transition-all duration-200 ease-in-out"
      style={{ 
        opacity: isChanging ? 0.5 : 1,
        transform: isChanging ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      {children}
    </div>
  );
}
