import { motion } from "framer-motion";
import { useT } from "@modules/skill-matrix/i18n";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { 
  Plus, 
  FileDown, 
  Target,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Briefcase,
  Users,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Zap,
  ChevronRight
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
import { cn } from "@shared/utils/cn";

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
  { name: "Entry", value: 45 },
  { name: "Mid", value: 30 },
  { name: "Senior", value: 15 },
  { name: "Executive", value: 10 },
];

const COLORS = ["oklch(64% 0.13 28)", "oklch(50% 0.018 50)", "oklch(40% 0.018 50)", "oklch(30% 0.018 50)"];

export default function JobEvaluationDashboard() {
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 pb-32 selection:bg-primary/30 selection:text-foreground">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                 <BarChart3 className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted">{t("label_mission_control")}</span>
           </div>
           <h1 className="text-6xl lg:text-7xl font-bold font-comfortaa text-foreground tracking-tighter leading-none uppercase">
              {t("je_analytics_title")}
           </h1>
           <p className="text-muted font-medium text-lg max-w-2xl leading-relaxed">{t("je_analytics_subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" className="rounded-full border-muted/10 bg-background text-foreground font-bold text-[10px] tracking-widest uppercase h-16 px-10 shadow-sm hover:shadow-xl transition-all">
            <FileDown className="h-4 w-4 me-3" /> EXPORT ANALYTICS
          </Button>
          <Button className="rounded-full bg-primary text-primary-foreground font-bold text-[10px] tracking-widest uppercase h-16 px-10 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            <Plus className="h-4 w-4 me-3" /> {t("je_new_evaluation")}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t("je_total_jobs"), value: "124", icon: Briefcase, color: "text-foreground", bg: "bg-muted/5" },
          { label: t("je_equity_index"), value: "92%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50/50" },
          { label: "Grading Accuracy", value: "98.4", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50/50" },
          { label: "Active Nodes", value: "852", icon: Users, color: "text-muted", bg: "bg-muted/5" },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group relative">
               <div className={cn("absolute top-0 right-0 p-8 opacity-[0.03] scale-150 transition-transform duration-700 group-hover:scale-125", m.color)}>
                  <m.icon className="h-24 w-24" />
               </div>
               <div className="space-y-4 relative z-10">
                  <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{m.label}</p>
                  <div className="flex items-end justify-between">
                     <h3 className={cn("text-5xl font-bold font-comfortaa", m.color)}>{m.value}</h3>
                     <div className={cn("p-3 rounded-2xl", m.bg)}>
                        <m.icon className={cn("h-5 w-5", m.color)} />
                     </div>
                  </div>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Scatter Chart: Salary vs Points */}
        <Card className="lg:col-span-8 p-12 shadow-sm hover:shadow-xl transition-all duration-500">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
              <div className="space-y-3">
                 <h2 className="text-3xl font-bold font-comfortaa tracking-tighter text-foreground uppercase">Equity Correlation</h2>
                 <p className="text-xs text-muted font-bold uppercase tracking-widest">Points to Salary Distribution Matrix</p>
              </div>
              <Badge className="rounded-full bg-primary text-primary-foreground border-none text-[9px] font-bold tracking-widest uppercase px-6 py-2">
                 R² = 0.942
              </Badge>
           </div>
           
           <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(90% 0.014 70)" />
                    <XAxis 
                      type="number" 
                      dataKey="points" 
                      name="Points" 
                      stroke="oklch(50% 0.018 50)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `${v}pt`}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="salary" 
                      name="Salary" 
                      stroke="oklch(50% 0.018 50)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(v) => `$${v}`}
                    />
                    <ZAxis type="category" dataKey="name" name="Job" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface text-foreground p-6 rounded-2xl shadow-2xl border border-muted/10">
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">{payload[2].value}</p>
                              <p className="text-xl font-bold font-comfortaa mb-1">${payload[1].value}</p>
                              <p className="text-xs font-bold text-muted">{payload[0].value} POINTS</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Jobs" data={scatterData} fill="oklch(64% 0.13 28)">
                       {scatterData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Scatter>
                 </ScatterChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Pie Chart: Grade Distribution */}
        <Card className="lg:col-span-4 bg-primary text-primary-foreground border-none shadow-2xl shadow-primary/10 relative overflow-hidden group">
           <div className="relative z-10 space-y-12">
              <div className="space-y-3">
                 <h2 className="text-3xl font-bold font-comfortaa tracking-tighter text-inherit uppercase">{t("je_grade_dist")}</h2>
                 <p className="text-xs text-inherit/40 font-bold uppercase tracking-widest">Global Structural Hierarchy</p>
              </div>

              <div className="h-[250px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={gradeDist}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                       >
                          {gradeDist.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? 'currentColor' : `rgba(255,255,255,${0.4 - (index * 0.1)})`} stroke="none" />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold font-comfortaa text-inherit">100%</span>
                    <span className="text-[8px] font-bold text-inherit/40 uppercase tracking-widest">TOTAL</span>
                 </div>
              </div>

              <div className="space-y-4">
                 {gradeDist.map((g, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full" style={{ backgroundColor: i === 0 ? 'currentColor' : `rgba(255,255,255,${0.4 - (i * 0.1)})` }} />
                         <span className="text-[10px] font-bold text-inherit/60 uppercase tracking-widest">{g.name}</span>
                      </div>
                      <span className="text-sm font-bold font-comfortaa text-inherit">{g.value}%</span>
                   </div>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      {/* Control Bar & Search */}
      <Card className="shadow-sm overflow-hidden border-muted/10">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
           <div className="flex-1 w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search job titles or grades..."
                className="ps-14 h-16 bg-muted/5 border-transparent focus-visible:ring-primary/20"
              />
           </div>
           <Button variant="outline" className="h-16 rounded-3xl border-muted/10 px-8 gap-3 text-muted hover:text-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">ADVANCED FILTERS</span>
           </Button>
        </CardContent>
      </Card>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
         <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer group">
            <Card className="p-12 shadow-sm group-hover:shadow-2xl group-hover:shadow-muted/10 transition-all duration-500 relative overflow-hidden border-muted/10">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-20 transition-all">
                  <Cpu className="h-16 w-16 text-foreground" />
               </div>
               <div className="space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-muted/5 flex items-center justify-center text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                     <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                     <h4 className="text-3xl font-bold font-comfortaa text-foreground tracking-tighter uppercase">Review Methodologies</h4>
                     <p className="text-xs text-muted font-bold uppercase tracking-widest mt-2 leading-relaxed">Update points allocation and scoring criteria</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted group-hover:text-foreground transition-colors">
                     <span className="text-[10px] font-bold uppercase tracking-widest">OPEN CONFIGURE</span>
                     <ChevronRight className="h-4 w-4" />
                  </div>
               </div>
            </Card>
         </motion.div>

         <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer group">
            <Card className="bg-foreground text-background border-none p-12 shadow-2xl shadow-muted/10 group-hover:scale-[1.03] transition-all duration-500 relative overflow-hidden">
               <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-background/10 flex items-center justify-center text-background">
                     <Plus className="h-8 w-8" />
                  </div>
                  <div>
                     <h4 className="text-3xl font-bold font-comfortaa text-background tracking-tighter uppercase">Benchmarking</h4>
                     <p className="text-xs text-background/40 font-bold uppercase tracking-widest mt-2 leading-relaxed">Compare internal data with market standards</p>
                  </div>
                  <div className="flex items-center gap-2 text-background/20 group-hover:text-background transition-colors">
                     <span className="text-[10px] font-bold uppercase tracking-widest">LAUNCH ENGINE</span>
                     <ArrowUpRight className="h-4 w-4" />
                  </div>
               </div>
            </Card>
         </motion.div>
      </div>

      {/* Security Footer */}
      <div className="pt-20 flex flex-col items-center gap-10">
        <div className="flex items-center gap-6 w-full max-w-md">
          <div className="h-px flex-1 bg-muted/10" />
          <div className="flex items-center gap-4 px-10 py-4 bg-muted/5 border border-muted/10 text-[10px] text-muted font-bold tracking-[0.5em] uppercase rounded-full">
            <ShieldCheck className="h-4 w-4 text-foreground" />
            SECURED NODE
          </div>
          <div className="h-px flex-1 bg-muted/10" />
        </div>
      </div>
    </div>
  );
}
