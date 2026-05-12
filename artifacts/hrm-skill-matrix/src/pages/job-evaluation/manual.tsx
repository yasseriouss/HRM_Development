import { motion } from "framer-motion";
import { useT } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)]`} />
  </>
);

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
      className="space-y-12 pb-24 font-sans text-white"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header Section - Industrial focus */}
      <motion.div variants={item} className="relative p-12 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden text-center md:text-start">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
             <div className="flex items-center justify-center md:justify-start gap-3">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">OPERATIONAL MANUAL_v9.4</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-white uppercase leading-none text-shimmer">{t("je_manual_title")}
             </h1>
             <p className="text-secondary/40 font-medium border-s-2 border-primary/20 ps-4 text-lg max-w-2xl mx-auto md:mx-0">
               {isAr 
                 ? "Ø¯Ù„ÙŠÙ„ Ø´Ø§Ù…Ù„ Ù„ÙÙ‡Ù… ÙƒÙŠÙÙŠØ© ØªÙ‚ÙŠÙŠÙ… Ø§Ù„ÙˆØ¸Ø§Ø¦Ù ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¯Ø±Ø¬Ø§Øª Ø§Ù„ÙˆØ¸ÙŠÙÙŠØ© Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ø¹Ø§ÙŠÙŠØ± Ø§Ù„Ø¹Ù„Ù…ÙŠØ©." 
                 : "Recursive structural guide for comprehensive job valuation and hierarchical grade calibration using scientific compensable vectors."}
             </p>
          </div>
          <div className="p-8 bg-primary/10 border border-primary/20 hidden lg:block">
             <BookOpen className="h-16 w-16 text-primary" />
          </div>
        </div>
        <CornerMarks />
      </motion.div>

      {/* Methodology Overview - Tactical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{[
          { icon: Target, title: t("je_purpose_title"), val: t("je_val_equity"), color: "sky-400", desc: t("je_purpose_desc") },
          { icon: ShieldCheck, title: t("je_neutrality_title"), val: t("je_val_objective"), color: "emerald-400", desc: t("je_neutrality_desc") },
          { icon: Scale, title: t("je_grading_arch_title"), val: t("je_val_scalable"), color: "amber-400", desc: t("je_grading_arch_desc") },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="bg-[#0D0D0D] border border-zinc-900 rounded-none relative group hover:border-primary/30 transition-all duration-500 overflow-hidden h-full shadow-xl">
              <CardHeader className="p-10 border-b border-zinc-900">
                <div className={`h-14 w-14 border-2 flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-white/5 relative overflow-hidden`} style={{ borderColor: stat.color === "sky-400" ? "rgb(56,189,248,0.4)" : stat.color === "emerald-400" ? "rgb(52,211,153,0.4)" : "rgb(251,191,36,0.4)" }}>
                  <stat.icon className="h-6 w-6 relative z-10" style={{ color: stat.color === "sky-400" ? "#38bdf8" : stat.color === "emerald-400" ? "#34d399" : "#fbbf24" }} />
                  <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                </div>
                <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter">{stat.title}</CardTitle>
                <div className="font-mono text-[8px] uppercase tracking-[0.2em] mt-3 text-zinc-600">NODE STATUS::<span className="text-primary/60">{stat.val}</span></div>
              </CardHeader>
              <CardContent className="p-10 font-sans font-medium text-zinc-500 text-[11px] leading-relaxed uppercase tracking-widest opacity-80">
                {stat.desc}
              </CardContent>
              <CornerMarks color="zinc" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        {/* Factors Detail - High Tech List */}
        <motion.div variants={item} className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 bg-primary rotate-45" />
            <h2 className="font-headline text-2xl font-black uppercase tracking-widest">{t("je_manual_factors")}</h2>
            <div className="flex-1 h-px bg-zinc-900" />
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
              <div key={i} className="p-10 bg-[#0D0D0D] border border-zinc-900 group hover:border-primary/30 transition-all duration-500 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-6 font-mono text-[8px] text-zinc-800 tracking-[0.2em] group-hover:text-primary transition-colors duration-500">0{i+1}_VECTORS</div>
                <h3 className="font-headline font-black text-xl text-white uppercase tracking-tighter mb-6 group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                <p className="text-[11px] font-sans font-medium text-zinc-500 mb-8 leading-relaxed uppercase tracking-widest opacity-80">{f.desc}</p>
                <div className="flex flex-wrap gap-3">
                  {f.sub.map((s, si) => (
                    <Badge key={si} variant="outline" className="rounded-none border-zinc-900 bg-zinc-900/50 text-[8px] font-mono font-black tracking-[0.2em] text-zinc-500 px-4 py-1.5 group-hover:border-primary/20 transition-all duration-300 uppercase shadow-inner">
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
            <div className="h-2 w-2 bg-amber-500 rotate-45" />
            <h2 className="font-headline text-2xl font-black uppercase tracking-widest">{t("je_rubric_title")}</h2>
            <div className="flex-1 h-px bg-zinc-900" />
          </div>

          <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-none overflow-hidden relative">
            <div className="divide-y divide-zinc-900">{[
                { lv: "L1", title: t("je_level_basic"), desc: t("je_level_basic_desc") },
                { lv: "L2", title: t("je_level_intermediate"), desc: t("je_level_intermediate_desc") },
                { lv: "L3", title: t("je_level_proficient"), desc: t("je_level_proficient_desc") },
                { lv: "L4", title: t("je_level_expert"), desc: t("je_level_expert_desc") },
                { lv: "L5", title: t("je_level_strategic"), desc: t("je_level_strategic_desc") }
              ].map((l, i) => (
                <div key={i} className="p-6 flex gap-6 hover:bg-white/5 transition-colors group">
                  <div className="h-12 w-12 shrink-0 border border-zinc-800 bg-black flex items-center justify-center font-mono font-black text-primary group-hover:border-primary transition-colors text-sm">
                    {l.lv}
                  </div>
                  <div>
                    <h4 className="font-headline font-black text-xs text-white uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{l.title}</h4>
                    <p className="text-[10px] font-sans font-medium text-zinc-500 leading-relaxed uppercase">{l.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <CornerMarks color="zinc" />
          </Card>

          <div className="p-8 bg-amber-500/10 border border-amber-500/20 relative overflow-hidden group">
            <Cpu className="absolute -right-4 -bottom-4 h-24 w-24 text-amber-500 opacity-5 group-hover:opacity-10 transition-all duration-700" />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30">
                 <Info className="h-5 w-5 text-amber-500" />
              </div>
              <h4 className="font-headline font-black text-sm text-white uppercase tracking-[0.2em]">{t("je_calc_logic")}</h4>
            </div>
            <p className="text-[11px] font-sans font-medium text-zinc-500 leading-relaxed relative z-10">
              {isAr 
                ? "يتم ضرب مستوى العامل (1-5) في وزنه النسبي المخصص للقسم والوظيفة. يتم جمع كافة النقاط للحصول على التقييم النهائي من أصل 1000 نقطة." 
                : "Recursive factor level (1-5) multiplied by relative weighted coefficient assigned to the node domain. All points aggregated into a final 1000-point structural valuation."}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Grade Mapping - Full Width Tactical Table */}
      <motion.div variants={item} className="mt-12">
        <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-none relative overflow-hidden shadow-2xl">
           <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <CardHeader className="text-center p-12 border-b border-zinc-900">
             <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-12 bg-primary/30" />
                <span className="font-headline font-black text-[10px] text-primary tracking-[0.4em] uppercase">SYSTEM TIER MAPPING</span>
                <div className="h-px w-12 bg-primary/30" />
             </div>
             <CardTitle className="font-headline font-black text-4xl text-white uppercase tracking-tighter">{t("je_matrix_title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-900/50 text-zinc-500 uppercase text-[10px] font-headline font-black tracking-widest border-b border-zinc-800">
                    <th className="p-8 text-center">{t("je_col_tier")}</th>
                    <th className="p-8 text-center">{t("je_col_band")}</th>
                    <th className="p-8 text-start">{t("je_col_cat")}</th>
                    <th className="p-8 text-end">{t("common_status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-mono">{[
                    { g: "G1-G2", range: "100 - 199", cat: t("je_cat_labor") },
                    { g: "G3-G4", range: "200 - 329", cat: t("je_cat_tech") },
                    { g: "G5-G6", range: "330 - 509", cat: t("je_cat_spec") },
                    { g: "G7-G8", range: "510 - 769", cat: t("je_cat_mgmt") },
                    { g: "G9-G10", range: "770 - 1000", cat: t("je_cat_exec") },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="p-8 text-center font-headline font-black text-2xl text-primary">{row.g}</td>
                      <td className="p-8 text-center text-lg font-black text-white">{row.range}</td>
                      <td className="p-8 text-start font-headline font-black text-[10px] text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">{row.cat}</td>
                      <td className="p-8 text-end">
                         <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-[9px] tracking-tighter">
                            <Activity className="h-3 w-3 animate-pulse" />{t("je_active_tier")}
                         </div>
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
      <div className="p-10 border-2 border-primary/20 bg-primary/5 relative overflow-hidden group">
         <Terminal className="absolute -right-6 -top-6 h-32 w-32 text-primary opacity-5 group-hover:opacity-10 transition-all duration-1000" />
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
               <p className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em]">MANUAL READY FOR OPERATIVES</p>
               <p className="text-[10px] font-mono text-zinc-600 leading-relaxed uppercase tracking-widest">DOC REF::94.2.0 // SECURITY VERIFIED // ARCHITECT AUTHORIZED
               </p>
            </div>
            <div className="flex items-center gap-4">
               <Button variant="outline" className="rounded-none border-zinc-800 font-headline font-black text-[10px] tracking-widest uppercase h-10 px-6">{t("je_initial_protocol")} <ChevronRight className="ms-2 h-3 w-3" />
               </Button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
