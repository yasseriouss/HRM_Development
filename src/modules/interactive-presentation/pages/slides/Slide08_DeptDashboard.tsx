import { useT } from "@/i18n";
import { useLang } from "@/shared/contexts/LangContext";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide08_DeptDashboard() {
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes deptIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .dept-h { animation: ${isExport ? "none" : "deptIn 0.5s ease 0.1s both"}; }
        .dept-c { animation: ${isExport ? "none" : "deptIn 0.5s ease 0.3s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--slide-bg) 0%, var(--slide-grad-end) 100%)" }} />
      <div 
        className="absolute top-0 h-full" 
        style={{ 
          [isAr ? 'left' : 'right']: 0,
          width: "0.4vw", 
          background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" 
        }} 
      />

      <div className={`absolute top-[7vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} dept-h`} style={{ textAlign: isAr ? 'right' : 'left' }}>
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s8_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>
          {isAr ? t("s8_subtitle") : (
            <>
              {t("s8_subtitle").split(" ").slice(0, 1)}<br />{t("s8_subtitle").split(" ").slice(1).join(" ")}
            </>
          )}
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "var(--slide-muted)", maxWidth: "30vw", lineHeight: 1.6 }}>
          {t("s8_description")}
        </p>
      </div>

      <div className={`absolute top-[7vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'} dept-c`} style={{ width: "50vw", display: "flex", flexDirection: "column", gap: "2vh", direction: isAr ? 'rtl' : 'ltr' }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5vw" }}>
          <div style={{ background: "rgba(16,185,129,0.08)", border: "0.15vw solid rgba(16,185,129,0.25)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "var(--slide-success)" }}>68%</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s8_metric_a")}</div>
          </div>
          <div style={{ background: "rgba(234,179,8,0.08)", border: "0.15vw solid rgba(234,179,8,0.25)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "var(--slide-warning)" }}>24%</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s8_metric_b")}</div>
          </div>
          <div style={{ background: "rgba(239,68,68,0.08)", border: "0.15vw solid rgba(239,68,68,0.25)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "var(--slide-danger)" }}>8%</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s8_metric_c")}</div>
          </div>
        </div>

        <div style={{ background: "var(--slide-glass-bg-03)", border: "0.15vw solid var(--slide-glass-border-08)", borderRadius: "0.8vw", padding: "2vh 2.5vw" }}>
          <div className="font-body mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "var(--slide-muted)", textAlign: isAr ? 'right' : 'left' }}>{t("s8_heat_map")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.8vh" }}>
            {[
              [t("s8_skill_cnc"), "var(--slide-success)"], [t("s8_skill_weld"), "var(--slide-success)"], [t("s8_skill_assembly"), "var(--slide-warning)"], [t("s8_skill_qc"), "var(--slide-success)"], [t("s8_skill_safety"), "var(--slide-success)"],
              [t("s8_skill_paint"), "var(--slide-danger)"], [t("s8_skill_finish"), "var(--slide-warning)"], [t("s8_skill_pack"), "var(--slide-success)"], [t("s8_skill_lift"), "var(--slide-warning)"], [t("s8_skill_maint"), "var(--slide-success)"],
            ].map(([label, color], i) => (
              <div key={i} style={{ background: color + "20", border: `0.12vw solid ${color}50`, borderRadius: "0.4vw", padding: "0.8vh 0.5vw", textAlign: "center" }}>
                <div className="font-body" style={{ fontSize: "1.1vw", color: color }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--slide-glass-bg-03)", border: "0.15vw solid var(--slide-glass-border-08)", borderRadius: "0.8vw", padding: "1.8vh 2.5vw" }}>
          <div className="font-body mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-muted)", textAlign: isAr ? 'right' : 'left' }}>{t("s8_pending_title")}</div>
          <div style={{ display: "flex", gap: "2vw", alignItems: 'center' }}>
            <div>
              <span className="font-display font-bold" style={{ fontSize: "2vw", color: "var(--slide-primary)" }}>3</span>
              <span className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)", [isAr ? 'marginRight' : 'marginLeft']: "0.5vw" }}>{t("s8_pending_training")}</span>
            </div>
            <div style={{ width: "0.1vw", height: '3vh', background: "var(--slide-muted)", opacity: 0.3 }} />
            <div>
              <span className="font-display font-bold" style={{ fontSize: "2vw", color: "var(--slide-primary)" }}>12</span>
              <span className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)", [isAr ? 'marginRight' : 'marginLeft']: "0.5vw" }}>{t("s8_pending_evals")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-[6vh] ${isAr ? 'left-[8vw]' : 'right-[8vw]'}`}>
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
