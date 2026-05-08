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
  Scaling
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
  { name: "Skills", value: 350, color: "#94A3B8" },
  { name: "Responsibility", value: 350, color: "#64748B" },
  { name: "Effort", value: 200, color: "#475569" },
  { name: "Conditions", value: 100, color: "#334155" }
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
      className="space-y-10 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <Scaling className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {isAr ? "منهجية تقييم الوظائف بالنقاط" : "Point Factor Job Evaluation Method"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isAr ? "منهجية كمية منظمة لتحديد القيمة النسبية للوظائف داخل المنظمة." : "A structured, quantitative approach to determine the relative worth of jobs."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: BrainCircuit, title: isAr ? "المهارات" : "Skills", value: "35%", color: "border-slate-500" },
          { icon: ShieldCheck, title: isAr ? "المسؤولية" : "Responsibility", value: "35%", color: "border-slate-600" },
          { icon: Zap, title: isAr ? "الجهد" : "Effort", value: "20%", color: "border-slate-700" },
          { icon: BarChart3, title: isAr ? "ظروف العمل" : "Work Conditions", value: "10%", color: "border-slate-800" }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className={`bg-card/50 backdrop-blur-sm border-l-4 ${stat.color} hover:bg-card transition-all duration-300`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <stat.icon className="h-8 w-8 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Breakdown Table */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-card/40 border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                {isAr ? "توزيع الأوزان والنقاط" : "Weight & Points Distribution"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-md border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>{isAr ? "الفئة الرئيسية" : "Main Category"}</TableHead>
                      <TableHead>{isAr ? "العوامل الفرعية" : "Sub-Factors"}</TableHead>
                      <TableHead className="text-center">{isAr ? "النسبة" : "Weight"}</TableHead>
                      <TableHead className="text-center">{isAr ? "النقاط" : "Max Points"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { cat: isAr ? "المهارات" : "Skills", factors: isAr ? "التعليم، الخبرة، المعرفة" : "Education, Experience, Knowledge", weight: "35%", points: 350 },
                      { cat: isAr ? "المسؤولية" : "Responsibility", factors: isAr ? "الالتزام، الإشراف، اتخاذ القرار" : "Compliance, Supervisory, Decision-Making", weight: "35%", points: 350 },
                      { cat: isAr ? "الجهد" : "Effort", factors: isAr ? "الجهد الذهني، الجهد البدني" : "Mental Effort, Physical Effort", weight: "20%", points: 200 },
                      { cat: isAr ? "ظروف العمل" : "Work Conditions", factors: isAr ? "المخاطر، الساعات، البيئة، السفر" : "Hazards, Schedule, Environment, Travel", weight: "10%", points: 100 }
                    ].map((row, i) => (
                      <TableRow key={i} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold">{row.cat}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{row.factors}</TableCell>
                        <TableCell className="text-center">{row.weight}</TableCell>
                        <TableCell className="text-center font-mono">{row.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground font-medium px-1">
                <span>{isAr ? "إجمالي النقاط الأقصى" : "Maximum Total Points"}</span>
                <span className="text-primary font-bold text-sm">1000 pts</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visual Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-card/40 border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {isAr ? "توزيع النقاط بيانياً" : "Visual Point Allocation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 flex items-center justify-center">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#121212', border: '1px solid #333' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grading Scale Table */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Scaling className="h-5 w-5 text-primary" />
                {isAr ? "سلم الدرجات الوظيفية" : "Job Grading Scale"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="grade" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      cursor={{fill: '#222'}}
                      contentStyle={{ backgroundColor: '#121212', border: '1px solid #333' }}
                    />
                    <Bar dataKey="max" radius={[4, 4, 0, 0]}>
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index > 5 ? '#94A3B8' : '#475569'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-md border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>{isAr ? "النقاط" : "Points"}</TableHead>
                        <TableHead>{isAr ? "الدرجة" : "Grade"}</TableHead>
                        <TableHead>{isAr ? "الفئة" : "Title Category"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gradeData.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono">{row.min} - {row.max}</TableCell>
                          <TableCell className="font-bold">{row.grade}</TableCell>
                          <TableCell className="text-muted-foreground">{row.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="rounded-md border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>{isAr ? "النقاط" : "Points"}</TableHead>
                        <TableHead>{isAr ? "الدرجة" : "Grade"}</TableHead>
                        <TableHead>{isAr ? "الفئة" : "Title Category"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gradeData.slice(5).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono">{row.min} - {row.max}</TableCell>
                          <TableCell className="font-bold">{row.grade}</TableCell>
                          <TableCell className="text-muted-foreground">{row.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Governance & Process */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    {isAr ? "الحوكمة والعمليات" : "Governance & Process"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { t: isAr ? "تحليل الوظيفة" : "Job Analysis", d: isAr ? "جمع البيانات من الأوصاف الوظيفية والمقابلات." : "Gather data from job descriptions and interviews." },
                    { t: isAr ? "لجنة التقييم" : "Committee Evaluation", d: isAr ? "تتكون من 3 أعضاء على الأقل لتحديد الدرجات." : "Minimum of 3 members to score the job using matrices." },
                    { t: isAr ? "المراجعة" : "Auditing", d: isAr ? "اجتماعات دورية كل ستة أشهر لمراجعة الأدوار الجديدة." : "Bi-annual meetings to evaluate new or updated roles." },
                    { t: isAr ? "المخرجات" : "Outputs", d: isAr ? "خريطة شفافة مرتبطة مباشرة بسلم الرواتب." : "Transparent point distribution linked to salary scale." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="mt-1"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="text-sm font-bold">{item.t}</p>
                        <p className="text-xs text-muted-foreground">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
             </Card>

             <Card className="bg-card/40 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Scaling className="h-5 w-5 text-primary" />
                    {isAr ? "مقياس التقييم الخماسي" : "5-Level Grading Rubric"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { l: 1, e: "Very simple requirements", a: "متطلبات بسيطة جداً" },
                    { l: 2, e: "Limited requirements", a: "متطلبات محدودة" },
                    { l: 3, e: "Medium requirements", a: "متطلبات متوسطة" },
                    { l: 4, e: "High requirements", a: "متطلبات عالية" },
                    { l: 5, e: "Leadership requirements", a: "متطلبات قيادية" }
                  ].map((level) => (
                    <div key={level.l} className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/30">
                      <Badge variant="outline" className="font-mono">L{level.l}</Badge>
                      <div className="text-right">
                        <p className="text-xs font-medium">{isAr ? level.a : level.e}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
             </Card>
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
