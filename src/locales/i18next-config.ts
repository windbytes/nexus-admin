import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { usePreferencesStore } from '@/stores/store';
import { LanguagesSupported } from './language';

/**
 * 加载语言资源
 * @param lang 语言
 */
const loadLangResources = (lang: string) => ({
  translation: {
    common: require(`./${lang}/common`).default,
    layout: require(`./${lang}/layout`).default,
    menu: require(`./${lang}/menu`).default,
    login: require(`./${lang}/login`).default,
    app: require(`./${lang}/app`).default,
    workflow: require(`./${lang}/workflow`).default,
    preferences: require(`./${lang}/preferences`).default,
    user: require(`./${lang}/user`).default,
  },
});

type Resource = Record<string, ReturnType<typeof loadLangResources>>;

/**
 * 加载支持的语言资源
 */
export const resources = LanguagesSupported.reduce<Resource>((acc, lang) => {
  acc[lang] = loadLangResources(lang);
  return acc;
}, {});

const { preferences } = usePreferencesStore.getState();
const { app } = preferences;
const { locale } = app;

i18n.use(initReactI18next).init({
  lng: locale,
  fallbackLng: locale,
  resources,
  interpolation: {
    escapeValue: false,
  },
});
export const changeLanguage = i18n.changeLanguage;
export default i18n;
