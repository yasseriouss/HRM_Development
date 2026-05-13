import { useT } from "@/i18n";

export default function Slide02_Challenge() {
  const t = useT();
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          width: "42vw",
          background: "linear-gradient(135deg, var(--slide-accent) 0%, #1E2028 100%)"
        }}
      />
      <div
        className="absolute top-0 left-[42vw]"
        style={{ width: "0.3vw", height: "100%", background: "var(--slide-primary)", opacity: 0.6 }}
      />

      <div className="absolute left-[6vw] top-[12vh]">
        <div className="font-body font-semibold mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>
          {t("s2_title")}
        </div>
        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: "5vw", lineHeight: 1, color: "var(--slide-text)", textWrap: "balance", maxWidth: "34vw" }}
        >
          {t("s2_subtitle")}
        </h2>
        <div className="mt-[3vh]" style={{ width: "5vw", height: "0.3vh", background: "var(--slide-primary)" }} />
        <p
          className="font-body mt-[2.5vh]"
          style={{ fontSize: "1.6vw", color: "var(--slide-muted)", maxWidth: "32vw", lineHeight: 1.7 }}
        >
          {t("s2_description")}
        </p>
      </div>

      <div className="absolute right-[5vw] top-[10vh]" style={{ width: "50vw" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
          <div
            style={{
              background: "var(--slide-accent)",
              borderLeft: "0.4vw solid var(--slide-primary)",
              padding: "2.5vh 2.5vw",
              borderRadius: "0 0.5vw 0.5vw 0"
            }}
          >
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.8vh" }}>
              {t("s2_point1_title")}
            </div>
            <div className="font-body" style={{ fontSize: "1.4vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>
              {t("s2_point1_desc")}
            </div>
          </div>

          <div
            style={{
              background: "var(--slide-accent)",
              borderLeft: "0.4vw solid #8B909A",
              padding: "2.5vh 2.5vw",
              borderRadius: "0 0.5vw 0.5vw 0"
            }}
          >
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.8vh" }}>
              {t("s2_point2_title")}
            </div>
            <div className="font-body" style={{ fontSize: "1.4vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>
              {t("s2_point2_desc")}
            </div>
          </div>

          <div
            style={{
              background: "var(--slide-accent)",
              borderLeft: "0.4vw solid #8B909A",
              padding: "2.5vh 2.5vw",
              borderRadius: "0 0.5vw 0.5vw 0"
            }}
          >
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.8vh" }}>
              {t("s2_point3_title")}
            </div>
            <div className="font-body" style={{ fontSize: "1.4vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>
              {t("s2_point3_desc")}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[4vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
