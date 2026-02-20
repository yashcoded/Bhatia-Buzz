import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  fr: { translation: fr },
  hi: { translation: hi },
  ar: { translation: ar },
};

// Get device locale
const deviceLocale = Localization.locale || 'en';
const languageCode = deviceLocale.split('-')[0]; // e.g., 'en' from 'en-US'

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: languageCode,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt', 'fr', 'hi', 'ar'],
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

// Initialize RTL for Arabic
if (languageCode === 'ar') {
  try {
    const { I18nManager } = require('react-native');
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      // Note: On Android, app restart may be needed
    }
  } catch (e) {
    console.warn('Could not initialize RTL:', e);
  }
}

export default i18n;
