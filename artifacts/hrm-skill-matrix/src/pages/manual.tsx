import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Target, 
  ShieldCheck, 
  Zap, 
  FileJson, 
  Download,
  Info,
  Scaling,
  Layers,
  BrainCircuit,
  LayoutDashboard,
  Database,
  Crosshair
} from "lucide-react";

const CornerMarks = () => (
  <>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/40" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/40" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/40" />
  </>
);

export default function ManualPage() {
  const isAr = document.documentElement.dir === "rtl";
  const [activeTab, setActiveTab] = useState("overview");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-6 pb-32 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section - Industrial Console Style */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative p-16 bg-[#0E0E0E] border-2 border-primary/30 shadow-[0_0_50px_rgba(212,175,55,0.05)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
            <div className="h-32 w-32 bg-primary/10 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <BookOpen className="h-16 w-16" />
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-primary/20 rounded-full" 
            />
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="h-1 w-8 bg-primary" />
              <span className="font-headline font-black tracking-[0.4em] uppercase text-[10px] text-primary">
                {isAr ? "البروتوكول التشغيلي" : "Operational Protocol"}
              </span>
              <div className="h-1 w-8 bg-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {isAr ? "دليل نظام الموارد البشرية" : "HRM SYSTEM MANUAL"}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 rounded-none px-4 py-1 font-mono text-[10px]">
                BUILD v2.4.8
              </Badge>
              <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/5 rounded-none px-4 py-1 font-mono text-[10px]">
                AUTH_LEVEL: ADMIN
              </Badge>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/5 rounded-none px-4 py-1 font-mono text-[10px]">
                STATUS: ENCRYPTED
              </Badge>
            </div>
          </div>
        </div>
        <CornerMarks />
      </motion.div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
        <div className="flex justify-center sticky top-4 z-50">
          <TabsList className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-primary/30 p-1 rounded-none shadow-2xl">
            {[
              { id: "overview", icon: LayoutDashboard, label: isAr ? "نظرة عامة" : "Overview" },
              { id: "skills", icon: BrainCircuit, label: isAr ? "مصفوفة المهارات" : "Skill Matrix" },
              { id: "evaluation", icon: Scaling, label: isAr ? "تقييم الوظائف" : "Job Evaluation" },
              { id: "tech", icon: Database, label: isAr ? "البيانات التقنية" : "Technical Data" }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none px-8 py-3 flex items-center gap-3 transition-all font-headline font-black text-[11px] tracking-widest uppercase border border-transparent data-[state=active]:border-primary/50"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" className="mt-0">
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div variants={item}>
                <Card className="h-full bg-[#121212] border border-white/10 rounded-none relative group hover:border-primary/50 transition-all overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-30 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-2xl font-black uppercase flex items-center gap-3">
                      <Target className="h-6 w-6 text-primary" />
                      {isAr ? "الهدف الاستراتيجي" : "STRATEGIC OBJECTIVE"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-secondary/70 leading-relaxed font-medium">
                    <p className="border-l-2 border-primary/20 pl-4 py-2 italic bg-primary/5">
                      {isAr 
                        ? "تحويل إدارة الموارد البشرية من وظيفة إدارية إلى محرك استراتيجي قائم على البيانات." 
                        : "Transforming HR management from an administrative function to a data-driven strategic engine."}
                    </p>
                    <p className="mt-4">
                      {isAr 
                        ? "نظامنا يضمن الشفافية المطلقة في تقييم الكفاءات، مما يسمح باتخاذ قرارات دقيقة تتعلق بالترقيات، التدريب، وتخصيص الموارد في بيئة صناعية عالية الضغط." 
                        : "Our system ensures absolute transparency in competency evaluation, allowing for precise decisions regarding promotions, training, and resource allocation in high-pressure industrial environments."}
                    </p>
                  </CardContent>
                  <CornerMarks />
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full bg-[#121212] border border-white/10 rounded-none relative group hover:border-emerald-500/50 transition-all overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-2xl font-black uppercase flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-500" />
                      {isAr ? "بروتوكول الأمان" : "SECURITY PROTOCOL"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-secondary/70 leading-relaxed font-medium">
                    <div className="space-y-4">
                      {[
                        { r: "ADMIN", d: isAr ? "تحكم كامل في النظام والمعايير." : "Full override authority over all system parameters." },
                        { r: "MANAGER", d: isAr ? "إدارة تقييمات القسم والتقارير." : "Manage departmental evaluations and analytical exports." },
                        { r: "COORDINATOR", d: isAr ? "تنسيق حملات التقييم والتدريب." : "Coordinate assessment campaigns and training logs." }
                      ].map((role) => (
                        <div key={role.r} className="flex gap-4 items-center">
                          <div className="font-mono text-[10px] bg-white/5 px-2 py-1 border border-white/10 text-emerald-500">{role.r}</div>
                          <p className="text-xs">{role.d}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CornerMarks />
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { class: "CLASS A", color: "border-emerald-500", text: "text-emerald-500", label: "EXPERT", desc: isAr ? "درجة ≥ 85%. استقلالية تامة وقدرة على التوجيه." : "Score ≥ 85%. Full autonomy and mentoring capability." },
                  { class: "CLASS B", color: "border-primary", text: "text-primary", label: "ADVANCED", desc: isAr ? "درجة 60% – 84%. كفاءة عالية مع إشراف محدود." : "Score 60% – 84%. High proficiency with limited oversight." },
                  { class: "CLASS C", color: "border-rose-500", text: "text-rose-500", label: "TRAINEE", desc: isAr ? "درجة < 60%. طور التعلم، يحتاج إشراف مستمر." : "Score < 60%. Learning phase, requires continuous supervision." }
                ].map((c, i) => (
                  <motion.div key={i} variants={item} className={`p-8 bg-[#121212] border-t-4 ${c.color} relative group`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`font-headline font-black text-2xl ${c.text}`}>{c.class}</span>
                      <Badge variant="outline" className={`rounded-none border-current ${c.text} text-[10px] px-2`}>{c.label}</Badge>
                    </div>
                    <p className="text-sm text-secondary/60 leading-relaxed">{c.desc}</p>
                    <CornerMarks />
                  </motion.div>
                ))}
              </div>

              <motion.div variants={item} className="p-12 bg-[#0E0E0E] border border-primary/20 relative">
                <h3 className="font-headline text-3xl font-black uppercase text-primary mb-12 flex items-center gap-4">
                  <Zap className="h-8 w-8" />
                  {isAr ? "مسار العمليات التشغيلي" : "OPERATIONAL PIPELINE"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { s: "01", t: isAr ? "تحديد المعايير" : "DEFINE", d: isAr ? "برمجة المهارات والأوزان." : "Initialize skill matrices & weights." },
                    { s: "02", t: isAr ? "إطلاق الحملة" : "DEPLOY", d: isAr ? "تفعيل نافذة التقييم." : "Activate evaluation window." },
                    { s: "03", t: isAr ? "التقييم" : "EXECUTE", d: isAr ? "إدخال البيانات الفنية." : "Execute score inputs." },
                    { s: "04", t: isAr ? "التحليل" : "ANALYZE", d: isAr ? "تصدير الذكاء التشغيلي." : "Export operational intelligence." }
                  ].map((step, idx) => (
                    <div key={idx} className="relative group p-6 bg-white/5 border border-white/5 hover:border-primary/50 transition-all">
                      <span className="font-mono text-5xl font-black text-white/5 absolute -top-4 -right-2 group-hover:text-primary/20 transition-colors">{step.s}</span>
                      <h4 className="font-headline font-black text-lg text-white mb-2">{step.t}</h4>
                      <p className="text-xs text-secondary/50 uppercase tracking-tighter">{step.d}</p>
                      {idx < 3 && <div className="hidden md:block absolute top-1/2 -right-4 translate-y-[-50%] z-20 text-primary/30 font-black text-xl">>></div>}
                    </div>
                  ))}
                </div>
                <CornerMarks />
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="evaluation" className="mt-0">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <motion.div variants={item} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Scaling className="h-10 w-10 text-primary" />
                    <h3 className="font-headline text-4xl font-black uppercase text-white leading-none">
                      {isAr ? "مصفوفة النقاط الأربعة" : "POINT FACTOR MATRIX"}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { l: "SKILLS & KNOWLEDGE", w: "350", p: "35%", d: isAr ? "الخبرة، التعليم، والقدرات التقنية." : "Experience, Education, and Tech Cap." },
                      { l: "RESPONSIBILITY", w: "350", p: "35%", d: isAr ? "صنع القرار، الإشراف، والتبعات المالية." : "Decision Making, Supervision, Fiscal impact." },
                      { l: "EFFORT / CONCENTRATION", w: "100", p: "10%", d: isAr ? "التركيز الذهني والجهد البدني." : "Mental density and physical exertion." },
                      { l: "WORKING CONDITIONS", w: "200", p: "20%", d: isAr ? "المخاطر، السفر، وبيئة العمل." : "Hazards, travel, and environment." }
                    ].map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-[#121212] border border-white/10 group hover:border-primary/50 transition-all relative">
                        <div className="space-y-2">
                          <p className="font-headline font-black text-sm tracking-widest text-white">{f.l}</p>
                          <p className="text-[10px] text-secondary/40 font-mono">{f.d}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-2xl font-black text-primary leading-none">{f.w}</p>
                          <p className="text-[9px] text-secondary/40 font-bold tracking-[0.2em]">{f.p}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={item} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Layers className="h-10 w-10 text-primary" />
                    <h3 className="font-headline text-4xl font-black uppercase text-white leading-none">
                      {isAr ? "توزيع الدرجات الوظيفية" : "GRADE HIERARCHY"}
                    </h3>
                  </div>
                  <div className="bg-[#0A0A0A] border border-primary/30 p-1 relative overflow-hidden">
                    <table className="w-full text-[10px] font-mono border-collapse">
                      <thead className="bg-primary/10 text-primary font-black uppercase tracking-widest">
                        <tr>
                          <th className="p-4 border border-primary/20 text-center">GRADE</th>
                          <th className="p-4 border border-primary/20 text-center">POINTS</th>
                          <th className="p-4 border border-primary/20 text-left">DESIGNATION</th>
                        </tr>
                      </thead>
                      <tbody className="text-white">
                        {[
                          { g: "G1-G2", p: "100 - 199", c: "SUPPORT / LABOR" },
                          { g: "G3-G4", p: "200 - 329", c: "TECHNICAL / ADMIN" },
                          { g: "G5-G6", p: "330 - 509", c: "PROFESSIONAL / SR." },
                          { g: "G7-G8", p: "510 - 769", c: "MANAGEMENT / HEAD" },
                          { g: "G9-G10", p: "770 - 1000", c: "EXECUTIVE / DIRECTOR" }
                        ].map((r, i) => (
                          <tr key={i} className="hover:bg-primary/5 transition-colors group">
                            <td className="p-4 border border-white/5 text-center font-black group-hover:text-primary">{r.g}</td>
                            <td className="p-4 border border-white/5 text-center">{r.p}</td>
                            <td className="p-4 border border-white/5 text-left text-secondary/50 group-hover:text-white transition-colors">{r.c}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <CornerMarks />
                  </div>
                  <div className="p-6 bg-primary/5 border border-primary/20 flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full border border-primary flex items-center justify-center animate-pulse">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs text-secondary/60 leading-tight">
                      {isAr 
                        ? "يتم تحديد الدرجة النهائية تلقائياً بمجرد إغلاق جلسة التقييم وحساب مجموع نقاط العوامل." 
                        : "Final grade is automatically determined upon evaluation session closure and factor point summation."}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="tech" className="mt-0">
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div variants={item} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center">
                    <FileJson className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-headline text-3xl font-black uppercase text-white">DATA_SCHEMA</h3>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-transparent opacity-30 group-hover:opacity-50 blur transition duration-1000"></div>
                  <div className="relative bg-[#050505] border border-white/10 p-8 font-mono text-[11px] text-emerald-500 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                      <span className="text-white/30 text-[9px]">METHODOLOGY_STRUCT.JSON</span>
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    <pre className="leading-relaxed">
{`{
  "protocol": "POINT_FACTOR",
  "calibration": {
    "total_units": 1000,
    "granularity": 5,
    "weights": {
      "skill_cap": 0.35,
      "responsibility": 0.35,
      "effort": 0.10,
      "conditions": 0.20
    }
  },
  "export_formats": ["PDF", "XLSX", "JSON"],
  "security": "AES-256-GCM"
}`}
                    </pre>
                  </div>
                  <CornerMarks />
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-headline text-3xl font-black uppercase text-white">SYSTEM_EXPORTS</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { l: "PDF_EVALUATION_REPORT", v: "v2.1", s: "SECURE", c: "text-rose-500" },
                    { l: "XLSX_DATA_MATRIX", v: "v3.0", s: "READY", c: "text-emerald-500" },
                    { l: "JSON_SYSTEM_STATE", v: "v1.5", s: "PROTECTED", c: "text-primary" }
                  ].map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-[#121212] border border-white/5 group hover:border-primary/50 transition-all relative">
                      <div className="flex items-center gap-6">
                        <Crosshair className={`h-5 w-5 ${e.c} opacity-50 group-hover:opacity-100 transition-all`} />
                        <div>
                          <span className="font-headline font-black text-sm tracking-widest text-white block">{e.l}</span>
                          <span className="text-[9px] font-mono text-secondary/30">HASH: SHA256_{Math.random().toString(16).substring(2, 10).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-white/5 text-secondary/50 rounded-none border-white/10 font-mono text-[9px] mb-1">{e.v}</Badge>
                        <span className={`block text-[8px] font-black tracking-widest ${e.c}`}>{e.s}</span>
                      </div>
                      <div className="absolute top-0 right-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-300" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="pt-24 flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="h-px w-20 bg-primary/30" />
          <div className="flex items-center gap-3 px-8 py-3 bg-[#0A0A0A] border border-primary/40 text-[10px] text-primary/80 font-headline font-black tracking-[0.5em] uppercase">
            <Info className="h-4 w-4" />
            HRM_DEV_SUITE :: INDUSTRIAL_EXCELLENCE :: 2026
          </div>
          <div className="h-px w-20 bg-primary/30" />
        </div>
        <div className="flex gap-8 text-[9px] font-mono text-secondary/20 uppercase tracking-[0.2em]">
          <span>© DEEPMIND_SYSTEMS</span>
          <span>LATENCY: 0.002MS</span>
          <span>KERN_MOD: HR_EVAL_SCORER</span>
        </div>
      </motion.div>
    </div>
  );
}
