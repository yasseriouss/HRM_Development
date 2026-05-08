import { motion } from "framer-motion";
import { useT } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Settings2,
  TrendingUp,
  BrainCircuit,
  Scaling,
  Activity,
  Terminal,
  Cpu,
  Target
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";

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
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

const categoryData = [
  { name: "Skills", value: 350, color: "#D4AF37" },
  { name: "Responsibility", value: 350, color: "#A0A0A0" },
  { name: "Effort", value: 200, color: "#4A4A4A" },
  { name: "Conditions", value: 100, color: "#1A1A1A" }
];

const gradeData = [
  { grade: "G1", min: 100, max: 149, category: "Worker" },
  { grade: "G2", min: 150, max: 199, category: "Junior Tech" },
  { grade: "G3", min: 200, max: 259, category: "Mid Tech" },
  { grade: "G4", min: 260, max: 329, category: "Supervisor" },
  { grade: "G5", min: 330, max: 409, category: "Senior" },
  { grade: "G6", min: 410, max: 509, category: "Section Head" },
  { grade: "G7", min: 510, max: 629, category: "Manager" },
  { grade: "G8", min: 630, max: 769, category: "Head of Function" },
  { grade: "G9", min: 770, max: 929, category: "General Manager" },
  { grade: "G10", min: 930, max: 1000, category: "Executive" }
];

export default function JobEvaluationGuide() {
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";

  return (
    <motion.div 
      className="space-y-10 pb-24 font-sans text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section - Industrial Focus */}
      <motion.div variants={itemVariants} className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="p-4 bg-primary/10 border border-primary/20 shrink-0">
            <Scaling className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <Activity className="h-4 w-4 text-primary animate-pulse" />
               <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">METHODOLOGY_CORE_DOCUMENTATION</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {isAr ? "منهجية تقييم الوظائف بالنقاط" : "POINT_FACTOR_METHODOLOGY"}
            </h1>
            <p className="text-secondary/40 font-medium border-l-2 border-primary/20 pl-4 text-lg">
              {isAr ? "منهجية كمية منظمة لتحديد القيمة النسبية للوظائف داخل المنظمة." : "Structural, quantitative framework for determining relative organizational value metrics."}
            </p>
          </div>
        </div>
        <CornerMarks />
      </motion.div>

      {/* Pillar Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: BrainCircuit, title: isAr ? "المهارات" : "SKILLS_DOMAIN", value: "35%", color: "primary" },
          { icon: ShieldCheck, title: isAr ? "المسؤولية" : "RESPONSIBILITY_DOMAIN", value: "35%", color: "zinc-400" },
          { icon: Zap, title: isAr ? "الجهد" : "EFFORT_DOMAIN", value: "20%", color: "amber-400" },
          { icon: BarChart3, title: isAr ? "ظروف العمل" : "ENV_CONDITIONS", value: "10%", color: "rose-400" }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className={`bg-[#0D0D0D] border-zinc-800 rounded-none relative group hover:border-${stat.color}/40 transition-all`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-headline font-black tracking-[0.2em] text-zinc-500 uppercase">{stat.title}</p>
                    <h3 className={`text-3xl font-mono font-black text-${stat.color}`}>{stat.value}</h3>
                  </div>
                  <div className="p-3 bg-zinc-900 border border-zinc-800 group-hover:border-current transition-colors">
                     <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                </div>
              </CardContent>
              <CornerMarks />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Architectural Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Factor Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden">
            <CardHeader className="p-8 border-b border-zinc-900">
              <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                <Layers className="h-5 w-5 text-primary" />
                {isAr ? "توزيع الأوزان والنقاط" : "STRUCTURAL_WEIGHT_DISTRIBUTION"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/50 border-b border-zinc-800 text-left">
                      <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase">{isAr ? "الفئة الرئيسية" : "CORE_PILLAR"}</th>
                      <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase">{isAr ? "العوامل الفرعية" : "SUB_VECTORS"}</th>
                      <th className="px-8 py-5 text-center font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase">{isAr ? "النسبة" : "WEIGHT"}</th>
                      <th className="px-8 py-5 text-center font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase">{isAr ? "النقاط" : "MAX_PTS"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {[
                      { cat: isAr ? "المهارات" : "SKILLS", factors: isAr ? "التعليم، الخبرة، المعرفة" : "Education, Experience, Knowledge", weight: "35%", points: 350 },
                      { cat: isAr ? "المسؤولية" : "RESPONSIBILITY", factors: isAr ? "الالتزام، الإشراف، اتخاذ القرار" : "Compliance, Supervisory, Decision-Making", weight: "35%", points: 350 },
                      { cat: isAr ? "الجهد" : "EFFORT", factors: isAr ? "الجهد الذهني، الجهد البدني" : "Mental Effort, Physical Effort", weight: "20%", points: 200 },
                      { cat: isAr ? "ظروف العمل" : "CONDITIONS", factors: isAr ? "المخاطر، الساعات، البيئة، السفر" : "Hazards, Schedule, Environment, Travel", weight: "10%", points: 100 }
                    ].map((row, i) => (
                      <tr key={i} className="group hover:bg-white/2 transition-colors">
                        <td className="px-8 py-6">
                           <span className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover:text-primary transition-colors">{row.cat}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed block max-w-[200px]">{row.factors}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <Badge variant="outline" className="rounded-none border-zinc-800 bg-zinc-900 font-mono text-[10px] font-black text-zinc-400 px-3 py-1">{row.weight}</Badge>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className="font-mono font-black text-white text-lg">{row.points}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-primary/[0.02] border-t border-zinc-900 flex items-center justify-between">
                <span className="font-headline font-black text-[10px] text-zinc-600 uppercase tracking-[0.2em]">{isAr ? "إجمالي النقاط الأقصى" : "TOTAL_AGGREGATED_POINTS"}</span>
                <span className="text-primary font-mono font-black text-xl tracking-tighter">1000.00 PTS</span>
              </div>
            </CardContent>
            <CornerMarks />
          </Card>
        </motion.div>

        {/* Allocation Pie Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden">
            <CardHeader className="p-8 border-b border-zinc-900">
              <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                {isAr ? "توزيع النقاط بيانياً" : "VECTOR_ALLOCATION"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col items-center justify-center h-[calc(100%-80px)]">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #D4AF37', borderRadius: '0px', color: '#FFF', fontSize: '10px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-10 space-y-3">
                 {categoryData.map((cat, i) => (
                   <div key={i} className="flex items-center justify-between text-[10px] font-headline font-black text-zinc-500 uppercase tracking-widest">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2" style={{ backgroundColor: cat.color }} />
                         <span>{cat.name}</span>
                      </div>
                      <span className="font-mono text-white">{cat.value} PTS</span>
                   </div>
                 ))}
              </div>
            </CardContent>
            <CornerMarks />
          </Card>
        </motion.div>

        {/* Grading Scale Module */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden">
            <CardHeader className="p-8 border-b border-zinc-900">
              <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                <Scaling className="h-5 w-5 text-primary" />
                {isAr ? "سلم الدرجات الوظيفية" : "ARCHITECTURAL_GRADING_SCALE"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[300px] mb-12">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1A" />
                    <XAxis dataKey="grade" stroke="#444" fontSize={10} fontStyle="italic" />
                    <YAxis stroke="#444" fontSize={10} />
                    <Tooltip 
                      cursor={{fill: 'rgba(212,175,55,0.05)'}}
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #D4AF37', borderRadius: '0px', color: '#FFF', fontSize: '10px' }}
                    />
                    <Bar dataKey="max" radius={[0, 0, 0, 0]}>
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index > 5 ? '#D4AF37' : '#333'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[gradeData.slice(0, 5), gradeData.slice(5)].map((subset, idx) => (
                  <div key={idx} className="border border-zinc-900 bg-black/40 p-1">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-900/80 font-headline font-black text-[9px] uppercase tracking-widest text-zinc-500">
                        <tr>
                          <th className="px-6 py-4">{isAr ? "النقاط" : "PT_RANGE"}</th>
                          <th className="px-6 py-4">{isAr ? "الدرجة" : "TIER"}</th>
                          <th className="px-6 py-4">{isAr ? "الفئة" : "DESIGNATION"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {subset.map((row, i) => (
                          <tr key={i} className="hover:bg-primary/3 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-zinc-400">{row.min} - {row.max}</td>
                            <td className="px-6 py-4 font-mono font-black text-primary text-sm">{row.grade}</td>
                            <td className="px-6 py-4 text-[10px] font-headline font-black text-zinc-500 uppercase tracking-widest">{row.category}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </CardContent>
            <CornerMarks />
          </Card>
        </motion.div>

        {/* Operational Intelligence */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="bg-primary/3 border-primary/20 rounded-none relative overflow-hidden group">
                <CardHeader className="p-8 border-b border-primary/10">
                  <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                    <Settings2 className="h-5 w-5 text-primary" />
                    {isAr ? "الحوكمة والعمليات" : "GOVERNANCE_PROTOCOL"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {[
                    { t: isAr ? "تحليل الوظيفة" : "NODE_ANALYSIS", d: isAr ? "جمع البيانات من الأوصاف الوظيفية والمقابلات." : "Granular data harvesting from active JD streams and stakeholder interviews." },
                    { t: isAr ? "لجنة التقييم" : "VALUATION_COUNCIL", d: isAr ? "تتكون من 3 أعضاء على الأقل لتحديد الدرجات." : "Minimum 3-member quorum required for structural point allocation." },
                    { t: isAr ? "المراجعة" : "AUDIT_CYCLE", d: isAr ? "اجتماعات دورية كل ستة أشهر لمراجعة الأدوار الجديدة." : "Bi-annual recursive audit to calibrate new or evolving organizational nodes." },
                    { t: isAr ? "المخرجات" : "OUTPUT_MAP", d: isAr ? "خريطة شفافة مرتبطة مباشرة بسلم الرواتب." : "High-transparency mapping linking structural points to fiscal compensation tiers." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="font-headline font-black text-xs text-white uppercase tracking-widest">{item.t}</p>
                        <p className="text-[11px] font-sans font-medium text-zinc-500 leading-relaxed mt-2">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CornerMarks />
             </Card>

             <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none relative overflow-hidden">
                <CardHeader className="p-8 border-b border-zinc-900">
                  <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                    <Cpu className="h-5 w-5 text-zinc-400" />
                    {isAr ? "مقياس التقييم الخماسي" : "LEVEL_RUBRIC_v4.2"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {[
                    { l: 1, e: "CRITICAL_MINIMUM_REQS", a: "متطلبات بسيطة جداً" },
                    { l: 2, e: "BASIC_OPERATIONAL_THRESHOLD", a: "متطلبات محدودة" },
                    { l: 3, e: "STANDARD_PROFICIENCY_NODE", a: "متطلبات متوسطة" },
                    { l: 4, e: "ADVANCED_SYSTEM_COMMAND", a: "متطلبات عالية" },
                    { l: 5, e: "STRATEGIC_LEAD_EXCELLENCE", a: "متطلبات قيادية" }
                  ].map((level) => (
                    <div key={level.l} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 group hover:border-primary/30 transition-all">
                      <div className="h-10 w-10 flex items-center justify-center bg-black border border-zinc-800 font-mono font-black text-xs text-primary group-hover:border-primary transition-colors">
                        L{level.l}
                      </div>
                      <div className="text-right">
                        <p className="font-headline font-black text-[10px] text-white uppercase tracking-widest">{isAr ? level.a : level.e}</p>
                        <p className="font-mono text-[8px] text-zinc-600 uppercase tracking-tighter mt-1">{isAr ? level.e : level.a}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CornerMarks color="zinc" />
             </Card>
          </div>
        </motion.div>
      </div>

      {/* Telemetry Footer */}
      <div className="p-10 border-2 border-primary/20 bg-primary/3 relative overflow-hidden group">
         <Terminal className="absolute -right-6 -top-6 h-32 w-32 text-primary opacity-5 group-hover:opacity-10 transition-all duration-1000" />
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
               <p className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em]">GUIDE_SYNC_COMPLETED</p>
               <p className="text-[10px] font-mono text-zinc-600 leading-relaxed uppercase tracking-widest">
                  DOC_REF_v4.2 // SECURITY_LAYER_ACTIVE // AUTHORIZED_ACCESS_ONLY
               </p>
            </div>
            <div className="flex items-center gap-6 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
               <span>LATENCY::5MS</span>
               <span>REVISION::94.2.0</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
