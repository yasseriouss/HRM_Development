const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

export default function Slide11_Roadmap() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes roadIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .road-h { animation: ${isExport ? "none" : "roadIn 0.5s ease 0.1s both"}; }
        .road-phases { animation: ${isExport ? "none" : "roadIn 0.5s ease 0.35s both"}; }
        .road-weeks { animation: ${isExport ? "none" : "roadIn 0.5s ease 0.55s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1A1C22 0%, #1C1F28 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] road-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>8-WEEK DELIVERY</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>
          IMPLEMENTATION<br />ROADMAP
        </h2>
      </div>

      <div className="absolute top-[22vh] left-[8vw] right-[6vw] road-phases">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1.2vw" }}>
          {[
            { phase: "01", title: "Foundation", weeks: "Wk 1", desc: "Project setup, DB schema, auth system" },
            { phase: "02", title: "Data Mgmt", weeks: "Wk 2", desc: "Employee, skills, department CRUD" },
            { phase: "03", title: "Calculations", weeks: "Wk 3", desc: "Scoring engine, A/B/C classification" },
            { phase: "04", title: "Analytics", weeks: "Wk 4–5", desc: "Dashboards, KPIs, heatmaps" },
            { phase: "05", title: "Reporting", weeks: "Wk 5–6", desc: "PDF, Excel export, audit trail" },
            { phase: "06", title: "Optimization", weeks: "Wk 6–7", desc: "Performance, mobile polish, QA" },
            { phase: "07", title: "Deployment", weeks: "Wk 7–8", desc: "Production, CI/CD, user training" },
          ].map((item, i) => (
            <div key={i} style={{ background: i === 6 ? "rgba(212,150,10,0.1)" : "rgba(245,240,232,0.04)", border: `0.15vw solid ${i === 6 ? "rgba(212,150,10,0.4)" : "rgba(245,240,232,0.08)"}`, borderRadius: "0.8vw", padding: "2.5vh 1.5vw" }}>
              <div className="font-display font-bold" style={{ fontSize: "2.5vw", color: i === 6 ? "#D4960A" : "#3A3F4A", marginBottom: "0.5vh" }}>{item.phase}</div>
              <div className="font-display font-semibold" style={{ fontSize: "1.5vw", color: "#F5F0E8", marginBottom: "0.5vh" }}>{item.title}</div>
              <div className="font-body" style={{ fontSize: "1.1vw", color: "#D4960A", marginBottom: "0.8vh" }}>{item.weeks}</div>
              <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070", lineHeight: 1.4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-[10vh] left-[8vw] right-[6vw] road-weeks">
        <div style={{ height: "0.15vw", background: "rgba(212,150,10,0.3)", position: "relative" }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((w) => (
            <div key={w} style={{ position: "absolute", left: `${(w / 7) * 100}%`, transform: "translateX(-50%)", textAlign: "center" }}>
              <div style={{ width: "0.4vw", height: "1.5vh", background: "#D4960A", margin: "0 auto -0.4vh" }} />
              <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070", marginTop: "0.5vh" }}>Wk {w + 1}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: "100%", transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ width: "0.4vw", height: "1.5vh", background: "#10B981", margin: "0 auto -0.4vh" }} />
            <div className="font-body" style={{ fontSize: "1.1vw", color: "#10B981", marginTop: "0.5vh" }}>LIVE</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
