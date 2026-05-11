import { useT } from "@/i18n";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide04_Architecture() {
  const t = useT();
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .arch-anim-1 { animation: ${isExport ? "none" : "fadeUp 0.5s ease 0.1s both"}; }
        .arch-anim-2 { animation: ${isExport ? "none" : "fadeUp 0.5s ease 0.25s both"}; }
        .arch-anim-3 { animation: ${isExport ? "none" : "fadeUp 0.5s ease 0.4s both"}; }
        .arch-anim-4 { animation: ${isExport ? "none" : "fadeUp 0.5s ease 0.55s both"}; }
        .arch-anim-5 { animation: ${isExport ? "none" : "fadeUp 0.5s ease 0.7s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--slide-bg) 0%, #1E2230 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" }} />

      <div className="absolute top-[8vh] left-[8vw] arch-anim-1">
        <div className="font-body font-semibold mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s4_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>
          BUILT FOR<br />PRODUCTION SCALE
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "var(--slide-muted)", maxWidth: "32vw", lineHeight: 1.6 }}>
          {t("s4_frontend_desc")}
        </p>
      </div>

      <div className="absolute right-[6vw] top-[8vh]" style={{ width: "50vw", display: "flex", flexDirection: "column", gap: "1.8vh" }}>
        <div className="arch-anim-2" style={{ background: "rgba(212,150,10,0.08)", border: "0.15vw solid rgba(212,150,10,0.35)", borderRadius: "0.8vw", padding: "2.2vh 3vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "2vw", color: "var(--slide-primary)", marginBottom: "0.4vh" }}>{t("s4_frontend")}</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>React 18 + TypeScript + Vite + TailwindCSS</div>
          </div>
          <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "rgba(212,150,10,0.2)" }}>UI</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1vw" }}>
          <div style={{ flex: 1, height: "0.15vw", background: "rgba(212,150,10,0.3)" }} />
          <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>REST API + JSON</div>
          <div style={{ flex: 1, height: "0.15vw", background: "rgba(212,150,10,0.3)" }} />
        </div>

        <div className="arch-anim-3" style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.12)", borderRadius: "0.8vw", padding: "2.2vh 3vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "2vw", color: "var(--slide-text)", marginBottom: "0.4vh" }}>{t("s4_backend")}</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>Express.js + Node.js + RBAC Middleware + JWT Auth</div>
          </div>
          <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "rgba(245,240,232,0.1)" }}>API</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1vw" }}>
          <div style={{ flex: 1, height: "0.15vw", background: "rgba(90,96,112,0.4)" }} />
          <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>Drizzle ORM</div>
          <div style={{ flex: 1, height: "0.15vw", background: "rgba(90,96,112,0.4)" }} />
        </div>

        <div className="arch-anim-4" style={{ background: "rgba(16,185,129,0.06)", border: "0.15vw solid rgba(16,185,129,0.25)", borderRadius: "0.8vw", padding: "2.2vh 3vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "2vw", color: "#10B981", marginBottom: "0.4vh" }}>{t("s4_security")}</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>PostgreSQL — 9 tables, relational schema, audit logging</div>
          </div>
          <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "rgba(16,185,129,0.15)" }}>DB</div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]" style={{ textAlign: "right" }}>
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

