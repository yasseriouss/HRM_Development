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
  Search
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
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  { name: "Entry", value: 45 },
  { name: "Mid", value: 30 },
  { name: "Senior", value: 15 },
  { name: "Executive", value: 10 },
];

const COLORS = ["#94A3B8", "#64748B", "#475569", "#334155"];

export default function JobEvaluationDashboard() {
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isAr ? "لوحة تحليلات تقييم الوظائف" : "Job Evaluation Analytics"}
          </h1>
          <p className="text-muted-foreground">
            {isAr ? "إدارة ومراقبة العدالة الداخلية وتوزيع الدرجات الوظيفية." : "Manage internal equity and job grading distribution."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 border-border">
            <Upload className="h-4 w-4" /> {isAr ? "استيراد" : "Import"}
          </Button>
          <Button variant="outline" className="gap-2 border-border">
            <FileDown className="h-4 w-4" /> {isAr ? "تصدير" : "Export"}
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" /> {isAr ? "تقييم جديد" : "New Evaluation"}
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: isAr ? "إجمالي الوظائف" : "Total Jobs", value: "142", icon: Briefcase, trend: "+12%", up: true },
          { label: isAr ? "متوسط النقاط" : "Avg Points", value: "342", icon: BarChart3, trend: "+5.4%", up: true },
          { label: isAr ? "عدالة الرواتب" : "Salary Equity", value: "92%", icon: TrendingUp, trend: "-2.1%", up: false },
          { label: isAr ? "الموظفين" : "Total Employees", value: "1,284", icon: Users, trend: "+3%", up: true },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-muted rounded-lg">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Badge variant={stat.up ? "default" : "destructive"} className="bg-emerald-500/10 text-emerald-500 border-none">
                    {stat.trend}
                    {stat.up ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
                  </Badge>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scatter Plot: Internal Equity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-card/40 border-border/50 h-[450px]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{isAr ? "تحليل العدالة الداخلية" : "Internal Equity Analysis"}</CardTitle>
                <CardDescription>{isAr ? "مقارنة الراتب الفعلي مع نقاط تقييم الوظيفة." : "Actual Salary vs. Job Evaluation Points."}</CardDescription>
              </div>
              <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis type="number" dataKey="points" name="Points" unit="pts" stroke="#666" />
                  <YAxis type="number" dataKey="salary" name="Salary" unit="$" stroke="#666" />
                  <ZAxis type="category" dataKey="name" name="Role" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #333' }}
                  />
                  <Scatter name="Jobs" data={scatterData} fill="#94A3B8" shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grade Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card/40 border-border/50 h-[450px]">
            <CardHeader>
              <CardTitle className="text-lg">{isAr ? "توزيع الفئات" : "Grade Distribution"}</CardTitle>
              <CardDescription>{isAr ? "نسبة الوظائف حسب الفئة الوظيفية." : "Percentage of roles by category."}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDist}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {gradeDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full mt-4 space-y-2">
                {gradeDist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Evaluations Table */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card/40 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">{isAr ? "آخر عمليات التقييم" : "Recent Evaluations"}</CardTitle>
              <CardDescription>{isAr ? "قائمة بأحدث الوظائف التي تم تقييمها." : "List of recently evaluated job profiles."}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={isAr ? "بحث..." : "Search..."} className="pl-9 w-[200px] bg-muted/20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left border-b border-border/50">
                  <tr>
                    <th className="p-4 font-medium">{isAr ? "المسمى الوظيفي" : "Job Title"}</th>
                    <th className="p-4 font-medium">{isAr ? "النقاط" : "Points"}</th>
                    <th className="p-4 font-medium">{isAr ? "الدرجة" : "Grade"}</th>
                    <th className="p-4 font-medium">{isAr ? "الحالة" : "Status"}</th>
                    <th className="p-4 font-medium text-right">{isAr ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[
                    { title: "Senior Software Engineer", points: 342, grade: "G5", status: "Approved" },
                    { title: "Project Manager", points: 580, grade: "G7", status: "Approved" },
                    { title: "HR Business Partner", points: 420, grade: "G6", status: "Pending" },
                    { title: "Admin Assistant", points: 140, grade: "G1", status: "Draft" },
                  ].map((job, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium">{job.title}</td>
                      <td className="p-4 font-mono">{job.points}</td>
                      <td className="p-4 font-bold text-primary">{job.grade}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={
                          job.status === "Approved" ? "text-emerald-500 border-emerald-500/20" :
                          job.status === "Pending" ? "text-amber-500 border-amber-500/20" :
                          "text-slate-500 border-slate-500/20"
                        }>{job.status}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="text-xs">{isAr ? "تفاصيل" : "Details"}</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
