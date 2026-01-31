import data from './language.json';

export const languages = data.languages;
// 支持的语言
export const LanguagesSupported = languages.filter((item) => item.supported).map((item) => item.value);
