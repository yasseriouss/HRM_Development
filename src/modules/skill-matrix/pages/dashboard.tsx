import { useState } from "react";
import { useGetDashboardMetrics, useGetDepartmentPerformance } from "@hrm-development/api-client-react";
import { useFactory } from "@shared/contexts/FactoryContext";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Button } from "@shared/components/ui/button";
import { useT } from "@modules/skill-matrix/i18n";
import { motion } from "framer-motion";

import {
  LayoutGrid,
  BarChart3,
  FileText,
  Presentation,
  Table2,
  FlaskConical,
  ExternalLink,
  Users,
  Target,
  Zap,
  Activity,
  ChevronRight,
  ShieldAlert,
  Cpu
} from "lucide-react";
import { Badge } from "@shared/components/ui/badge";
import { Brain, Sparkles, Loader2, RefreshCcw } from "lucide-react";

interface AIInsight {
  title: string;
  content: string;
  priority: "Low" | "Medium" | "High";
}

// CornerMarks removed - legacy


const SUITE_APPS = [
  {
    id: "dashboard",
    labelKey: "suite_dashboard",
    href: "/hrm-dashboard",
    icon: BarChart3,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
  },
  {
    id: "docs",
    labelKey: "suite_docs",
    href: "/hrm-docs",
    icon: FileText,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  {
    id: "pitch",
    labelKey: "suite_pitch_deck",
    href: "/hrm-pitch-deck",
    icon: Presentation,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
  },
  {
    id: "spreadsheet",
    labelKey: "suite_spreadsheet",
    href: "/hrm-spreadsheet",
    icon: Table2,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  {
    id: "sandbox",
    labelKey: "suite_sandbox",
    href: "/mockup-sandbox",
    icon: FlaskConical,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/20",
  },
] as const;

export default function Dashboard() {
  const headers = getAuthHeaders();
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";
  const { activeFactoryId } = useFactory();
  const { data: metrics, isLoading: isMetricsLoading } = useGetDashboardMetrics(
    { factory_id: activeFactoryId ?? undefined },
    { request: { headers } },
  );
  const { data: deptPerformance, isLoading: isDeptLoading } =
    useGetDepartmentPerformance(
      { factory_id: activeFactoryId ?? undefined },
      { request: { headers } },
    );

  const [aiInsights, setAiInsights] = useState<AIInsight[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchAIInsights = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/insights", { headers });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (err) {
      console.error("Failed to fetch AI insights", err);
    } finally {
      setIsAiLoading(false);
    }
  };

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
    <div className="space-y-10 pb-32 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header - Editorial Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-16 bg-surface border border-muted/20 overflow-hidden shadow-2xl shadow-primary/5 rounded-[3rem]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(64%_0.13_28/0.04)_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center lg:text-start flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span className={`font-headline font-bold tracking-tight text-xs text-primary uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("dash_command_center")}</span>
            </div>
            <h2 className={`text-6xl lg:text-8xl font-headline font-extrabold tracking-tight text-foreground leading-[0.9] ${isAr ? 'font-tajawal' : ''}`}>{t("dashboard_title")}</h2>
            <p className={`text-muted-foreground font-medium border-primary/20 max-w-xl leading-relaxed text-lg ${isAr ? 'font-tajawal border-e-4 pe-8 ps-0' : 'border-s-4 ps-8'}`}>{t("dashboard_subtitle")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="p-10 bg-background/50 backdrop-blur-sm border border-muted/20 text-center min-w-[180px] shadow-sm rounded-3xl">
              <p className="text-xs font-headline font-bold text-muted-foreground/60 tracking-tight uppercase">{t("je_stat_uptime")}</p>
              <p className="text-4xl font-sans font-extrabold text-foreground mt-2">99.9%</p>
            </div>
            <div className="p-10 bg-background/50 backdrop-blur-sm border border-muted/20 text-center min-w-[180px] shadow-sm rounded-3xl">
              <p className="text-xs font-headline font-bold text-muted-foreground/60 tracking-tight uppercase">{t("je_stat_latency")}</p>
              <p className="text-4xl font-sans font-extrabold text-primary mt-2">12ms</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Metrics Matrix */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >{isMetricsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full bg-muted/10 rounded-[2rem]" />)
        ) : metrics ? (
          <>
            <motion.div variants={item}>
              <Card className="bg-surface border border-muted/20 rounded-[2.5rem] relative group hover:shadow-xl transition-all duration-500 overflow-hidden shadow-sm">
                <CardContent className="p-12 relative z-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-6 bg-primary/5 border border-primary/10 transition-colors mb-10 rounded-2xl">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className={`text-xs font-headline font-bold tracking-tight text-muted-foreground/60 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("dashboard_total_employees")}</p>
                      <h3 className="text-7xl font-headline font-extrabold text-foreground mt-4 tracking-tighter leading-none">{metrics.total_employees}</h3>
                      <div className={`flex items-center justify-center gap-3 mt-10 text-[10px] font-bold text-emerald-600 uppercase tracking-widest ${isAr ? 'font-tajawal' : ''}`}>
                        <Activity className="h-4 w-4" />{metrics.active_employees} {t("dashboard_active")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-surface border border-muted/20 rounded-[2.5rem] relative group hover:shadow-xl transition-all shadow-sm overflow-hidden">
                <CardContent className="p-12 relative z-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-6 bg-emerald-50 text-emerald-600 border border-emerald-100 mb-10 rounded-2xl">
                      <Target className="h-8 w-8" />
                    </div>
                    <div className="w-full">
                      <p className={`text-xs font-headline font-bold tracking-tight text-muted-foreground/60 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("dashboard_avg_skill_match")}</p>
                      <h3 className="text-7xl font-headline font-extrabold text-foreground mt-4 leading-none tracking-tighter">{metrics.average_skill_percentage}%</h3>
                      <div className="mt-10 w-full h-2 bg-muted/10 overflow-hidden rounded-full border border-muted/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${metrics.average_skill_percentage}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-surface border border-muted/20 rounded-[2.5rem] relative group hover:shadow-xl transition-all shadow-sm overflow-hidden">
                <CardContent className="p-12 relative z-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-6 bg-amber-50 text-amber-600 border border-amber-100 mb-10 rounded-2xl">
                      <Zap className="h-8 w-8" />
                    </div>
                    <div>
                      <p className={`text-xs font-headline font-bold tracking-tight text-muted-foreground/60 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("dashboard_active_campaigns")}</p>
                      <h3 className="text-7xl font-headline font-extrabold text-foreground mt-4 leading-none tracking-tighter">{metrics.active_campaigns}</h3>
                      <p className={`mt-10 text-[10px] font-bold text-amber-600 tracking-widest uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("je_stat_sync")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-surface border border-muted/20 rounded-[2.5rem] relative group hover:shadow-xl transition-all shadow-sm overflow-hidden">
                <CardContent className="p-12 relative z-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-6 bg-rose-50 text-rose-600 border border-rose-100 mb-10 rounded-2xl">
                      <ShieldAlert className="h-8 w-8" />
                    </div>
                    <div>
                      <p className={`text-xs font-headline font-bold tracking-tight text-muted-foreground/60 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("je_stat_threat")}</p>
                      <h3 className="text-6xl font-headline font-extrabold text-foreground mt-4 leading-none tracking-tighter uppercase">{t("je_level_low")}</h3>
                      <p className={`mt-10 text-[10px] font-bold text-rose-600 uppercase tracking-widest ${isAr ? 'font-tajawal' : ''}`}>{t("je_stat_no_failures")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}
      </motion.div>

      {/* Class Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">{metrics && [
          { label: t("dashboard_class_a"), count: metrics.class_a_count, pct: metrics.class_a_percentage, color: "emerald", tier: t("dash_expert") },
          { label: t("dashboard_class_b"), count: metrics.class_b_count, pct: metrics.class_b_percentage, color: "amber", tier: t("dash_developing") },
          { label: t("dashboard_class_c"), count: metrics.class_c_count, pct: metrics.class_c_percentage, color: "rose", tier: t("dash_trainee") }
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
          >
            <Card className={`bg-surface border border-muted/20 border-t-8 border-t-${c.color}-500 rounded-[2rem] p-10 relative shadow-sm overflow-hidden hover:shadow-lg transition-shadow`}>
              <div className="flex flex-col items-center justify-center text-center relative z-10">
                <div className="flex justify-between items-center w-full mb-8">
                  <span className={`font-headline font-extrabold text-xl text-${c.color}-600 tracking-tight ${isAr ? 'font-tajawal' : ''}`}>{c.tier}</span>
                  <Badge variant="outline" className={`rounded-full px-3 py-1 bg-${c.color}-50 text-${c.color}-600 border-${c.color}-100 font-bold text-[10px] uppercase tracking-wider`}>LEVEL {3-i}</Badge>
                </div>
                <div className="space-y-4">
                  <p className={`text-xs font-bold text-muted-foreground/60 tracking-widest uppercase ${isAr ? 'font-tajawal' : ''}`}>{c.label}</p>
                  <p className="text-6xl font-headline font-extrabold text-foreground tracking-tighter leading-none">{c.count}</p>
                  <p className="text-xl font-sans font-bold text-muted-foreground/30 mt-4">{c.pct}% OF TOTAL</p>
                </div>
              </div>
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${c.color}-500/5 rounded-full blur-3xl`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Strategic Insights Hub */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-8 pt-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className={`font-headline text-3xl font-extrabold text-foreground tracking-tight ${isAr ? 'font-tajawal' : ''}`}>
                {t("dash_ai_intelligence")}
              </h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1 opacity-60">STRATEGIC ANALYSIS ENGINE</p>
            </div>
          </div>
          <Button 
            onClick={fetchAIInsights} 
            disabled={isAiLoading}
            variant="outline"
            className={`rounded-2xl border-muted/20 bg-surface text-foreground font-headline font-bold text-xs tracking-tight uppercase hover:bg-background h-auto py-5 px-10 shadow-sm transition-all hover:scale-[1.02] ${isAr ? 'font-tajawal' : ''}`}
          >{aiInsights ? t("dash_regenerate") : t("dash_init_intelligence")}
          </Button>
        </div>

        {!aiInsights && !isAiLoading ? (
          <Card className="bg-surface border-2 border-dashed border-muted/20 rounded-[2.5rem] p-24 text-center group hover:border-primary/30 transition-all shadow-sm">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
              <Sparkles className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
            <p className={`text-muted-foreground/60 font-sans text-lg font-medium max-w-md mx-auto leading-relaxed ${isAr ? 'font-tajawal' : ''}`}>{t("dash_ai_idle")}
            </p>
          </Card>
        ) : isAiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-surface border border-muted/20 rounded-[2rem] h-64 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiInsights?.map((insight: AIInsight, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-surface border border-muted/20 rounded-[2rem] relative h-full group hover:shadow-xl transition-all shadow-sm overflow-hidden">
                  <CardContent className="p-10 flex flex-col items-start text-start relative z-10">
                    <Badge variant="secondary" className={`rounded-full font-sans text-[10px] font-bold tracking-tight uppercase mb-8 ${
                      insight.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                      insight.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>PRIORITY: {t(`crit_${insight.priority.toLowerCase()}` as any)}
                    </Badge>
                    <h4 className={`font-headline font-extrabold text-foreground text-xl tracking-tight mb-4 group-hover:text-primary transition-colors ${isAr ? 'font-tajawal' : ''}`}>
                      {insight.title}
                    </h4>
                    <p className={`text-muted-foreground font-sans text-sm leading-relaxed ${isAr ? 'font-tajawal font-medium' : ''}`}>
                      {insight.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
        {/* Performance Stream */}
        <Card className="lg:col-span-4 bg-surface border border-muted/20 rounded-[2.5rem] relative overflow-hidden shadow-sm">
          <CardHeader className="border-b border-muted/10 p-10 flex flex-row items-center justify-between">
            <CardTitle className={`font-headline text-2xl font-extrabold text-foreground flex items-center gap-4 ${isAr ? 'font-tajawal' : ''}`}>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              {t("dashboard_dept_performance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isDeptLoading ? (
              <Skeleton className="h-[500px] w-full bg-muted/5" />
            ) : deptPerformance ? (
              <div className="divide-y divide-muted/10">
                {deptPerformance.map(dept => (
                  <div key={dept.department_id} className="p-10 hover:bg-primary/2 transition-colors flex items-center justify-between group">
                    <div className="space-y-2">
                      <p className={`font-headline font-extrabold text-xl text-foreground group-hover:text-primary transition-colors tracking-tight ${isAr ? 'font-tajawal' : ''}`}>{dept.department_name}</p>
                      <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">{dept.employee_count} PERSONNEL // UNIT_LVL_03</p>
                    </div>
                    <div className="text-end">
                      <p className="text-4xl font-headline font-extrabold text-primary leading-none tracking-tighter">{dept.average_percentage}%</p>
                      <div className="mt-4 w-40 h-2 bg-muted/10 overflow-hidden rounded-full border border-muted/5">
                        <div className="h-full bg-primary" style={{ width: `${dept.average_percentage}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-muted-foreground/30 font-sans text-sm font-bold uppercase tracking-widest">{t("dash_no_analytics")}</div>
            )}
          </CardContent>
        </Card>

        {/* Activity Intelligence */}
        <Card className="lg:col-span-3 bg-surface border border-muted/20 rounded-[2.5rem] relative shadow-sm overflow-hidden">
          <CardHeader className="border-b border-muted/10 p-10 flex flex-row items-center justify-between">
            <CardTitle className={`font-headline text-2xl font-extrabold text-foreground flex items-center gap-4 ${isAr ? 'font-tajawal' : ''}`}>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              {t("dashboard_recent_activity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
             <div className="space-y-8">
                {([
                  { time: "09:42:11", msg: t("log_skill_matrix_update"), user: t("role_super_admin") },
                  { time: "08:15:04", msg: t("log_campaign_launched"), user: t("role_hr_coordinator") },
                  { time: "07:55:59", msg: t("log_security_verified"), user: t("label_system_intelligence") },
                  { time: "05:12:33", msg: t("log_export_generated"), user: t("role_dept_head") }
                ]).map((log, i) => (
                  <div key={i} className="flex gap-6 group items-start">
                    <span className="text-muted-foreground/20 font-bold text-[10px] bg-muted/5 px-2 py-1 rounded-md">[{log.time}]</span>
                    <div className="flex-1">
                      <p className={`text-foreground font-sans font-medium group-hover:text-primary transition-colors ${isAr ? 'font-tajawal' : ''}`}>{log.msg}</p>
                      <span className="text-[10px] text-muted-foreground/30 font-bold tracking-tight uppercase mt-2 block">USER AUTH :: {log.user}</span>
                    </div>
                  </div>
                ))}
             </div>
             <div className="pt-10 border-t border-muted/10">
                <Button variant="ghost" className={`w-full rounded-2xl border border-muted/20 bg-muted/5 text-xs font-headline font-bold tracking-tight uppercase hover:bg-muted/10 h-auto py-5 shadow-sm ${isAr ? 'font-tajawal' : ''}`}>{t("dash_view_all_logs")} <ChevronRight className="h-4 w-4 ms-2" />
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Suite Apps Grid */}
      <div className="space-y-10 pt-16 border-t border-muted/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-start">
            <h3 className={`font-headline text-4xl font-extrabold text-foreground tracking-tight ${isAr ? 'font-tajawal' : ''}`}>
              {t("suite_title")}
            </h3>
            <p className={`text-muted-foreground font-medium text-lg mt-2 ${isAr ? 'font-tajawal' : ''}`}>{t("dash_suite_desc")}</p>
          </div>
          <Badge className="bg-primary/5 text-primary border-primary/10 rounded-full px-6 py-2 font-sans font-bold text-xs uppercase shadow-sm">{t("dash_cluster_active")}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">{SUITE_APPS.map((app) => (
            <a key={app.id} href={app.href} className="block group">
              <Card className={`h-full border border-muted/20 bg-surface transition-all hover:shadow-2xl hover:scale-[1.02] rounded-[2rem] relative shadow-sm overflow-hidden`}>
                <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-8 relative z-10">
                  <div className={`p-8 bg-primary/5 border border-primary/10 ${app.color} transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary rounded-3xl shadow-lg shadow-primary/5`}>
                    <app.icon className="h-14 w-14" />
                  </div>
                  <div>
                    <h4 className={`font-headline font-extrabold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors ${isAr ? 'font-tajawal' : ''}`}>
                      {t(app.labelKey as any)}
                    </h4>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tight">
                      <span>{t("dashboard_execute_module")}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
