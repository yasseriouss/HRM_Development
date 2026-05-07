import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts";
import type {
  DashboardMetrics, DepartmentPerf, ClassTrend, ActivityItem
} from "@/lib/api";
import {
  fetchDashboardMetrics, fetchDepartmentPerformance, fetchClassTrends, fetchRecentActivity,
  clearToken
} from "@/lib/api";
import { useT } from "@/i18n";

const COLORS = { A: "#10B981", B: "#EAB308", C: "#EF4444" };

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const t = useT();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [deptPerf, setDeptPerf] = useState<DepartmentPerf[]>([]);
  const [trends, setTrends] = useState<ClassTrend[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [m, d, tr, a] = await Promise.all([
          fetchDashboardMetrics(),
          fetchDepartmentPerformance(),
          fetchClassTrends(),
          fetchRecentActivity(),
        ]);
        setMetrics(m);
        setDeptPerf(d);
        setTrends(tr);
        setActivity(a);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error_loading"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleLogout() {
    clearToken();
    onLogout();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-destructive/30 rounded-xl p-8 text-center max-w-sm">
          <p className="text-destructive font-medium mb-2">{t("error_loading")}</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button onClick={handleLogout} className="text-sm text-primary hover:underline">{t("error_sign_out")}</button>
        </div>
      </div>
    );
  }

  const classDistData = metrics ? [
    { name: "Class A", value: metrics.class_a_count, pct: metrics.class_a_percentage },
    { name: "Class B", value: metrics.class_b_count, pct: metrics.class_b_percentage },
    { name: "Class C", value: metrics.class_c_count, pct: metrics.class_c_percentage },
  ].filter(d => d.value > 0) : [];

  const trendData = trends.map(tr => ({
    name: tr.campaign_title,
    A: tr.class_a_count,
    B: tr.class_b_count,
    C: tr.class_c_count,
  }));

  const deptChartData = deptPerf.map(d => ({
    name: d.department_name.length > 10 ? d.department_name.substring(0, 10) + "…" : d.department_name,
    fullName: d.department_name,
    classA: d.class_a_count,
    classB: d.class_b_count,
    classC: d.class_c_count,
    avg: d.average_percentage,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <div>
              <h1 className="font-bold text-foreground leading-none">HRM</h1>
              <p className="text-xs text-muted-foreground">{t("workforce_subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/5 flex items-center gap-2">
              <span>←</span>
              {t("open_app")}
            </a>
            <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t("sign_out")}</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">{t("workforce_overview")}</h2>
          <p className="text-sm text-muted-foreground">{t("workforce_subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label={t("kpi_total_employees")} value={metrics?.total_employees ?? 0} sub={`${metrics?.active_employees ?? 0} ${t("employees")}`} accent />
          <StatCard label="Active Campaigns" value={metrics?.active_campaigns ?? 0} sub={`${metrics?.completed_campaigns ?? 0} ${t("completed")}`} />
          <StatCard label={t("kpi_skills_tracked")} value={metrics?.total_skills ?? 0} sub="tracked competencies" />
          <StatCard label={t("kpi_avg_score")} value={metrics?.average_skill_percentage != null ? `${metrics.average_skill_percentage}%` : "—"} sub="across all evaluations" accent />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">{t("perf_dist")}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t("perf_dist_desc")}</p>
            {classDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={classDistData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {classDistData.map((entry, i) => (
                      <Cell key={i} fill={entry.name === "Class A" ? COLORS.A : entry.name === "Class B" ? COLORS.B : COLORS.C} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, n: string) => [`${v} ${t("employees")}`, n]}
                    contentStyle={{ background: "#242830", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }}
                  />
                  <Legend formatter={(v) => <span style={{ color: "#9AA0AE", fontSize: "12px" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">{t("no_eval_data")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("no_eval_data_sub")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">{t("class_summary")}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t("class_summary_desc")}</p>
            <div className="space-y-4 pt-2">
              {[
                { label: "Class A — High Performers", count: metrics?.class_a_count ?? 0, pct: metrics?.class_a_percentage ?? 0, color: "#10B981" },
                { label: "Class B — Developing", count: metrics?.class_b_count ?? 0, pct: metrics?.class_b_percentage ?? 0, color: "#EAB308" },
                { label: "Class C — Needs Improvement", count: metrics?.class_c_count ?? 0, pct: metrics?.class_c_percentage ?? 0, color: "#EF4444" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className="text-sm font-semibold" style={{ color: item.color }}>{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("pending_training")}</span>
                  <span className="text-foreground font-medium">{metrics?.pending_training ?? 0} {t("employees")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-1">{t("dept_perf")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{t("dept_perf_desc")}</p>
          {deptChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptChartData} margin={{ top: 0, right: 0, bottom: 24, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3340" />
                <XAxis dataKey="name" tick={{ fill: "#9AA0AE", fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: "#9AA0AE", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName ?? label}
                  contentStyle={{ background: "#242830", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }}
                />
                <Legend formatter={(v) => <span style={{ color: "#9AA0AE", fontSize: "12px" }}>{v}</span>} />
                <Bar dataKey="classA" name="Class A" fill={COLORS.A} stackId="a" />
                <Bar dataKey="classB" name="Class B" fill={COLORS.B} stackId="a" />
                <Bar dataKey="classC" name="Class C" fill={COLORS.C} radius={[2, 2, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">{t("no_dept_data")}</div>
          )}
        </div>

        {trendData.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">{t("class_trends")}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t("class_trends_desc")}</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3340" />
                <XAxis dataKey="name" tick={{ fill: "#9AA0AE", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9AA0AE", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#242830", border: "1px solid #2E3340", borderRadius: "8px", color: "#F5F0E8", fontSize: "12px" }} />
                <Legend formatter={(v) => <span style={{ color: "#9AA0AE", fontSize: "12px" }}>{v}</span>} />
                <Line type="monotone" dataKey="A" name="Class A" stroke={COLORS.A} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="B" name="Class B" stroke={COLORS.B} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="C" name="Class C" stroke={COLORS.C} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("recent_activity")}</h3>
            <div className="space-y-3">
              {activity.length > 0 ? activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.department_name} · {new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">{t("no_recent_activity")}</p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">{t("avg_score_by_dept")}</h3>
            <div className="space-y-3">
              {deptPerf.length > 0 ? [...deptPerf].sort((a, b) => b.average_percentage - a.average_percentage).map((dept) => (
                <div key={dept.department_id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground truncate pr-2">{dept.department_name}</span>
                    <span className="text-sm font-semibold shrink-0" style={{
                      color: dept.average_percentage >= 85 ? "#10B981" : dept.average_percentage >= 60 ? "#EAB308" : "#EF4444"
                    }}>
                      {dept.average_percentage > 0 ? `${Math.round(dept.average_percentage)}%` : "—"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${dept.average_percentage}%`,
                      background: dept.average_percentage >= 85 ? "#10B981" : dept.average_percentage >= 60 ? "#EAB308" : "#EF4444"
                    }} />
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">{t("no_data")}</p>
              )}
            </div>
          </div>
        </div>

        <footer className="text-center pb-4">
          <p className="text-xs text-muted-foreground">
            {t("app_footer")} · {t("app_created_by")} <span className="text-primary">yasserious.com</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
