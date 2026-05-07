import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const isExport = typeof window !== "undefined" && window.location.pathname.endsWith("/allslides");

const deptData = [
  { name: "Assembly", score: 84 },
  { name: "Upholstery", score: 78 },
  { name: "Painting", score: 71 },
  { name: "Wood Prep", score: 88 },
  { name: "Finishing", score: 65 },
  { name: "Packing", score: 92 },
  { name: "Maint.", score: 76 },
  { name: "QC", score: 81 },
  { name: "Cutting", score: 69 },
];

const COLORS = ["#10B981", "#10B981", "#EAB308", "#10B981", "#EAB308", "#10B981", "#EAB308", "#10B981", "#EAB308"];

export default function Slide09_ExecDashboard() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#1A1C22" }}>
      <style>{`
        @keyframes execIn { from { opacity: 0; transform: translateY(2vh); } to { opacity: 1; transform: translateY(0); } }
        .exec-h { animation: ${isExport ? "none" : "execIn 0.5s ease 0.1s both"}; }
        .exec-kpi { animation: ${isExport ? "none" : "execIn 0.5s ease 0.3s both"}; }
        .exec-chart { animation: ${isExport ? "none" : "execIn 0.5s ease 0.5s both"}; }
      `}</style>

      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1A1C22 0%, #1C1E2A 100%)" }} />
      <div className="absolute right-0 top-0 h-full" style={{ width: "0.4vw", background: "linear-gradient(180deg, transparent 0%, #D4960A 40%, #D4960A 60%, transparent 100%)" }} />

      <div className="absolute top-[7vh] left-[8vw] exec-h">
        <div className="font-body font-semibold mb-[1vh]" style={{ fontSize: "1.2vw", color: "#D4960A", letterSpacing: "0.2em" }}>LEADERSHIP VIEW</div>
        <h2 className="font-display font-bold tracking-tight" style={{ fontSize: "4.2vw", lineHeight: 1, color: "#F5F0E8" }}>
          EXECUTIVE<br />DASHBOARD
        </h2>
      </div>

      <div className="absolute top-[7vh] right-[6vw] exec-kpi" style={{ display: "flex", gap: "2vw" }}>
        <div style={{ background: "rgba(212,150,10,0.08)", border: "0.15vw solid rgba(212,150,10,0.25)", borderRadius: "0.8vw", padding: "2vh 2.5vw", textAlign: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#D4960A" }}>78.4%</div>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>Company avg. score</div>
        </div>
        <div style={{ background: "rgba(16,185,129,0.07)", border: "0.15vw solid rgba(16,185,129,0.2)", borderRadius: "0.8vw", padding: "2vh 2.5vw", textAlign: "center" }}>
          <div className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#10B981" }}>+12%</div>
          <div className="font-body" style={{ fontSize: "1.2vw", color: "#5A6070" }}>vs. last quarter</div>
        </div>
      </div>

      <div className="absolute top-[26vh] left-[8vw] right-[6vw] exec-chart" style={{ height: "52vh" }}>
        <div className="font-body mb-[1.5vh]" style={{ fontSize: "1.2vw", color: "#5A6070" }}>AVERAGE SKILL SCORE BY DEPARTMENT</div>
        <div style={{ height: "44vh" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: "#5A6070", fontSize: "1.1vw", fontFamily: "Source Sans 3" }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#5A6070", fontSize: "1.1vw", fontFamily: "Source Sans 3" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#242830", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8" }}
                cursor={{ fill: "rgba(245,240,232,0.04)" }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {deptData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} fillOpacity={0.8} />
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
