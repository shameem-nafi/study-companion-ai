import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

// Detect user's preferred language
const getDefaultLanguage = () => {
  const saved = localStorage.getItem('language');
  if (saved) return saved;
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('bn')) return 'bn';
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: translations,
  lng: getDefaultLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
