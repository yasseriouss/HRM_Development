import { useState } from "react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { DEPT_PERFORMANCE } from "@modules/dashboard/data/demo";
import { SectionHeader } from "./OverviewSection";
import { useT } from "@modules/dashboard/i18n";
import { motion } from "framer-motion";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@shared/utils/cn";
import {
  dataTableBase,
  dataTableBody,
  dataTableHeadRow,
  dataTableScroll,
  dataTableShell,
  dataTableTd,
  dataTableTh,
  dataTableThSortable,
} from "@shared/components/data/data-table-styles";

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

  const barData = [...DEPT_PERFORMANCE].sort((a, b) => b.avgPct - a.avgPct).map((d) => ({
    name: d.name.length > 10 ? d.name.slice(0, 9) + "…" : d.name,
    fullName: d.name,
    avg: d.avgPct,
  }));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === -1 ? 1 : -1));
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  const th = (label: string, key: SortKey) => (
    <th className={dataTableThSortable} onClick={() => toggleSort(key)}>
      <div className="flex items-center gap-2">
        {label}
        <span
          className={cn(
            "transition-opacity",
            sortKey === key ? "opacity-100 text-foreground" : "opacity-0 group-hover:opacity-40",
          )}
        >
          {sortKey === key ? (
            sortDir === -1 ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3" />
          )}
        </span>
      </div>
    </th>
  );

  const panelClass =
    "bg-background border border-border rounded-4xl p-8 shadow-sm text-foreground";

  return (
    <section>
      <SectionHeader title={t("dash_section_dept_title")} desc={t("dash_section_dept_desc")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className={panelClass}
        >
          <div className="mb-8">
            <h3 className="font-headline font-bold text-lg text-foreground">{t("dash_chart_score_ranking")}</h3>
            <p className="text-[10px] font-headline font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {t("dash_chart_score_ranking_desc")}
            </p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
                barSize={14}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                  formatter={(v: number) => [`${v}%`, t("dash_kpi_avg_score")]}
                  contentStyle={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                />
                <Bar dataKey="avg" radius={[0, 8, 8, 0]}>
                  {barData.map((d, i) => (
                    <Cell key={i} fill={scoreColor(d.avg)} fillOpacity={1} />
                  ))}
                  <LabelList
                    dataKey="avg"
                    position="right"
                    formatter={(v: number) => `${v}%`}
                    style={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "var(--font-headline), system-ui, sans-serif",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className={cn(dataTableShell, "p-0")}
          data-testid="dept-comparison-table"
        >
          <div className="px-8 pt-8 pb-4 border-b border-border/60">
            <h3 className="font-headline font-bold text-lg text-foreground">{t("dash_chart_comparison_table")}</h3>
            <p className="text-[10px] font-headline font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {t("dash_chart_comparison_table_desc")}
            </p>
          </div>

          <div className={dataTableScroll}>
            <table className={dataTableBase}>
              <thead>
                <tr className={dataTableHeadRow}>
                  <th className={dataTableTh}>{t("dash_col_department")}</th>
                  {th(t("dash_col_employees"), "employees")}
                  {th(t("dash_col_avg_pct"), "avgPct")}
                  {th(t("dash_col_class_a"), "classA")}
                  {th(t("dash_col_class_b"), "classB")}
                  {th(t("dash_col_class_c"), "classC")}
                </tr>
              </thead>
              <tbody className={dataTableBody}>
                {sorted.map((d) => (
                  <tr key={d.id} className={cn(dataTableRow, "group")}>
                    <td className={dataTableTd}>
                      <Link
                        href={`/skill-matrix/departments/${d.id}`}
                        className="font-headline font-bold text-primary hover:underline underline-offset-4"
                      >
                        {d.name}
                      </Link>
                    </td>
                    <td className={cn(dataTableTd, "text-muted-foreground font-medium tabular-nums")}>{d.employees}</td>
                    <td className={cn(dataTableTd, "font-bold tabular-nums")} style={{ color: scoreColor(d.avgPct) }}>
                      {d.avgPct}%
                    </td>
                    <td className={dataTableTd}>
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-[10px] font-bold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
                        {d.classA}
                      </span>
                    </td>
                    <td className={dataTableTd}>
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {d.classB}
                      </span>
                    </td>
                    <td className={dataTableTd}>
                      <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-[10px] font-bold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
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
