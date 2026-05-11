import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { t, type Locale, type TranslationKey } from "../i18n";

interface LangContextType {
  lang: Locale;
  setLang: (l: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>(() => {
    const saved = localStorage.getItem('lang') as Locale;
    return saved === 'en' || saved === 'ar' ? saved : 'en';
  });

  const setLang = (l: Locale) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const translate = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    return t(key, lang, params);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within LangProvider");
  return context;
}
