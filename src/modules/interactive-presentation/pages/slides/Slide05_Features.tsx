import { useT } from "@/i18n";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide05_Features() {
  const t = useT();
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes featFadeUp { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .feat-h { animation: ${isExport ? "none" : "featFadeUp 0.5s ease 0.1s both"}; }
        .feat-1 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.2s both"}; }
        .feat-2 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.3s both"}; }
        .feat-3 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.4s both"}; }
        .feat-4 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.5s both"}; }
        .feat-5 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.6s both"}; }
        .feat-6 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.7s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, var(--slide-bg) 60%, #1C1E28 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] feat-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s5_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>{t("s5_subtitle")}</h2>
      </div>

      <div className="absolute top-[20vh] left-[8vw] right-[8vw]" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2.5vh 3vw" }}>
        <div className="feat-1" style={{ background: "rgba(212,150,10,0.07)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "var(--slide-primary)" }}>{t("s5_f1_title")}</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>{t("s5_f1_desc")}</div>
        </div>
        <div className="feat-2" style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "var(--slide-text)" }}>{t("s5_f2_title")}</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>{t("s5_f2_desc")}</div>
        </div>
        <div className="feat-3" style={{ background: "rgba(16,185,129,0.06)", border: "0.15vw solid rgba(16,185,129,0.2)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#10B981" }}>{t("s5_f3_title")}</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>{t("s5_f3_desc")}</div>
        </div>
        <div className="feat-4" style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "var(--slide-text)" }}>{t("s5_f4_title")}</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>{t("s5_f4_desc")}</div>
        </div>
        <div className="feat-5" style={{ background: "rgba(212,150,10,0.07)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "var(--slide-primary)" }}>{t("s5_f5_title")}</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>{t("s5_f5_desc")}</div>
        </div>
        <div className="feat-6" style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "var(--slide-text)" }}>{t("s5_f6_title")}</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>{t("s5_f6_desc")}</div>
        </div>
      </div>

      <div className="absolute bottom-[6vh] right-[8vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

