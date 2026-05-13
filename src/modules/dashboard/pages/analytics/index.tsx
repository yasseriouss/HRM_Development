import { useT } from "@modules/dashboard/i18n";
import OverviewSection from "./OverviewSection";
import WorkflowSummaryWidget from "./WorkflowSummaryWidget";
import DeptSection from "./DeptSection";
import SkillSection from "./SkillSection";
import EmployeeSection from "./EmployeeSection";
import TrainingSection from "./TrainingSection";
import CampaignSection from "./CampaignSection";

export default function Analytics() {
  const t = useT();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Inline summary band — the global Layout already provides the
          top-level header and theme/lang toggles, so this page just renders
          its content with theme-aware tokens. */}
      <div className="max-w-[1600px] mx-auto px-2 md:px-6 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-2xl md:text-3xl tracking-tight text-foreground leading-none">
            {t("common_app_title")}
          </h1>
          <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-[0.25em] mt-2">
            {t("common_app_subtitle")}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
          {t("dash_app_stats")
            .split("|")
            .map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-foreground text-sm font-headline normal-case tracking-tight">
                  {s.trim().split(" ")[0]}
                </span>
                <span className="opacity-60 text-[10px]">
                  {s.trim().split(" ").slice(1).join(" ")}
                </span>
              </div>
            ))}
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-2 md:px-6 py-6 md:py-12 space-y-12 md:space-y-16">
        <OverviewSection />
        <WorkflowSummaryWidget />
        <DeptSection />
        <SkillSection />
        <EmployeeSection />
        <TrainingSection />
        <CampaignSection />
      </main>

      <footer className="max-w-[1600px] mx-auto px-2 md:px-6 py-10 border-t border-border/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground/70 text-sm font-medium">{t("dash_app_footer")}</p>
          <p className="text-muted-foreground/70 text-sm">
            {t("dash_app_created_by")}{" "}
            <span className="text-primary font-bold">yasserious.com</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
