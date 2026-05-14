import { useT } from "@/i18n";
import { useLang } from "@/shared/contexts/LangContext";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide07_RBAC() {
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes rbacIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .rbac-h { animation: ${isExport ? "none" : "rbacIn 0.5s ease 0.1s both"}; }
        .rbac-t { animation: ${isExport ? "none" : "rbacIn 0.5s ease 0.3s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, var(--slide-bg) 0%, var(--slide-grad-end) 100%)" }} />
      <div 
        className="absolute top-0 h-full" 
        style={{ 
          [isAr ? 'left' : 'right']: 0,
          width: "0.4vw", 
          background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" 
        }} 
      />

      <div
        className={`absolute top-[7vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} rbac-h`}
        style={{ textAlign: isAr ? 'right' : 'left', maxWidth: "min(38vw, calc(100vw - 58vw))", boxSizing: "border-box" }}
      >
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s7_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>
          {isAr ? t("s7_subtitle") : (
            <>
              {t("s7_subtitle").split(" ").slice(0, 1)}<br />{t("s7_subtitle").split(" ").slice(1).join(" ")}
            </>
          )}
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "var(--slide-muted)", maxWidth: "30vw", lineHeight: 1.6 }}>
          {t("s7_description")}
        </p>
      </div>

      <div
        className={`absolute top-[7vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'} rbac-t`}
        style={{ width: "min(52vw, calc(100vw - 44vw))", minWidth: 0, direction: isAr ? 'rtl' : 'ltr' }}
      >
        <div style={{ background: "var(--slide-glass-bg-03)", border: "0.15vw solid var(--slide-glass-border)", borderRadius: "0.8vw", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: isAr ? "1.8fr 1fr 1fr 1fr 1fr" : "1.8fr 1fr 1fr 1fr 1fr", background: "rgba(212,150,10,0.12)", borderBottom: "0.15vw solid rgba(212,150,10,0.25)" }}>
            <div className="font-body font-semibold" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", padding: "1.5vh 1.5vw", textAlign: isAr ? 'right' : 'left' }}>{t("s7_header_perm")}</div>
            <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "var(--slide-text)", padding: "1.5vh 1vw", textAlign: "center" }}>{t("s7_role_admin")}</div>
            <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "var(--slide-text)", padding: "1.5vh 1vw", textAlign: "center" }}>{t("s7_role_head")}</div>
            <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "var(--slide-text)", padding: "1.5vh 1vw", textAlign: "center" }}>{t("s7_role_hr")}</div>
            <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "var(--slide-text)", padding: "1.5vh 1vw", textAlign: "center" }}>{t("s7_role_emp")}</div>
          </div>
          {[
            [t("s7_p1"), true, false, false, false],
            [t("s7_p2"), true, false, true, false],
            [t("s7_p3"), true, false, true, false],
            [t("s7_p4"), true, true, false, false],
            [t("s7_p5"), true, true, true, false],
            [t("s7_p6"), true, true, true, true],
            [t("s7_p7"), true, false, true, false],
            [t("s7_p8"), true, true, true, false],
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", borderBottom: i < 7 ? "0.1vw solid var(--slide-grid-row)" : "none", background: i % 2 === 0 ? "transparent" : "var(--slide-glass-bg-02)" }}>
              <div className="font-body" style={{ fontSize: "1.25vw", color: "var(--slide-muted)", padding: "1.3vh 1.5vw", textAlign: isAr ? 'right' : 'left' }}>{row[0]}</div>
              {[row[1], row[2], row[3], row[4]].map((val, j) => (
                <div key={j} style={{ padding: "1.3vh 1vw", textAlign: "center", fontSize: "1.5vw" }}>
                  {val ? <span style={{ color: "var(--slide-success)" }}>&#10003;</span> : <span style={{ color: "var(--slide-false-color)" }}>&#10005;</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`absolute bottom-[6vh] ${isAr ? 'left-[8vw]' : 'right-[8vw]'}`}>
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

