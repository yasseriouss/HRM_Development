export default function Slide03_Solution() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1A1C22 0%, #1E2028 100%)" }}
    >
      <div
        className="absolute"
        style={{
          top: "-10vh",
          right: "-10vw",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,150,10,0.08) 0%, transparent 70%)"
        }}
      />

      <div className="absolute top-[10vh] left-[8vw]">
        <div className="font-body font-semibold mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>
          THE SOLUTION
        </div>
        <h2
          className="font-display font-bold tracking-tight"
          style={{ fontSize: "5.5vw", lineHeight: 1, color: "#F5F0E8" }}
        >
          HRM SKILL
          <br />
          <span style={{ color: "#D4960A" }}>MATRIX</span>
        </h2>
        <p
          className="font-body mt-[2.5vh]"
          style={{ fontSize: "1.6vw", color: "#9AA0AE", maxWidth: "35vw", lineHeight: 1.7 }}
        >
          A full-stack digital platform that brings every skill, evaluation, and training recommendation into one unified workspace.
        </p>
      </div>

      <div
        className="absolute right-[6vw] top-[8vh]"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2vh 2vw", width: "48vw" }}
      >
        <div
          style={{
            background: "rgba(212,150,10,0.08)",
            border: "0.15vw solid rgba(212,150,10,0.25)",
            borderRadius: "0.8vw",
            padding: "3vh 2.5vw"
          }}
        >
          <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#D4960A", marginBottom: "1vh" }}>01</div>
          <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.8vh" }}>
            Employee Profiles
          </div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#5A6070", lineHeight: 1.5 }}>
            Complete skill records for every worker across all departments
          </div>
        </div>

        <div
          style={{
            background: "rgba(36,40,48,0.8)",
            border: "0.15vw solid #2E3340",
            borderRadius: "0.8vw",
            padding: "3vh 2.5vw"
          }}
        >
          <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#D4960A", marginBottom: "1vh" }}>02</div>
          <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.8vh" }}>
            Skill Campaigns
          </div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#5A6070", lineHeight: 1.5 }}>
            Structured monthly, quarterly, and bi-annual evaluation cycles
          </div>
        </div>

        <div
          style={{
            background: "rgba(36,40,48,0.8)",
            border: "0.15vw solid #2E3340",
            borderRadius: "0.8vw",
            padding: "3vh 2.5vw"
          }}
        >
          <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#D4960A", marginBottom: "1vh" }}>03</div>
          <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.8vh" }}>
            HRM Development View
          </div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#5A6070", lineHeight: 1.5 }}>
            Visual grid showing every employee's competency at a glance
          </div>
        </div>

        <div
          style={{
            background: "rgba(36,40,48,0.8)",
            border: "0.15vw solid #2E3340",
            borderRadius: "0.8vw",
            padding: "3vh 2.5vw"
          }}
        >
          <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#D4960A", marginBottom: "1vh" }}>04</div>
          <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.8vh" }}>
            Training Engine
          </div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#5A6070", lineHeight: 1.5 }}>
            Auto-generated recommendations based on skill gap analysis
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
