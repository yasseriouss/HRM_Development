const base = import.meta.env.BASE_URL;

export default function Slide01_Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <img
        src={`${base}hero-factory.png`}
        crossOrigin="anonymous"
        alt="Wood manufacturing factory"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.35 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(26,28,34,0.95) 0%, rgba(26,28,34,0.6) 50%, rgba(26,28,34,0.85) 100%)"
        }}
      />

      <div className="absolute left-[8vw] top-[50%]" style={{ transform: "translateY(-50%)" }}>
        <div
          className="mb-[2vh]"
          style={{
            width: "6vw",
            height: "0.4vh",
            background: "#D4960A"
          }}
        />
        <h1
          className="font-display font-bold tracking-tight text-accent mb-[1.5vh]"
          style={{ fontSize: "7vw", lineHeight: 1, textWrap: "balance", color: "#F5F0E8" }}
        >
          EBDAA
        </h1>
        <h2
          className="font-display font-semibold tracking-wide"
          style={{ fontSize: "3.5vw", lineHeight: 1.1, color: "#D4960A", textWrap: "balance" }}
        >
          SKILL MATRIX SYSTEM
        </h2>
        <p
          className="font-body mt-[3vh]"
          style={{ fontSize: "1.6vw", color: "#9AA0AE", maxWidth: "38vw", lineHeight: 1.6 }}
        >
          A complete workforce competency platform for wood manufacturing — tracking skills, driving training, and elevating performance across 146 employees in 9 departments.
        </p>
        <div className="mt-[4vh]" style={{ display: "flex", gap: "3vw" }}>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#D4960A" }}>146+</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "#5A6070" }}>Employees</div>
          </div>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#D4960A" }}>9</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "#5A6070" }}>Departments</div>
          </div>
          <div>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#D4960A" }}>100%</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "#5A6070" }}>Digital</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[4vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>

      <div
        className="absolute right-0 top-0 h-full"
        style={{
          width: "0.4vw",
          background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)"
        }}
      />
    </div>
  );
}
