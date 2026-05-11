import en from './en';
import ar from './ar';

export type TranslationKey = keyof typeof en;
export type Locale = 'en' | 'ar';

export const translations = { en, ar };

export function t(key: string, lang: Locale = 'en', params?: Record<string, string | number>): string {
  const dict = translations[lang] as Record<string, string>;
  let text = dict[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  
  return text;
}
