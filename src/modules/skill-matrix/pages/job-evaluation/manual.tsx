import { motion } from "framer-motion";
import { useT } from "@modules/skill-matrix/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  Layers, 
  Target, 
  Settings,
  Scale,
  Zap,
  Info,
  Terminal,
  Activity,
  Cpu,
  ChevronRight
} from "lucide-react";
import { cn } from "@shared/utils/cn";
import {
  dataTableBase,
  dataTableBody,
  dataTableHeadRow,
  dataTableRow,
  dataTableScroll,
  dataTableShell,
  dataTableTd,
  dataTableTh,
} from "@shared/components/data/data-table-styles";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function JobEvaluationManualPage() {
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";

  return (
    <motion.div 
      className="space-y-12 pb-24 font-sans text-foreground"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header Section - Editorial focus */}
      <motion.div variants={item} className="relative p-12 bg-surface/50 border border-muted/10 rounded-3xl overflow-hidden text-center md:text-start shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
             <div className="flex items-center justify-center md:justify-start gap-3">
                <Activity className="h-4 w-4 text-primary" />
                <span className="font-headline font-bold tracking-[0.2em] text-[10px] text-muted uppercase">OPERATIONAL MANUAL_v9.4</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground uppercase leading-none">{t("je_manual_title")}
             </h1>
             <p className="text-muted font-medium border-s-2 border-primary/20 ps-4 text-lg max-w-2xl mx-auto md:mx-0">
               {isAr 
                 ? "دليل شامل لفهم كيفية تقييم الوظائف وتحديد الدرجات الوظيفية باستخدام المعايير العلمية." 
                 : "Recursive structural guide for comprehensive job valuation and hierarchical grade calibration using scientific compensable vectors."}
             </p>
          </div>
          <div className="p-8 bg-background border border-muted/10 rounded-2xl hidden lg:block shadow-sm">
             <BookOpen className="h-16 w-16 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Methodology Overview - Tactical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{[
          { icon: Target, title: t("je_purpose_title"), val: t("je_val_equity"), color: "text-sky-600", bg: "bg-sky-500/10", border: "border-sky-500/20", desc: t("je_purpose_desc") },
          { icon: ShieldCheck, title: t("je_neutrality_title"), val: t("je_val_objective"), color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: t("je_neutrality_desc") },
          { icon: Scale, title: t("je_grading_arch_title"), val: t("je_val_scalable"), color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", desc: t("je_grading_arch_desc") },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="relative group hover:border-primary/20 transition-all duration-500 overflow-hidden h-full shadow-sm">
              <CardHeader className="p-10 border-b border-muted/5 bg-background/30">
                <div className={cn("h-14 w-14 border rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-105 relative overflow-hidden", stat.bg, stat.border)}>
                  <stat.icon className={cn("h-6 w-6 relative z-10", stat.color)} />
                </div>
                <CardTitle className="font-headline font-bold text-xl text-foreground uppercase tracking-tight">{stat.title}</CardTitle>
                <div className="font-headline font-bold text-[10px] uppercase tracking-widest mt-3 text-muted">NODE STATUS:: <span className="text-primary">{stat.val}</span></div>
              </CardHeader>
              <CardContent className="p-10 font-sans font-medium text-muted text-[11px] leading-relaxed uppercase tracking-widest">
                {stat.desc}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        {/* Factors Detail - High Tech List */}
        <motion.div variants={item} className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 bg-primary rounded-full" />
            <h2 className="font-headline text-2xl font-bold uppercase tracking-widest text-foreground">{t("je_manual_factors")}</h2>
            <div className="flex-1 h-px bg-muted/10" />
          </div>

            <div className="space-y-6">{[
              { 
                title: t("je_factor_skills_title"), 
                desc: t("je_factor_skills_desc"),
                sub: [t("je_f_education"), t("je_f_experience"), t("je_f_knowledge")]
              },
              { 
                title: t("je_factor_resp_title"), 
                desc: t("je_factor_resp_desc"),
                sub: [t("je_f_decision"), t("je_f_supervisory"), t("je_f_compliance")]
              },
              { 
                title: t("je_factor_effort_title"), 
                desc: t("je_factor_effort_desc"),
                sub: [t("je_f_mental"), t("je_f_physical")]
              },
              { 
                title: t("je_factor_env_title"), 
                desc: t("je_factor_env_desc"),
                sub: [t("je_f_hazards"), t("je_f_environment"), t("je_f_schedule")]
              }
            ].map((f, i) => (
              <div key={i} className="p-10 bg-background border border-muted/10 rounded-3xl group hover:border-primary/20 transition-all duration-500 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-6 font-headline font-bold text-[10px] text-muted tracking-widest group-hover:text-primary transition-colors duration-500">0{i+1}_VECTORS</div>
                <h3 className="font-headline font-bold text-xl text-foreground uppercase tracking-tight mb-6 group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                <p className="text-[11px] font-sans font-medium text-muted mb-8 leading-relaxed uppercase tracking-widest">{f.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {f.sub.map((s, si) => (
                    <Badge key={si} variant="outline" className="rounded-full border-muted/20 bg-muted/5 text-[9px] font-headline font-bold tracking-widest text-muted px-4 py-1.5 group-hover:border-primary/20 transition-all duration-300 uppercase shadow-sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scoring Scale - Level Selection UI */}
        <motion.div variants={item} className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 bg-amber-500 rounded-full" />
            <h2 className="font-headline text-2xl font-bold uppercase tracking-widest text-foreground">{t("je_rubric_title")}</h2>
            <div className="flex-1 h-px bg-muted/10" />
          </div>

          <Card className="border border-muted/10 rounded-3xl overflow-hidden relative shadow-sm">
            <div className="divide-y divide-muted/5">{[
                { lv: "L1", title: t("je_level_basic"), desc: t("je_level_basic_desc") },
                { lv: "L2", title: t("je_level_intermediate"), desc: t("je_level_intermediate_desc") },
                { lv: "L3", title: t("je_level_proficient"), desc: t("je_level_proficient_desc") },
                { lv: "L4", title: t("je_level_expert"), desc: t("je_level_expert_desc") },
                { lv: "L5", title: t("je_level_strategic"), desc: t("je_level_strategic_desc") }
              ].map((l, i) => (
                <div key={i} className="p-6 flex gap-6 hover:bg-muted/5 transition-colors group">
                  <div className="h-12 w-12 shrink-0 border border-muted/20 bg-background rounded-2xl flex items-center justify-center font-headline font-bold text-primary group-hover:border-primary/30 transition-colors text-sm shadow-sm">
                    {l.lv}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xs text-foreground uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{l.title}</h4>
                    <p className="text-[10px] font-sans font-medium text-muted leading-relaxed uppercase">{l.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-3xl relative overflow-hidden group shadow-sm">
            <Cpu className="absolute -right-4 -bottom-4 h-24 w-24 text-amber-500 opacity-5 group-hover:opacity-10 transition-all duration-700" />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-2 bg-background rounded-xl border border-amber-500/30">
                 <Info className="h-5 w-5 text-amber-600" />
              </div>
              <h4 className="font-headline font-bold text-sm text-foreground uppercase tracking-[0.2em]">{t("je_calc_logic")}</h4>
            </div>
            <p className="text-[11px] font-sans font-medium text-muted leading-relaxed relative z-10">
              {isAr 
                ? "يتم ضرب مستوى العامل (1-5) في وزنه النسبي المخصص للقسم والوظيفة. يتم جمع كافة النقاط للحصول على التقييم النهائي من أصل 1000 نقطة." 
                : "Recursive factor level (1-5) multiplied by relative weighted coefficient assigned to the node domain. All points aggregated into a final 1000-point structural valuation."}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Grade Mapping - Full Width Tactical Table */}
      <motion.div variants={item} className="mt-12">
        <Card className="border border-muted/10 rounded-3xl relative overflow-hidden shadow-md">
          <CardHeader className="text-center p-12 border-b border-muted/5 bg-background/30">
             <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-12 bg-primary/30" />
                <span className="font-headline font-bold text-[10px] text-primary tracking-[0.3em] uppercase">SYSTEM TIER MAPPING</span>
                <div className="h-px w-12 bg-primary/30" />
             </div>
             <CardTitle className="font-headline font-bold text-4xl text-foreground uppercase tracking-tighter">{t("je_matrix_title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className={cn(dataTableShell, "rounded-b-3xl border-0 bg-transparent p-0")}>
              <div className={dataTableScroll}>
                <table className={cn(dataTableBase, "text-sm")}>
                  <thead>
                    <tr className={cn(dataTableHeadRow, "border-muted/10 bg-muted/5 text-muted uppercase text-[10px] font-headline font-bold tracking-widest border-b")}>
                      <th className={cn(dataTableTh, "p-8 text-center border-muted/5")}>{t("je_col_tier")}</th>
                      <th className={cn(dataTableTh, "p-8 text-center border-muted/5")}>{t("je_col_band")}</th>
                      <th className={cn(dataTableTh, "p-8 text-start border-muted/5")}>{t("je_col_cat")}</th>
                      <th className={cn(dataTableTh, "p-8 text-end border-muted/5")}>{t("common_status")}</th>
                    </tr>
                  </thead>
                  <tbody className={cn(dataTableBody, "divide-muted/5 font-headline")}>
                    {[
                        { g: "G1-G2", range: "100 - 199", cat: t("je_cat_labor") },
                        { g: "G3-G4", range: "200 - 329", cat: t("je_cat_tech") },
                        { g: "G5-G6", range: "330 - 509", cat: t("je_cat_spec") },
                        { g: "G7-G8", range: "510 - 769", cat: t("je_cat_mgmt") },
                        { g: "G9-G10", range: "770 - 1000", cat: t("je_cat_exec") },
                      ].map((row, i) => (
                        <tr key={i} className={cn(dataTableRow, "border-muted/5 hover:bg-primary/5 transition-colors group")}>
                          <td className={cn(dataTableTd, "p-8 text-center font-bold text-2xl text-primary")}>{row.g}</td>
                          <td className={cn(dataTableTd, "p-8 text-center text-lg font-bold text-foreground")}>{row.range}</td>
                          <td className={cn(dataTableTd, "p-8 text-start font-bold text-[10px] text-muted uppercase tracking-widest group-hover:text-foreground transition-colors")}>{row.cat}</td>
                          <td className={cn(dataTableTd, "p-8 text-end")}>
                             <div className="flex items-center justify-end gap-2 text-emerald-600 font-bold text-[9px] tracking-widest uppercase">
                                <Activity className="h-3 w-3" />{t("je_active_tier")}
                             </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Telemetry Footer */}
      <div className="p-10 border border-muted/10 bg-surface/50 rounded-3xl relative overflow-hidden group shadow-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
               <p className="font-headline font-bold text-sm text-primary uppercase tracking-[0.2em]">MANUAL READY FOR OPERATIVES</p>
               <p className="text-[10px] font-headline font-bold text-muted leading-relaxed uppercase tracking-widest">DOC REF::94.2.0 // SECURITY VERIFIED // ARCHITECT AUTHORIZED
               </p>
            </div>
            <div className="flex items-center gap-4">
               <Button variant="outline" className="rounded-full border-muted/20 font-headline font-bold text-[10px] tracking-widest uppercase h-10 px-6 bg-background hover:bg-muted/5 hover:text-foreground">{t("je_initial_protocol")} <ChevronRight className="ms-2 h-3 w-3" />
               </Button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
