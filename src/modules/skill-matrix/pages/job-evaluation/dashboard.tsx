import { motion } from "framer-motion";
import { useT } from "@modules/skill-matrix/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { 
  Plus, 
  FileDown, 
  Upload, 
  Filter, 
  BarChart3, 
  Users, 
  Briefcase, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Activity,
  Cpu,
  Shield,
  Terminal,
  ExternalLink
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Input } from "@shared/components/ui/input";
import { Badge } from "@shared/components/ui/badge";

// Removed Industrial CornerMarks as per ADR-001

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// Mock data for initial UI
const scatterData = [
  { points: 120, salary: 3000, name: "Janitor" },
  { points: 180, salary: 4500, name: "Junior Tech" },
  { points: 280, salary: 7200, name: "Supervisor" },
  { points: 450, salary: 12000, name: "Dept Manager" },
  { points: 750, salary: 25000, name: "GM" },
  { points: 950, salary: 45000, name: "CEO" },
  { points: 310, salary: 9000, name: "Senior Eng" },
  { points: 220, salary: 5500, name: "Admin" },
];

const gradeDist = [
  { name: "entry", value: 45 },
  { name: "mid", value: 30 },
  { name: "senior", value: 15 },
  { name: "executive", value: 10 },
];

const COLORS = ["#18181B", "#10B981", "#F59E0B", "#EF4444"];

export default function JobEvaluationDashboard() {
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";

  return (
    <motion.div 
      className="space-y-10 pb-20 font-sans text-foreground selection:bg-primary/20 selection:text-primary"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Editorial Style */}
      <motion.div 
        variants={itemVariants} 
        className="relative p-12 bg-white/40 border border-muted/20 rounded-4xl overflow-hidden soft-shadow backdrop-blur-md"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(64%_0.13_28/0.05)_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center lg:text-start flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="font-headline font-bold tracking-widest text-[10px] text-primary uppercase opacity-60">{t("label_mission_control")}</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold text-foreground tracking-tight leading-[0.9]">{t("je_analytics_title")}</h1>
            <p className="text-muted-foreground font-medium border-s-4 border-primary/10 ps-8 text-lg max-w-2xl leading-relaxed">{t("je_analytics_subtitle")}</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="outline" className="rounded-2xl border-muted/20 bg-surface/50 hover:bg-background font-headline font-bold text-[11px] tracking-wide uppercase h-14 px-8 shadow-sm">
              <Upload className="h-4 w-4 me-3 text-primary" />{t("action_import_stream")}
            </Button>
            <Button variant="outline" className="rounded-2xl border-muted/20 bg-surface/50 hover:bg-background font-headline font-bold text-[11px] tracking-wide uppercase h-14 px-8 shadow-sm">
              <FileDown className="h-4 w-4 me-3 text-primary" />{t("action_export_data")}
            </Button>
            <Button className="rounded-2xl bg-primary text-primary-foreground font-headline font-bold text-[11px] tracking-wide uppercase h-14 px-10 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
              <Plus className="h-4 w-4 me-3" />{t("action_new_protocol")}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t("je_total_jobs"), value: "142", icon: Briefcase, trend: "+12%", up: true },
          { label: t("je_col_points"), value: "342", icon: BarChart3, trend: "+5.4%", up: true },
          { label: t("je_equity_analysis"), value: "92%", icon: TrendingUp, trend: "-2.1%", up: false },
          { label: t("nav_employees"), value: "1,284", icon: Users, trend: "+3%", up: true },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-surface border border-muted/10 rounded-[2.5rem] transition-all duration-500 shadow-sm hover:shadow-xl hover:border-primary/20 group overflow-hidden">
              <CardContent className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                    <stat.icon className="h-7 w-7" />
                  </div>
                  <Badge variant="outline" className={`rounded-full font-bold text-[10px] tracking-widest border-muted/10 px-4 py-1.5 shadow-sm ${stat.up ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                    {stat.trend}
                    {stat.up ? <ArrowUpRight className="h-3 w-3 ms-2" /> : <ArrowDownRight className="h-3 w-3 ms-2" />}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-5xl font-headline font-bold text-foreground tracking-tighter leading-none">{stat.value}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-5 opacity-40">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Equity Scatter Plot */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-surface/40 border border-muted/10 rounded-4xl relative overflow-hidden shadow-sm backdrop-blur-sm">
            <CardHeader className="p-10 border-b border-muted/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline font-bold text-2xl text-foreground tracking-tight flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                  {t("je_equity_analysis")}
                </CardTitle>
                <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3 opacity-40 ps-12">{t("je_scatter_title")}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-muted/10 hover:bg-primary/5 hover:border-primary/30 transition-all">
                <Filter className="h-5 w-5 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="h-[450px] p-10">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(22% 0.02 50)" opacity={0.05} vertical={false} />
                  <XAxis type="number" dataKey="points" name={t("je_col_points")} unit="pts" stroke="oklch(22% 0.02 50 / 0.4)" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} />
                  <YAxis type="number" dataKey="salary" name={t("je_col_salary_mid")} unit="$" stroke="oklch(22% 0.02 50 / 0.4)" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} />
                  <ZAxis type="category" dataKey="name" name={t("field_name")} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} 
                  />
                  <Scatter name={t("je_scatter_jobs")} data={scatterData} fill="var(--primary)">
                     {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'oklch(50% 0.018 50)'} opacity={0.6} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl font-bold text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                   <span>{t("log_analytics_active")}</span>
                 </div>
                 <span className="flex items-center gap-2 text-primary">
                   <Activity className="h-3.5 w-3.5" />
                   {t("log_live_sync")}
                 </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grade Distribution Pie */}
        <motion.div variants={itemVariants}>
          <Card className="bg-surface/40 border border-muted/10 rounded-4xl relative overflow-hidden h-full shadow-sm backdrop-blur-sm">
            <CardHeader className="p-10 border-b border-muted/5">
              <CardTitle className="font-headline font-bold text-2xl text-foreground tracking-tight">{t("je_grade_dist")}</CardTitle>
              <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3 opacity-40">{t("je_weight_title")}</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex flex-col items-center justify-center">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDist}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={12}
                      dataKey="value"
                      stroke="none"
                    >
                      {gradeDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "oklch(64% 0.13 28)" : index === 1 ? "oklch(58% 0.16 145)" : index === 2 ? "oklch(70% 0.15 15)" : "oklch(50% 0.018 50)"} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)', fontSize: '10px', fontWeight: '700', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-12 space-y-6">
                {gradeDist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: i === 0 ? "oklch(64% 0.13 28)" : i === 1 ? "oklch(58% 0.16 145)" : i === 2 ? "oklch(70% 0.15 15)" : "oklch(50% 0.018 50)" }} />
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{t(("je_pie_" + item.name) as any)}</span>
                    </div>
                    <span className="text-sm font-headline font-bold text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Evaluations Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-surface/40 border border-muted/10 rounded-4xl relative overflow-hidden shadow-sm backdrop-blur-sm">
          <CardHeader className="p-10 border-b border-muted/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline font-bold text-2xl text-foreground tracking-tight">{t("je_recent_logs")}</CardTitle>
                <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-40">{t("log_audit_trail")}</CardDescription>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
              <Input placeholder={t("je_query_logs")} className="ps-12 h-14 w-full lg:w-[350px] bg-background/50 border-muted/20 rounded-2xl font-bold text-[11px] text-foreground uppercase tracking-widest focus:border-primary/50 focus:ring-0 shadow-sm" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/5 border-b border-muted/5">
                    <th className="px-10 py-6 font-bold text-[10px] tracking-widest text-muted-foreground uppercase text-start">{t("je_col_job_title")}</th>
                    <th className="px-10 py-6 font-bold text-[10px] tracking-widest text-muted-foreground uppercase text-start">{t("je_col_points")}</th>
                    <th className="px-10 py-6 font-bold text-[10px] tracking-widest text-muted-foreground uppercase text-start">{t("je_col_grade")}</th>
                    <th className="px-10 py-6 font-bold text-[10px] tracking-widest text-muted-foreground uppercase text-start">{t("field_status")}</th>
                    <th className="px-10 py-6 font-bold text-[10px] tracking-widest text-muted-foreground uppercase text-end">{t("je_col_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/5">
                  {[
                    { title: "Senior Software Engineer", points: 342, grade: "G5", status: "Approved" },
                    { title: "Project Manager", points: 580, grade: "G7", status: "Approved" },
                    { title: "HR Business Partner", points: 420, grade: "G6", status: "Pending" },
                    { title: "Admin Assistant", points: 140, grade: "G1", status: "Draft" },
                  ].map((job, i) => (
                    <tr key={i} className="group hover:bg-primary/[0.02] transition-all duration-300">
                      <td className="px-10 py-8">
                         <div className="font-headline font-bold text-base text-foreground uppercase tracking-tight group-hover:text-primary transition-colors duration-300">{job.title}</div>
                         <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
                           <span className="text-primary/30">UUID ::</span>
                           <span>VAL-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                         </div>
                      </td>
                      <td className="px-10 py-8 font-bold text-sm text-muted-foreground group-hover:text-foreground transition-colors tabular-nums">{job.points}</td>
                      <td className="px-10 py-8">
                         <div className="h-12 w-16 flex items-center justify-center bg-background/50 border border-muted/10 text-primary font-bold text-xs rounded-2xl group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shadow-sm">
                           {job.grade}
                         </div>
                      </td>
                      <td className="px-10 py-8">
                        <Badge variant="outline" className={`rounded-full font-bold text-[9px] tracking-widest px-4 py-1.5 uppercase shadow-sm ${
                          job.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" :
                          job.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200/50" :
                          "bg-muted/5 text-muted-foreground border-muted-foreground/10"
                        }`}>{job.status === "Approved" ? t("status_active") : job.status === "Pending" ? t("status_draft") : t("status_draft")}
                        </Badge>
                      </td>
                      <td className="px-10 py-8 text-end">
                        <Button variant="ghost" className="rounded-2xl border border-muted/10 hover:border-primary/40 text-[10px] font-bold tracking-widest uppercase h-12 px-8 group/btn transition-all duration-300 shadow-sm">
                          {t("action_access_details")} 
                          <ExternalLink className="ms-3 h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform text-primary" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Telemetry Footer */}
      <div className="p-12 bg-primary/5 border border-primary/10 rounded-[2.5rem] relative overflow-hidden group shadow-sm">
         <Terminal className="absolute -right-10 -top-10 h-48 w-48 text-primary opacity-5 group-hover:opacity-10 transition-all duration-1000 rotate-12" />
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                  <p className="font-headline font-bold text-base text-primary uppercase tracking-widest">{t("log_system_core_ready")}</p>
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] max-w-xl leading-relaxed opacity-60">{t("log_encrypted_stream")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-10 font-bold text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
               <div className="flex items-center gap-4 bg-background/50 px-6 py-3 rounded-2xl border border-muted/10 shadow-sm">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>{t("log_core_uptime")} :: 99.9%</span>
               </div>
               <div className="flex items-center gap-4 bg-background/50 px-6 py-3 rounded-2xl border border-muted/10 shadow-sm">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span>{t("log_latency")} :: 12ms</span>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
