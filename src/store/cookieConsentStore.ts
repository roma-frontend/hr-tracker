import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CookiePreferences {
  necessary: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentStore {
  hasConsent: boolean;
  showBanner: boolean;
  showSettings: boolean;
  preferences: CookiePreferences;
  
  // Actions
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  openSettings: () => void;
  closeSettings: () => void;
  resetConsent: () => void;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

export const useCookieConsent = create<CookieConsentStore>()(
  persist(
    (set) => ({
      hasConsent: false,
      showBanner: true,
      showSettings: false,
      preferences: defaultPreferences,

      acceptAll: () => {
        set({
          hasConsent: true,
          showBanner: false,
          preferences: {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
          },
        });
      },

      rejectAll: () => {
        set({
          hasConsent: true,
          showBanner: false,
          preferences: {
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
          },
        });
      },

      savePreferences: (preferences: CookiePreferences) => {
        set({
          hasConsent: true,
          showBanner: false,
          showSettings: false,
          preferences: {
            ...preferences,
            necessary: true, // Always true
          },
        });
      },

      openSettings: () => {
        set({ showSettings: true });
      },

      closeSettings: () => {
        set({ showSettings: false });
      },

      resetConsent: () => {
        set({
          hasConsent: false,
          showBanner: true,
          showSettings: false,
          preferences: defaultPreferences,
        });
      },
    }),
    {
      name: 'cookie-consent-storage',
      partialize: (state) => ({
        hasConsent: state.hasConsent,
        preferences: state.preferences,
      }),
    }
  )
);
