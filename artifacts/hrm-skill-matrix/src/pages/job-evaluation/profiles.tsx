import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  FileDown, 
  Download,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Calculator
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
import { Upload } from "lucide-react";

// Types
interface JobProfile {
  id: string;
  title: string;
  department: string;
  points: number;
  grade: string;
  status: "Draft" | "Pending" | "Approved";
  factors: Record<string, number>; // Sub-factor ID -> Level (1-5)
}

const SUB_FACTORS = [
  { id: "edu", name: "Education", category: "Skills", weight: 35 },
  { id: "exp", name: "Experience", category: "Skills", weight: 35 },
  { id: "knw", name: "Knowledge", category: "Skills", weight: 35 },
  { id: "cmp", name: "Compliance", category: "Responsibility", weight: 35 },
  { id: "sup", name: "Supervisory", category: "Responsibility", weight: 35 },
  { id: "dec", name: "Decision-Making", category: "Responsibility", weight: 35 },
  { id: "mnt", name: "Mental Effort", category: "Effort", weight: 20 },
  { id: "phy", name: "Physical Effort", category: "Effort", weight: 20 },
  { id: "haz", name: "Hazards", category: "Conditions", weight: 10 },
  { id: "sch", name: "Schedule", category: "Conditions", weight: 10 },
  { id: "env", name: "Environment", category: "Conditions", weight: 10 },
  { id: "trv", name: "Travel", category: "Conditions", weight: 10 },
];

const GRADES = [
  { g: "G1", min: 100, max: 149 },
  { g: "G2", min: 150, max: 199 },
  { g: "G3", min: 200, max: 259 },
  { g: "G4", min: 260, max: 329 },
  { g: "G5", min: 330, max: 409 },
  { g: "G6", min: 410, max: 509 },
  { g: "G7", min: 510, max: 629 },
  { g: "G8", min: 630, max: 769 },
  { g: "G9", min: 770, max: 929 },
  { g: "G10", min: 930, max: 1000 },
];

export default function JobProfilesPage() {
  const t = useT();
  const { toast } = useToast();
  const isAr = document.documentElement.dir === "rtl";
  
  const [profiles, setProfiles] = useState<JobProfile[]>([
    { id: "1", title: "Senior Developer", department: "IT", points: 342, grade: "G5", status: "Approved", factors: {} },
    { id: "2", title: "HR Manager", department: "HR", points: 580, grade: "G7", status: "Approved", factors: {} },
  ]);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<JobProfile | null>(null);
  const [evalStep, setEvalStep] = useState(0); // 0: Basic Info, 1: Factor Evaluation

  const calculateTotal = (factors: Record<string, number>) => {
    // Each factor max points is calculated as (Weight * 10 / Number of SubFactors in Cat)
    // For simplicity here, we assume each sub-factor contributes equally to its category's 1000pt share.
    // Total = Sum of (Level * (CategoryMax / 5 / NumSubFactors))
    let total = 0;
    SUB_FACTORS.forEach(sf => {
      const level = factors[sf.id] || 1;
      // Skill max = 350. Skill sub-factors = 3. So each sub-factor max = 116.6. 
      // Level 5 = 116.6. Level 1 = 23.3.
      // For this mock, let's just do a linear scale.
      const factorMax = (sf.weight / 100) * 1000 / (SUB_FACTORS.filter(s => s.category === sf.category).length);
      total += (level / 5) * factorMax;
    });
    return Math.round(total);
  };

  const getGrade = (pts: number) => {
    const grade = GRADES.find(g => pts >= g.min && pts <= g.max);
    return grade ? grade.g : "N/A";
  };

  const handleExportExcel = () => {
    exportToExcel({
      title: isAr ? "أوصاف الوظائف المجمعة" : "Job Profiles Evaluation",
      filename: "Job_Evaluation_Profiles",
      headers: [t("field_name"), t("field_department"), isAr ? "النقاط" : "Points", isAr ? "الدرجة" : "Grade", t("field_status")],
      rows: profiles.map(p => [p.title, p.department, p.points.toString(), p.grade, p.status])
    });
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: isAr ? "أوصاف الوظائف المجمعة" : "Job Profiles Evaluation",
      filename: "Job_Evaluation_Profiles",
      headers: [t("field_name"), t("field_department"), isAr ? "النقاط" : "Points", isAr ? "الدرجة" : "Grade", t("field_status")],
      rows: profiles.map(p => [p.title, p.department, p.points.toString(), p.grade, p.status])
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isAr ? "أوصاف وتقييم الوظائف" : "Job Profiles & Evaluation"}</h1>
          <p className="text-muted-foreground">{isAr ? "إدارة وتقييم متطلبات الوظائف باستخدام منهجية النقاط." : "Manage and score job requirements using the Point Factor Method."}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-border" onClick={handleExportPDF}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-border" onClick={handleExportExcel}>
            <Download className="h-4 w-4" /> EXCEL
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-border" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4" /> {isAr ? "استيراد" : "Import"}
          </Button>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground" onClick={() => setIsNewOpen(true)}>
            <Plus className="h-4 w-4" /> {isAr ? "إضافة وظيفة" : "New Job Profile"}
          </Button>
        </div>
      </div>

      {/* Filters & List */}
      <Card className="bg-card/40 border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={isAr ? "بحث بالاسم أو القسم..." : "Search by title or department..."} className="pl-9 bg-muted/20" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] bg-muted/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left border-b border-border/50">
                <tr>
                  <th className="p-4 font-medium">{isAr ? "المسمى الوظيفي" : "Job Title"}</th>
                  <th className="p-4 font-medium">{isAr ? "القسم" : "Department"}</th>
                  <th className="p-4 font-medium text-center">{isAr ? "النقاط" : "Points"}</th>
                  <th className="p-4 font-medium text-center">{isAr ? "الدرجة" : "Grade"}</th>
                  <th className="p-4 font-medium">{isAr ? "الحالة" : "Status"}</th>
                  <th className="p-4 font-medium text-right">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {profiles.map((p) => (
                  <motion.tr 
                    key={p.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="p-4 font-semibold">{p.title}</td>
                    <td className="p-4 text-muted-foreground">{p.department}</td>
                    <td className="p-4 text-center font-mono">{p.points}</td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold">
                        {p.grade}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Approved' ? 'bg-emerald-500' : p.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-500'}`} />
                        <span className="text-xs font-medium">{p.status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Job Evaluation Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 border-b border-border/50">
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              {isAr ? "تقييم وظيفة جديدة" : "New Job Evaluation Session"}
            </DialogTitle>
            <DialogDescription>
              {isAr ? "اتبع الخطوات لتحديد المسمى الوظيفي وتقييم العوامل." : "Follow the steps to define the job and evaluate its factors."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {evalStep === 0 ? (
                <motion.div 
                  key="step0"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{isAr ? "المسمى الوظيفي (EN)" : "Job Title (EN)"}</label>
                      <Input placeholder="e.g. Senior Accountant" className="bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{isAr ? "المسمى الوظيفي (AR)" : "Job Title (AR)"}</label>
                      <Input placeholder="مثال: محاسب أول" className="text-right bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{isAr ? "القسم" : "Department"}</label>
                      <Select>
                        <SelectTrigger className="bg-muted/20">
                          <SelectValue placeholder="Select Dept" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it">IT</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-8"
                >
                  {["Skills", "Responsibility", "Effort", "Conditions"].map((cat) => (
                    <div key={cat} className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {cat}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {SUB_FACTORS.filter(sf => sf.category === cat).map(sf => (
                          <div key={sf.id} className="space-y-2 p-3 rounded-lg border border-border/50 bg-muted/10">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold">{sf.name}</label>
                              <Badge variant="outline" className="text-[10px]">Level Selection</Badge>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(lv => (
                                <button 
                                  key={lv}
                                  className="flex-1 h-8 rounded border border-border/50 hover:bg-primary/20 hover:border-primary/50 text-[10px] font-bold transition-all flex items-center justify-center"
                                >
                                  L{lv}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="p-6 border-t border-border/50 bg-muted/20">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Current Score</p>
                  <p className="text-xl font-mono font-bold">0 <span className="text-xs">/ 1000</span></p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Assigned Grade</p>
                  <p className="text-xl font-bold text-primary">N/A</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setIsNewOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
                {evalStep === 0 ? (
                  <Button onClick={() => setEvalStep(1)} className="gap-2">
                    {isAr ? "التالي" : "Next: Evaluation"} <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="bg-primary text-primary-foreground gap-2">
                    <CheckCircle2 className="h-4 w-4" /> {isAr ? "حفظ التقييم" : "Save Evaluation"}
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
