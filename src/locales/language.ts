import type { AppLocale } from '@/shared/stores/setting.store';
import data from './language.json';

export const languages = data.languages;
export const LanguagesSupported = languages.flatMap((item) => (item.supported ? [item.value] : [])) as AppLocale[];
