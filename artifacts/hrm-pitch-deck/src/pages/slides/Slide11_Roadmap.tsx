import { useT } from "@/i18n";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide11_Roadmap() {
  const t = useT();
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes roadIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .road-h { animation: ${isExport ? "none" : "roadIn 0.5s ease 0.1s both"}; }
        .road-phases { animation: ${isExport ? "none" : "roadIn 0.5s ease 0.35s both"}; }
        .road-weeks { animation: ${isExport ? "none" : "roadIn 0.5s ease 0.55s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, var(--slide-bg) 0%, #1C1F28 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] road-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s11_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>
          {t("s11_subtitle").split(" ").slice(0, 1)}<br />{t("s11_subtitle").split(" ").slice(1).join(" ")}
        </h2>
      </div>

      <div className="absolute top-[22vh] left-[8vw] right-[6vw] road-phases">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1.2vw" }}>
          {[
            { phase: "01", title: t("s11_p1_title"), weeks: `${t("s11_wk")} 1`, desc: t("s11_p1_desc") },
            { phase: "02", title: t("s11_p2_title"), weeks: `${t("s11_wk")} 2`, desc: t("s11_p2_desc") },
            { phase: "03", title: t("s11_p3_title"), weeks: `${t("s11_wk")} 3`, desc: t("s11_p3_desc") },
            { phase: "04", title: t("s11_p4_title"), weeks: `${t("s11_wk")} 4–5`, desc: t("s11_p4_desc") },
            { phase: "05", title: t("s11_p5_title"), weeks: `${t("s11_wk")} 5–6`, desc: t("s11_p5_desc") },
            { phase: "06", title: t("s11_p6_title"), weeks: `${t("s11_wk")} 6–7`, desc: t("s11_p6_desc") },
            { phase: "07", title: t("s11_p7_title"), weeks: `${t("s11_wk")} 7–8`, desc: t("s11_p7_desc") },
          ].map((item, i) => (
            <div key={i} style={{ background: i === 6 ? "rgba(212,150,10,0.1)" : "rgba(245,240,232,0.04)", border: `0.15vw solid ${i === 6 ? "rgba(212,150,10,0.4)" : "rgba(245,240,232,0.08)"}`, borderRadius: "0.8vw", padding: "2.5vh 1.5vw" }}>
              <div className="font-display font-bold" style={{ fontSize: "2.5vw", color: i === 6 ? "var(--slide-primary)" : "#3A3F4A", marginBottom: "0.5vh" }}>{item.phase}</div>
              <div className="font-display font-semibold" style={{ fontSize: "1.5vw", color: "var(--slide-text)", marginBottom: "0.5vh" }}>{item.title}</div>
              <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-primary)", marginBottom: "0.8vh" }}>{item.weeks}</div>
              <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)", lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[10vh] left-[8vw] right-[6vw] road-weeks">
        <div style={{ height: "0.15vw", background: "rgba(212,150,10,0.3)", position: "relative" }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((w) => (
            <div key={w} style={{ position: "absolute", left: `${(w / 7) * 100}%`, transform: "translateX(-50%)", textAlign: "center" }}>
              <div style={{ width: "0.4vw", height: "1.5vh", background: "var(--slide-primary)", margin: "0 auto -0.4vh" }} />
              <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)", marginTop: "0.5vh" }}>{t("s11_wk")} {w + 1}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: "100%", transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ width: "0.4vw", height: "1.5vh", background: "#10B981", margin: "0 auto -0.4vh" }} />
            <div className="font-body" style={{ fontSize: "1.1vw", color: "#10B981", marginTop: "0.5vh" }}>{t("s11_live")}</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

