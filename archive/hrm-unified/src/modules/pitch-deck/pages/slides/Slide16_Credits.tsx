import { useT } from "@/i18n";

const base = import.meta.env.BASE_URL;
const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide16_Credits() {
  const t = useT();

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes credIn { from { opacity: 0; transform: translateY(3vh); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lineGrow { from { width: 0; } to { width: 6vw; } }
        .cred-line { animation: ${isExport ? "none" : "lineGrow 0.6s ease 0.2s both"}; }
        .cred-1 { animation: ${isExport ? "none" : "credIn 0.6s ease 0.3s both"}; }
        .cred-2 { animation: ${isExport ? "none" : "credIn 0.6s ease 0.5s both"}; }
        .cred-3 { animation: ${isExport ? "none" : "credIn 0.6s ease 0.7s both"}; }
        .cred-4 { animation: ${isExport ? "none" : "credIn 0.6s ease 0.9s both"}; }
      `}</style>

      <img
        src={`${base}hero-factory.png`}
        crossOrigin="anonymous"
        alt="Factory background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.15 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(26,28,34,0.5) 0%, rgba(26,28,34,0.96) 65%)" }}
      />

      <div
        className="absolute inset-0"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
      >
        <div className="cred-line" style={{ height: "0.4vh", background: "var(--slide-primary)", marginBottom: "4vh", width: "6vw" }} />

        <div className="cred-1">
          <div className="font-body font-semibold" style={{ fontSize: "1.3vw", color: "var(--slide-muted)", letterSpacing: "0.25em", marginBottom: "1.5vh" }}>{t("s16_title")}</div>
          <div className="font-display font-bold" style={{ fontSize: "8vw", color: "var(--slide-primary)", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
            yasserious
            <span style={{ color: "rgba(212,150,10,0.5)" }}>.com</span>
          </div>
        </div>

        <div className="cred-2" style={{ marginTop: "3vh" }}>
          <div className="font-body" style={{ fontSize: "1.8vw", color: "var(--slide-muted)", lineHeight: 1.6, maxWidth: "50vw" }}>
            {t("s16_line1")}<br />
            {t("s16_line2")}
          </div>
        </div>

        <div className="cred-3" style={{ marginTop: "4vh", display: "flex", gap: "5vw" }}>
          <div style={{ textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "var(--slide-primary)" }}>146+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s16_employees")}</div>
          </div>
          <div style={{ width: "0.15vw", background: "var(--slide-muted)" }} />
          <div style={{ textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "var(--slide-primary)" }}>9</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s16_departments")}</div>
          </div>
          <div style={{ width: "0.15vw", background: "var(--slide-muted)" }} />
          <div style={{ textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "var(--slide-primary)" }}>8wk</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s16_delivery")}</div>
          </div>
          <div style={{ width: "0.15vw", background: "var(--slide-muted)" }} />
          <div style={{ textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "var(--slide-primary)" }}>$72K+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s16_value")}</div>
          </div>
        </div>

        <div className="cred-4" style={{ marginTop: "4.5vh", padding: "1.8vh 5vw", background: "rgba(212,150,10,0.1)", border: "0.15vw solid rgba(212,150,10,0.35)", borderRadius: "0.8vw" }}>
          <div className="font-body" style={{ fontSize: "1.5vw", color: "var(--slide-primary)" }}>
            <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--slide-primary)", textDecoration: "underline" }}>yasserious.com</a>
          </div>
        </div>

        <div className="cred-line" style={{ height: "0.4vh", background: "var(--slide-primary)", marginTop: "4vh", width: "6vw" }} />
      </div>
    </div>
  );
}

