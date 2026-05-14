import { useT } from "@/i18n";
import { useLang } from "@/shared/contexts/LangContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide12_ROI() {
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const chartTickFont = isAr ? "Tajawal, sans-serif" : "Source Sans 3, sans-serif";

  const roiData = [
    { name: t("s12_label_cost"), value: -11, label: "EGP 11K" },
    { name: t("s12_label_y1"), value: 24, label: "EGP 24K" },
    { name: t("s12_label_y2"), value: 26, label: "EGP 26K" },
    { name: t("s12_label_y3"), value: 26, label: "EGP 26K" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes roiIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .roi-h { animation: ${isExport ? "none" : "roiIn 0.5s ease 0.1s both"}; }
        .roi-kpis { animation: ${isExport ? "none" : "roiIn 0.5s ease 0.3s both"}; }
        .roi-chart { animation: ${isExport ? "none" : "roiIn 0.5s ease 0.5s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--slide-bg) 0%, #1E2030 100%)" }} />
      <div 
        className="absolute top-0 h-full" 
        style={{ 
          [isAr ? 'left' : 'right']: 0,
          width: "0.4vw", 
          background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" 
        }} 
      />

      <div className={`absolute top-[7vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} roi-h`} style={{ textAlign: isAr ? 'right' : 'left' }}>
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s12_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>
          {isAr ? t("s12_subtitle") : (
            t("s12_subtitle").split("&").map((s, i) => (
              <span key={i}>{s.trim()}{i === 0 && <><br />&amp;<br /></>}</span>
            ))
          )}
        </h2>
      </div>

      <div className={`absolute top-[7vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'} roi-kpis`} style={{ display: "flex", flexDirection: "column", gap: "2vh", direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "rgba(212,150,10,0.08)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2vh 3vw", textAlign: "center" }}>
            <div className="font-display font-bold tabular-num" style={{ fontSize: "3.5vw", color: "var(--slide-primary)" }}>EGP&nbsp;11K</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s12_metric_inv")}</div>
          </div>
          <div style={{ background: "rgba(16,185,129,0.08)", border: "0.15vw solid rgba(16,185,129,0.25)", borderRadius: "0.8vw", padding: "2vh 3vw", textAlign: "center" }}>
            <div className="font-display font-bold tabular-num" style={{ fontSize: "3.5vw", color: "#10B981" }}>EGP&nbsp;72K+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s12_metric_ret")}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "1.8vh 2.5vw", textAlign: "center", flex: 1 }}>
            <div className="font-display font-bold" style={{ fontSize: "2.8vw", color: "var(--slide-text)" }}>5–6</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s12_metric_pay")}</div>
          </div>
          <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "1.8vh 2.5vw", textAlign: "center", flex: 1 }}>
            <div className="font-display font-bold" style={{ fontSize: "2.8vw", color: "var(--slide-text)" }}>10+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s12_metric_sav")}</div>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-[10vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} ${isAr ? 'left-[6vw]' : 'right-[6vw]'} roi-chart`} style={{ height: "40vh", direction: 'ltr' }}>
        <div className="font-body mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "var(--slide-muted)", textAlign: isAr ? 'right' : 'left' }}>{t("s12_chart_title")}</div>
        <div style={{ height: "32vh" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={60}>
              <XAxis dataKey="name" tick={{ fill: "var(--slide-muted)", fontSize: "1.2vw", fontFamily: chartTickFont }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--slide-muted)", fontSize: "1.1vw", fontFamily: chartTickFont }} axisLine={false} tickLine={false} />
              <ReferenceLine y={0} stroke="var(--slide-muted)" strokeWidth={1} />
              <Tooltip contentStyle={{ background: "var(--slide-accent)", border: "1px solid var(--slide-muted)", borderRadius: "8px", color: "var(--slide-text)" }} cursor={{ fill: "rgba(245,240,232,0.04)" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {roiData.map((entry, index) => (
                  <Cell key={index} fill={entry.value < 0 ? "#EF4444" : "#10B981"} fillOpacity={0.85} />
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

