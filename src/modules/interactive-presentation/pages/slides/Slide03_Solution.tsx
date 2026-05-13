import { useT } from "@/i18n";
import { useLang } from "@/shared/contexts/LangContext";

export default function Slide03_Solution() {
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, var(--slide-bg) 0%, #1E2028 100%)" }}
    >
      <div
        className="absolute"
        style={{
          top: "-10vh",
          [isAr ? 'left' : 'right']: "-10vw",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,150,10,0.08) 0%, transparent 70%)"
        }}
      />

      <div className={`absolute top-[10vh] ${isAr ? 'right-[8vw]' : 'left-[8vw]'}`} style={{ textAlign: isAr ? 'right' : 'left' }}>
        <div className="font-body font-semibold mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "var(--slide-primary)", letterSpacing: "0.2em" }}>
          {t("s3_title")}
        </div>
        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: "5.5vw", lineHeight: 1, color: "var(--slide-text)" }}
        >
          {isAr ? t("s3_subtitle") : (
            <>
              {t("s3_subtitle").split(" ").slice(0, 2).join(" ")}
              <br />
              <span style={{ color: "var(--slide-primary)" }}>{t("s3_subtitle").split(" ").slice(2).join(" ")}</span>
            </>
          )}
        </h2>
        <p
          className="font-body mt-[2.5vh]"
          style={{ fontSize: "1.6vw", color: "var(--slide-muted)", maxWidth: "32vw", lineHeight: 1.7 }}
        >
          {t("s3_description")}
        </p>
      </div>

      <div
        className={`absolute top-[8vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'}`}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2vh 2vw", width: "46vw", direction: isAr ? 'rtl' : 'ltr' }}
      >
        <div
          style={{
            background: "rgba(212,150,10,0.08)",
            border: "0.15vw solid rgba(212,150,10,0.25)",
            borderRadius: "0.8vw",
            padding: "3vh 2.5vw",
            textAlign: isAr ? 'right' : 'left'
          }}
        >
          <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-primary)", marginBottom: "1vh" }}>01</div>
          <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.8vh" }}>
            {t("s3_feat1_title")}
          </div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>
            {t("s3_feat1_desc")}
          </div>
        </div>

        <div
          style={{
            background: "rgba(36,40,48,0.8)",
            border: "0.15vw solid var(--slide-muted)",
            borderRadius: "0.8vw",
            padding: "3vh 2.5vw",
            textAlign: isAr ? 'right' : 'left'
          }}
        >
          <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-primary)", marginBottom: "1vh" }}>02</div>
          <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.8vh" }}>
            {t("s3_feat2_title")}
          </div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>
            {t("s3_feat2_desc")}
          </div>
        </div>

        <div
          style={{
            background: "rgba(36,40,48,0.8)",
            border: "0.15vw solid var(--slide-muted)",
            borderRadius: "0.8vw",
            padding: "3vh 2.5vw",
            textAlign: isAr ? 'right' : 'left'
          }}
        >
          <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-primary)", marginBottom: "1vh" }}>03</div>
          <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.8vh" }}>
            {t("s3_feat3_title")}
          </div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>
            {t("s3_feat3_desc")}
          </div>
        </div>

        <div
          style={{
            background: "rgba(36,40,48,0.8)",
            border: "0.15vw solid var(--slide-muted)",
            borderRadius: "0.8vw",
            padding: "3vh 2.5vw",
            textAlign: isAr ? 'right' : 'left'
          }}
        >
          <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-primary)", marginBottom: "1vh" }}>04</div>
          <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "var(--slide-text)", marginBottom: "0.8vh" }}>
            {t("s3_feat4_title")}
          </div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "var(--slide-muted)", lineHeight: 1.5 }}>
            {t("s3_feat4_desc")}
          </div>
        </div>
      </div>

      <div className={`absolute bottom-[5vh] ${isAr ? 'left-[6vw]' : 'right-[6vw]'}`}>
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}

