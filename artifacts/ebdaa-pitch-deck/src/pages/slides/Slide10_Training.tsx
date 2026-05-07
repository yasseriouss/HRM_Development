const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide10_Training() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes trainIn { from { opacity: 0; transform: translateX(-2vw); } to { opacity: 1; transform: translateX(0); } }
        .train-h { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.1s both"}; }
        .train-a { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.25s both"}; }
        .train-b { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.4s both"}; }
        .train-c { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.55s both"}; }
        .train-flow { animation: ${isExport ? "none" : "trainIn 0.5s ease 0.7s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1A1C22 0%, #1E2028 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] train-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>AUTOMATED GUIDANCE</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>
          TRAINING<br />RECOMMENDATIONS
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "#9AA0AE", maxWidth: "32vw", lineHeight: 1.6 }}>
          The system auto-generates training plans the moment results are calculated — no manual intervention required.
        </p>
      </div>

      <div className="absolute top-[7vh] right-[6vw]" style={{ width: "44vw", display: "flex", flexDirection: "column", gap: "2.5vh" }}>
        <div className="train-a" style={{ background: "rgba(16,185,129,0.08)", border: "0.15vw solid rgba(16,185,129,0.3)", borderRadius: "0.8vw", padding: "2.5vh 3vw", display: "flex", gap: "2.5vw", alignItems: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "5vw", color: "#10B981", lineHeight: 1, minWidth: "5vw", textAlign: "center" }}>A</div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.5vh" }}>Leadership Development</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "#9AA0AE" }}>85%+ — Advanced skill programs, mentorship roles, cross-department projects</div>
          </div>
        </div>
        <div className="train-b" style={{ background: "rgba(234,179,8,0.08)", border: "0.15vw solid rgba(234,179,8,0.3)", borderRadius: "0.8vw", padding: "2.5vh 3vw", display: "flex", gap: "2.5vw", alignItems: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "5vw", color: "#EAB308", lineHeight: 1, minWidth: "5vw", textAlign: "center" }}>B</div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.5vh" }}>Mid-Term Training Plan</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "#9AA0AE" }}>60–84% — Targeted skill workshops, structured on-the-job training</div>
          </div>
        </div>
        <div className="train-c" style={{ background: "rgba(239,68,68,0.08)", border: "0.15vw solid rgba(239,68,68,0.3)", borderRadius: "0.8vw", padding: "2.5vh 3vw", display: "flex", gap: "2.5vw", alignItems: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "5vw", color: "#EF4444", lineHeight: 1, minWidth: "5vw", textAlign: "center" }}>C</div>
          <div>
            <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.5vh" }}>Urgent Intervention</div>
            <div className="font-body" style={{ fontSize: "1.3vw", color: "#9AA0AE" }}>Below 60% — Immediate corrective training, supervisor escalation</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[10vh] left-[8vw] train-flow" style={{ display: "flex", gap: "1.5vw", alignItems: "center" }}>
        <div style={{ background: "rgba(245,240,232,0.04)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#9AA0AE" }}>Campaign Closes</div>
        </div>
        <div style={{ color: "#D4960A", fontSize: "1.5vw" }}>&#8594;</div>
        <div style={{ background: "rgba(245,240,232,0.04)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#9AA0AE" }}>Scores Calculated</div>
        </div>
        <div style={{ color: "#D4960A", fontSize: "1.5vw" }}>&#8594;</div>
        <div style={{ background: "rgba(245,240,232,0.04)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#9AA0AE" }}>Plans Generated</div>
        </div>
        <div style={{ color: "#D4960A", fontSize: "1.5vw" }}>&#8594;</div>
        <div style={{ background: "rgba(212,150,10,0.1)", border: "0.1vw solid rgba(212,150,10,0.3)", borderRadius: "0.5vw", padding: "1vh 2vw" }}>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#D4960A" }}>Manager Notified</div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
