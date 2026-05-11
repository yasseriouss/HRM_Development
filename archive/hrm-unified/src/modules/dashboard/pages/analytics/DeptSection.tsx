import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { DEPT_PERFORMANCE } from "@modules/dashboard/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@modules/dashboard/i18n";

type SortKey = "avgPct" | "employees" | "classA" | "classB" | "classC";

const CLR = { A: "#10B981", B: "#EAB308", C: "#EF4444" };

function scoreColor(pct: number) {
  if (pct >= 85) return CLR.A;
  if (pct >= 60) return CLR.B;
  return CLR.C;
}

export default function DeptSection() {
  const t = useT();
  const [sortKey, setSortKey] = useState<SortKey>("avgPct");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const sorted = [...DEPT_PERFORMANCE].sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir);

  const barData = [...DEPT_PERFORMANCE].sort((a, b) => b.avgPct - a.avgPct).map(d => ({
    name: d.name.length > 10 ? d.name.slice(0, 9) + "…" : d.name,
    fullName: d.name,
    avg: d.avgPct,
  }));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === -1 ? 1 : -1);
    else { setSortKey(key); setSortDir(-1); }
  }

  const th = (label: string, key: SortKey) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => toggleSort(key)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="opacity-50">{sortKey === key ? (sortDir === -1 ? "↓" : "↑") : "↕"}</span>
      </span>
    </th>
  );

  return (
    <section>
      <SectionHeader title={t('dash_section_dept_title')} desc={t('dash_section_dept_desc')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t('dash_chart_score_ranking')}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t('dash_chart_score_ranking_desc')}</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }} barSize={18}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" width={74} tick={{ fill: "#9AA0AE", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                formatter={(v: number) => [`${v}%`, t('dash_kpi_avg_score')]}
                contentStyle={{ background: "#1E2028", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }}
              />
              <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                {barData.map((d, i) => (
                  <Cell key={i} fill={scoreColor(d.avg)} fillOpacity={0.85} />
                ))}
                <LabelList dataKey="avg" position="right" formatter={(v: number) => `${v}%`} style={{ fill: "#9AA0AE", fontSize: 11 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 overflow-auto">
          <h3 className="font-semibold text-sm text-foreground mb-0.5">{t('dash_chart_comparison_table')}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t('dash_chart_comparison_table_desc')}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('dash_col_department')}</th>
                {th(t('dash_col_employees'), "employees")}
                {th(t('dash_col_avg_pct'), "avgPct")}
                {th(t('dash_col_class_a'), "classA")}
                {th(t('dash_col_class_b'), "classB")}
                {th(t('dash_col_class_c'), "classC")}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.employees}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: scoreColor(d.avgPct) }}>{d.avgPct}%</td>
                  <td className="px-4 py-3"><span className="font-semibold text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: CLR.A }}>{d.classA}</span></td>
                  <td className="px-4 py-3"><span className="font-semibold text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(234,179,8,0.15)", color: CLR.B }}>{d.classB}</span></td>
                  <td className="px-4 py-3"><span className="font-semibold text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: CLR.C }}>{d.classC}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
