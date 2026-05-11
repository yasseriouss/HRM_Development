import { useT } from "@/i18n";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide14_Metrics() {
  const t = useT();

  const metrics = [
    { value: "100%", desc: t("s14_m1_desc"), bg: "rgba(212,150,10,0.07)", border: "rgba(212,150,10,0.25)", color: "var(--slide-primary)" },
    { value: "+15%", desc: t("s14_m2_desc"), bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)", color: "#10B981" },
    { value: "10h+", desc: t("s14_m3_desc"), bg: "rgba(245,240,232,0.04)", border: "rgba(245,240,232,0.1)", color: "var(--slide-text)" },
    { value: "80%", desc: t("s14_m4_desc"), bg: "rgba(212,150,10,0.07)", border: "rgba(212,150,10,0.25)", color: "var(--slide-primary)" },
    { value: "3", desc: t("s14_m5_desc"), bg: "rgba(245,240,232,0.04)", border: "rgba(245,240,232,0.1)", color: "var(--slide-text)" },
    { value: "9/9", desc: t("s14_m6_desc"), bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)", color: "#10B981" },
    { value: "0", desc: t("s14_m7_desc"), bg: "rgba(245,240,232,0.04)", border: "rgba(245,240,232,0.1)", color: "var(--slide-text)" },
    { value: "65+", desc: t("s14_m8_desc"), bg: "rgba(212,150,10,0.07)", border: "rgba(212,150,10,0.25)", color: "var(--slide-primary)" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes metIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .met-h { animation: ${isExport ? "none" : "metIn 0.5s ease 0.1s both"}; }
        .met-grid { animation: ${isExport ? "none" : "metIn 0.5s ease 0.3s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, var(--slide-bg) 0%, #1D1F2C 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] met-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s14_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>
          {t("s14_subtitle").split("&").map((s, i) => (
            <span key={i}>{s.trim()}{i === 0 && <><br />&amp;<br /></>}</span>
          ))}
        </h2>
      </div>

      <div className="absolute top-[22vh] left-[8vw] right-[6vw] met-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2vw" }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: m.bg, border: `0.15vw solid ${m.border}`, borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
            <div className="font-display font-bold" style={{ fontSize: "4vw", color: m.color, lineHeight: 1 }}>{m.value}</div>
            <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

