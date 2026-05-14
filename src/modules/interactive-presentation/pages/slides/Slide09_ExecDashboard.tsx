import { useT } from "@/i18n";
import { useLang } from "@/shared/contexts/LangContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

const COLORS = ["#10B981", "#10B981", "#EAB308", "#10B981", "#EAB308", "#10B981", "#EAB308", "#10B981", "#EAB308"];

export default function Slide09_ExecDashboard() {
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const chartTickFont = isAr ? "Tajawal, sans-serif" : "Source Sans 3, sans-serif";

  const deptData = [
    { name: t("s9_dept_assembly"), score: 84 },
    { name: t("s9_dept_upholstery"), score: 78 },
    { name: t("s9_dept_painting"), score: 71 },
    { name: t("s9_dept_wood"), score: 88 },
    { name: t("s9_dept_finishing"), score: 65 },
    { name: t("s9_dept_packing"), score: 92 },
    { name: t("s9_dept_maint"), score: 76 },
    { name: t("s9_dept_qc"), score: 81 },
    { name: t("s9_dept_cutting"), score: 69 },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes execIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .exec-h { animation: ${isExport ? "none" : "execIn 0.5s ease 0.1s both"}; }
        .exec-kpi { animation: ${isExport ? "none" : "execIn 0.5s ease 0.3s both"}; }
        .exec-chart { animation: ${isExport ? "none" : "execIn 0.5s ease 0.5s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, var(--slide-bg) 0%, #1C1E2A 100%)" }} />
      <div 
        className="absolute top-0 h-full" 
        style={{ 
          [isAr ? 'left' : 'right']: 0,
          width: "0.4vw", 
          background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" 
        }} 
      />

      <div className={`absolute top-[7vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} exec-h`} style={{ textAlign: isAr ? 'right' : 'left' }}>
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s9_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.2vw", lineHeight: 1, color: "var(--slide-text)" }}>
          {isAr ? t("s9_subtitle") : (
            <>
              {t("s9_subtitle").split(" ").slice(0, 1)}<br />{t("s9_subtitle").split(" ").slice(1).join(" ")}
            </>
          )}
        </h2>
      </div>

      <div className={`absolute top-[7vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'} exec-kpi`} style={{ display: "flex", gap: "2vw", direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ background: "rgba(212,150,10,0.08)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2vh 2.5vw", textAlign: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "var(--slide-primary)" }}>78.4%</div>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s9_metric_avg")}</div>
        </div>
        <div style={{ background: "rgba(16,185,129,0.07)", border: "0.15vw solid rgba(16,185,129,0.2)", borderRadius: "0.8vw", padding: "2vh 2.5vw", textAlign: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#10B981" }}>+12%</div>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s9_metric_vs")}</div>
        </div>
      </div>

      <div className={`absolute top-[26vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} left-[8vw] right-[6vw] exec-chart`} style={{ height: "52vh", direction: 'ltr' }}>
        <div className="font-body mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "var(--slide-muted)", textAlign: isAr ? 'right' : 'left' }}>{t("s9_chart_title")}</div>
        <div style={{ height: "44vh" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: "var(--slide-muted)", fontSize: "0.9vw", fontFamily: chartTickFont }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "var(--slide-muted)", fontSize: "1.1vw", fontFamily: chartTickFont }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--slide-accent)", border: "1px solid var(--slide-muted)", borderRadius: "8px", color: "var(--slide-text)" }}
                cursor={{ fill: "rgba(245,240,232,0.04)" }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {deptData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`absolute bottom-[3vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'}`}>
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

