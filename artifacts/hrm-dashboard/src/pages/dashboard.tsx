import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { 
  Users, Target, Zap, ShieldAlert, Activity, Cpu, 
  LayoutGrid, ExternalLink, ChevronRight, BarChart3, 
  Brain, Sparkles, Loader2, RefreshCcw 
} from "lucide-react";
import type {
  DashboardMetrics, DepartmentPerf, ClassTrend, ActivityItem
} from "@/lib/api";
import {
  fetchDashboardMetrics, fetchDepartmentPerformance, fetchClassTrends, fetchRecentActivity,
  clearToken
} from "@/lib/api";
import { useT } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLORS = { A: "#D4AF37", B: "#C0C0C0", C: "#EF4444" };

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-500 group-hover:scale-110`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-500 group-hover:scale-110`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-500 group-hover:scale-110`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-500 group-hover:scale-110`} />
  </>);

function StatCard({ label, value, sub, icon: Icon, colorClass = "primary" }: { label: string; value: string | number; sub?: string; icon: any; colorClass?: string }) {
  return (
    <Card className="bg-[#0D0D0D] border border-zinc-900 rounded-none relative group hover:border-primary/50 transition-all duration-500">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-white/5 border border-zinc-900 group-hover:border-primary/30 transition-colors mb-6 relative">
            <Icon className={`h-6 w-6 text-${colorClass}`} />
            <div className="absolute -inset-1 border border-primary/10 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-headline font-black tracking-[0.2em] text-zinc-600 uppercase">{label}</p>
            <h3 className="text-5xl font-mono font-black text-white mt-4 tracking-tighter">{value}</h3>
            {sub && (
              <div className="flex items-center justify-center gap-2 mt-6 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                <Activity className="h-3 w-3 animate-pulse" />{sub}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CornerMarks />
    </Card>
  );
}

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";
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
  }, [t]);

  function handleLogout() {
    clearToken();
    onLogout();
  }

  const classDistData = useMemo(() => metrics ? [
    { name: "Class A", value: metrics.class_a_count, pct: metrics.class_a_percentage },
    { name: "Class B", value: metrics.class_b_count, pct: metrics.class_b_percentage },
    { name: "Class C", value: metrics.class_c_count, pct: metrics.class_c_percentage },
  ].filter(d => d.value > 0) : [], [metrics]);

  const trendData = useMemo(() => trends.map(tr => ({
    name: tr.campaign_title,
    A: tr.class_a_count,
    B: tr.class_b_count,
    C: tr.class_c_count,
  })), [trends]);

  const deptChartData = useMemo(() => deptPerf.map(d => ({
    name: d.department_name.length > 10 ? d.department_name.substring(0, 10) + "…" : d.department_name,
    fullName: d.department_name,
    classA: d.class_a_count,
    classB: d.class_b_count,
    classC: d.class_c_count,
    avg: d.average_percentage,
  })), [deptPerf]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6 industrial-grid">
        <div className="hacker-loader">
          <div className="loader-text"><span className="text-glitch" data-text={t("loading")}>{t("loading")}</span></div>
          <div className="loader-bar"><div className="bar-fill"></div><div className="bar-glitch"></div></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6 industrial-grid">
        <Card className="bg-[#0A0A0A] border-2 border-destructive/20 rounded-none p-12 text-center max-w-md relative">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-6 animate-pulse" />
          <p className="text-destructive font-headline font-black uppercase tracking-widest mb-2">{t("error_loading")}</p>
          <p className="text-xs text-zinc-500 font-mono mb-8 uppercase leading-relaxed">{error}</p>
          <Button onClick={handleLogout} variant="outline" className="rounded-none border-destructive/30 text-destructive hover:bg-destructive/10 uppercase font-black text-[10px] tracking-widest">{t("error_sign_out")}</Button>
          <CornerMarks color="destructive" />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040404] text-foreground selection:bg-primary selection:text-primary-foreground industrial-grid">
      <header className="border-b border-zinc-900 bg-[#0A0A0A]/80 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-8 w-1 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            <div>
              <h1 className="font-headline font-black text-2xl tracking-tighter text-white uppercase">HRM <span className="text-primary font-mono ml-2 text-sm tracking-widest">OS_ANALYTICS</span></h1>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-1">{t("workforce_subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="btn-industrial px-6 py-2 text-[10px] font-black uppercase tracking-widest">
              {t("open_app")}
            </a>
            <Button onClick={handleLogout} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
              {t("sign_out")}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-12 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
             <div className="h-1.5 w-1.5 bg-primary animate-pulse" />
             <h2 className="text-4xl font-headline font-black text-white uppercase tracking-tighter">{t("workforce_overview")}</h2>
          </div>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.2em]">{t("workforce_subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label={t("kpi_total_employees")} value={metrics?.total_employees ?? 0} sub={`${metrics?.active_employees ?? 0} ${t("dashboard_active")}`} icon={Users} />
          <StatCard label="Active Campaigns" value={metrics?.active_campaigns ?? 0} sub={`${metrics?.completed_campaigns ?? 0} ${t("completed")}`} icon={Zap} colorClass="amber-500" />
          <StatCard label={t("kpi_skills_tracked")} value={metrics?.total_skills ?? 0} sub="competency nodes" icon={Target} colorClass="emerald-500" />
          <StatCard label={t("kpi_avg_score")} value={metrics?.average_skill_percentage != null ? `${metrics.average_skill_percentage}%` : "—"} sub="global baseline" icon={Activity} colorClass="blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-[#0A0A0A] border border-zinc-900 rounded-none relative overflow-hidden group">
            <CardHeader className="p-8 border-b border-zinc-900/50">
              <CardTitle className="font-headline font-black text-sm uppercase tracking-widest text-zinc-400 flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-primary" /> {t("perf_dist")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {classDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={classDistData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                      {classDistData.map((entry, i) => (
                        <Cell key={i} fill={entry.name === "Class A" ? COLORS.A : entry.name === "Class B" ? COLORS.B : COLORS.C} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "0", color: "#FFF", fontSize: "10px", textTransform: "uppercase", fontWeight: "900" }}
                    />
                    <Legend iconType="rect" formatter={(v) => <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex flex-col items-center justify-center text-center p-12 border border-dashed border-zinc-900">
                  <Sparkles className="h-10 w-10 text-zinc-800 mb-4" />
                  <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">{t("no_eval_data")}</p>
                </div>
              )}
            </CardContent>
            <CornerMarks />
          </Card>

          <Card className="bg-[#0A0A0A] border border-zinc-900 rounded-none relative overflow-hidden group">
            <CardHeader className="p-8 border-b border-zinc-900/50">
              <CardTitle className="font-headline font-black text-sm uppercase tracking-widest text-zinc-400 flex items-center gap-3">
                <Brain className="h-4 w-4 text-primary" /> {t("class_summary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {[
                { label: "Class A — High Performers", count: metrics?.class_a_count ?? 0, pct: metrics?.class_a_percentage ?? 0, color: COLORS.A },
                { label: "Class B — Developing", count: metrics?.class_b_count ?? 0, pct: metrics?.class_b_percentage ?? 0, color: COLORS.B },
                { label: "Class C — Needs Improvement", count: metrics?.class_c_count ?? 0, pct: metrics?.class_c_percentage ?? 0, color: COLORS.C },
              ].map((item) => (
                <div key={item.label} className="group/item">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/item:text-white transition-colors">{item.label}</span>
                    <span className="text-2xl font-mono font-black text-white">{item.pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      className="h-full" 
                      style={{ background: item.color }} 
                    />
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-zinc-900 flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{t("pending_training")}</span>
                  <Badge className="bg-zinc-900 text-zinc-400 border-zinc-800 rounded-none px-3 font-mono text-[10px] font-black">{metrics?.pending_training ?? 0} NODES</Badge>
              </div>
            </CardContent>
            <CornerMarks />
          </Card>
        </div>

        <Card className="bg-[#0A0A0A] border border-zinc-900 rounded-none relative overflow-hidden group">
          <CardHeader className="p-8 border-b border-zinc-900/50">
            <CardTitle className="font-headline font-black text-sm uppercase tracking-widest text-zinc-400 flex items-center gap-3">
              <Cpu className="h-4 w-4 text-primary" /> {t("dept_perf")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={deptChartData} margin={{ top: 20, right: 30, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#444", fontSize: 9, fontWeight: 900 }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: "#444", fontSize: 9, fontWeight: 900 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName ?? label}
                    contentStyle={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "0", color: "#FFF", fontSize: "10px", textTransform: "uppercase", fontWeight: "900" }}
                  />
                  <Legend iconType="rect" formatter={(v) => <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">{v}</span>} />
                  <Bar dataKey="classA" name="Class A" fill={COLORS.A} stackId="a" />
                  <Bar dataKey="classB" name="Class B" fill={COLORS.B} stackId="a" />
                  <Bar dataKey="classC" name="Class C" fill={COLORS.C} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-zinc-700 font-mono text-[10px] uppercase tracking-widest">{t("no_dept_data")}</div>
            )}
          </CardContent>
          <CornerMarks />
        </Card>

        {trendData.length > 0 && (
          <Card className="bg-[#0A0A0A] border border-zinc-900 rounded-none relative overflow-hidden group">
            <CardHeader className="p-8 border-b border-zinc-900/50">
              <CardTitle className="font-headline font-black text-sm uppercase tracking-widest text-zinc-400 flex items-center gap-3">
                <Activity className="h-4 w-4 text-primary" /> {t("class_trends")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#444", fontSize: 9, fontWeight: 900 }} axisLine={{ stroke: "#1A1A1A" }} tickLine={false} />
                  <YAxis tick={{ fill: "#444", fontSize: 9, fontWeight: 900 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid #1A1A1A", borderRadius: "0", color: "#FFF", fontSize: "10px", textTransform: "uppercase", fontWeight: "900" }} />
                  <Legend iconType="rect" formatter={(v) => <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">{v}</span>} />
                  <Line type="monotone" dataKey="A" name="Class A" stroke={COLORS.A} strokeWidth={3} dot={{ r: 4, fill: COLORS.A, strokeWidth: 0 }} activeDot={{ r: 6, stroke: "#FFF", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="B" name="Class B" stroke={COLORS.B} strokeWidth={3} dot={{ r: 4, fill: COLORS.B, strokeWidth: 0 }} activeDot={{ r: 6, stroke: "#FFF", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="C" name="Class C" stroke={COLORS.C} strokeWidth={3} dot={{ r: 4, fill: COLORS.C, strokeWidth: 0 }} activeDot={{ r: 6, stroke: "#FFF", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CornerMarks />
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-[#0A0A0A] border border-zinc-900 rounded-none relative overflow-hidden group">
            <CardHeader className="p-8 border-b border-zinc-900/50">
              <CardTitle className="font-headline font-black text-sm uppercase tracking-widest text-zinc-400">{t("recent_activity")}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {activity.length > 0 ? activity.map((item) => (
                <div key={item.id} className="flex items-start gap-4 group/log">
                  <div className="w-1.5 h-1.5 rounded-none bg-primary mt-1.5 shrink-0 group-hover/log:scale-125 transition-transform" />
                  <div className="space-y-1">
                    <p className="text-[11px] text-white font-medium group-hover/log:text-primary transition-colors">{item.description}</p>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{item.department_name} · {new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">{t("no_recent_activity")}</p>
              )}
            </CardContent>
            <CornerMarks color="zinc-800" />
          </Card>

          <Card className="bg-[#0A0A0A] border border-zinc-900 rounded-none relative overflow-hidden group">
            <CardHeader className="p-8 border-b border-zinc-900/50">
              <CardTitle className="font-headline font-black text-sm uppercase tracking-widest text-zinc-400">{t("avg_score_by_dept")}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {deptPerf.length > 0 ? [...deptPerf].sort((a, b) => b.average_percentage - a.average_percentage).map((dept) => (
                <div key={dept.department_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate pr-4">{dept.department_name}</span>
                    <span className="font-mono font-black text-white text-sm">
                      {dept.average_percentage > 0 ? `${Math.round(dept.average_percentage)}%` : "—"}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{
                      width: `${dept.average_percentage}%`,
                      background: dept.average_percentage >= 85 ? COLORS.A : dept.average_percentage >= 60 ? COLORS.B : COLORS.C
                    }} />
                  </div>
                </div>
              )) : (
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">{t("no_data")}</p>
              )}
            </CardContent>
            <CornerMarks color="zinc-800" />
          </Card>
        </div>

        <footer className="text-center pt-12 border-t border-zinc-900/50">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">
            {t("app_footer")} · {t("app_created_by")} <span className="text-primary hover:text-white transition-colors cursor-pointer">yasserious.com</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
