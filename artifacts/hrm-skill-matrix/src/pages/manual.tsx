import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/i18n";
import { 
  BookOpen, 
  Target, 
  BarChart4, 
  ShieldCheck, 
  Users, 
  Zap, 
  FileJson, 
  Download,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ManualPage() {
  const t = useT();

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="border-b border-border pb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3 text-primary">
          <BookOpen className="h-8 w-8" />
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase">System Documentation & Manual</h1>
        </div>
        <p className="text-muted-foreground text-lg">Comprehensive guide for the HRM Development suite.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary uppercase tracking-wider text-sm">
              <Target className="h-4 w-4" /> Core Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            The HRM Development suite is engineered to provide precise, data-driven intelligence on workforce competencies. 
            By mapping skills to industrial requirements, the system enables optimized production scheduling, targeted training interventions, and merit-based career progression.
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary uppercase tracking-wider text-sm">
              <ShieldCheck className="h-4 w-4" /> Authority & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Role-based access control (RBAC) ensures data integrity. 
            <span className="text-foreground font-semibold"> Super Admins</span> manage the entire ecosystem, <span className="text-foreground font-semibold">HR Coordinators</span> focus on campaigns and training, and <span className="text-foreground font-semibold">Dept Heads</span> maintain local team evaluations.
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <BarChart4 className="h-5 w-5" /> Evaluation Framework
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Badge className="mb-2 bg-emerald-600">CLASS A — EXPERT</Badge>
            <p className="text-xs text-muted-foreground">Score ≥ 85%. Employees who can perform independently and train others. Critical for high-precision operations.</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Badge className="mb-2 bg-amber-600">CLASS B — DEVELOPING</Badge>
            <p className="text-xs text-muted-foreground">Score 60% – 84%. Proficient operators who require occasional supervision but maintain consistent output quality.</p>
          </div>
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <Badge className="mb-2 bg-rose-600">CLASS C — NEEDS TRAINING</Badge>
            <p className="text-xs text-muted-foreground">Score &lt; 60%. New hires or cross-trained staff requiring constant supervision. Primary target for training modules.</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <h3 className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Zap className="h-5 w-5" /> Operational Workflow
        </h3>
        <div className="space-y-3">
          {[
            { step: "01", title: "Skill Definitions", desc: "Define technical and soft skills with specific weights (1-10) and criticality levels (Low to Critical)." },
            { step: "02", title: "Campaign Launch", desc: "Create time-bound evaluation windows for specific departments or the entire workforce." },
            { step: "03", title: "Score Entry", desc: "Department heads utilize the Industrial Matrix or Spreadsheet Tool to input 0-4 values per skill." },
            { step: "04", title: "Analytics & Export", desc: "System auto-calculates weighted averages and generates PDF reports for individual or department performance." }
          ].map((item) => (
            <div key={item.step} className="flex gap-4 p-4 rounded-md bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors group">
              <span className="text-2xl font-black text-primary/20 group-hover:text-primary/40 transition-colors shrink-0">{item.step}</span>
              <div>
                <p className="font-bold uppercase text-sm tracking-tighter text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 pt-4">
        <section className="space-y-4">
          <h3 className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <FileJson className="h-5 w-5" /> Data Engineering
          </h3>
          <Card className="bg-black/40 border-border">
            <CardContent className="p-0">
              <pre className="text-[10px] p-4 overflow-x-auto font-mono text-emerald-500/80 leading-tight">
{`{
  "scoring": {
    "0": "Cannot perform / No exposure",
    "1": "Constant supervision required",
    "2": "Occasional supervision required",
    "3": "Independent performance",
    "4": "Expert / Trainer level"
  },
  "weighted_avg": "Σ(score * weight) / Σ(max_score * weight)",
  "criticality_multiplier": true
}`}
              </pre>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Download className="h-5 w-5" /> Technical Exports
          </h3>
          <div className="space-y-2">
            <div className="p-3 rounded-md bg-muted/40 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-xs font-medium">PDF Evaluation Report</span>
              </div>
              <Badge variant="outline" className="text-[9px]">v1.4 - AutoGen</Badge>
            </div>
            <div className="p-3 rounded-md bg-muted/40 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium">XLSX Bulk Skill Matrix</span>
              </div>
              <Badge variant="outline" className="text-[9px]">v2.1 - Spreadsheet</Badge>
            </div>
            <div className="p-3 rounded-md bg-muted/40 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium">JSON System Snapshot</span>
              </div>
              <Badge variant="outline" className="text-[9px]">v1.0 - Backup</Badge>
            </div>
          </div>
        </section>
      </div>

      <div className="pt-10 flex justify-center">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary/60">
          <Info className="h-3 w-3" />
          <span>HRM Development System v2.4.8 — Industrial Excellence</span>
        </div>
      </div>
    </div>
  );
}
