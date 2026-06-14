import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMetrics } from "@modules/dashboard/lib/api";
import { useT } from "@modules/dashboard/i18n";
import { motion } from "framer-motion";
import { TrendingUp, Users, Layout, Zap } from "lucide-react";
import { cn } from "@shared/utils/cn";
import { Skeleton } from "@shared/components/ui/skeleton";

const CLR = { A: "#10B981", B: "#F59E0B", C: "#EF4444" };

function KpiCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-4xl border border-zinc-100 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", color || "bg-zinc-50 text-zinc-600 group-hover:bg-zinc-100")}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-bold text-zinc-900 font-comfortaa">{value}</p>
        </div>
      </div>
      {sub && <p className="text-xs text-zinc-500 font-medium">{sub}</p>}
    </motion.div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-zinc-900 font-comfortaa tracking-tight mb-2">{title}</h2>
      <p className="text-sm text-zinc-500 max-w-2xl">{desc}</p>
    </div>
  );
}

export { SectionHeader };

function GaugeChart({ pct, label }: { pct: number; label: string }) {
  const r = 60;
  const cx = 80, cy = 80;
  const angle = -180 + (pct / 100) * 180;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (a1: number, a2: number, rr: number) => {
    const x1 = cx + rr * Math.cos(toRad(a1));
    const y1 = cy + rr * Math.sin(toRad(a1));
    const x2 = cx + rr * Math.cos(toRad(a2));
    const y2 = cy + rr * Math.sin(toRad(a2));
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${rr} ${rr} 0 ${large} 1 ${x2} ${y2}`;
  };
  const needleX = cx + (r - 10) * Math.cos(toRad(angle));
  const needleY = cy + (r - 10) * Math.sin(toRad(angle));
  const color = pct >= 85 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <svg viewBox="0 0 160 100" className="w-full" style={{ maxHeight: 140 }}>
      <path d={arcPath(-180, 0, r)} fill="none" stroke="#F4F4F5" strokeWidth="12" strokeLinecap="round" />
      <path d={arcPath(-180, angle, r)} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={3} fill="#18181B" />
      <text x={cx} y={cy + 18} textAnchor="middle" fill={color} fontSize="16" fontWeight="bold" className="font-comfortaa">{pct}%</text>
      <text x={cx} y={cy + 32} textAnchor="middle" fill="#71717A" fontSize="8" fontWeight="500">{label}</text>
    </svg>
  );
}

export default function OverviewSection() {
  const t = useT();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 rounded-xl bg-zinc-200/50" />
          <Skeleton className="h-4 w-96 rounded-lg bg-zinc-100/50 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-4xl bg-zinc-200/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[440px] rounded-4xl bg-zinc-200/50" />
          <Skeleton className="h-[440px] rounded-4xl bg-zinc-200/50" />
          <Skeleton className="h-[440px] rounded-4xl bg-zinc-200/50" />
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 rounded-4xl border border-red-100 bg-red-50 text-red-700 font-sans">
        <p className="font-bold">Error loading dashboard metrics</p>
        <p className="text-sm mt-1">{error instanceof Error ? error.message : "Please check your network connection."}</p>
      </div>
    );
  }

  const classDonut = [
    { name: "Class A", value: metrics.class_a_count, pct: metrics.class_a_percentage },
    { name: "Class B", value: metrics.class_b_count, pct: metrics.class_b_percentage },
    { name: "Class C", value: metrics.class_c_count, pct: metrics.class_c_percentage },
  ];

  const campaignBar = [
    { status: t('dash_chart_campaign_status').split(" ")[0], count: metrics.active_campaigns },
    { status: t('dash_completed'), count: metrics.completed_campaigns },
  ];

  return (
    <section>
      <SectionHeader title={t('dash_section_overview_title')} desc={t('dash_section_overview_desc')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KpiCard label={t('dash_kpi_total_employees')} value={metrics.total_employees} sub={t('dash_kpi_active_staff')} icon={Users} color="bg-zinc-900 text-white" />
        <KpiCard label={t('dash_kpi_departments')} value={metrics.total_departments} sub={t('dash_kpi_wood_units')} icon={Layout} />
        <KpiCard label={t('dash_kpi_skills_tracked')} value={metrics.total_skills} sub={t('dash_kpi_across_all_depts')} icon={Zap} />
        <KpiCard label={t('dash_kpi_avg_score')} value={`${metrics.average_skill_percentage}%`} sub={t('dash_kpi_company_wide')} icon={TrendingUp} color="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Distribution */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_perf_dist')}</h3>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest mt-1">{t('dash_chart_perf_dist_desc')}</p>
          </div>
          
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={classDonut} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                  {classDonut.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? CLR.A : i === 1 ? CLR.B : CLR.C} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, n: string) => [`${v} ${t('dash_employees')}`, n]}
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #F4F4F5", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "600" }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(v) => <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {classDonut.map((c, i) => (
              <div key={i} className="text-center p-3 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                <div className="text-xl font-bold font-comfortaa" style={{ color: i === 0 ? CLR.A : i === 1 ? CLR.B : CLR.C }}>{c.pct}%</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{c.name}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Average Skill Score Gauge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm flex flex-col items-center justify-center"
        >
          <div className="w-full mb-8">
            <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_avg_skill_score')}</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_avg_skill_score_desc')}</p>
          </div>
          
          <div className="w-full max-w-[240px]">
            <GaugeChart pct={metrics.average_skill_percentage} label={t('dash_chart_company_avg')} />
          </div>

          <div className="w-full grid grid-cols-3 gap-3 mt-8">
            {[
              { label: "Class A", val: `≥85%`, color: CLR.A },
              { label: "Class B", val: `60–84%`, color: CLR.B },
              { label: "Class C", val: `<60%`, color: CLR.C },
            ].map((ti, i) => (
              <div key={i} className="rounded-2xl p-3 bg-zinc-50 border border-zinc-100 text-center">
                <div className="text-xs font-bold font-comfortaa" style={{ color: ti.color }}>{ti.val}</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{ti.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Campaign Status Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-zinc-100 rounded-4xl p-8 shadow-sm"
        >
          <div className="mb-6">
            <h3 className="font-bold text-lg text-zinc-900 font-comfortaa">{t('dash_chart_campaign_status')}</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('dash_chart_campaign_status_desc')}</p>
          </div>

          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignBar} barSize={40} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A1A1AA", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#FAFAFA' }}
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #F4F4F5", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", fontSize: "12px", fontWeight: "600" }} 
                />
                <Bar dataKey="count" name="Campaigns" radius={[8, 8, 0, 0]}>
                  {campaignBar.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#18181B" : "#10B981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
            {[
              { label: t('dash_pending_training'), val: metrics.pending_training, color: "#EF4444" },
              { label: "In Progress", val: (metrics as any).in_progress_training || 0, color: "#F59E0B" },
              { label: t('dash_completed'), val: (metrics as any).completed_training || 0, color: "#10B981" },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-tight">{s.label}</span>
                </div>
                <span className="text-sm font-bold text-zinc-900 font-comfortaa">{s.val}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
