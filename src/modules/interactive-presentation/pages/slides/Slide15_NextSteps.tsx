import { useT } from "@/i18n";
import { useLang } from "@/shared/contexts/LangContext";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide15_NextSteps() {
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const steps = [
    { num: "1", title: t("s15_step1_title"), desc: t("s15_step1_desc"), active: true },
    { num: "2", title: t("s15_step2_title"), desc: t("s15_step2_desc"), active: false },
    { num: "3", title: t("s15_step3_title"), desc: t("s15_step3_desc"), active: false },
    { num: "4", title: t("s15_step4_title"), desc: t("s15_step4_desc"), active: false },
    { num: "5", title: t("s15_step5_title"), desc: t("s15_step5_desc"), active: true, green: true },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <style>{`
        @keyframes nextIn { from { opacity: 0; transform: translateX(-2vw); } to { opacity: 1; transform: translateX(0); } }
        .next-h { animation: ${isExport ? "none" : "nextIn 0.5s ease 0.1s both"}; }
        .next-step { animation: ${isExport ? "none" : "nextIn 0.4s ease var(--delay) both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--slide-bg) 0%, #1E2028 100%)" }} />
      <div 
        className="absolute top-0 h-full" 
        style={{ 
          [isAr ? 'left' : 'right']: 0,
          width: "0.4vw", 
          background: "linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)" 
        }} 
      />

      <div className={`absolute top-[7vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'} ${isAr ? 'left-[6vw]' : 'right-[6vw]'}`}>
        <div className="next-h" style={{ textAlign: isAr ? 'right' : 'left' }}>
          <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>{t("s15_title")}</div>
          <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "var(--slide-text)" }}>{t("s15_subtitle")}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5vh 5vw", marginTop: "4vh", direction: isAr ? 'rtl' : 'ltr' }}>
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="next-step" 
              style={{ 
                display: "flex", 
                gap: "2vw", 
                alignItems: "flex-start",
                gridColumn: i === 4 ? "1 / -1" : "auto",
                "--delay": `${0.2 + i * 0.15}s`,
                textAlign: isAr ? 'right' : 'left'
              } as any}
            >
              <div style={{ 
                background: step.green ? "#10B981" : (step.active ? "var(--slide-primary)" : "rgba(212,150,10,0.2)"), 
                border: step.active || step.green ? "none" : "0.15vw solid var(--slide-primary)",
                borderRadius: "50%", 
                width: "3vw", 
                height: "3vw", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexShrink: 0 
              }}>
                <span className="font-display font-bold" style={{ fontSize: "1.5vw", color: step.active || step.green ? "var(--slide-bg)" : "var(--slide-primary)" }}>{step.num}</span>
              </div>
              <div>
                <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: step.green ? "#10B981" : "var(--slide-text)", marginBottom: "0.5vh" }}>{step.title}</div>
                <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`absolute bottom-[3vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'}`}>
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

