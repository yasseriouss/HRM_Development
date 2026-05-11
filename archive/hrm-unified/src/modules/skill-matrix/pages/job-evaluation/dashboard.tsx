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

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
  </>
);

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

const COLORS = ["#D4AF37", "#A0A0A0", "#4A4A4A", "#1A1A1A"];

export default function JobEvaluationDashboard() {
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";

  return (
    <motion.div 
      className="space-y-10 pb-20 font-sans text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Tactical Style */}
      <motion.div variants={itemVariants} className="relative p-12 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-start">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <Activity className="h-4 w-4 text-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              <span className="font-headline font-black tracking-[0.5em] text-[10px] text-primary/60 uppercase">{t("label_mission_control")}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-white uppercase leading-none text-shimmer">{t("je_analytics_title")}
            </h1>
            <p className="text-zinc-500 font-medium border-s-2 border-primary/20 ps-6 text-[11px] uppercase tracking-widest max-w-xl leading-relaxed">{t("je_analytics_subtitle")}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 font-headline font-black text-[10px] tracking-widest uppercase py-6 px-6 h-auto">
              <Upload className="h-4 w-4 me-2" />{t("action_import_stream")}
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 font-headline font-black text-[10px] tracking-widest uppercase py-6 px-6 h-auto">
              <FileDown className="h-4 w-4 me-2" />{t("action_export_data")}
            </Button>
            <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <Plus className="h-4 w-4 me-2" />{t("action_new_protocol")}
            </Button>
          </div>
        </div>
        <CornerMarks />
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[
          { label: t("je_total_jobs"), value: "142", icon: Briefcase, trend: "+12%", up: true, color: "primary" },
          { label: t("je_col_points"), value: "342", icon: BarChart3, trend: "+5.4%", up: true, color: "emerald-400" },
          { label: t("je_equity_analysis"), value: "92%", icon: TrendingUp, trend: "-2.1%", up: false, color: "amber-400" },
          { label: t("nav_employees"), value: "1,284", icon: Users, trend: "+3%", up: true, color: "sky-400" },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-[#0D0D0D] border border-zinc-900 rounded-none relative group overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 group-hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                    <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                    <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  </div>
                  <Badge variant="outline" className={`rounded-none font-mono text-[8px] font-black tracking-widest border-zinc-800 px-2 py-1 ${stat.up ? "text-emerald-500 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "text-rose-500 bg-rose-500/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]"}`}>
                    {stat.trend}
                    {stat.up ? <ArrowUpRight className="h-3 w-3 ms-1" /> : <ArrowDownRight className="h-3 w-3 ms-1" />}
                  </Badge>
                </div>
                <div className="mt-8">
                  <p className="text-4xl font-mono font-black text-white leading-none tracking-tighter">{stat.value}</p>
                  <p className="text-[9px] font-headline font-black text-zinc-600 uppercase tracking-[0.3em] mt-4 border-l-2 border-primary/20 ps-3">{stat.label}</p>
                </div>
              </CardContent>
              <CornerMarks />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Equity Scatter Plot */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden">
            <CardHeader className="p-8 border-b border-zinc-900 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-primary" />{t("je_equity_analysis")}
                </CardTitle>
                <CardDescription className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">{t("je_scatter_title")}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-zinc-800 hover:bg-white/5"><Filter className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="h-[400px] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                  <XAxis type="number" dataKey="points" name={t("je_col_points")} unit="pts" stroke="#444" fontSize={10} fontStyle="italic" />
                  <YAxis type="number" dataKey="salary" name={t("je_col_salary_mid")} unit="$" stroke="#444" fontSize={10} />
                  <ZAxis type="category" dataKey="name" name={t("field_name")} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #D4AF37', borderRadius: '0px', color: '#FFF', fontSize: '10px', fontFamily: 'monospace' }} 
                  />
                  <Scatter name={t("je_scatter_jobs")} data={scatterData} fill="#D4AF37">
                     {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : '#555'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-white/2 border border-zinc-900 font-mono text-[9px] text-zinc-600 uppercase tracking-widest flex items-center justify-between">
                 <span>{t("log_analytics_active")}</span>
                 <span className="flex items-center gap-2 text-primary"><Activity className="h-3 w-3" />{t("log_live_sync")}</span>
              </div>
            </CardContent>
            <CornerMarks />
          </Card>
        </motion.div>

        {/* Grade Distribution Pie */}
        <motion.div variants={itemVariants}>
          <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden h-full">
            <CardHeader className="p-8 border-b border-zinc-900">
              <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter">{t("je_grade_dist")}
              </CardTitle>
              <CardDescription className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">{t("je_weight_title")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center justify-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDist}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {gradeDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #D4AF37', borderRadius: '0px', color: '#FFF', fontSize: '10px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-8 space-y-3">
                {gradeDist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-[10px] font-headline font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">{t(("je_pie_" + item.name) as any)}</span>
                    </div>
                    <span className="font-mono text-xs font-black text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CornerMarks />
          </Card>
        </motion.div>
      </div>

      {/* Recent Evaluations Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden">
          <CardHeader className="p-8 border-b border-zinc-900 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />{t("je_recent_logs")}
              </CardTitle>
              <CardDescription className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">{t("log_audit_trail")}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <Input placeholder={t("je_query_logs")} className="ps-10 h-12 w-[300px] bg-white/5 border-zinc-800 rounded-none font-mono text-xs text-white uppercase tracking-widest focus:border-primary/50" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto border border-zinc-900 bg-[#0A0A0A]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-zinc-900 text-start">
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">{t("je_col_job_title")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">{t("je_col_points")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">{t("je_col_grade")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-start">{t("field_status")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-[0.3em] text-zinc-500 uppercase text-end">{t("je_col_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {[
                    { title: "Senior Software Engineer", points: 342, grade: "G5", status: "Approved" },
                    { title: "Project Manager", points: 580, grade: "G7", status: "Approved" },
                    { title: "HR Business Partner", points: 420, grade: "G6", status: "Pending" },
                    { title: "Admin Assistant", points: 140, grade: "G1", status: "Draft" },
                  ].map((job, i) => (
                    <tr key={i} className="group hover:bg-white/2 border-l-2 border-transparent hover:border-primary transition-all duration-300">
                      <td className="px-8 py-5">
                         <div className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover:text-primary transition-colors duration-300">{job.title}</div>
                         <div className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                           <span className="text-primary/40 text-[7px]">UUID::</span>
                           <span>VAL-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-sm font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">{job.points}</td>
                      <td className="px-8 py-5">
                         <div className="h-10 w-14 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-primary font-mono font-black text-xs shadow-inner group-hover:border-primary/30 transition-all">
                           {job.grade}
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className={`rounded-none font-mono text-[8px] font-black tracking-[0.2em] px-3 py-1 uppercase whitespace-nowrap ${
                          job.status === "Approved" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" :
                          job.status === "Pending" ? "bg-amber-500/5 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" :
                          "bg-zinc-900/50 text-zinc-600 border-zinc-800"
                        }`}>{job.status === "Approved" ? t("status_active") : job.status === "Pending" ? t("status_draft") : t("status_draft")}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-end">
                        <Button variant="ghost" className="rounded-none border border-zinc-800 hover:border-primary/50 text-[9px] font-headline font-black tracking-[0.3em] uppercase h-auto py-3 px-5 group/btn transition-all duration-300">{t("action_access_details")} <ExternalLink className="ms-3 h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CornerMarks />
        </Card>
      </motion.div>

      {/* Telemetry Footer */}
      <div className="p-10 border-2 border-primary/20 bg-primary/3 relative overflow-hidden group">
         <Terminal className="absolute -right-6 -top-6 h-32 w-32 text-primary opacity-5 group-hover:opacity-10 transition-all duration-1000" />
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
               <p className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em]">{t("log_system_core_ready")}</p>
               <p className="text-[10px] font-mono text-zinc-600 leading-relaxed uppercase tracking-widest">{t("log_encrypted_stream")}
               </p>
            </div>
            <div className="flex items-center gap-6 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
                  <span>{t("log_core_uptime")}</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-primary rounded-full" />
                  <span>{t("log_latency")}</span>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
