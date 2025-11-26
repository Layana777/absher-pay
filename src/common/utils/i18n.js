import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

// Translation resources
const resources = {
  en: {
    translation: {
      // Add English translations here
      welcome: 'Welcome',
      login: 'Login',
      register: 'Register',
      // Add more translations...
    },
  },
  ar: {
    translation: {
      // Add Arabic translations here
      welcome: 'مرحباً',
      login: 'تسجيل الدخول',
      register: 'التسجيل',
      // Add more translations...
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Default language (Arabic for RTL)
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Set RTL based on language
export const setRTL = (isRTL) => {
  I18nManager.forceRTL(isRTL);
  I18nManager.allowRTL(isRTL);
};

// Check if current language is RTL
export const isRTL = () => {
  return i18n.language === 'ar';
};

export default i18n;
