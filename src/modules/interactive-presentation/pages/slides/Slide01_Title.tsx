import { useT } from "@/i18n";
import { useLang } from "@/shared/contexts/LangContext";
import { getBrandLogoUrl } from "@/shared/lib/brand";

const base = import.meta.env.BASE_URL;

export default function Slide01_Title() {
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--slide-bg)" }}>
      <img
        src={`${base}hero-factory.png`}
        crossOrigin="anonymous"
        alt="Wood manufacturing factory"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.65 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "var(--slide-hero-scrim)",
        }}
      />

      <div
        className={`absolute top-[4vh] ${isAr ? 'left-[4vw]' : 'right-[4vw]'} z-10`}
      >
        <img
          src={getBrandLogoUrl()}
          alt=""
          className="h-[min(10vh,120px)] w-auto max-w-[min(28vw,320px)] object-contain drop-shadow-md"
          width={320}
          height={120}
        />
      </div>

      <div
        className={`absolute top-[50%] ${isAr ? 'right-[8vw]' : 'left-[8vw]'}`}
        style={{ transform: "translateY(-50%)", textAlign: isAr ? 'right' : 'left' }}
      >
        <div
          className="mb-[2vh]"
          style={{
            width: "6vw",
            height: "0.4vh",
            background: "var(--slide-primary)"
          }}
        />
        <h1
          className="font-display font-bold tracking-tight text-accent mb-[1.5vh]"
          style={{ fontSize: "7vw", lineHeight: 1, textWrap: "balance", color: "var(--slide-text)" }}
        >
          {t("s1_title")}
        </h1>
        <h2
          className="font-display font-semibold tracking-wide"
          style={{ fontSize: "3.5vw", lineHeight: 1.1, color: "var(--slide-primary)", textWrap: "balance" }}
        >
          {t("s1_subtitle")}
        </h2>
        <p
          className="font-body mt-[3vh]"
          style={{ fontSize: "1.6vw", color: "var(--slide-muted)", maxWidth: "38vw", lineHeight: 1.6 }}
        >
          {t("s1_description")}
        </p>
        <div className="mt-[4vh]" style={{ display: "flex", gap: "3vw", justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-primary)" }}>146+</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>{t("s1_employees")}</div>
          </div>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-primary)" }}>9</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>{t("s1_departments")}</div>
          </div>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "var(--slide-primary)" }}>100%</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "var(--slide-muted)" }}>{t("s1_digital")}</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[6vh] right-[8vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "var(--slide-muted)" }}>{t("s1_created_by")} <span style={{ color: "var(--slide-primary)" }}>yasserious.com</span></div>
      </div>

      <div
        className={`absolute top-0 h-full ${isAr ? 'left-0' : 'right-0'}`}
        style={{
          width: "0.4vw",
          background: `linear-gradient(180deg, transparent 0%, var(--slide-primary) 40%, var(--slide-primary) 60%, transparent 100%)`
        }}
      />
    </div>
  );
}

