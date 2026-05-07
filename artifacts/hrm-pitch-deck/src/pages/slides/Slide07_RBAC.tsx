const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide07_RBAC() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes rbacIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .rbac-h { animation: ${isExport ? "none" : "rbacIn 0.5s ease 0.1s both"}; }
        .rbac-t { animation: ${isExport ? "none" : "rbacIn 0.5s ease 0.3s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1A1C22 0%, #1D1F2A 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] rbac-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>ACCESS CONTROL</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>
          ROLE-BASED<br />ACCESS SYSTEM
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "#9AA0AE", maxWidth: "30vw", lineHeight: 1.6 }}>
          4 roles with distinct permissions — every user sees exactly what they need.
        </p>
      </div>

      <div className="absolute top-[7vh] right-[6vw] rbac-t" style={{ width: "52vw" }}>
        <div style={{ background: "rgba(245,240,232,0.03)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", background: "rgba(212,150,10,0.12)", borderBottom: "0.15vw solid rgba(212,150,10,0.25)" }}>
            <div className="font-body font-semibold" style={{ fontSize: "1.2vw", color: "#D4960A", padding: "1.5vh 1.5vw" }}>Permission</div>
            <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "#F5F0E8", padding: "1.5vh 1vw", textAlign: "center" }}>Super Admin</div>
            <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "#F5F0E8", padding: "1.5vh 1vw", textAlign: "center" }}>Dept Head</div>
            <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "#F5F0E8", padding: "1.5vh 1vw", textAlign: "center" }}>HR</div>
            <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "#F5F0E8", padding: "1.5vh 1vw", textAlign: "center" }}>Employee</div>
          </div>
          {[
            ["Manage Departments", true, false, false, false],
            ["Manage Employees", true, false, true, false],
            ["Create Campaigns", true, false, true, false],
            ["Submit Evaluations", true, true, false, false],
            ["View All Results", true, true, true, false],
            ["View Own Results", true, true, true, true],
            ["Export Reports", true, false, true, false],
            ["Manage Training", true, true, true, false],
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr", borderBottom: i < 7 ? "0.1vw solid rgba(245,240,232,0.06)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(245,240,232,0.02)" }}>
              <div className="font-body" style={{ fontSize: "1.25vw", color: "#9AA0AE", padding: "1.3vh 1.5vw" }}>{row[0]}</div>
              {[row[1], row[2], row[3], row[4]].map((val, j) => (
                <div key={j} style={{ padding: "1.3vh 1vw", textAlign: "center", fontSize: "1.5vw" }}>
                  {val ? <span style={{ color: "#10B981" }}>&#10003;</span> : <span style={{ color: "#3A3F4A" }}>&#10005;</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
