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
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
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
      <motion.div variants={item} className="relative p-12 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden text-center md:text-left">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
             <div className="flex items-center justify-center md:justify-start gap-3">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">OPERATIONAL_MANUAL_v9.4</span>
             </div>
             <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-white uppercase leading-none">
               {isAr ? "دليل بروتوكول تقييم الوظائف" : "VALUATION_PROTOCOL_MANUAL"}
             </h1>
             <p className="text-secondary/40 font-medium border-l-2 border-primary/20 pl-4 text-lg max-w-2xl mx-auto md:mx-0">
               {isAr 
                 ? "دليل شامل لفهم كيفية تقييم الوظائف وتحديد الدرجات الوظيفية باستخدام المعايير العلمية." 
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Target, title: isAr ? "الغرض من التقييم" : "EVALUATION_PURPOSE", val: "EQUITY", color: "sky-400", desc: isAr ? "تحقيق العدالة الداخلية من خلال مقارنة المتطلبات بشكل موضوعي." : "Achieving absolute internal equity by objectively comparing mental and physical requirement streams." },
          { icon: ShieldCheck, title: isAr ? "الموضوعية والحياد" : "SYSTEM_NEUTRALITY", val: "OBJECTIVE", color: "emerald-400", desc: isAr ? "يتم تقييم الوظيفة نفسها وليس شاغل الوظيفة." : "The architectural node is evaluated, not the operative. Focusing on minimum structural requirements." },
          { icon: Scale, title: isAr ? "هيكل الدرجات" : "GRADING_ARCH", val: "SCALABLE", color: "amber-400", desc: isAr ? "تحويل النقاط الإجمالية إلى درجات وظيفية (G1-G10)." : "Seamless conversion of aggregated point streams into hierarchical grades for fiscal calibration." },
        ].map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none relative group hover:border-current transition-all overflow-hidden h-full" style={{ color: `var(--${stat.color})` } as any}>
              <CardHeader className="p-8 border-b border-zinc-900">
                <div className={`h-12 w-12 border flex items-center justify-center mb-6 transition-transform group-hover:scale-110`} style={{ borderColor: 'currentColor' }}>
                  <stat.icon className="h-6 w-6" style={{ color: 'currentColor' }} />
                </div>
                <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter">{stat.title}</CardTitle>
                <div className="font-mono text-[9px] uppercase tracking-widest mt-1 opacity-50">NODE_STATUS::{stat.val}</div>
              </CardHeader>
              <CardContent className="p-8 font-sans font-medium text-zinc-500 text-sm leading-relaxed">
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
            <h2 className="font-headline text-2xl font-black uppercase tracking-widest">{isAr ? "عوامل التقييم الأربعة" : "COMPENSABLE_FACTORS"}</h2>
            <div className="flex-1 h-px bg-zinc-900" />
          </div>

          <div className="space-y-6">
            {[
              { 
                title: isAr ? "المهارات (35%)" : "SKILLS_MATRIX (35%)", 
                desc: isAr ? "تشمل التعليم، الخبرة، والمعرفة التقنية المطلوبة." : "Includes required education, experience, and technical knowledge streams.",
                sub: ["EDUCATION", "EXPERIENCE", "TECH_KNOWLEDGE"]
              },
              { 
                title: isAr ? "المسؤولية (35%)" : "RESPONSIBILITY_DOMAIN (35%)", 
                desc: isAr ? "تشمل صنع القرار، الإشراف على الآخرين، والمسؤولية المالية." : "Includes decision-making, supervision of others, and fiscal responsibility protocols.",
                sub: ["DECISION_MAKING", "SUPERVISION", "CONFIDENTIALITY"]
              },
              { 
                title: isAr ? "المجهود (10%)" : "EFFORT_VECTOR (10%)", 
                desc: isAr ? "تشمل المجهود الذهني والبدني المبذول في العمل." : "Includes mental concentration and physical exertion bandwidth.",
                sub: ["MENTAL_CONCENTRATION", "PHYSICAL_DEMAND"]
              },
              { 
                title: isAr ? "ظروف العمل (20%)" : "ENVIRONMENT_LOGS (20%)", 
                desc: isAr ? "تشمل المخاطر والبيئة المادية المحيطة بالعمل." : "Includes hazards and the physical surrounding operational environment.",
                sub: ["HAZARDS", "ENVIRONMENT", "WORK_SCHEDULE"]
              }
            ].map((f, i) => (
              <div key={i} className="p-8 bg-[#0D0D0D] border border-zinc-900 group hover:border-primary/40 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-zinc-800 group-hover:text-primary transition-colors">0{i+1}_CORE</div>
                <h3 className="font-headline font-black text-lg text-white uppercase tracking-widest mb-4 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-[11px] font-sans font-medium text-zinc-500 mb-6 leading-relaxed">{f.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {f.sub.map((s, si) => (
                    <Badge key={si} variant="outline" className="rounded-none border-zinc-800 bg-black text-[8px] font-mono font-black tracking-tighter text-zinc-600 px-3 py-1 group-hover:border-primary/20 transition-colors uppercase">
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
            <h2 className="font-headline text-2xl font-black uppercase tracking-widest">{isAr ? "مستويات التقييم" : "LEVEL_SCORING_v9.2"}</h2>
            <div className="flex-1 h-px bg-zinc-900" />
          </div>

          <Card className="bg-[#0A0A0A] border border-zinc-800 rounded-none overflow-hidden relative">
            <div className="divide-y divide-zinc-900">
              {[
                { lv: "L1", title: isAr ? "مبتدئ / أساسي" : "BASIC_ENTRY", desc: isAr ? "مهام بسيطة تتطلب إشرافاً مباشراً." : "Simple tasks requiring direct supervision protocols." },
                { lv: "L2", title: isAr ? "متوسط" : "INTERMEDIATE", desc: isAr ? "فهم جيد للمهام مع استقلالية محدودة." : "Proficient understanding with limited node autonomy." },
                { lv: "L3", title: isAr ? "ماهر" : "PROFICIENT", desc: isAr ? "أداء مهام معقدة بشكل مستقل." : "Independent performance of complex operational tasks." },
                { lv: "L4", title: isAr ? "خبير" : "SYSTEM_EXPERT", desc: isAr ? "تقديم المشورة الفنية وقيادة الفرق." : "Technical advisory and tactical team leadership." },
                { lv: "L5", title: isAr ? "رائد / استراتيجي" : "STRATEGIC_MASTER", desc: isAr ? "تحديد التوجهات الاستراتيجية للمؤسسة." : "Architecting strategic organizational direction." }
              ].map((l, i) => (
                <div key={i} className="p-6 flex gap-6 hover:bg-primary/[0.02] transition-colors group">
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

          <div className="p-8 bg-amber-500/[0.03] border border-amber-500/20 relative overflow-hidden group">
            <Cpu className="absolute -right-4 -bottom-4 h-24 w-24 text-amber-500 opacity-5 group-hover:opacity-10 transition-all duration-700" />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30">
                 <Info className="h-5 w-5 text-amber-500" />
              </div>
              <h4 className="font-headline font-black text-sm text-white uppercase tracking-[0.2em]">{isAr ? "معادلة الاحتساب" : "CALCULATION_LOGIC"}</h4>
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
           <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />
          <CardHeader className="text-center p-12 border-b border-zinc-900">
             <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-12 bg-primary/30" />
                <span className="font-headline font-black text-[10px] text-primary tracking-[0.4em] uppercase">SYSTEM_TIER_MAPPING</span>
                <div className="h-px w-12 bg-primary/30" />
             </div>
             <CardTitle className="font-headline font-black text-4xl text-white uppercase tracking-tighter">{isAr ? "جدول الدرجات الوظيفية" : "STANDARD_GRADE_MATRIX"}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-900/50 text-zinc-500 uppercase text-[10px] font-headline font-black tracking-widest border-b border-zinc-800">
                    <th className="p-8 text-center">{isAr ? "الدرجة" : "TIER_GRADE"}</th>
                    <th className="p-8 text-center">{isAr ? "نطاق النقاط" : "POINT_BAND"}</th>
                    <th className="p-8 text-left">{isAr ? "التصنيف الإداري" : "H_CATEGORY"}</th>
                    <th className="p-8 text-right">{isAr ? "الحالة" : "STATUS"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-mono">
                  {[
                    { g: "G1-G2", range: "100 - 199", cat: isAr ? "عمالي / مساعد" : "Labor / Support Node" },
                    { g: "G3-G4", range: "200 - 329", cat: isAr ? "موظف فني / إداري" : "Technical / Admin Operative" },
                    { g: "G5-G6", range: "330 - 509", cat: isAr ? "أخصائي / مهني" : "Professional / Specialist" },
                    { g: "G7-G8", range: "510 - 769", cat: isAr ? "إدارة وسطى / عليا" : "Middle / Senior Management" },
                    { g: "G9-G10", range: "770 - 1000", cat: isAr ? "تنفيذي / قيادي" : "Executive / Strategic Lead" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-primary/[0.03] transition-colors group">
                      <td className="p-8 text-center font-headline font-black text-2xl text-primary">{row.g}</td>
                      <td className="p-8 text-center text-lg font-black text-white">{row.range}</td>
                      <td className="p-8 text-left font-headline font-black text-[10px] text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">{row.cat}</td>
                      <td className="p-8 text-right">
                         <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-[9px] tracking-tighter">
                            <Activity className="h-3 w-3 animate-pulse" /> ACTIVE_TIER
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
      <div className="p-10 border-2 border-primary/20 bg-primary/[0.03] relative overflow-hidden group">
         <Terminal className="absolute -right-6 -top-6 h-32 w-32 text-primary opacity-5 group-hover:opacity-10 transition-all duration-1000" />
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
               <p className="font-headline font-black text-sm text-primary uppercase tracking-[0.3em]">MANUAL_READY_FOR_OPERATIVES</p>
               <p className="text-[10px] font-mono text-zinc-600 leading-relaxed uppercase tracking-widest">
                  DOC_REF::94.2.0 // SECURITY_VERIFIED // ARCHITECT_AUTHORIZED
               </p>
            </div>
            <div className="flex items-center gap-4">
               <Button variant="outline" className="rounded-none border-zinc-800 font-headline font-black text-[10px] tracking-widest uppercase h-10 px-6">
                  INITIALIZE_PROTOCOL <ChevronRight className="ml-2 h-3 w-3" />
               </Button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
