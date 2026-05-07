const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide15_NextSteps() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes nextIn { from { opacity: 0; transform: translateX(-2vw); } to { opacity: 1; transform: translateX(0); } }
        .next-h { animation: ${isExport ? "none" : "nextIn 0.5s ease 0.1s both"}; }
        .next-1 { animation: ${isExport ? "none" : "nextIn 0.4s ease 0.2s both"}; }
        .next-2 { animation: ${isExport ? "none" : "nextIn 0.4s ease 0.35s both"}; }
        .next-3 { animation: ${isExport ? "none" : "nextIn 0.4s ease 0.5s both"}; }
        .next-4 { animation: ${isExport ? "none" : "nextIn 0.4s ease 0.65s both"}; }
        .next-5 { animation: ${isExport ? "none" : "nextIn 0.4s ease 0.8s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1A1C22 0%, #1E2028 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] right-[6vw]">
        <div className="next-h">
          <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>GETTING STARTED</div>
          <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>NEXT STEPS</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5vh 5vw", marginTop: "4vh" }}>
          <div className="next-1" style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
            <div style={{ background: "#D4960A", borderRadius: "50%", width: "3vw", height: "3vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="font-display font-bold" style={{ fontSize: "1.5vw", color: "#1A1C22" }}>1</span>
            </div>
            <div>
              <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.5vh" }}>Budget Approval</div>
              <div className="font-body" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Confirm $10–12K development budget with management. Infrastructure runs $1K/year.</div>
            </div>
          </div>
          <div className="next-2" style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
            <div style={{ background: "rgba(212,150,10,0.2)", border: "0.15vw solid #D4960A", borderRadius: "50%", width: "3vw", height: "3vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="font-display font-bold" style={{ fontSize: "1.5vw", color: "#D4960A" }}>2</span>
            </div>
            <div>
              <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.5vh" }}>Assign Dev Team</div>
              <div className="font-body" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>2 developers with React + Node.js experience. 8-week engagement.</div>
            </div>
          </div>
          <div className="next-3" style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
            <div style={{ background: "rgba(212,150,10,0.2)", border: "0.15vw solid #D4960A", borderRadius: "50%", width: "3vw", height: "3vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="font-display font-bold" style={{ fontSize: "1.5vw", color: "#D4960A" }}>3</span>
            </div>
            <div>
              <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.5vh" }}>Infrastructure Setup</div>
              <div className="font-body" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Create GitHub repo, set up PostgreSQL database, configure hosting environment.</div>
            </div>
          </div>
          <div className="next-4" style={{ display: "flex", gap: "2vw", alignItems: "flex-start" }}>
            <div style={{ background: "rgba(212,150,10,0.2)", border: "0.15vw solid #D4960A", borderRadius: "50%", width: "3vw", height: "3vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="font-display font-bold" style={{ fontSize: "1.5vw", color: "#D4960A" }}>4</span>
            </div>
            <div>
              <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#F5F0E8", marginBottom: "0.5vh" }}>Prepare Employee Data</div>
              <div className="font-body" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>HR exports current Excel records. Validate and clean data for migration.</div>
            </div>
          </div>
          <div className="next-5" style={{ display: "flex", gap: "2vw", alignItems: "flex-start", gridColumn: "1 / -1" }}>
            <div style={{ background: "#10B981", borderRadius: "50%", width: "3vw", height: "3vw", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="font-display font-bold" style={{ fontSize: "1.5vw", color: "#1A1C22" }}>5</span>
            </div>
            <div>
              <div className="font-display font-semibold" style={{ fontSize: "1.8vw", color: "#10B981", marginBottom: "0.5vh" }}>Kickoff — Week 1</div>
              <div className="font-body" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Development starts. 8 weeks to a live, production-ready system serving all 146 employees.</div>
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
