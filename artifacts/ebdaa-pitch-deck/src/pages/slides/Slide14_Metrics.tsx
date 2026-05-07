const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide14_Metrics() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes metIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .met-h { animation: ${isExport ? "none" : "metIn 0.5s ease 0.1s both"}; }
        .met-grid { animation: ${isExport ? "none" : "metIn 0.5s ease 0.3s both"}; }
        .met-note { animation: ${isExport ? "none" : "metIn 0.5s ease 0.5s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1A1C22 0%, #1D1F2C 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] met-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>6-MONTH TARGETS</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>
          SUCCESS METRICS<br />&amp; KPIs
        </h2>
      </div>

      <div className="absolute top-[22vh] left-[8vw] right-[6vw] met-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2vw" }}>
        <div style={{ background: "rgba(212,150,10,0.07)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
          <div className="font-display font-bold" style={{ fontSize: "4vw", color: "#D4960A", lineHeight: 1 }}>100%</div>
          <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Employee records digitized within 30 days of launch</div>
        </div>
        <div style={{ background: "rgba(16,185,129,0.06)", border: "0.15vw solid rgba(16,185,129,0.2)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
          <div className="font-display font-bold" style={{ fontSize: "4vw", color: "#10B981", lineHeight: 1 }}>+15%</div>
          <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Average skill score improvement across all departments</div>
        </div>
        <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
          <div className="font-display font-bold" style={{ fontSize: "4vw", color: "#F5F0E8", lineHeight: 1 }}>10h+</div>
          <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Monthly hours saved vs. manual Excel tracking process</div>
        </div>
        <div style={{ background: "rgba(212,150,10,0.07)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
          <div className="font-display font-bold" style={{ fontSize: "4vw", color: "#D4960A", lineHeight: 1 }}>80%</div>
          <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Class C employees moved to B or A within 6 months</div>
        </div>
        <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
          <div className="font-display font-bold" style={{ fontSize: "4vw", color: "#F5F0E8", lineHeight: 1 }}>3</div>
          <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Evaluation campaigns completed in the first quarter</div>
        </div>
        <div style={{ background: "rgba(16,185,129,0.06)", border: "0.15vw solid rgba(16,185,129,0.2)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
          <div className="font-display font-bold" style={{ fontSize: "4vw", color: "#10B981", lineHeight: 1 }}>9/9</div>
          <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>All departments onboarded and actively using the system</div>
        </div>
        <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
          <div className="font-display font-bold" style={{ fontSize: "4vw", color: "#F5F0E8", lineHeight: 1 }}>0</div>
          <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Manual reporting cycles — all automated within platform</div>
        </div>
        <div style={{ background: "rgba(212,150,10,0.07)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
          <div className="font-display font-bold" style={{ fontSize: "4vw", color: "#D4960A", lineHeight: 1 }}>65+</div>
          <div className="font-body mt-[1vh]" style={{ fontSize: "1.3vw", color: "#9AA0AE", lineHeight: 1.5 }}>Skills tracked with weighted scoring across all roles</div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
