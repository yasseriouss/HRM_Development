import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ZAxis, ReferenceLine,
} from "recharts";
import { EMPLOYEE_DATA, CLASS_PROGRESSION } from "@/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@/i18n";

const CLR = { A: "#10B981", B: "#EAB308", C: "#EF4444" };

const dataA = EMPLOYEE_DATA.filter(e => e.cls === "A").map(e => ({ x: e.idx + 1, y: e.pct, name: e.name, dept: e.deptName }));
const dataB = EMPLOYEE_DATA.filter(e => e.cls === "B").map(e => ({ x: e.idx + 1, y: e.pct, name: e.name, dept: e.deptName }));
const dataC = EMPLOYEE_DATA.filter(e => e.cls === "C").map(e => ({ x: e.idx + 1, y: e.pct, name: e.name, dept: e.deptName }));

const totalProg = CLASS_PROGRESSION.improved + CLASS_PROGRESSION.maintained + CLASS_PROGRESSION.declined;

interface TooltipEntry {
  payload: { x: number; y: number; name: string; dept: string };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "#1E2028", border: "1px solid #2E3340", color: "#F5F0E8" }}>
      <p className="font-semibold mb-1">{d.name}</p>
      <p className="text-muted-foreground">{d.dept}</p>
      <p>Score: <span className="font-bold" style={{ color: d.y >= 85 ? CLR.A : d.y >= 60 ? CLR.B : CLR.C }}>{d.y}%</span></p>
    </div>
  );
};

export default function EmployeeSection() {
  const t = useT();

  return (
    <section>
      <SectionHeader title={t("section_employee_title")} desc={t("section_employee_desc")} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t("chart_emp_scatter")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("chart_emp_scatter_desc")}</p>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E3340" />
              <XAxis type="number" dataKey="x" name="Employee" domain={[0, 150]} tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Employee #", position: "insideBottom", offset: -2, fill: "#5A6070", fontSize: 10 }} />
              <YAxis type="number" dataKey="y" name="Score" domain={[20, 100]} tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <ZAxis range={[30, 30]} />
              <ReferenceLine y={85} stroke={CLR.A} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "A", fill: CLR.A, fontSize: 10, position: "right" }} />
              <ReferenceLine y={60} stroke={CLR.B} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "B/C", fill: CLR.B, fontSize: 10, position: "right" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: "#9AA0AE", fontSize: "11px" }}>{v}</span>} />
              <Scatter name="Class A" data={dataA} fill={CLR.A} fillOpacity={0.8} />
              <Scatter name="Class B" data={dataB} fill={CLR.B} fillOpacity={0.8} />
              <Scatter name="Class C" data={dataC} fill={CLR.C} fillOpacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t("chart_class_prog")}</h3>
          <p className="text-xs text-muted-foreground mb-6">{t("chart_class_prog_desc")}</p>

          <div className="flex-1 space-y-4">
            {[
              { label: t("prog_improved"), desc: t("prog_improved_desc"), count: CLASS_PROGRESSION.improved, color: CLR.A, icon: "↑" },
              { label: t("prog_maintained"), desc: t("prog_maintained_desc"), count: CLASS_PROGRESSION.maintained, color: "#9AA0AE", icon: "→" },
              { label: t("prog_declined"), desc: t("prog_declined_desc"), count: CLASS_PROGRESSION.declined, color: CLR.C, icon: "↓" },
            ].map((p, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2E3340" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold" style={{ color: p.color }}>{p.icon}</span>
                      <span className="text-sm font-semibold text-foreground">{p.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: p.color }}>{p.count}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#2E3340" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(p.count / totalProg) * 100}%`, background: p.color }} />
                </div>
                <div className="text-right text-xs text-muted-foreground mt-1">{((p.count / totalProg) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg p-3 text-xs" style={{ background: "rgba(212,150,10,0.08)", border: "1px solid rgba(212,150,10,0.2)" }}>
            <p className="text-foreground font-medium mb-1">{t("net_improvement")}</p>
            <p style={{ color: "#D4960A" }} className="font-bold text-base">
              +{(((CLASS_PROGRESSION.improved - CLASS_PROGRESSION.declined) / totalProg) * 100).toFixed(1)}%
            </p>
            <p className="text-muted-foreground">{t("net_improvement_sub")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
