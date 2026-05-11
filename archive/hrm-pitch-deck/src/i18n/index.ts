import { useContext } from "react";
import { LangContext, type Lang } from "@/contexts/LangContext";
import en from "./en";
import ar from "./ar";
import type { TranslationKey } from "./en";

const translations = { en, ar } as const;

export { type Lang, type TranslationKey };

export function useT() {
  const { lang } = useContext(LangContext);
  return function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const dict = (translations[lang] || translations.en) as Record<string, string>;
    let text = dict[key] ?? (translations.en as Record<string, string>)[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };
}
