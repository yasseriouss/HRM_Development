const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide13_Migration() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes migIn { from { opacity: 0; transform: translateX(-2vw); } to { opacity: 1; transform: translateX(0); } }
        .mig-h { animation: ${isExport ? "none" : "migIn 0.5s ease 0.1s both"}; }
        .mig-steps { animation: ${isExport ? "none" : "migIn 0.5s ease 0.3s both"}; }
        .mig-stats { animation: ${isExport ? "none" : "migIn 0.5s ease 0.5s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1A1C22 0%, #1E2028 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] mig-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>FROM SPREADSHEETS TO PLATFORM</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>
          DATA MIGRATION<br />STRATEGY
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: "1.5vw", color: "#9AA0AE", maxWidth: "30vw", lineHeight: 1.6 }}>
          5+ years of Excel data migrated seamlessly — no historical records lost.
        </p>
      </div>

      <div className="absolute top-[7vh] right-[6vw] mig-stats" style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "rgba(212,150,10,0.08)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2vh 3vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#D4960A" }}>146+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Employee records</div>
          </div>
          <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.08)", borderRadius: "0.8vw", padding: "2vh 3vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3vw", color: "#F5F0E8" }}>2021–</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Historical data</div>
          </div>
        </div>
      </div>

      <div className="absolute top-[38vh] left-[8vw] right-[6vw] mig-steps">
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          {[
            { num: "01", title: "Export Excel", desc: "Extract current spreadsheet data in standardized CSV format" },
            { num: "02", title: "Map Columns", desc: "Match Excel columns to system schema fields automatically" },
            { num: "03", title: "Validate Data", desc: "Flag duplicates, missing values, and format inconsistencies" },
            { num: "04", title: "Seed Database", desc: "Bulk import via migration scripts with full audit trail" },
            { num: "05", title: "Verify & Go", desc: "HR signs off on data accuracy before system goes live" },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, background: i === 4 ? "rgba(16,185,129,0.08)" : "rgba(245,240,232,0.04)", border: `0.15vw solid ${i === 4 ? "rgba(16,185,129,0.3)" : "rgba(245,240,232,0.08)"}`, borderRadius: "0.8vw", padding: "3vh 2vw" }}>
                <div className="font-display font-bold" style={{ fontSize: "2.5vw", color: i === 4 ? "#10B981" : "#3A3F4A", marginBottom: "0.8vh" }}>{step.num}</div>
                <div className="font-display font-semibold" style={{ fontSize: "1.5vw", color: "#F5F0E8", marginBottom: "0.8vh" }}>{step.title}</div>
                <div className="font-body" style={{ fontSize: "1.15vw", color: "#5A6070", lineHeight: 1.4 }}>{step.desc}</div>
              </div>
              {i < 4 && <div style={{ width: "1.5vw", height: "0.2vw", background: "rgba(212,150,10,0.4)", flexShrink: 0 }} />}
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
