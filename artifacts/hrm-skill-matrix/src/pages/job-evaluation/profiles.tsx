import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  FileDown, 
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Calculator,
  Upload,
  ChevronLeft,
  LayoutDashboard,
  TrendingUp,
  Target,
  Users,
  Crosshair,
  Shield,
  Activity,
  Cpu,
  Terminal,
  Info
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { ImportDialog } from "@/components/import-dialog";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell
} from 'recharts';

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

// Types
interface JobProfile {
  id: string;
  title: string;
  title_ar: string;
  department: string;
  department_ar: string;
  points: number;
  grade: string;
  status: "Draft" | "Pending" | "Approved";
  factors: Record<string, number>;
  salary_mid?: number;
}

const SUB_FACTORS = [
  { id: "edu", name: "Education", name_ar: "Ø§Ù„ØªØ¹Ù„ÙŠÙ…", category: "Skills", weight: 35 },
  { id: "exp", name: "Experience", name_ar: "Ø§Ù„Ø®Ø¨Ø±Ø©", category: "Skills", weight: 35 },
  { id: "knw", name: "Knowledge", name_ar: "Ø§Ù„Ù…Ø¹Ø±ÙØ©", category: "Skills", weight: 30 },
  { id: "cmp", name: "Compliance", name_ar: "Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„", category: "Responsibility", weight: 35 },
  { id: "sup", name: "Supervisory", name_ar: "Ø§Ù„Ø¥Ø´Ø±Ø§Ù", category: "Responsibility", weight: 35 },
  { id: "dec", name: "Decision-Making", name_ar: "ØµÙ†Ø¹ Ø§Ù„Ù‚Ø±Ø§Ø±", category: "Responsibility", weight: 30 },
  { id: "mnt", name: "Mental Effort", name_ar: "Ø§Ù„Ù…Ø¬Ù‡ÙˆØ¯ Ø§Ù„Ø°Ù‡Ù†ÙŠ", category: "Effort", weight: 50 },
  { id: "phy", name: "Physical Effort", name_ar: "Ø§Ù„Ù…Ø¬Ù‡ÙˆØ¯ Ø§Ù„Ø¨Ø¯Ù†ÙŠ", category: "Effort", weight: 50 },
  { id: "haz", name: "Hazards", name_ar: "Ø§Ù„Ù…Ø®Ø§Ø·Ø±", category: "Conditions", weight: 25 },
  { id: "sch", name: "Schedule", name_ar: "Ø§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠ", category: "Conditions", weight: 25 },
  { id: "env", name: "Environment", name_ar: "Ø§Ù„Ø¨ÙŠØ¦Ø©", category: "Conditions", weight: 25 },
  { id: "trv", name: "Travel", name_ar: "Ø§Ù„Ø³ÙØ±", category: "Conditions", weight: 25 },
];

const GRADES = [
  { g: "G1", min: 100, max: 149, category_en: "Entry Level", category_ar: "Ù…Ø³ØªÙˆÙ‰ Ù…Ø¨ØªØ¯Ø¦" },
  { g: "G2", min: 150, max: 199, category_en: "Junior", category_ar: "Ù…Ø³Ø§Ø¹Ø¯" },
  { g: "G3", min: 200, max: 259, category_en: "Officer", category_ar: "Ù…ÙˆØ¸Ù" },
  { g: "G4", min: 260, max: 329, category_en: "Senior Officer", category_ar: "Ù…ÙˆØ¸Ù Ø£ÙˆÙ„" },
  { g: "G5", min: 330, max: 409, category_en: "Specialist", category_ar: "Ø£Ø®ØµØ§Ø¦ÙŠ" },
  { g: "G6", min: 410, max: 509, category_en: "Senior Specialist", category_ar: "Ø£Ø®ØµØ§Ø¦ÙŠ Ø£ÙˆÙ„" },
  { g: "G7", min: 510, max: 629, category_en: "Manager", category_ar: "Ù…Ø¯ÙŠØ±" },
  { g: "G8", min: 630, max: 769, category_en: "Senior Manager", category_ar: "Ù…Ø¯ÙŠØ± Ø£ÙˆÙ„" },
  { g: "G9", min: 770, max: 929, category_en: "Director", category_ar: "Ù…Ø¯ÙŠØ± Ø¹Ø§Ù…" },
  { g: "G10", min: 930, max: 1000, category_en: "Executive", category_ar: "Ø±Ø¦ÙŠØ³ ØªÙ†ÙÙŠØ°ÙŠ" },
];

export default function JobProfilesPage() {
  const t = useT();
  const { toast } = useToast();
  const isAr = document.documentElement.dir === "rtl";
  
  const [profiles, setProfiles] = useState<JobProfile[]>([
    { id: "1", title: "Senior Developer", title_ar: "Ù…Ø·ÙˆØ± Ø¨Ø±Ù…Ø¬ÙŠØ§Øª Ø£ÙˆÙ„", department: "IT", department_ar: "ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª", points: 342, grade: "G5", status: "Approved", factors: {}, salary_mid: 8500 },
    { id: "2", title: "HR Manager", title_ar: "Ù…Ø¯ÙŠØ± Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©", department: "HR", department_ar: "Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©", points: 580, grade: "G7", status: "Approved", factors: {}, salary_mid: 12000 },
    { id: "3", title: "Accountant", title_ar: "Ù…Ø­Ø§Ø³Ø¨", department: "Finance", department_ar: "Ø§Ù„Ù…Ø§Ù„ÙŠØ©", points: 245, grade: "G3", status: "Approved", factors: {}, salary_mid: 6000 },
    { id: "4", title: "Plant Operator", title_ar: "Ù…Ø´ØºÙ„ Ù…Ø­Ø·Ø©", department: "Production", department_ar: "Ø§Ù„Ø¥Ù†ØªØ§Ø¬", points: 185, grade: "G2", status: "Approved", factors: {}, salary_mid: 4500 },
    { id: "5", title: "Quality Inspector", title_ar: "Ù…Ø±Ø§Ù‚Ø¨ Ø¬ÙˆØ¯Ø©", department: "QA", department_ar: "Ø§Ù„Ø¬ÙˆØ¯Ø©", points: 290, grade: "G4", status: "Approved", factors: {}, salary_mid: 6800 },
  ]);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [evalStep, setEvalStep] = useState(0);
  const [newProfile, setNewProfile] = useState({
    title_en: "",
    title_ar: "",
    department_id: "",
    scores: {} as Record<string, number>
  });

  const currentTotal = useMemo(() => {
    let total = 0;
    const CAT_WEIGHTS = { Skills: 350, Responsibility: 350, Effort: 100, Conditions: 200 };
    
    ["Skills", "Responsibility", "Effort", "Conditions"].forEach(cat => {
      const catSubFactors = SUB_FACTORS.filter(sf => sf.category === cat);
      catSubFactors.forEach(sf => {
        const level = newProfile.scores[sf.id] || 0;
        if (level > 0) {
          const factorMax = (sf.weight / 100) * (CAT_WEIGHTS[cat as keyof typeof CAT_WEIGHTS]);
          total += (level / 5) * factorMax;
        }
      });
    });
    return Math.round(total);
  }, [newProfile.scores]);

  const currentGrade = useMemo(() => {
    const grade = GRADES.find(g => currentTotal >= g.min && currentTotal <= g.max);
    return grade ? grade.g : "N/A";
  }, [currentTotal]);

  const handleExportExcel = () => {
    exportToExcel({
      title: isAr ? "Ø£ÙˆØµØ§Ù Ø§Ù„ÙˆØ¸Ø§Ø¦Ù Ø§Ù„Ù…Ø¬Ù…Ø¹Ø©" : "Job Profiles Evaluation",
      filename: "Job_Evaluation_Profiles",
      headers: [t("field_name"), t("field_department"), isAr ? "Ø§Ù„Ù†Ù‚Ø§Ø·" : "Points", isAr ? "Ø§Ù„Ø¯Ø±Ø¬Ø©" : "Grade", t("field_status")],
      rows: profiles.map(p => [isAr ? p.title_ar : p.title, isAr ? p.department_ar : p.department, p.points.toString(), p.grade, p.status])
    });
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: isAr ? "Ø£ÙˆØµØ§Ù Ø§Ù„ÙˆØ¸Ø§Ø¦Ù Ø§Ù„Ù…Ø¬Ù…Ø¹Ø©" : "Job Profiles Evaluation",
      filename: "Job_Evaluation_Profiles",
      headers: [t("field_name"), t("field_department"), isAr ? "Ø§Ù„Ù†Ù‚Ø§Ø·" : "Points", isAr ? "Ø§Ù„Ø¯Ø±Ø¬Ø©" : "Grade", t("field_status")],
      rows: profiles.map(p => [isAr ? p.title_ar : p.title, isAr ? p.department_ar : p.department, p.points.toString(), p.grade, p.status])
    });
  };

  return (
    <div className="space-y-10 pb-20 font-sans selection:bg-primary selection:text-primary-foreground text-white">
      {/* Header - Industrial Focus */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative p-10 bg-[#0A0A0A] border-2 border-primary/30 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.4em] uppercase text-[9px] text-primary">{isAr ? "Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…" : "EVALUATION_PROTOCOL"}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {isAr ? "Ø£ÙˆØµØ§Ù ÙˆØªÙ‚ÙŠÙŠÙ… Ø§Ù„ÙˆØ¸Ø§Ø¦Ù" : "JOB_PROFILE_REGISTRY"}
            </h1>
            <p className="text-secondary/40 font-medium text-sm border-s-2 border-primary/20 ps-4">
              {isAr ? "Ø¥Ø¯Ø§Ø±Ø© ÙˆØªØ­Ù„ÙŠÙ„ Ø§Ù„ÙˆØ¸Ø§Ø¦Ù Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…Ù†Ù‡Ø¬ÙŠØ© Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ©." : "Industrial grade point-factor methodology management for structural integrity."}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 font-headline font-black text-[10px] tracking-widest px-6 h-12 uppercase" onClick={handleExportPDF}>
              <Download className="h-4 w-4 me-2" /> PDF_EXPORT
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 font-headline font-black text-[10px] tracking-widest px-6 h-12 uppercase" onClick={handleExportExcel}>
              <FileDown className="h-4 w-4 me-2" /> XLSX_STREAM
            </Button>
            <Button className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-black tracking-widest text-[10px] px-10 h-12 uppercase shadow-[0_0_20px_rgba(212,175,55,0.3)]" onClick={() => { setEvalStep(0); setIsNewOpen(true); }}>
              <Plus className="h-4 w-4 me-2" /> INITIALIZE_EVAL
            </Button>
          </div>
        </div>
        <CornerMarks />
      </motion.div>

      {/* Stats - Tactical Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: isAr ? 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø³Ø¬Ù„Ø§Øª' : 'TOTAL_NODES', val: profiles.length, icon: Users, color: 'text-primary' },
          { label: isAr ? 'Ù…ØªÙˆØ³Ø· Ø§Ù„ÙƒÙØ§Ø¡Ø©' : 'AVG_EQUITY_PTS', val: Math.round(profiles.reduce((a, b) => a + b.points, 0) / profiles.length), icon: Target, color: 'text-emerald-500' },
          { label: isAr ? 'Ø£Ø¹Ù„Ù‰ ÙØ¦Ø©' : 'MAX_TIER_IDENTIFIED', val: 'G7', icon: TrendingUp, color: 'text-amber-500' },
          { label: isAr ? 'Ø­Ø§Ù„Ø© Ø§Ù„Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„' : 'PROTOCOL_STATUS', val: 'SECURE', icon: Crosshair, color: 'text-sky-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#0D0D0D] border border-zinc-800 rounded-none relative group hover:border-primary/40 transition-all overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-headline font-black tracking-[0.2em] text-zinc-500 uppercase">{stat.label}</p>
                    <p className="text-3xl font-mono font-black mt-2 text-white">{stat.val}</p>
                  </div>
                  <div className={`p-3 bg-zinc-900 border border-zinc-800 group-hover:border-current transition-colors ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
              <CornerMarks />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Workstation Module: Evaluation Log */}
        <Card className="lg:col-span-2 bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden">
          <CardHeader className="border-b border-zinc-900 flex flex-row items-center justify-between p-8">
            <CardTitle className="font-headline text-xl font-black uppercase flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              {isAr ? "Ø³Ø¬Ù„ Ø°ÙƒØ§Ø¡ Ø§Ù„ÙˆØ¸Ø§Ø¦Ù" : "JOB_VALUATION_STREAM"}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <Input placeholder={isAr ? "ÙÙ„ØªØ±Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª..." : "QUERY_LOGS..."} className="ps-10 h-12 w-[240px] bg-white/5 border-zinc-800 rounded-none font-mono text-xs uppercase tracking-widest focus:border-primary/50 text-white" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-zinc-900/50 text-zinc-500 font-headline font-black text-[10px] uppercase tracking-widest border-b border-zinc-800">
                  <tr>
                    <th className="px-8 py-5 text-start">{isAr ? "Ø§Ù„Ù…Ø³Ù…Ù‰" : "PROFILE_ID"}</th>
                    <th className="px-8 py-5 text-start">{isAr ? "Ø§Ù„Ù‚Ø³Ù…" : "UNIT_DOMAIN"}</th>
                    <th className="px-8 py-5 text-center">{isAr ? "Ø§Ù„Ù†Ù‚Ø§Ø·" : "PTS_VAL"}</th>
                    <th className="px-8 py-5 text-center">{isAr ? "Ø§Ù„Ø¯Ø±Ø¬Ø©" : "TIER"}</th>
                    <th className="px-8 py-5 text-end">{isAr ? "Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª" : "COMMAND"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  <AnimatePresence mode="popLayout">
                    {profiles.map((p) => (
                      <motion.tr 
                        key={p.id} 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="hover:bg-white/2 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="font-headline font-black text-white text-sm uppercase tracking-tight group-hover:text-primary transition-colors">{isAr ? p.title_ar : p.title}</div>
                          <div className="text-[9px] font-mono text-zinc-600 tracking-[0.2em] mt-1 uppercase">ARCH::{p.id.padStart(4, '0')}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] uppercase tracking-widest">
                            {isAr ? p.department_ar : p.department}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="font-mono font-black text-primary text-lg">{p.points}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="h-10 w-12 mx-auto flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono font-black text-sm">
                            {p.grade}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-end">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-zinc-800 hover:bg-white/5 hover:text-primary transition-colors"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
          <CornerMarks />
        </Card>

        {/* Analytics Card */}
        <Card className="bg-[#0D0D0D] border border-zinc-800 rounded-none relative group overflow-hidden h-full">
          <CardHeader className="p-8 border-b border-zinc-900">
            <CardTitle className="font-headline text-lg font-black uppercase flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              {isAr ? "ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¹Ø¯Ø§Ù„Ø©" : "EQUITY_ANALYTICS"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] p-8">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" />
                <XAxis type="number" dataKey="points" name="Points" stroke="#444" fontSize={10} fontStyle="italic" />
                <YAxis type="number" dataKey="salary" name="Salary" stroke="#444" fontSize={10} />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #D4AF37', borderRadius: '0px', color: '#FFF', fontSize: '10px', fontFamily: 'monospace' }} 
                />
                <Scatter name="Jobs" data={profiles.map(p => ({ points: p.points, salary: p.salary_mid, name: isAr ? p.title_ar : p.title }))} fill="#D4AF37">
                   {profiles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : '#444'} strokeWidth={2} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-8 p-4 bg-white/[0.02] border border-zinc-900 font-mono text-[9px] text-zinc-600 leading-relaxed uppercase tracking-widest flex items-center justify-between">
              <span>// SCATTER_PLOT_ACTIVE</span>
              <Activity className="h-3 w-3 text-primary animate-pulse" />
            </div>
          </CardContent>
          <CornerMarks />
        </Card>
      </div>

      {/* Factor Evaluation Engine Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-[#0E0E0E] border-2 border-primary/30 rounded-none shadow-[0_0_100px_rgba(0,0,0,0.9)] text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <DialogHeader className="p-8 border-b border-zinc-900 bg-white/[0.02] relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <DialogTitle className="font-headline font-black text-3xl text-white uppercase flex items-center gap-4">
                  <div className="p-3 bg-primary/10 border border-primary text-primary">
                    <Calculator className="h-8 w-8" />
                  </div>
                  {isAr ? "Ù…Ø­Ø±Ùƒ ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ø¹ÙˆØ§Ù…Ù„" : "FACTOR_EVAL_ENGINE"}
                </DialogTitle>
                <DialogDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                  {isAr ? "Ø¨Ø±ÙˆØªÙˆÙƒÙˆÙ„ Ø§Ù„Ù†Ù‚Ø§Ø· Ø§Ù„Ù…ÙˆØ²ÙˆÙ†Ø© (SC-2026)" : "WEIGHTED_FACTOR_PROTOCOL_v4.2_ACTIVE"}
                </DialogDescription>
              </div>
              
              <div className="flex items-center gap-8 p-6 bg-black border border-zinc-800 min-w-[320px]">
                <div className="flex-1">
                  <p className="text-[9px] font-headline font-black text-primary tracking-[0.2em] uppercase">{isAr ? 'Ù†Ù‚Ø§Ø· Ø§Ù„ØªÙ‚ÙŠÙŠÙ…' : 'PTS_ACCUMULATED'}</p>
                  <p className="text-4xl font-mono font-black text-white leading-none mt-2">{currentTotal}</p>
                </div>
                <div className="h-12 w-px bg-zinc-800" />
                <div className="flex-1">
                  <p className="text-[9px] font-headline font-black text-zinc-500 tracking-[0.2em] uppercase">{isAr ? 'Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ù…Ø³ØªØ­Ù‚Ø©' : 'TIER_GRADE'}</p>
                  <p className="text-4xl font-mono font-black text-primary leading-none mt-2">{currentGrade}</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-10 font-mono relative z-10">
            <AnimatePresence mode="wait">
              {evalStep === 0 ? (
                <motion.div 
                  key="step0"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="space-y-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-headline font-black uppercase tracking-[0.3em] text-primary">{isAr ? "ØªØ¹Ø±ÙŠÙ Ø§Ù„Ù‡ÙˆÙŠØ© (EN)" : "PROFILE_LABEL (EN) *"}</label>
                      <Input 
                        placeholder="e.g. SENIOR_SYSTEM_OPERATIVE" 
                        className="bg-white/5 border-zinc-800 h-14 text-xl font-black rounded-none border-s-4 border-s-primary focus:border-primary/50 text-white transition-all uppercase placeholder:text-zinc-800" 
                        value={newProfile.title_en}
                        onChange={(e) => setNewProfile({ ...newProfile, title_en: e.target.value })}
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-headline font-black uppercase tracking-[0.3em] text-primary">{isAr ? "ØªØ¹Ø±ÙŠÙ Ø§Ù„Ù‡ÙˆÙŠØ© (AR)" : "PROFILE_LABEL (AR) *"}</label>
                      <Input 
                        placeholder="Ø§Ù„Ù…Ø³Ù…Ù‰ Ø§Ù„Ø¹Ø±Ø¨ÙŠ" 
                        className="text-end bg-white/5 border-zinc-800 h-14 text-xl font-black rounded-none border-e-4 border-e-primary focus:border-primary/50 text-white transition-all" 
                        value={newProfile.title_ar}
                        onChange={(e) => setNewProfile({ ...newProfile, title_ar: e.target.value })}
                      />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-headline font-black uppercase tracking-[0.3em] text-zinc-600">{isAr ? "ØªØ®ØµÙŠØµ Ø§Ù„ÙˆØ­Ø¯Ø©" : "DEPLOYMENT_DOMAIN (DEPT) *"}</label>
                      <Select value={newProfile.department_id} onValueChange={(val) => setNewProfile({ ...newProfile, department_id: val })}>
                        <SelectTrigger className="bg-white/5 border-zinc-800 h-14 rounded-none text-white font-bold uppercase text-[10px] tracking-widest">
                          <SelectValue placeholder="SELECT_OPERATIONAL_DOMAIN" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0A0A] border-zinc-800 rounded-none text-white font-headline font-black text-[9px] uppercase tracking-widest">
                          <SelectItem value="it" className="focus:bg-primary/20">CORE_IT_INFRA</SelectItem>
                          <SelectItem value="hr" className="focus:bg-primary/20">HUMAN_CAPITAL</SelectItem>
                          <SelectItem value="fin" className="focus:bg-primary/20">FISCAL_OPS</SelectItem>
                          <SelectItem value="ops" className="focus:bg-primary/20">PRODUCTION_LINE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-8 bg-primary/5 border border-primary/20 relative group">
                    <div className="flex gap-6 items-start">
                      <div className="h-12 w-12 bg-primary/10 border border-primary flex items-center justify-center shrink-0">
                        <Info className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-headline font-black text-sm uppercase tracking-[0.2em] text-white">EVALUATION_PROTOCOL_NOTICE</h4>
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed font-sans font-medium">
                          {isAr ? "ÙŠØªØ·Ù„Ø¨ Ù…Ø­Ø±Ùƒ Ø§Ù„ØªÙ‚ÙŠÙŠÙ… Ø¥Ø¯Ø®Ø§Ù„ Ù…Ø³ØªÙˆÙŠØ§Øª Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù€ 12 Ø¹Ø§Ù…Ù„Ø§Ù‹ ÙØ±Ø¹ÙŠØ§Ù‹ Ù…ÙˆØ²Ø¹Ø© Ø¹Ù„Ù‰ 4 Ù…Ø­Ø§ÙˆØ± Ø£Ø³Ø§Ø³ÙŠØ© Ù„Ø¶Ù…Ø§Ù† Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„ Ù„Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„ØµÙ†Ø§Ø¹ÙŠØ©." : "The valuation engine requires high-fidelity calibration across 12 unique sub-factors. All inputs are cryptographically logged for structural integrity audit trails."}
                        </p>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary/10 border-b border-r border-primary/40 group-hover:scale-110 transition-transform" />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-12"
                >
                  {["Skills", "Responsibility", "Effort", "Conditions"].map((cat, catIdx) => (
                    <div key={cat} className="space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="h-2 w-2 bg-primary rotate-45" />
                        <h3 className="font-headline text-2xl font-black uppercase tracking-[0.3em] text-primary whitespace-nowrap">
                          {cat}_DOMAIN
                        </h3>
                        <div className="flex-1 h-px bg-zinc-900" />
                        <span className="font-mono text-[9px] text-zinc-700 tracking-widest uppercase">{catIdx + 1}/4</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {SUB_FACTORS.filter(sf => sf.category === cat).map((sf, sfIdx) => (
                          <motion.div 
                            key={sf.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: sfIdx * 0.05 }}
                            className={`p-6 border transition-all relative group ${newProfile.scores[sf.id] ? 'border-primary/40 bg-primary/3' : 'border-zinc-900 bg-black/40 hover:border-zinc-800'}`}
                          >
                            <div className="flex items-center justify-between mb-6">
                              <div className="space-y-1">
                                <label className="font-headline font-black text-sm uppercase tracking-widest text-white block">{isAr ? sf.name_ar : sf.name}</label>
                                <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em]">{sf.id.toUpperCase()}::VECTOR</span>
                              </div>
                              <div className={`h-10 w-12 border flex items-center justify-center font-mono text-sm font-black transition-colors ${newProfile.scores[sf.id] ? 'bg-primary text-black border-primary' : 'bg-black text-zinc-800 border-zinc-800 group-hover:border-zinc-700'}`}>
                                {newProfile.scores[sf.id] || "0"}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(lv => (
                                <button 
                                  key={lv}
                                  onClick={() => setNewProfile({ ...newProfile, scores: { ...newProfile.scores, [sf.id]: lv } })}
                                  className={`flex-1 h-12 border font-black font-mono text-[11px] transition-all relative overflow-hidden active:scale-95 ${
                                    newProfile.scores[sf.id] === lv 
                                    ? 'bg-primary border-primary text-black' 
                                    : 'border-zinc-800 bg-black hover:border-zinc-700 text-zinc-600 hover:text-zinc-400'
                                  }`}
                                >
                                  L_{lv}
                                  {newProfile.scores[sf.id] === lv && <div className="absolute top-0 right-0 w-2 h-2 bg-black rotate-45 translate-x-1 -translate-y-1" />}
                                </button>
                              ))}
                            </div>
                            <CornerMarks color={newProfile.scores[sf.id] ? "primary" : "zinc"} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="p-8 border-t border-zinc-900 bg-white/[0.02] relative z-10">
            <div className="flex items-center justify-between w-full">
              <Button variant="ghost" onClick={() => setIsNewOpen(false)} className="rounded-none border border-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 font-headline font-black text-[10px] tracking-widest px-8 uppercase h-12">
                TERMINATE_INIT
              </Button>
              <div className="flex items-center gap-4">
                {evalStep === 1 && (
                  <Button variant="outline" onClick={() => setEvalStep(0)} className="rounded-none border-zinc-800 bg-white/5 hover:bg-white/10 font-headline font-black text-[10px] tracking-widest px-8 uppercase h-12">
                    BACK_TO_ID
                  </Button>
                )}
                {evalStep === 0 ? (
                  <Button 
                    onClick={() => setEvalStep(1)} 
                    disabled={!newProfile.title_en}
                    className="rounded-none bg-white text-black hover:bg-white/90 font-headline font-black text-[10px] tracking-widest px-12 uppercase h-12"
                  >
                    DEPLOY_FACTORS <ChevronRight className="h-4 w-4 ms-2" />
                  </Button>
                ) : (
                  <Button 
                    disabled={Object.keys(newProfile.scores).length < SUB_FACTORS.length}
                    className="rounded-none bg-primary text-black hover:bg-primary/90 font-headline font-black text-[10px] tracking-widest px-16 h-12 uppercase shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                    onClick={() => {
                      const newP: JobProfile = {
                        id: (profiles.length + 1).toString(),
                        title: newProfile.title_en,
                        title_ar: newProfile.title_ar,
                        department: "DOMAIN_DEPLOYED",
                        department_ar: "Ù‚Ø³Ù… Ø¬Ø¯ÙŠØ¯",
                        points: currentTotal,
                        grade: currentGrade,
                        status: "Approved",
                        factors: newProfile.scores,
                        salary_mid: 5000
                      };
                      setProfiles([newP, ...profiles]);
                      setIsNewOpen(false);
                      toast({ title: "LOG_COMMITTED", description: "Valuation protocol successfully written to registry." });
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 me-2" /> COMMIT_REGISTRY
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onSuccess={() => {}}
        type="profiles"
      />
    </div>
  );
}
