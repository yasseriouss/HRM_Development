import { useLang } from "@shared/contexts/LangContext";

export function useT() {
  const { t } = useLang();
  return t;
}
