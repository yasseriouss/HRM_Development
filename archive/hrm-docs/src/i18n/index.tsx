import { useLang } from "@/contexts/LangContext";
import en, { type TranslationKey } from "./en";
import ar from "./ar";

const dictionaries = { en, ar };

export function useT() {
  const { lang } = useLang();
  const dict = dictionaries[lang] || en;

  return (key: TranslationKey, vars?: Record<string, string | number>) => {
    let val = (dict as any)[key] || (en as any)[key] || key;
    
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        val = val.replace(`{{${k}}}`, String(v));
      });
    }
    
    return val;
  };
}
