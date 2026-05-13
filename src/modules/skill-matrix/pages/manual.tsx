import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@modules/skill-matrix/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
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
  Crosshair,
  ArrowRight
} from "lucide-react";
import { cn } from "@shared/utils/cn";

export default function ManualPage() {
  const t = useT();
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
    <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 pb-32 selection:bg-zinc-900 selection:text-white">
      {/* Hero Section - Editorial Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-20 bg-white border border-zinc-100 shadow-sm overflow-hidden rounded-4xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#F4F4F5_0%,transparent_50%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="relative shrink-0">
            <div className="h-40 w-40 bg-zinc-900 rounded-4xl flex items-center justify-center text-white shadow-2xl shadow-zinc-200">
              <BookOpen className="h-16 w-16" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-6 border border-dashed border-zinc-200 rounded-full opacity-50" 
            />
          </div>
          
          <div className="text-center lg:text-start space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{t("manual_protocol")}</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-[0.9]">
              {t("manual_title")}
            </h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Badge variant="outline" className="border-zinc-200 text-zinc-500 bg-zinc-50 rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest">
                BUILD v2.5.0
              </Badge>
              <Badge variant="outline" className="border-zinc-200 text-zinc-500 bg-zinc-50 rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest">
                {t("label_auth_admin")}
              </Badge>
              <Badge variant="outline" className="border-green-100 text-green-600 bg-green-50 rounded-full px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest">
                {t("label_status_encrypted_full")}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-16">
        <div className="flex justify-center sticky top-8 z-50">
          <TabsList className="bg-white/80 backdrop-blur-2xl border border-zinc-100 p-1.5 rounded-full shadow-xl shadow-zinc-100/50">
            {[
              { id: "overview", icon: LayoutDashboard, label: t("manual_tab_overview") },
              { id: "skills", icon: BrainCircuit, label: t("manual_tab_skills") },
              { id: "evaluation", icon: Scaling, label: t("manual_tab_evaluation") },
              { id: "tech", icon: Database, label: t("manual_tab_tech") }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-full px-10 py-3.5 flex items-center gap-3 transition-all font-bold text-[11px] tracking-widest uppercase border border-transparent"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <TabsContent value="overview" className="mt-0">
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div variants={item}>
                <Card className="h-full bg-white border border-zinc-100 rounded-4xl relative group transition-all duration-500 hover:shadow-xl hover:shadow-zinc-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-zinc-900 opacity-5 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 pb-4">
                    <CardTitle className="font-bold text-2xl font-comfortaa flex items-center gap-4 text-zinc-900">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                        <Target className="h-5 w-5" />
                      </div>
                      {t("manual_strategic_obj")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 text-zinc-500 leading-relaxed font-medium">
                    <p className="border-s-4 border-zinc-100 ps-6 py-4 italic bg-zinc-50/50 rounded-r-3xl text-zinc-600 mb-6">{t("manual_strategic_vision")}</p>
                    <p className="text-sm">{t("manual_strategic_desc")}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full bg-white border border-zinc-100 rounded-4xl relative group transition-all duration-500 hover:shadow-xl hover:shadow-zinc-100 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-green-500 opacity-5 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="p-10 pb-4">
                    <CardTitle className="font-bold text-2xl font-comfortaa flex items-center gap-4 text-zinc-900">
                      <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      {t("manual_security_protocol")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 pt-0 text-zinc-500 leading-relaxed font-medium">
                    <div className="space-y-6">
                      {[
                        { r: "ADMIN", d: t("manual_role_admin") },
                        { r: "MANAGER", d: t("manual_role_manager") },
                        { r: "COORDINATOR", d: t("manual_role_coordinator") }
                      ].map((role) => (
                        <div key={role.r} className="flex gap-6 items-center p-4 rounded-3xl bg-zinc-50/50 group-hover:bg-white transition-colors">
                          <div className="font-bold text-[10px] bg-white px-3 py-1 border border-zinc-200 text-zinc-900 rounded-full tracking-widest uppercase">{role.r}</div>
                          <p className="text-xs font-bold text-zinc-600 uppercase tracking-tight">{role.d}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { class: "CLASS A", color: "bg-green-500", text: "text-green-600", light: "bg-green-50", label: "EXPERT", desc: t("manual_class_a_desc") },
                  { class: "CLASS B", color: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", label: "ADVANCED", desc: t("manual_class_b_desc") },
                  { class: "CLASS C", color: "bg-red-500", text: "text-red-600", light: "bg-red-50", label: "TRAINEE", desc: t("manual_class_c_desc") }
                ].map((c, i) => (
                  <motion.div key={i} variants={item} className="p-10 bg-white border border-zinc-100 relative group rounded-4xl shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <span className={cn("font-comfortaa font-bold text-3xl", c.text)}>{c.class}</span>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Classification</p>
                      </div>
                      <Badge variant="outline" className={cn("rounded-full border-none px-3 py-1 font-bold text-[10px]", c.light, c.text)}>{c.label}</Badge>
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed font-medium">{c.desc}</p>
                    <div className={cn("absolute bottom-0 left-0 w-full h-1.5 opacity-20 group-hover:opacity-100 transition-opacity rounded-b-4xl", c.color)} />
                  </motion.div>
                ))}
              </div>

              <motion.div variants={item} className="p-16 bg-zinc-900 relative rounded-4xl shadow-2xl shadow-zinc-200 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_30%,#3F3F46_0%,transparent_60%)] opacity-20" />
                <h3 className="font-comfortaa text-3xl font-bold text-white mb-16 flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  {t("manual_pipeline_title")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { s: "01", t: t("manual_step_define"), d: t("manual_step_define_desc") },
                    { s: "02", t: t("manual_step_deploy"), d: t("manual_step_deploy_desc") },
                    { s: "03", t: t("manual_step_execute"), d: t("manual_step_execute_desc") },
                    { s: "04", t: t("manual_step_analyze"), d: t("manual_step_analyze_desc") }
                  ].map((step, idx) => (
                    <div key={idx} className="relative group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-300">
                      <span className="font-bold text-6xl text-white/5 absolute -top-4 -right-2 group-hover:text-white/10 transition-colors">{step.s}</span>
                      <h4 className="font-bold text-lg text-white mb-3 font-comfortaa">{step.t}</h4>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">{step.d}</p>
                      {idx < 3 && <div className="hidden lg:block absolute top-1/2 -right-6 translate-y-[-50%] z-20 text-white/20">
                        <ArrowRight className="h-6 w-6" />
                      </div>}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="evaluation" className="mt-0">
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <motion.div variants={item} className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200">
                      <Scaling className="h-8 w-8" />
                    </div>
                    <h3 className="font-comfortaa text-4xl font-bold text-zinc-900 leading-tight">
                      {t("manual_point_factor_title")}
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {[
                      { l: t("manual_factor_skills"), w: "350", p: "35%", d: t("manual_factor_skills_desc") },
                      { l: t("manual_factor_responsibility"), w: "350", p: "35%", d: t("manual_factor_responsibility_desc") },
                      { l: t("manual_factor_effort"), w: "100", p: "10%", d: t("manual_factor_effort_desc") },
                      { l: t("manual_factor_conditions"), w: "200", p: "20%", d: t("manual_factor_conditions_desc") }
                    ].map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-8 bg-white border border-zinc-100 rounded-4xl group hover:shadow-lg transition-all relative">
                        <div className="space-y-3">
                          <p className="font-bold text-sm uppercase tracking-widest text-zinc-900">{f.l}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">{f.d}</p>
                        </div>
                        <div className="text-end shrink-0 pl-8">
                          <p className="font-comfortaa text-4xl font-bold text-zinc-900 leading-none">{f.w}</p>
                          <p className="text-[10px] text-zinc-300 font-bold tracking-[0.2em] mt-1 uppercase">{f.p}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={item} className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900">
                      <Layers className="h-8 w-8" />
                    </div>
                    <h3 className="font-comfortaa text-4xl font-bold text-zinc-900 leading-tight">
                      {t("manual_grade_hierarchy")}
                    </h3>
                  </div>
                  <div className="bg-white border border-zinc-100 p-2 relative overflow-hidden rounded-4xl shadow-sm">
                    <table className="w-full text-[11px] border-collapse">
                      <thead className="bg-zinc-50 text-zinc-400 font-bold uppercase tracking-widest">
                        <tr>
                          <th className="p-6 text-center">{t("label_grade")}</th>
                          <th className="p-6 text-center">{t("label_points")}</th>
                          <th className="p-6 text-start">{t("label_designation")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-zinc-600">
                        {[
                          { g: "G1-G2", p: "100 - 199", c: t("je_cat_labor_manual") },
                          { g: "G3-G4", p: "200 - 329", c: t("je_cat_tech_manual") },
                          { g: "G5-G6", p: "330 - 509", c: t("je_cat_spec_manual") },
                          { g: "G7-G8", p: "510 - 769", c: t("je_cat_mgmt_manual") },
                          { g: "G9-G10", p: "770 - 1000", c: t("je_cat_exec_manual") }
                        ].map((r, i) => (
                          <tr key={i} className="hover:bg-zinc-50 transition-colors group">
                            <td className="p-6 border-t border-zinc-50 text-center font-bold text-zinc-900 font-comfortaa text-sm">{r.g}</td>
                            <td className="p-6 border-t border-zinc-50 text-center font-bold tracking-widest">{r.p}</td>
                            <td className="p-6 border-t border-zinc-50 text-start font-bold uppercase tracking-tight opacity-60 group-hover:opacity-100 transition-opacity">{r.c}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-8 bg-zinc-900 text-white flex gap-6 items-center rounded-4xl shadow-xl shadow-zinc-200">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                      <Info className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest leading-relaxed opacity-80">{t("manual_grade_notice")}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="tech" className="mt-0">
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div variants={item} className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-white border border-zinc-100 flex items-center justify-center rounded-3xl shadow-sm">
                    <FileJson className="h-8 w-8 text-zinc-900" />
                  </div>
                  <h3 className="font-comfortaa text-3xl font-bold text-zinc-900">{t("label_data_schema")}</h3>
                </div>
                <div className="relative group overflow-hidden rounded-4xl border border-zinc-100">
                  <div className="bg-zinc-900 p-12 font-mono text-[12px] text-zinc-400 overflow-x-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                      <span className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase">METHODOLOGY STRUCT.JSON</span>
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
                      </div>
                    </div>
                    <pre className="leading-loose text-zinc-100">
{`{
  "protocol": "POINT FACTOR",
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
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-white border border-zinc-100 flex items-center justify-center rounded-3xl shadow-sm">
                    <Download className="h-8 w-8 text-zinc-900" />
                  </div>
                  <h3 className="font-comfortaa text-3xl font-bold text-zinc-900">{t("label_system_exports")}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { l: "PDF EVALUATION REPORT", v: "v2.1", s: "SECURE", c: "text-red-600" },
                    { l: "XLSX DATA MATRIX", v: "v3.0", s: "READY", c: "text-green-600" },
                    { l: "JSON SYSTEM STATE", v: "v1.5", s: "PROTECTED", c: "text-zinc-900" }
                  ].map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-8 bg-white border border-zinc-100 rounded-4xl group hover:shadow-lg transition-all relative">
                      <div className="flex items-center gap-8">
                        <Crosshair className={cn("h-6 w-6 opacity-20 group-hover:opacity-100 transition-all", e.c)} />
                        <div>
                          <span className="font-bold text-sm tracking-widest text-zinc-900 block mb-1 uppercase">{e.l}</span>
                          <span className="text-[9px] font-bold text-zinc-300 tracking-widest uppercase">HASH: {Math.random().toString(16).substring(2, 12).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="text-end">
                        <Badge className="bg-zinc-50 text-zinc-400 rounded-full border-none font-bold text-[9px] mb-2 px-3 py-1 uppercase tracking-widest">{e.v}</Badge>
                        <span className={cn("block text-[10px] font-bold tracking-[0.2em] uppercase", e.c)}>{e.s}</span>
                      </div>
                      <div className="absolute top-0 right-0 w-2 h-0 bg-zinc-900 group-hover:h-full transition-all duration-300" />
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
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="pt-32 flex flex-col items-center gap-10"
      >
        <div className="flex items-center gap-6 w-full max-w-2xl">
          <div className="h-px flex-1 bg-zinc-100" />
          <div className="flex items-center gap-4 px-10 py-4 bg-zinc-900 text-[10px] text-white font-bold tracking-[0.5em] uppercase rounded-full shadow-2xl shadow-zinc-200">
            <Info className="h-4 w-4" />{t("manual_footer_suite")}
          </div>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>
        <div className="flex flex-wrap justify-center gap-12 text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em]">
          <span>{t("label_copyright_footer")}</span>
          <span>{t("label_latency_footer")}</span>
          <span>{t("label_kern_mod")}</span>
        </div>
      </motion.div>
    </div>
  );
}
