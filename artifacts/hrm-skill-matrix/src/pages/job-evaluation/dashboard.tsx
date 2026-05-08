import { motion } from "framer-motion";
import { useT } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
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
      <motion.div variants={itemVariants} className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-start">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">{t("label_mission_control")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {isAr ? "ØªØ­Ù„ÙŠÙ„Ø§Øª ØªÙ‚ÙŠÙŠÙ… Ø§Ù„ÙˆØ¸Ø§Ø¦Ù" : "JOB_EVAL_ANALYTICS"}
            </h1>
            <p className="text-secondary/40 font-medium border-s-2 border-primary/20 ps-4 text-sm">
              {isAr ? "Ø¥Ø¯Ø§Ø±Ø© ÙˆÙ…Ø±Ø§Ù‚Ø¨Ø© Ø§Ù„Ø¹Ø¯Ø§Ù„Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ© ÙˆØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ø§Ù„ÙˆØ¸ÙŠÙÙŠØ©." : "Internal equity monitoring and structural grade distribution telemetry."}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 font-headline font-black text-[10px] tracking-widest uppercase py-6 px-6 h-auto">
              <Upload className="h-4 w-4 me-2" /> IMPORT_STREAM
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 font-headline font-black text-[10px] tracking-widest uppercase py-6 px-6 h-auto">
              <FileDown className="h-4 w-4 me-2" /> EXPORT_DATA
            </Button>
            <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <Plus className="h-4 w-4 me-2" /> NEW_PROTOCOL
            </Button>
          </div>
        </div>
        <CornerMarks />
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: isAr ? "Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„ÙˆØ¸Ø§Ø¦Ù" : t("je_grade_executive"), value: "142", icon: Briefcase, trend: "+12%", up: true, color: "primary" },
          { label: isAr ? "Ù…ØªÙˆØ³Ø· Ø§Ù„Ù†Ù‚Ø§Ø·" : t("je_col_points"), value: "342", icon: BarChart3, trend: "+5.4%", up: true, color: "emerald-400" },
          { label: isAr ? "Ø¹Ø¯Ø§Ù„Ø© Ø§Ù„Ø±ÙˆØ§ØªØ¨" : t("skills_col_weight"), value: "92%", icon: TrendingUp, trend: "-2.1%", up: false, color: "amber-400" },
          { label: isAr ? "Ø§Ù„Ù…ÙˆØ¸ÙÙŠÙ†" : t("employees_title"), value: "1,284", icon: Users, trend: "+3%", up: true, color: "sky-400" },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none relative group overflow-hidden hover:border-primary/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-zinc-900 border border-zinc-800 group-hover:border-primary/30 transition-colors">
                    <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                  <Badge className={`rounded-none font-mono text-[9px] font-black border-none ${stat.up ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                    {stat.trend}
                    {stat.up ? <ArrowUpRight className="h-3 w-3 ms-1" /> : <ArrowDownRight className="h-3 w-3 ms-1" />}
                  </Badge>
                </div>
                <div className="mt-6">
                  <p className="text-3xl font-mono font-black text-white leading-none">{stat.value}</p>
                  <p className="text-[9px] font-headline font-black text-zinc-500 uppercase tracking-widest mt-2">{stat.label}</p>
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
                  <Cpu className="h-5 w-5 text-primary" />
                  {isAr ? "ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¹Ø¯Ø§Ù„Ø© Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©" : "EQUITY_REGRESSION_MATRIX"}
                </CardTitle>
                <CardDescription className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
                   {t("je_scatter_title")}
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
              <div className="mt-4 p-4 bg-white/[0.02] border border-zinc-900 font-mono text-[9px] text-zinc-600 uppercase tracking-widest flex items-center justify-between">
                 <span>// ANALYTICS_ENGINE_ACTIVE</span>
                 <span className="flex items-center gap-2 text-primary"><Activity className="h-3 w-3" /> LIVE_SYNC</span>
              </div>
            </CardContent>
            <CornerMarks />
          </Card>
        </motion.div>

        {/* Grade Distribution Pie */}
        <motion.div variants={itemVariants}>
          <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden h-full">
            <CardHeader className="p-8 border-b border-zinc-900">
              <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter">
                {isAr ? "ØªÙˆØ²ÙŠØ¹ Ø§Ù„ÙØ¦Ø§Øª" : "GRADE_ARCH_DIST"}
              </CardTitle>
              <CardDescription className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
                 {t("je_weight_title")}
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
                <Shield className="h-5 w-5 text-primary" />
                {isAr ? "Ø¢Ø®Ø± Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„ØªÙ‚ÙŠÙŠÙ…" : "RECENT_VALUATION_LOGS"}
              </CardTitle>
              <CardDescription className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
                 AUDIT_TRAIL_v9.4 // SECURITY_VERIFIED
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <Input placeholder={isAr ? "Ø¨Ø­Ø«..." : "QUERY_LOGS..."} className="ps-10 h-12 w-[300px] bg-white/5 border-zinc-800 rounded-none font-mono text-xs text-white uppercase tracking-widest focus:border-primary/50" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-zinc-800 text-start">
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase">{isAr ? "Ø§Ù„Ù…Ø³Ù…Ù‰ Ø§Ù„ÙˆØ¸ÙŠÙÙŠ" : t("field_name")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase">{isAr ? "Ø§Ù„Ù†Ù‚Ø§Ø·" : t("je_col_points")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase">{isAr ? "Ø§Ù„Ø¯Ø±Ø¬Ø©" : t("je_guide_title")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase">{isAr ? "Ø§Ù„Ø­Ø§Ù„Ø©" : t("field_status")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase text-end">{isAr ? "Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª" : t("common_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {[
                    { title: "Senior Software Engineer", points: 342, grade: "G5", status: "Approved" },
                    { title: "Project Manager", points: 580, grade: "G7", status: "Approved" },
                    { title: "HR Business Partner", points: 420, grade: "G6", status: "Pending" },
                    { title: "Admin Assistant", points: 140, grade: "G1", status: "Draft" },
                  ].map((job, i) => (
                    <tr key={i} className="group hover:bg-white/2 transition-colors">
                      <td className="px-8 py-5">
                         <div className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover:text-primary transition-colors">{job.title}</div>
                         <div className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest mt-1">UUID::VAL-{Math.random().toString(36).substring(7).toUpperCase()}</div>
                      </td>
                      <td className="px-8 py-5 font-mono text-sm font-black text-zinc-400">{job.points}</td>
                      <td className="px-8 py-5">
                         <div className="h-8 w-12 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono font-black text-xs">
                           {job.grade}
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black border-current/20 px-3 py-1 uppercase tracking-widest ${
                          job.status === "Approved" ? "bg-emerald-500/10 text-emerald-500" :
                          job.status === "Pending" ? "bg-amber-500/10 text-amber-500" :
                          "bg-zinc-800 text-zinc-500"
                        }`}>
                          {job.status === "Approved" ? t("status_active") : job.status === "Pending" ? t("status_draft") : t("status_draft")}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-end">
                        <Button variant="ghost" className="rounded-none border border-zinc-800 hover:border-primary/50 text-[9px] font-headline font-black tracking-widest uppercase h-auto py-2 px-4 group/btn">
                           ACCESS <ExternalLink className="ms-2 h-3 w-3" />
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
               <p className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em]">SYSTEM_CORE_READY</p>
               <p className="text-[10px] font-mono text-zinc-600 leading-relaxed uppercase tracking-widest">
                  ENCRYPTED_STREAM_v9.2 // ANALYTICS_ENGINE_OPTIMIZED // MULTI_CLUSTER_SYNC_OK
               </p>
            </div>
            <div className="flex items-center gap-6 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
               <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
                  <span>CORE_UPTIME::99.9%</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-primary rounded-full" />
                  <span>LATENCY::12MS</span>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
