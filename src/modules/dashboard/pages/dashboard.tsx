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
} from "@modules/dashboard/lib/api";
import {
  fetchDashboardMetrics, fetchDepartmentPerformance, fetchClassTrends, fetchRecentActivity,
  clearToken
} from "@modules/dashboard/lib/api";
import { useLang } from "@shared/contexts/LangContext";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { logout } from "@shared/lib/auth";

const COLORS = { A: "oklch(64% 0.13 28)", B: "oklch(58% 0.16 145)", C: "oklch(70% 0.15 15)" };

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <div className={`absolute top-4 right-4 w-1 h-1 rounded-full bg-${color}/40 transition-all duration-500 group-hover:scale-150 shadow-[0_0_8px_rgba(var(--${color}),0.4)]`} />
);

function StatCard({ label, value, sub, icon: Icon, colorClass = "primary" }: { label: string; value: string | number; sub?: string; icon: any; colorClass?: string }) {
  return (
    <Card className="bg-surface/40 border border-muted/10 rounded-2xl relative group hover:border-primary/20 hover:bg-surface/60 transition-all duration-500 soft-shadow backdrop-blur-md">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start justify-between mb-8">
          <div className={`p-3 bg-${colorClass}/5 border border-${colorClass}/10 group-hover:border-${colorClass}/30 transition-colors rounded-xl`}>
            <Icon className={`h-5 w-5 text-${colorClass}`} />
          </div>
          <CornerMarks color={colorClass} />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-muted uppercase mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl md:text-4xl font-headline font-bold text-foreground tracking-tight">{value}</h3>
          </div>
          {sub && (
            <div className="flex items-center gap-2 mt-4 text-[9px] font-bold text-muted/60 uppercase tracking-widest">
              <Activity className="h-3 w-3" />{sub}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
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
        setError(err instanceof Error ? err.message : t('dash_error_loading'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);


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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{t('common_loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="bg-surface/50 border border-destructive/20 rounded-xl p-12 text-center max-w-md relative backdrop-blur-sm">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-6" />
          <p className="text-destructive font-headline font-bold uppercase tracking-widest mb-2">{t('dash_error_loading')}</p>
          <p className="text-xs text-muted font-body-default mb-8 uppercase leading-relaxed">{error}</p>
          <Button onClick={logout} variant="outline" className="rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10 uppercase font-bold text-[10px] tracking-widest">{t('dash_error_sign_out')}</Button>
          <CornerMarks color="destructive" />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full text-foreground selection:bg-primary/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-16 space-y-12 md:space-y-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center md:text-left"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
             <div className="h-10 w-1 bg-primary rounded-full hidden md:block" />
             <div>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground tracking-tight">{t('dash_workforce_overview')}</h2>
                <p className="text-xs text-muted font-body-default font-bold uppercase tracking-[0.2em] mt-2">{t('dash_workforce_subtitle')}</p>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <StatCard label={t('dash_kpi_total_employees')} value={metrics?.total_employees ?? 0} sub={`${metrics?.active_employees ?? 0} ${t('dash_dashboard_active')}`} icon={Users} />
          <StatCard label="Active Campaigns" value={metrics?.active_campaigns ?? 0} sub={`${metrics?.completed_campaigns ?? 0} ${t('dash_completed')}`} icon={Zap} colorClass="primary" />
          <StatCard label={t('dash_kpi_skills_tracked')} value={metrics?.total_skills ?? 0} sub="competency nodes" icon={Target} colorClass="primary" />
          <StatCard label={t('dash_kpi_avg_score')} value={metrics?.average_skill_percentage != null ? `${metrics.average_skill_percentage}%` : "—"} sub="global baseline" icon={Activity} colorClass="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <Card className="bg-surface/30 border border-muted/10 rounded-2xl relative overflow-hidden group backdrop-blur-md soft-shadow">
            <CardHeader className="p-6 md:p-8 border-b border-muted/5">
              <CardTitle className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-muted flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-primary" /> {t('dash_perf_dist')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              {classDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={classDistData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                      {classDistData.map((entry, i) => (
                        <Cell key={i} fill={entry.name === "Class A" ? COLORS.A : entry.name === "Class B" ? COLORS.B : COLORS.C} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--background)", border: "1px solid var(--muted)", borderRadius: "12px", color: "var(--foreground)", fontSize: "10px", textTransform: "uppercase", fontWeight: "700" }}
                    />
                    <Legend iconType="circle" formatter={(v) => <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-2">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex flex-col items-center justify-center text-center p-12 border border-dashed border-muted/20 rounded-xl">
                  <Sparkles className="h-10 w-10 text-muted/30 mb-4" />
                  <p className="text-muted font-body-default text-[10px] uppercase tracking-widest">{t('dash_no_eval_data')}</p>
                </div>
              )}
            </CardContent>
            <CornerMarks />
          </Card>

          <Card className="bg-surface/30 border border-muted/10 rounded-2xl relative overflow-hidden group backdrop-blur-md soft-shadow">
            <CardHeader className="p-6 md:p-8 border-b border-muted/5">
              <CardTitle className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-muted flex items-center gap-3">
                <Brain className="h-4 w-4 text-primary" /> {t('dash_class_summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-8">
              {[
                { label: "Class A — High Performers", count: metrics?.class_a_count ?? 0, pct: metrics?.class_a_percentage ?? 0, color: COLORS.A },
                { label: "Class B — Developing", count: metrics?.class_b_count ?? 0, pct: metrics?.class_b_percentage ?? 0, color: COLORS.B },
                { label: "Class C — Needs Improvement", count: metrics?.class_c_count ?? 0, pct: metrics?.class_c_percentage ?? 0, color: COLORS.C },
              ].map((item) => (
                <div key={item.label} className="group/item">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest group-hover/item:text-foreground transition-colors">{item.label}</span>
                    <span className="text-2xl font-headline font-bold text-foreground">{item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      className="h-full rounded-full" 
                      style={{ background: item.color }} 
                    />
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-muted/5 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-muted uppercase tracking-widest">{t('dash_pending_training')}</span>
                  <Badge className="bg-primary/5 text-primary border-primary/10 rounded-lg px-3 font-body-default text-[10px] font-bold uppercase tracking-widest">
                    {metrics?.pending_training ?? 0} NODES
                  </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-surface/30 border border-muted/10 rounded-2xl relative overflow-hidden group backdrop-blur-md soft-shadow">
          <CardHeader className="p-6 md:p-8 border-b border-muted/5">
            <CardTitle className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-muted flex items-center gap-3">
              <Cpu className="h-4 w-4 text-primary" /> {t('dash_dept_perf')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={deptChartData} margin={{ top: 20, right: 30, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" opacity={0.05} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 8, fontWeight: 700 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: 8, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName ?? label}
                    contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "16px", color: "var(--foreground)", fontSize: "10px", textTransform: "uppercase", fontWeight: "700", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                  />
                  <Legend iconType="circle" formatter={(v) => <span className="text-[9px] font-bold text-muted uppercase tracking-widest ml-2">{v}</span>} />
                  <Bar dataKey="classA" name="Class A" fill={COLORS.A} stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="classB" name="Class B" fill={COLORS.B} stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="classC" name="Class C" fill={COLORS.C} stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted font-body-default text-[10px] uppercase tracking-widest">{t('dash_no_dept_data')}</div>
            )}
          </CardContent>
        </Card>

        {trendData.length > 0 && (
          <Card className="bg-surface/30 border border-muted/10 rounded-2xl relative overflow-hidden group backdrop-blur-md soft-shadow">
            <CardHeader className="p-6 md:p-8 border-b border-muted/5">
              <CardTitle className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-muted flex items-center gap-3">
                <Activity className="h-4 w-4 text-primary" /> {t('dash_class_trends')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" opacity={0.05} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 8, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: 8, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: "16px", color: "var(--foreground)", fontSize: "10px", textTransform: "uppercase", fontWeight: "700", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                  <Legend iconType="circle" formatter={(v) => <span className="text-[9px] font-bold text-muted uppercase tracking-widest ml-2">{v}</span>} />
                  <Line type="monotone" dataKey="A" name="Class A" stroke={COLORS.A} strokeWidth={3} dot={{ r: 4, fill: COLORS.A, strokeWidth: 0 }} activeDot={{ r: 6, stroke: "var(--background)", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="B" name="Class B" stroke={COLORS.B} strokeWidth={3} dot={{ r: 4, fill: COLORS.B, strokeWidth: 0 }} activeDot={{ r: 6, stroke: "var(--background)", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="C" name="Class C" stroke={COLORS.C} strokeWidth={3} dot={{ r: 4, fill: COLORS.C, strokeWidth: 0 }} activeDot={{ r: 6, stroke: "var(--background)", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <Card className="bg-surface/30 border border-muted/10 rounded-2xl relative overflow-hidden group backdrop-blur-md soft-shadow">
            <CardHeader className="p-6 md:p-8 border-b border-muted/5">
              <CardTitle className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-muted">{t('dash_recent_activity')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-6">
              {activity.length > 0 ? activity.map((item) => (
                <div key={item.id} className="flex items-start gap-4 group/log">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover/log:scale-125 transition-transform" />
                  <div className="space-y-1">
                    <p className="text-[11px] text-foreground font-medium group-hover/log:text-primary transition-colors leading-tight">{item.description}</p>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{item.department_name} · {new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-[10px] font-body-default text-muted uppercase tracking-widest">{t('dash_no_recent_activity')}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-surface/30 border border-muted/10 rounded-2xl relative overflow-hidden group backdrop-blur-md soft-shadow">
            <CardHeader className="p-6 md:p-8 border-b border-muted/5">
              <CardTitle className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-muted">{t('dash_avg_score_by_dept')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-6">
              {deptPerf.length > 0 ? [...deptPerf].sort((a, b) => b.average_percentage - a.average_percentage).map((dept) => (
                <div key={dept.department_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest truncate pr-4">{dept.department_name}</span>
                    <span className="font-headline font-bold text-foreground text-sm">
                      {dept.average_percentage > 0 ? `${Math.round(dept.average_percentage)}%` : "—"}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-muted/5 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000 rounded-full" style={{
                      width: `${dept.average_percentage}%`,
                      background: dept.average_percentage >= 85 ? COLORS.A : dept.average_percentage >= 60 ? COLORS.B : COLORS.C
                    }} />
                  </div>
                </div>
              )) : (
                <p className="text-[10px] font-body-default text-muted uppercase tracking-widest">{t('dash_no_data')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <footer className="text-center pt-12 border-t border-muted/10">
          <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">
            {t('dash_app_footer')} · {t('dash_app_created_by')} <span className="text-primary hover:text-foreground transition-colors cursor-pointer">yasserious.com</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
