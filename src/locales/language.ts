import type { AppLocale } from '@/shared/stores/setting.store';
import data from './language.json';

export const languages = data.languages;
export const LanguagesSupported = languages.filter((item) => item.supported).map((item) => item.value) as AppLocale[];
