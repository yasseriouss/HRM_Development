import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

const roiData = [
  { name: "Dev Cost", value: -11, label: "$11K" },
  { name: "Yr 1 Savings", value: 24, label: "$24K" },
  { name: "Yr 2 Savings", value: 26, label: "$26K" },
  { name: "Yr 3 Savings", value: 26, label: "$26K" },
];

export default function Slide12_ROI() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes roiIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .roi-h { animation: ${isExport ? "none" : "roiIn 0.5s ease 0.1s both"}; }
        .roi-kpis { animation: ${isExport ? "none" : "roiIn 0.5s ease 0.3s both"}; }
        .roi-chart { animation: ${isExport ? "none" : "roiIn 0.5s ease 0.5s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1A1C22 0%, #1E2030 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] roi-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>FINANCIAL CASE</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.5vw", lineHeight: 1, color: "#F5F0E8" }}>
          COST &amp;<br />RETURN ON INVESTMENT
        </h2>
      </div>

      <div className="absolute top-[7vh] right-[6vw] roi-kpis" style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "rgba(212,150,10,0.08)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2vh 3vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#D4960A" }}>$11K</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Development investment</div>
          </div>
          <div style={{ background: "rgba(16,185,129,0.08)", border: "0.15vw solid rgba(16,185,129,0.25)", borderRadius: "0.8vw", padding: "2vh 3vw", textAlign: "center" }}>
            <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#10B981" }}>$72K+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>3-year value return</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "1.8vh 2.5vw", textAlign: "center", flex: 1 }}>
            <div className="font-display font-bold" style={{ fontSize: "2.8vw", color: "#F5F0E8" }}>5–6</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Month payback period</div>
          </div>
          <div style={{ background: "rgba(245,240,232,0.04)", border: "0.15vw solid rgba(245,240,232,0.1)", borderRadius: "0.8vw", padding: "1.8vh 2.5vw", textAlign: "center", flex: 1 }}>
            <div className="font-display font-bold" style={{ fontSize: "2.8vw", color: "#F5F0E8" }}>10+</div>
            <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Hours saved per month</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[10vh] left-[8vw] right-[6vw] roi-chart" style={{ height: "40vh" }}>
        <div className="font-body mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "#5A6070" }}>INVESTMENT vs. CUMULATIVE VALUE ($K)</div>
        <div style={{ height: "32vh" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={60}>
              <XAxis dataKey="name" tick={{ fill: "#9AA0AE", fontSize: "1.2vw", fontFamily: "Source Sans 3" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5A6070", fontSize: "1.1vw", fontFamily: "Source Sans 3" }} axisLine={false} tickLine={false} />
              <ReferenceLine y={0} stroke="#2E3340" strokeWidth={1} />
              <Tooltip contentStyle={{ background: "#242830", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8" }} cursor={{ fill: "rgba(245,240,232,0.04)" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {roiData.map((entry, index) => (
                  <Cell key={index} fill={entry.value < 0 ? "#EF4444" : "#10B981"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[6vw]">
        <div className="font-body" style={{ fontSize: "1.1vw", color: "#5A6070" }}>Created by <span style={{ color: "#D4960A" }}>yasserious.com</span></div>
      </div>
    </div>
  );
}
