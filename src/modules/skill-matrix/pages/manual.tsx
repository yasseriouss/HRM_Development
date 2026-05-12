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
  Crosshair
} from "lucide-react";

const CornerMarks = () => (
  <>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-s-2 border-primary/40" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-e-2 border-primary/40" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-s-2 border-primary/40" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-e-2 border-primary/40" />
  </>
);

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
    <div className="max-w-7xl mx-auto space-y-12 py-12 px-6 pb-32 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section - Editorial Style */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative p-16 bg-surface border-2 border-primary/20 shadow-sm overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-primary/5 opacity-30" />
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="relative">
            <div className="h-32 w-32 bg-primary/10 border-2 border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <BookOpen className="h-16 w-16" />
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary/20 rounded-full" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary/20 rounded-full" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-primary/10 rounded-full" 
            />
          </div>
          
          <div className="text-center md:text-start space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="h-1 w-8 bg-primary/30 rounded-full" />
              <span className="font-headline font-black tracking-[0.4em] uppercase text-[10px] text-primary">{t("manual_protocol")}
              </span>
              <div className="h-1 w-8 bg-primary/30 rounded-full" />
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-foreground uppercase leading-none">{t("manual_title")}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 rounded-full px-4 py-1 font-mono text-[10px]">
                BUILD v2.4.8
              </Badge>
              <Badge variant="outline" className="border-secondary/20 text-foreground/60 bg-muted/20 rounded-full px-4 py-1 font-mono text-[10px]">{t("label_auth_admin")}
              </Badge>
              <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5 rounded-full px-4 py-1 font-mono text-[10px]">
                {t("label_status_encrypted_full")}
              </Badge>
            </div>
          </div>
        </div>
        <CornerMarks />
      </motion.div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
        <div className="flex justify-center sticky top-4 z-50">
          <TabsList className="bg-surface/80 backdrop-blur-xl border border-primary/20 p-1 rounded-full shadow-lg">{[
              { id: "overview", icon: LayoutDashboard, label: t("manual_tab_overview") },
              { id: "skills", icon: BrainCircuit, label: t("manual_tab_skills") },
              { id: "evaluation", icon: Scaling, label: t("manual_tab_evaluation") },
              { id: "tech", icon: Database, label: t("manual_tab_tech") }
            ].map((tab) => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-8 py-3 flex items-center gap-3 transition-all font-headline font-black text-[11px] tracking-widest uppercase border border-transparent"
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
                <Card className="h-full bg-surface border border-primary/10 rounded-2xl relative group hover:border-primary/30 transition-all overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-2xl font-black uppercase flex items-center gap-3 text-foreground">
                      <Target className="h-6 w-6 text-primary" />{t("manual_strategic_obj")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-foreground/70 leading-relaxed font-medium">
                    <p className="border-s-2 border-primary/20 ps-4 py-2 italic bg-primary/5 rounded-e-lg">{t("manual_strategic_vision")}
                    </p>
                    <p className="mt-4">{t("manual_strategic_desc")}
                    </p>
                  </CardContent>
                  <CornerMarks />
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="h-full bg-surface border border-primary/10 rounded-2xl relative group hover:border-emerald-500/30 transition-all overflow-hidden shadow-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-2xl font-black uppercase flex items-center gap-3 text-foreground">
                      <ShieldCheck className="h-6 w-6 text-emerald-500" />{t("manual_security_protocol")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-foreground/70 leading-relaxed font-medium">
                    <div className="space-y-4">{[
                        { r: "ADMIN", d: t("manual_role_admin") },
                        { r: "MANAGER", d: t("manual_role_manager") },
                        { r: "COORDINATOR", d: t("manual_role_coordinator") }
                      ].map((role) => (
                        <div key={role.r} className="flex gap-4 items-center">
                          <div className="font-mono text-[10px] bg-muted/30 px-2 py-1 border border-primary/10 text-emerald-600 rounded-md">{role.r}</div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[
                  { class: "CLASS A", color: "border-emerald-500", text: "text-emerald-600", label: "EXPERT", desc: t("manual_class_a_desc") },
                  { class: "CLASS B", color: "border-primary", text: "text-primary", label: "ADVANCED", desc: t("manual_class_b_desc") },
                  { class: "CLASS C", color: "border-rose-500", text: "text-rose-600", label: "TRAINEE", desc: t("manual_class_c_desc") }
                ].map((c, i) => (
                  <motion.div key={i} variants={item} className={`p-8 bg-surface border-t-4 ${c.color} relative group rounded-b-2xl shadow-sm border border-primary/5`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`font-headline font-black text-2xl ${c.text}`}>{c.class}</span>
                      <Badge variant="outline" className={`rounded-full border-current ${c.text} text-[10px] px-2`}>{c.label}</Badge>
                    </div>
                    <p className="text-sm text-foreground/60 leading-relaxed">{c.desc}</p>
                    <CornerMarks />
                  </motion.div>
                ))}
              </div>

              <motion.div variants={item} className="p-12 bg-surface border border-primary/10 relative rounded-2xl shadow-sm">
                <h3 className="font-headline text-3xl font-black uppercase text-primary mb-12 flex items-center gap-4">
                  <Zap className="h-8 w-8" />{t("manual_pipeline_title")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[
                    { s: "01", t: t("manual_step_define"), d: t("manual_step_define_desc") },
                    { s: "02", t: t("manual_step_deploy"), d: t("manual_step_deploy_desc") },
                    { s: "03", t: t("manual_step_execute"), d: t("manual_step_execute_desc") },
                    { s: "04", t: t("manual_step_analyze"), d: t("manual_step_analyze_desc") }
                  ].map((step, idx) => (
                    <div key={idx} className="relative group p-6 bg-background border border-primary/5 rounded-xl hover:border-primary/30 transition-all">
                      <span className="font-mono text-5xl font-black text-primary/5 absolute -top-4 -right-2 group-hover:text-primary/10 transition-colors">{step.s}</span>
                      <h4 className="font-headline font-black text-lg text-foreground mb-2">{step.t}</h4>
                      <p className="text-xs text-foreground/50 uppercase tracking-tighter">{step.d}</p>
                      {idx < 3 && <div className="hidden md:block absolute top-1/2 -right-4 translate-y-[-50%] z-20 text-primary/20 font-black text-xl">{" >> "}</div>}
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
                    <h3 className="font-headline text-4xl font-black uppercase text-foreground leading-none">{t("manual_point_factor_title")}
                    </h3>
                  </div>
                  <div className="space-y-4">{[
                      { l: t("manual_factor_skills"), w: "350", p: "35%", d: t("manual_factor_skills_desc") },
                      { l: t("manual_factor_responsibility"), w: "350", p: "35%", d: t("manual_factor_responsibility_desc") },
                      { l: t("manual_factor_effort"), w: "100", p: "10%", d: t("manual_factor_effort_desc") },
                      { l: t("manual_factor_conditions"), w: "200", p: "20%", d: t("manual_factor_conditions_desc") }
                    ].map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-surface border border-primary/10 rounded-xl group hover:border-primary/30 transition-all relative shadow-sm">
                        <div className="space-y-2">
                          <p className="font-headline font-black text-sm tracking-widest text-foreground">{f.l}</p>
                          <p className="text-[10px] text-foreground/40 font-mono">{f.d}</p>
                        </div>
                        <div className="text-end">
                          <p className="font-mono text-2xl font-black text-primary leading-none">{f.w}</p>
                          <p className="text-[9px] text-foreground/40 font-bold tracking-[0.2em]">{f.p}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={item} className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Layers className="h-10 w-10 text-primary" />
                    <h3 className="font-headline text-4xl font-black uppercase text-foreground leading-none">{t("manual_grade_hierarchy")}
                    </h3>
                  </div>
                  <div className="bg-surface border border-primary/20 p-1 relative overflow-hidden rounded-2xl shadow-sm">
                    <table className="w-full text-[10px] font-mono border-collapse">
                      <thead className="bg-primary/5 text-primary font-black uppercase tracking-widest">
                        <tr>
                          <th className="p-4 border border-primary/10 text-center">{t("label_grade")}</th>
                          <th className="p-4 border border-primary/10 text-center">{t("label_points")}</th>
                          <th className="p-4 border border-primary/10 text-start">{t("label_designation")}</th>
                        </tr>
                      </thead>
                      <tbody className="text-foreground">
                        {[
                          { g: "G1-G2", p: "100 - 199", c: t("je_cat_labor_manual") },
                          { g: "G3-G4", p: "200 - 329", c: t("je_cat_tech_manual") },
                          { g: "G5-G6", p: "330 - 509", c: t("je_cat_spec_manual") },
                          { g: "G7-G8", p: "510 - 769", c: t("je_cat_mgmt_manual") },
                          { g: "G9-G10", p: "770 - 1000", c: t("je_cat_exec_manual") }
                        ].map((r, i) => (
                          <tr key={i} className="hover:bg-primary/5 transition-colors group">
                            <td className="p-4 border border-primary/5 text-center font-black group-hover:text-primary">{r.g}</td>
                            <td className="p-4 border border-primary/5 text-center">{r.p}</td>
                            <td className="p-4 border border-primary/5 text-start text-foreground/50 group-hover:text-foreground transition-colors">{r.c}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <CornerMarks />
                  </div>
                  <div className="p-6 bg-primary/5 border border-primary/20 flex gap-4 items-center rounded-xl">
                    <div className="h-10 w-10 rounded-full border border-primary/30 flex items-center justify-center animate-pulse">
                      <Info className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs text-foreground/60 leading-tight">{t("manual_grade_notice")}
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
                  <div className="h-12 w-12 bg-surface border border-primary/10 flex items-center justify-center rounded-xl shadow-sm">
                    <FileJson className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-headline text-3xl font-black uppercase text-foreground">{t("label_data_schema")}</h3>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 to-transparent opacity-20 group-hover:opacity-40 blur transition duration-1000"></div>
                  <div className="relative bg-surface border border-primary/10 p-8 font-mono text-[11px] text-emerald-600 overflow-x-auto rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-primary/5 pb-2">
                      <span className="text-foreground/30 text-[9px]">METHODOLOGY STRUCT.JSON</span>
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-rose-400" />
                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      </div>
                    </div>
                    <pre className="leading-relaxed">{`{
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
                  <CornerMarks />
                </div>
              </motion.div>

              <motion.div variants={item} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-surface border border-primary/10 flex items-center justify-center rounded-xl shadow-sm">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-headline text-3xl font-black uppercase text-foreground">{t("label_system_exports")}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { l: "PDF EVALUATION REPORT", v: "v2.1", s: "SECURE", c: "text-rose-600" },
                    { l: "XLSX DATA MATRIX", v: "v3.0", s: "READY", c: "text-emerald-600" },
                    { l: "JSON SYSTEM STATE", v: "v1.5", s: "PROTECTED", c: "text-primary" }
                  ].map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-surface border border-primary/5 rounded-xl group hover:border-primary/30 transition-all relative shadow-sm">
                      <div className="flex items-center gap-6">
                        <Crosshair className={`h-5 w-5 ${e.c} opacity-30 group-hover:opacity-100 transition-all`} />
                        <div>
                          <span className="font-headline font-black text-sm tracking-widest text-foreground block">{e.l}</span>
                          <span className="text-[9px] font-mono text-foreground/30">HASH: SHA256_{Math.random().toString(16).substring(2, 10).toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="text-end">
                        <Badge className="bg-muted/20 text-foreground/40 rounded-full border-primary/5 font-mono text-[9px] mb-1">{e.v}</Badge>
                        <span className={`block text-[8px] font-black tracking-widest ${e.c}`}>{e.s}</span>
                      </div>
                      <div className="absolute top-0 right-0 w-1 h-0 bg-primary/40 group-hover:h-full transition-all duration-300" />
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
          <div className="h-px w-20 bg-primary/20" />
          <div className="flex items-center gap-3 px-8 py-3 bg-surface border border-primary/20 text-[10px] text-primary font-headline font-black tracking-[0.5em] uppercase rounded-full shadow-sm">
            <Info className="h-4 w-4" />{t("manual_footer_suite")}
          </div>
          <div className="h-px w-20 bg-primary/20" />
        </div>
        <div className="flex gap-8 text-[9px] font-mono text-foreground/20 uppercase tracking-[0.2em]">
          <span>{t("label_copyright_footer")}</span>
          <span>{t("label_latency_footer")}</span>
          <span>{t("label_kern_mod")}</span>
        </div>
      </motion.div>
    </div>
  );
}
