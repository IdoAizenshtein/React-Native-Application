import i18next from 'i18next';
import en from './en';
import he from './he';
import {initReactI18next} from 'react-i18next';

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  fallbackLng: 'en',
  lng: 'he',
  debug: false,
  resources: {
    en,
    he,
  },
  react: {
    useSuspense: false,
  },
});

export default i18next;
