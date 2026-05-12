import { useTheme } from "next-themes";
import { useLang } from "@/contexts/LangContext";
import { useT } from "@/i18n";
import OverviewSection from "./OverviewSection";
import WorkflowSummaryWidget from "./WorkflowSummaryWidget";
import DeptSection from "./DeptSection";
import SkillSection from "./SkillSection";
import EmployeeSection from "./EmployeeSection";
import TrainingSection from "./TrainingSection";
import CampaignSection from "./CampaignSection";

export default function Analytics() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const t = useT();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full" style={{ background: "#D4960A" }} />
            <div>
              <h1 className="font-bold text-base text-foreground leading-tight tracking-wide uppercase">{t("app_title")}</h1>
              <p className="text-xs text-muted-foreground leading-tight">{t("app_subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              {t("app_stats").split("|").map((s, i, arr) => (
                <span key={i} className="flex items-center gap-2">
                  {s.trim()}
                  {i < arr.length - 1 && <span className="opacity-30">|</span>}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {t("app_created_by")} <span style={{ color: "#D4960A" }}>yasserious.com</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                title={t("toggle_theme")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:bg-muted transition-colors"
              >
                {theme === "dark" ? "☀" : "☾"}
              </button>
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                title={t("toggle_language")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-border bg-card text-foreground hover:bg-muted transition-colors"
                style={{ minWidth: 36 }}
              >
                {lang === "en" ? t("lang_ar") : t("lang_en")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 space-y-10">
        <OverviewSection />
        <WorkflowSummaryWidget />
        <DeptSection />
        <SkillSection />
        <EmployeeSection />
        <TrainingSection />
        <CampaignSection />
      </main>

      <footer className="border-t border-border mt-12 py-6">
        <p className="text-center text-xs text-muted-foreground">
          {t("app_footer")} · {t("app_created_by")} <span style={{ color: "#D4960A" }}>yasserious.com</span>
        </p>
      </footer>
    </div>
  );
}
