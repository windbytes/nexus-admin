import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LanguagesSupported } from '@/locales/language';
import { usePreferencesStore } from '@/shared/stores/preferences.store';

const loadLangResources = async (lang: string) => ({
  translation: {
    common: (await import(`../../locales/${lang}/common.ts`)).default,
    layout: (await import(`../../locales/${lang}/layout.ts`)).default,
    menu: (await import(`../../locales/${lang}/menu.ts`)).default,
    login: (await import(`../../locales/${lang}/login.ts`)).default,
    app: (await import(`../../locales/${lang}/app.ts`)).default,
    workflow: (await import(`../../locales/${lang}/workflow.ts`)).default,
    preferences: (await import(`../../locales/${lang}/preferences.ts`)).default,
    user: (await import(`../../locales/${lang}/user.ts`)).default,
  },
});

type Resource = Record<string, Awaited<ReturnType<typeof loadLangResources>>>;

export const loadResources = async (): Promise<Resource> => {
  const entries = await Promise.all(
    LanguagesSupported.map(async (lang) => [lang, await loadLangResources(lang)] as const)
  );
  return Object.fromEntries(entries) as Resource;
};

export async function initI18n() {
  const locale = usePreferencesStore.getState().preferences.app.locale;
  const resources = await loadResources();

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: locale,
      fallbackLng: locale,
      resources,
      interpolation: {
        escapeValue: false,
      },
    });
  }

  return i18n;
}

export const changeLanguage = i18n.changeLanguage.bind(i18n);
export default i18n;
