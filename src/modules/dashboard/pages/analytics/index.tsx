import { useTheme } from "next-themes";
import { useLang } from "@shared/contexts/LangContext";
import { useT } from "@modules/dashboard/i18n";
import OverviewSection from "./OverviewSection";
import WorkflowSummaryWidget from "./WorkflowSummaryWidget";
import DeptSection from "./DeptSection";
import SkillSection from "./SkillSection";
import EmployeeSection from "./EmployeeSection";
import TrainingSection from "./TrainingSection";
import CampaignSection from "./CampaignSection";
import { Sun, Moon, Languages } from "lucide-react";

export default function Analytics() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const t = useT();

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-zinc-900 selection:bg-zinc-200">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-zinc-200">
              H
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-zinc-900 font-comfortaa leading-none">
                {t('common_app_title')}
              </h1>
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest mt-1">
                {t('common_app_subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-zinc-400 uppercase tracking-widest border-r border-zinc-100 pr-6 mr-2">
              {t('dash_app_stats').split("|").map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-zinc-800 text-sm font-comfortaa normal-case tracking-tight">{s.trim().split(" ")[0]}</span>
                  <span className="opacity-60 text-[10px]">{s.trim().split(" ").slice(1).join(" ")}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10 rounded-2xl flex items-center justify-center border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 transition-all active:scale-95"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="h-10 px-4 rounded-2xl flex items-center gap-2 border border-zinc-200 bg-white text-zinc-900 text-xs font-bold hover:bg-zinc-50 transition-all active:scale-95 uppercase tracking-widest"
              >
                <Languages className="w-4 h-4 opacity-40" />
                {lang === "en" ? t('common_lang_ar') : t('common_lang_en')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-12 space-y-16">
        <OverviewSection />
        <WorkflowSummaryWidget />
        <DeptSection />
        <SkillSection />
        <EmployeeSection />
        <TrainingSection />
        <CampaignSection />
      </main>

      <footer className="max-w-[1600px] mx-auto px-6 py-12 border-t border-zinc-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-400 text-sm font-medium">
            {t('dash_app_footer')}
          </p>
          <p className="text-zinc-500 text-sm">
            {t('dash_app_created_by')} <span className="text-zinc-900 font-bold">yasserious.com</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
