import { useT } from "@/i18n";
import { useLang } from "@/shared/contexts/LangContext";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide10_Training() {
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes trainIn { from { opacity: 0; transform: translateX(-2vw); } to { opacity: 1; transform: translateX(0); } }
        .train-h { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.1s both"}; }
        .train-a { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.25s both"}; }
        .train-b { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.4s both"}; }
        .train-c { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.55s both"}; }
        .train-flow { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.7s both"}; }
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

      <div className={`absolute top-[7vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} train-h`} style={{ textAlign: isAr ? 'right' : 'left' }}>
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s10_title")}</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>
          {isAr ? t("s10_subtitle") : (
            <>
              {t("s10_subtitle").split(" ").slice(0, 1)}<br />{t("s10_subtitle").split(" ").slice(1).join(" ")}
            </>
          )}
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "var(--slide-muted)", maxWidth: "32vw", lineHeight: 1.6 }}>
          {t("s10_description")}
        </p>
      </div>

      <div className={`absolute top-[7vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'}`} style={{ width: "44vw", display: "flex", flexDirection: "column", gap: "2.5vh", direction: isAr ? 'rtl' : 'ltr' }}>
        <div className="train-a" style={{ background: "rgba(16,185,129,0.08)", border: "0.15vw solid rgba(16,185,129,0.3)", borderRadius: "0.8vw", padding: "2.5vh 3vw", display: "flex", gap: "2.5vw", alignItems: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "5vw", color: "var(--slide-success)", lineHeight: 1, minWidth: "5vw", textAlign: "center" }}>A</div>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.5vh" }}>{t("s10_tier_a_title")}</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>{t("s10_tier_a_desc")}</div>
          </div>
        </div>
        <div className="train-b" style={{ background: "rgba(234,179,8,0.08)", border: "0.15vw solid rgba(234,179,8,0.3)", borderRadius: "0.8vw", padding: "2.5vh 3vw", display: "flex", gap: "2.5vw", alignItems: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "5vw", color: "var(--slide-warning)", lineHeight: 1, minWidth: "5vw", textAlign: "center" }}>B</div>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.5vh" }}>{t("s10_tier_b_title")}</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>{t("s10_tier_b_desc")}</div>
          </div>
        </div>
        <div className="train-c" style={{ background: "rgba(239,68,68,0.08)", border: "0.15vw solid rgba(239,68,68,0.3)", borderRadius: "0.8vw", padding: "2.5vh 3vw", display: "flex", gap: "2.5vw", alignItems: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "5vw", color: "var(--slide-danger)", lineHeight: 1, minWidth: "5vw", textAlign: "center" }}>C</div>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.5vh" }}>{t("s10_tier_c_title")}</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>{t("s10_tier_c_desc")}</div>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-[10vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} train-flow`} style={{ display: "flex", gap: "1.5vw", alignItems: "center", flexDirection: isAr ? 'row-reverse' : 'row' }}>
        <div style={{ background: "var(--slide-glass-bg)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s10_flow1")}</div>
        </div>
        <div style={{ color: "var(--slide-primary)", fontSize: "1.5vw" }}>{isAr ? "←" : "→"}</div>
        <div style={{ background: "var(--slide-glass-bg)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s10_flow2")}</div>
        </div>
        <div style={{ color: "var(--slide-primary)", fontSize: "1.5vw" }}>{isAr ? "←" : "→"}</div>
        <div style={{ background: "var(--slide-glass-bg)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-muted)" }}>{t("s10_flow3")}</div>
        </div>
        <div style={{ color: "var(--slide-primary)", fontSize: "1.5vw" }}>{isAr ? "←" : "→"}</div>
        <div style={{ background: "rgba(212,150,10,0.1)", border: "0.1vw solid rgba(212,150,10,0.3)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "var(--slide-primary)" }}>{t("s10_flow4")}</div>
        </div>
      </div>

      <div className={`absolute bottom-[3vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'}`}>
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

