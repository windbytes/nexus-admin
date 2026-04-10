import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { usePreferencesStore } from '@/stores/store'; // 假设存在一个获取偏好设置的函数
import { LanguagesSupported } from './language';

/**
 * 加载语言资源
 * @param lang 语言
 */
const loadLangResources = async (lang: string) => ({
  translation: {
    common: (await import(`./${lang}/common.ts`)).default,
    layout: (await import(`./${lang}/layout.ts`)).default,
    menu: (await import(`./${lang}/menu.ts`)).default,
    login: (await import(`./${lang}/login.ts`)).default,
    app: (await import(`./${lang}/app.ts`)).default,
    workflow: (await import(`./${lang}/workflow.ts`)).default,
    preferences: (await import(`./${lang}/preferences.ts`)).default,
    user: (await import(`./${lang}/user.ts`)).default,
  },
});

type Resource = Record<string, Awaited<ReturnType<typeof loadLangResources>>>;

/**
 * 加载支持的语言资源
 */
export const loadResources = async (): Promise<Resource> => {
  const resources: Partial<Resource> = {};
  for (const lang of LanguagesSupported) {
    resources[lang] = await loadLangResources(lang);
  }
  return resources as Resource;
};

// 初始化 i18n
export const initI18n = async () => {
  const { preferences } = usePreferencesStore.getState(); // 使用普通函数获取偏好设置
  const { app } = preferences;
  const { locale } = app;

  const resources = await loadResources();

  i18n.use(initReactI18next).init({
    lng: locale,
    fallbackLng: locale,
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
};

export const changeLanguage = i18n.changeLanguage;
export default i18n;
