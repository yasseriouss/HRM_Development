import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { DEPT_PERFORMANCE } from "@modules/dashboard/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@modules/dashboard/i18n";
import { motion } from "framer-motion";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@shared/utils/cn";

type SortKey = "avgPct" | "employees" | "classA" | "classB" | "classC";

const CLR = { A: "#10B981", B: "#F59E0B", C: "#EF4444" };

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
      className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 cursor-pointer select-none hover:text-zinc-900 transition-colors group"
      onClick={() => toggleSort(key)}
    >
      <div className="flex items-center gap-2">
        {label}
        <span className={cn(
          "transition-opacity",
          sortKey === key ? "opacity-100 text-zinc-900" : "opacity-0 group-hover:opacity-40"
        )}>
          {sortKey === key ? (sortDir === -1 ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
        </span>
      </div>
    </th>
  );

  return (
    <section>
      <SectionHeader title={t('dash_section_dept_title')} desc={t('dash_section_dept_desc')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Ranking Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm"
        >
          <div className="mb-8">
            <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_score_ranking')}</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_score_ranking_desc')}</p>
          </div>
          
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }} barSize={14}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#71717A", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#FAFAFA" }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                  formatter={(v: number) => [`${v}%`, t('dash_kpi_avg_score')]}
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #F4F4F5", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "600" }}
                />
                <Bar dataKey="avg" radius={[0, 8, 8, 0]}>
                  {barData.map((d, i) => (
                    <Cell key={i} fill={scoreColor(d.avg)} fillOpacity={1} />
                  ))}
                  <LabelList dataKey="avg" position="right" formatter={(v: number) => `${v}%`} style={{ fill: "#71717A", fontSize: 11, fontWeight: 700, fontFamily: "Comfortaa" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm overflow-hidden"
        >
          <div className="mb-8">
            <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_comparison_table')}</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_comparison_table_desc')}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{t('dash_col_department')}</th>
                  {th(t('dash_col_employees'), "employees")}
                  {th(t('dash_col_avg_pct'), "avgPct")}
                  {th(t('dash_col_class_a'), "classA")}
                  {th(t('dash_col_class_b'), "classB")}
                  {th(t('dash_col_class_c'), "classC")}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {sorted.map((d) => (
                  <tr key={d.id} className="group hover:bg-zinc-50/50 transition-all duration-300">
                    <td className="px-4 py-4 font-bold text-zinc-900 font-comfortaa">{d.name}</td>
                    <td className="px-4 py-4 text-zinc-500 font-medium">{d.employees}</td>
                    <td className="px-4 py-4 font-bold" style={{ color: scoreColor(d.avgPct) }}>{d.avgPct}%</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                        {d.classA}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                        {d.classB}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
                        {d.classC}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
