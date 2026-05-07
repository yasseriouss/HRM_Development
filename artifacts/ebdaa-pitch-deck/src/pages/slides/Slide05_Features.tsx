const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide05_Features() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes featFadeUp { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .feat-h { animation: ${isExport ? "none" : "featFadeUp 0.5s ease 0.1s both"}; }
        .feat-1 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.2s both"}; }
        .feat-2 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.3s both"}; }
        .feat-3 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.4s both"}; }
        .feat-4 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.5s both"}; }
        .feat-5 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.6s both"}; }
        .feat-6 { animation: ${isExport ? "none" : "featFadeUp 0.4s ease 0.7s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1A1C22 60%, #1C1E28 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] feat-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>PLATFORM CAPABILITIES</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>CORE FEATURES</h2>
      </div>

      <div className="absolute top-[20vh] left-[8vw] right-[6vw]" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vh 2.5vw" }}>
        <div className="feat-1" style={{ background: "rgba(212,150,10,0.07)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#D4960A" }}>Skill Tracking</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#9AA0AE", lineHeight: 1.5 }}>Real-time competency scores across all 65+ skills for every employee</div>
        </div>
        <div className="feat-2" style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#F5F0E8" }}>0–4 Scoring Scale</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#9AA0AE", lineHeight: 1.5 }}>Granular evaluation scale with weighted importance per skill category</div>
        </div>
        <div className="feat-3" style={{ background: "rgba(16,185,129,0.06)", border: "0.15vw solid rgba(16,185,129,0.2)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#10B981" }}>A/B/C Classification</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#9AA0AE", lineHeight: 1.5 }}>Automatic performance tiering: High, Developing, and Needs Improvement</div>
        </div>
        <div className="feat-4" style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#F5F0E8" }}>Campaign Management</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#9AA0AE", lineHeight: 1.5 }}>HR-controlled evaluation cycles with start/end dates and status tracking</div>
        </div>
        <div className="feat-5" style={{ background: "rgba(212,150,10,0.07)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#D4960A" }}>Training Plans</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#9AA0AE", lineHeight: 1.5 }}>Auto-generated training recommendations based on performance class</div>
        </div>
        <div className="feat-6" style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
          <div className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#F5F0E8" }}>Excel Export</div>
          <div className="font-body" style={{ fontSize: "1.35vw", color: "#9AA0AE", lineHeight: 1.5 }}>On-demand and monthly auto-export for compliance and offline review</div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
