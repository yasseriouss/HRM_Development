const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide08_DeptDashboard() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes deptIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .dept-h { animation: ${isExport ? "none" : "deptIn 0.5s ease 0.1s both"}; }
        .dept-c { animation: ${isExport ? "none" : "deptIn 0.5s ease 0.3s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1A1C22 0%, #1C1F2A 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] dept-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>MANAGER VIEW</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>
          DEPARTMENT<br />DASHBOARDS
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "#9AA0AE", maxWidth: "30vw", lineHeight: 1.6 }}>
          Department heads see their team's complete skill landscape — at a glance.
        </p>
      </div>

      <div className="absolute top-[7vh] right-[6vw] dept-c" style={{ width: "50vw", display: "flex", flexDirection: "column", gap: "2vh" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5vw" }}>
          <div style={{ background: "rgba(16,185,129,0.08)", border: "0.15vw solid rgba(16,185,129,0.25)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#10B981" }}>68%</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Class A employees</div>
          </div>
          <div style={{ background: "rgba(234,179,8,0.08)", border: "0.15vw solid rgba(234,179,8,0.25)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#EAB308" }}>24%</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Class B developing</div>
          </div>
          <div style={{ background: "rgba(239,68,68,0.08)", border: "0.15vw solid rgba(239,68,68,0.25)", borderRadius: "0.8vw", padding: "2vh 2vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#EF4444" }}>8%</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Class C urgent</div>
          </div>
        </div>

        <div style={{ background: "rgba(245,240,232,0.03)", border: "0.15vw solid rgba(245,240,232,0.08)", borderRadius: "0.8vw", padding: "2vh 2.5vw" }}>
          <div className="font-body mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "#5A6070" }}>SKILL HEAT MAP — ASSEMBLY DEPT</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.8vh" }}>
            {[
              ["CNC Op.", "#10B981"], ["Welding", "#10B981"], ["Assembly", "#EAB308"], ["QC", "#10B981"], ["Safety", "#10B981"],
              ["Painting", "#EF4444"], ["Finishing", "#EAB308"], ["Packing", "#10B981"], ["Forklift", "#EAB308"], ["Maint.", "#10B981"],
            ].map(([label, color], i) => (
              <div key={i} style={{ background: color + "20", border: `0.12vw solid ${color}50`, borderRadius: "0.4vw", padding: "0.8vh 0.5vw", textAlign: "center" }}>
                <div className="font-body" style={{ fontSize: "1.1vw", color: color }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(245,240,232,0.03)", border: "0.15vw solid rgba(245,240,232,0.08)", borderRadius: "0.8vw", padding: "1.8vh 2.5vw" }}>
          <div className="font-body mb-[1vh]" style={{ fontSize: "1.2vw", color: "#5A6070" }}>PENDING ACTIONS</div>
          <div style={{ display: "flex", gap: "2vw" }}>
            <div>
              <span className="font-display font-bold" style={{ fontSize: "2vw", color: "#D4960A" }}>3</span>
              <span className="font-body" style={{ fontSize: "1.2vw", color: "#9AA0AE", marginLeft: "0.5vw" }}>training plans to approve</span>
            </div>
            <div style={{ width: "0.1vw", background: "#2E3340" }} />
            <div>
              <span className="font-display font-bold" style={{ fontSize: "2vw", color: "#D4960A" }}>12</span>
              <span className="font-body" style={{ fontSize: "1.2vw", color: "#9AA0AE", marginLeft: "0.5vw" }}>evaluations to submit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
