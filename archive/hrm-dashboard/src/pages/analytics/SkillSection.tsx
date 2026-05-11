import { DEPARTMENTS, SKILL_CATEGORIES, HEATMAP_DATA, TOP_SKILLS, BOTTOM_SKILLS } from "@/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@/i18n";

function scoreToColor(score: number): string {
  if (score >= 3.5) return "#10B981";
  if (score >= 2.8) return "#84CC16";
  if (score >= 2.2) return "#EAB308";
  if (score >= 1.5) return "#F97316";
  return "#EF4444";
}

function scoreToTextColor(score: number): string {
  if (score >= 3.5) return "#064E3B";
  if (score >= 2.8) return "#1A2E05";
  if (score >= 2.2) return "#1C1700";
  if (score >= 1.5) return "#431407";
  return "#3B0A0A";
}

export default function SkillSection() {
  const t = useT();

  return (
    <section>
      <SectionHeader title={t("section_skill_title")} desc={t("section_skill_desc")} />

      <div className="bg-card border border-border rounded-xl p-6 mb-6 overflow-x-auto">
        <h3 className="font-semibold text-sm text-foreground mb-0.5">{t("chart_heatmap")}</h3>
        <p className="text-xs text-muted-foreground mb-4">{t("chart_heatmap_desc")}</p>

        <div className="min-w-[680px]">
          <div className="grid mb-1" style={{ gridTemplateColumns: `160px repeat(${DEPARTMENTS.length}, 1fr)` }}>
            <div />
            {DEPARTMENTS.map(d => (
              <div key={d.id} className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-wide py-1 px-1"
                style={{ fontSize: "10px" }}>
                {d.shortName}
              </div>
            ))}
          </div>

          {SKILL_CATEGORIES.map((cat, ci) => (
            <div key={ci} className="grid items-center" style={{ gridTemplateColumns: `160px repeat(${DEPARTMENTS.length}, 1fr)` }}>
              <div className="text-xs text-muted-foreground pr-3 py-1.5 leading-tight">{cat}</div>
              {DEPARTMENTS.map(dept => {
                const score = HEATMAP_DATA[dept.id]?.[ci] ?? 0;
                const bg = scoreToColor(score);
                return (
                  <div
                    key={dept.id}
                    className="mx-0.5 my-0.5 rounded-md flex items-center justify-center font-bold cursor-default"
                    style={{ background: bg, color: scoreToTextColor(score), height: "36px", fontSize: "12px" }}
                    title={`${dept.name} · ${cat}: ${score.toFixed(1)}/4`}
                  >
                    {score.toFixed(1)}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground">{t("score_legend")}</span>
            {[
              { label: "≥3.5 Expert", color: "#10B981" },
              { label: "2.8–3.5 Proficient", color: "#84CC16" },
              { label: "2.2–2.8 Developing", color: "#EAB308" },
              { label: "1.5–2.2 Basic", color: "#F97316" },
              { label: "<1.5 Critical Gap", color: "#EF4444" },
            ].map((l, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981" }} />
            <h3 className="font-semibold text-sm text-foreground">{t("chart_top_skills")}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{t("chart_top_skills_desc")}</p>
          <div className="space-y-3">
            {TOP_SKILLS.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="text-sm text-foreground font-medium">{s.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({s.dept})</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#10B981" }}>{s.avgScore}/4</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#2E3340" }}>
                  <div className="h-full rounded-full" style={{ width: `${(s.avgScore / 4) * 100}%`, background: "#10B981" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
            <h3 className="font-semibold text-sm text-foreground">{t("chart_bottom_skills")}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{t("chart_bottom_skills_desc")}</p>
          <div className="space-y-3">
            {BOTTOM_SKILLS.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="text-sm text-foreground font-medium">{s.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({s.dept})</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#EF4444" }}>{s.avgScore}/4</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#2E3340" }}>
                  <div className="h-full rounded-full" style={{ width: `${(s.avgScore / 4) * 100}%`, background: "#EF4444" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
