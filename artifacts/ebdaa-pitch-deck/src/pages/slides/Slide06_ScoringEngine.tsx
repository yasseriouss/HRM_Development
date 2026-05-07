const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide06_ScoringEngine() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes scoreIn { from { opacity: 0; transform: translateX(-2vw); } to { opacity: 1; transform: translateX(0); } }
        .score-h { animation: ${isExport ? "none" : "scoreIn 0.5s ease 0.1s both"}; }
        .score-formula { animation: ${isExport ? "none" : "scoreIn 0.6s ease 0.3s both"}; }
        .score-ex { animation: ${isExport ? "none" : "scoreIn 0.5s ease 0.5s both"}; }
        .score-result { animation: ${isExport ? "none" : "scoreIn 0.5s ease 0.7s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1A1C22 0%, #1E2028 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[8vh] left-[8vw] score-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>THE MATH BEHIND IT</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>
          WEIGHTED SCORING<br />ENGINE
        </h2>
      </div>

      <div className="absolute top-[8vh] right-[8vw] score-result" style={{ textAlign: "center" }}>
        <div className="font-display font-bold" style={{ fontSize: "7vw", color: "#D4960A", lineHeight: 1 }}>87.5</div>
        <div className="font-body" style={{ fontSize: "1.4vw", color: "#9AA0AE" }}>Sample Score</div>
        <div className="font-display font-bold mt-[1vh]" style={{ fontSize: "2.5vw", color: "#10B981" }}>CLASS A</div>
      </div>

      <div className="absolute top-[27vh] left-[8vw] score-formula" style={{ background: "rgba(212,150,10,0.08)", border: "0.15vw solid rgba(212,150,10,0.3)", borderRadius: "1vw", padding: "3vh 4vw", maxWidth: "55vw" }}>
        <div className="font-body mb-[1.5vh]" style={{ fontSize: "1.3vw", color: "#5A6070", letterSpacing: "0.1em" }}>FORMULA</div>
        <div className="font-display font-bold" style={{ fontSize: "2.2vw", color: "#F5F0E8", lineHeight: 1.4 }}>
          Score = <span style={{ color: "#D4960A" }}>&#x3A3;</span>(skill_score
          <span style={{ color: "#D4960A" }}> &times; </span>weight) <span style={{ color: "#D4960A" }}>/</span> <span style={{ color: "#D4960A" }}>&#x3A3;</span>(weight)
          <span style={{ color: "#D4960A" }}> &times; </span>100
        </div>
        <div className="font-body mt-[1.5vh]" style={{ fontSize: "1.35vw", color: "#9AA0AE" }}>
          Each skill carries a weight (1–5) reflecting its importance to the role. Higher-weight skills influence the final score more.
        </div>
      </div>

      <div className="absolute bottom-[12vh] left-[8vw] score-ex" style={{ display: "flex", gap: "2.5vw", alignItems: "flex-end" }}>
        <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2vh 2.5vw", minWidth: "18vw" }}>
          <div className="font-body mb-[1vh]" style={{ fontSize: "1.1vw", color: "#5A6070" }}>CNC Operation</div>
          <div className="font-display font-bold" style={{ fontSize: "2vw", color: "#D4960A" }}>3 / 4</div>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Weight: 5 (critical)</div>
        </div>
        <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2vh 2.5vw", minWidth: "18vw" }}>
          <div className="font-body mb-[1vh]" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Safety Protocols</div>
          <div className="font-display font-bold" style={{ fontSize: "2vw", color: "#D4960A" }}>4 / 4</div>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Weight: 4 (high)</div>
        </div>
        <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2vh 2.5vw", minWidth: "18vw" }}>
          <div className="font-body mb-[1vh]" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Quality Control</div>
          <div className="font-display font-bold" style={{ fontSize: "2vw", color: "#D4960A" }}>3 / 4</div>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Weight: 3 (standard)</div>
        </div>
        <div style={{ fontSize: "2.5vw", color: "#5A6070", marginBottom: "2vh" }}>&#8594;</div>
        <div style={{ background: "rgba(16,185,129,0.08)", border: "0.15vw solid rgba(16,185,129,0.3)", borderRadius: "0.8vw", padding: "2vh 2.5vw", minWidth: "14vw", textAlign: "center" }}>
          <div className="font-body mb-[0.5vh]" style={{ fontSize: "1.1vw", color: "#10B981" }}>Final Score</div>
          <div className="font-display font-bold" style={{ fontSize: "2.8vw", color: "#10B981" }}>87.5%</div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
