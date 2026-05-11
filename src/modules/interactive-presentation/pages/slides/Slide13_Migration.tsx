import { useT } from "@/i18n";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide13_Migration() {
  const t = useT();

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes migIn { from { opacity: 0; transform: translateX(-2vw); } to { opacity: 1; transform: translateX(0); } }
        .mig-h { animation: ${isExport ? "none" : "migIn 0.5s ease 0.1s both"}; }
        .mig-steps { animation: ${isExport ? "none" : "migIn 0.5s ease 0.3s both"}; }
        .mig-stats { animation: ${isExport ? "none" : "migIn 0.5s ease 0.5s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--slide-bg) 0%, #1E2028 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] mig-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s13_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>
          {t("s13_subtitle").split(" ").slice(0, 2).join(" ")}<br />{t("s13_subtitle").split(" ").slice(2).join(" ")}
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "var(--slide-muted)", maxWidth: "30vw", lineHeight: 1.6 }}>
          {t("s13_desc")}
        </p>
      </div>

      <div className="absolute top-[7vh] right-[6vw] mig-stats" style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "rgba(212,150,10,0.08)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2vh 3vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-primary)" }}>146+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s13_metric_emp")}</div>
          </div>
          <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.08)", borderRadius: "0.8vw", padding: "2vh 3vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-text)" }}>2021–</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s13_metric_hist")}</div>
          </div>
        </div>
      </div>

      <div className="absolute top-[38vh] left-[8vw] right-[6vw] mig-steps">
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          {[
            { num: "01", title: t("s13_step1_title"), desc: t("s13_step1_desc") },
            { num: "02", title: t("s13_step2_title"), desc: t("s13_step2_desc") },
            { num: "03", title: t("s13_step3_title"), desc: t("s13_step3_desc") },
            { num: "04", title: t("s13_step4_title"), desc: t("s13_step4_desc") },
            { num: "05", title: t("s13_step5_title"), desc: t("s13_step5_desc") },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, background: i === 4 ? "rgba(16,185,129,0.08)" : "rgba(245,240,232,0.04)", border: `0.15vw solid ${i === 4 ? "rgba(16,185,129,0.3)" : "rgba(245,240,232,0.08)"}`, borderRadius: "0.8vw", padding: "3vh 2vw" }}>
                <div className="font-display font-bold" style={{ fontSize: "2.5vw", color: i === 4 ? "#10B981" : "#3A3F4A", marginBottom: "0.8vh" }}>{step.num}</div>
                <div className="font-display font-semibold" style={{ fontSize: "1.5vw", color: "var(--slide-text)", marginBottom: "0.8vh" }}>{step.title}</div>
                <div className="font-body" style={{ fontSize: "1.15vw", color: "var(--slide-muted)", lineHeight: 1.4 }}>{step.desc}</div>
              </div>
              {i < 4 && <div style={{ width: "1.5vw", height: "0.2vw", background: "rgba(212,150,10,0.4)", flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

