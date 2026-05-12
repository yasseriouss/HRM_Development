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

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-500 group-hover:scale-110`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-500 group-hover:scale-110`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-500 group-hover:scale-110`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_10px_rgba(var(--primary),0.2)] transition-all duration-500 group-hover:scale-110`} />
  </>);

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
      {/* Header - Terminal Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-12 bg-surface border border-primary/10 overflow-hidden shadow-xl rounded-3xl"
      >
        <div className="absolute inset-0 bg-primary/5 opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-start">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.2)]" />
              <span className={`font-headline font-black tracking-[0.5em] text-[10px] text-primary/60 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("dash_command_center")}
              </span>
            </div>
            <h2 className={`text-6xl md:text-8xl font-headline font-black tracking-tighter text-foreground uppercase leading-none ${isAr ? 'font-tajawal' : ''}`}>{t("dashboard_title")}
            </h2>
            <p className={`text-foreground/40 font-medium border-primary/10 max-w-xl leading-relaxed uppercase tracking-widest text-[11px] ${isAr ? 'font-tajawal border-e-2 pe-6 ps-0' : 'border-s-2 ps-6'}`}>{t("dashboard_subtitle")}</p>
          </div>
          <div className="flex gap-6">
            <div className="p-8 bg-background border border-primary/10 text-center min-w-[140px] shadow-sm rounded-2xl">
              <p className="text-[9px] font-headline font-black text-foreground/40 tracking-[0.3em] uppercase">{t("je_stat_uptime")}</p>
              <p className="text-3xl font-mono font-black text-foreground mt-2">99.99%</p>
            </div>
            <div className="p-8 bg-background border border-primary/10 text-center min-w-[140px] shadow-sm rounded-2xl">
              <p className="text-[9px] font-headline font-black text-foreground/40 tracking-[0.3em] uppercase">{t("je_stat_latency")}</p>
              <p className="text-3xl font-mono font-black text-primary mt-2">0.02ms</p>
            </div>
          </div>
        </div>
        <CornerMarks />
      </motion.div>

      {/* Main Metrics Matrix */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >{isMetricsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-muted rounded-2xl" />)
        ) : metrics ? (
          <>
            <motion.div variants={item}>
              <Card className="bg-surface border border-primary/10 rounded-2xl relative group hover:border-primary transition-all duration-500 overflow-hidden shadow-sm">
                <CardContent className="p-10 relative z-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-5 bg-primary/5 border border-primary/10 group-hover:border-primary/30 transition-colors mb-8 relative rounded-xl">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className={`text-[10px] font-headline font-black tracking-[0.2em] text-foreground/40 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("dashboard_total_employees")}</p>
                      <h3 className="text-6xl font-mono font-black text-foreground mt-4 tracking-tighter">{metrics.total_employees}</h3>
                      <div className={`flex items-center justify-center gap-3 mt-8 text-[9px] font-black text-emerald-600 uppercase tracking-widest ${isAr ? 'font-tajawal' : ''}`}>
                        <Activity className="h-3 w-3 animate-pulse" />{metrics.active_employees} {t("dashboard_active")}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 group-hover:bg-primary transition-colors" />
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-surface border border-primary/10 rounded-2xl relative group hover:border-emerald-500 transition-all shadow-sm overflow-hidden">
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors mb-6 rounded-xl">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="w-full">
                      <p className={`text-[10px] font-headline font-black tracking-widest text-foreground/40 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("dashboard_avg_skill_match")}</p>
                      <h3 className="text-5xl font-mono font-black text-foreground mt-4 leading-none">{metrics.average_skill_percentage}%</h3>
                      <div className="mt-6 w-full h-1.5 bg-muted overflow-hidden rounded-full">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${metrics.average_skill_percentage}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10 group-hover:bg-emerald-500 transition-colors" />
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-surface border border-primary/10 rounded-2xl relative group hover:border-amber-500 transition-all shadow-sm overflow-hidden">
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 group-hover:border-amber-500/30 transition-colors mb-6 rounded-xl">
                      <Zap className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className={`text-[10px] font-headline font-black tracking-widest text-foreground/40 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("dashboard_active_campaigns")}</p>
                      <h3 className="text-5xl font-mono font-black text-foreground mt-4 leading-none">{metrics.active_campaigns}</h3>
                      <p className={`mt-6 text-[10px] font-bold text-amber-600 ${isAr ? 'font-tajawal' : ''}`}>{t("je_stat_sync")}</p>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/10 group-hover:bg-amber-500 transition-colors" />
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-surface border border-primary/10 rounded-2xl relative group hover:border-rose-500 transition-all shadow-sm overflow-hidden">
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 group-hover:border-rose-500/30 transition-colors mb-6 rounded-xl">
                      <ShieldAlert className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <p className={`text-[10px] font-headline font-black tracking-widest text-foreground/40 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("je_stat_threat")}</p>
                      <h3 className="text-5xl font-mono font-black text-foreground mt-4 leading-none">{t("je_level_low")}</h3>
                      <p className={`mt-6 text-[10px] font-bold text-rose-600 uppercase ${isAr ? 'font-tajawal' : ''}`}>{t("je_stat_no_failures")}</p>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/10 group-hover:bg-rose-500 transition-colors" />
              </Card>
            </motion.div>
          </>
        ) : null}
      </motion.div>

      {/* Class Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{metrics && [
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
            <Card className={`bg-surface border border-primary/10 border-t-4 border-t-${c.color}-500 rounded-2xl p-6 relative shadow-sm overflow-hidden`}>
              <div className="flex flex-col items-center justify-center text-center relative z-10">
                <div className="flex justify-between items-center w-full mb-6">
                  <span className={`font-headline font-black text-lg text-${c.color}-600 ${isAr ? 'font-tajawal' : ''}`}>{c.tier}</span>
                  <span className={`text-[9px] font-mono font-black px-2 py-1 bg-${c.color}-500/5 text-${c.color}-600 border border-${c.color}-500/10 rounded-md`}>LEVEL_{3-i}</span>
                </div>
                <div className="space-y-2">
                  <p className={`text-[10px] font-bold text-foreground/40 tracking-widest ${isAr ? 'font-tajawal' : ''}`}>{c.label}</p>
                  <p className="text-5xl font-mono font-black text-foreground">{c.count}</p>
                  <p className="text-lg font-mono font-black text-foreground/20 mt-2">{c.pct}%</p>
                </div>
              </div>
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 bg-${c.color}-500/5 rounded-full blur-2xl`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Strategic Insights Hub */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-6 pt-6"
      >
        <div className="flex items-center justify-between">
          <h3 className={`font-headline text-2xl font-black text-foreground flex items-center gap-4 uppercase ${isAr ? 'font-tajawal' : ''}`}>
            <Brain className="h-6 w-6 text-primary" />
            <span className="">{t("dash_ai_intelligence")}</span>
          </h3>
          <Button 
            onClick={fetchAIInsights} 
            disabled={isAiLoading}
            variant="outline"
            className={`rounded-full border-primary/20 bg-primary/5 text-primary font-headline font-black text-[10px] tracking-widest uppercase hover:bg-primary/10 h-auto py-3 px-6 group ${isAr ? 'font-tajawal' : ''}`}
          >{aiInsights ? t("dash_regenerate") : t("dash_init_intelligence")}
          </Button>
        </div>

        {!aiInsights && !isAiLoading ? (
          <Card className="bg-surface border-2 border-dashed border-primary/10 rounded-2xl p-12 text-center group hover:border-primary/20 transition-colors shadow-sm">
            <Sparkles className="h-12 w-12 text-primary/10 mx-auto mb-6 group-hover:text-primary/20 transition-colors" />
            <p className={`text-foreground/40 font-mono text-xs uppercase tracking-widest max-w-md mx-auto leading-relaxed ${isAr ? 'font-tajawal' : ''}`}>{t("dash_ai_idle")}
            </p>
          </Card>
        ) : isAiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-surface border border-primary/10 rounded-2xl h-48 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiInsights?.map((insight: AIInsight, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-surface border border-primary/10 rounded-2xl relative h-full group hover:border-primary transition-all shadow-sm overflow-hidden">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center relative z-10">
                    <div className="flex flex-col items-center mb-6">
                      <Badge className={`rounded-full font-mono text-[9px] font-black tracking-widest uppercase mb-4 ${
                        insight.priority === 'High' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                        insight.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      }`}>{t("dash_priority")} {t(`crit_${insight.priority.toLowerCase()}` as any)}
                      </Badge>
                      <div className="w-12 h-1 bg-primary/10 group-hover:bg-primary transition-colors rounded-full" />
                    </div>
                    <h4 className={`font-headline font-black text-foreground text-sm uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors ${isAr ? 'font-tajawal' : ''}`}>
                      {insight.title}
                    </h4>
                    <p className={`text-foreground/40 font-mono text-xs leading-relaxed uppercase ${isAr ? 'font-tajawal font-medium' : ''}`}>
                      {insight.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Performance Stream */}
        <Card className="lg:col-span-4 bg-surface border border-primary/10 rounded-2xl relative overflow-hidden shadow-sm">
          <CardHeader className="border-b border-primary/5 py-8 flex items-center justify-center text-center">
            <CardTitle className={`font-headline text-xl font-black uppercase text-foreground flex items-center gap-3 ${isAr ? 'font-tajawal' : ''}`}>
              <Cpu className="h-5 w-5 text-primary" />{t("dashboard_dept_performance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isDeptLoading ? (
              <Skeleton className="h-[400px] w-full bg-muted" />
            ) : deptPerformance ? (
              <div className="divide-y divide-primary/5">
                {deptPerformance.map(dept => (
                  <div key={dept.department_id} className="p-8 hover:bg-primary/5 transition-colors flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className={`font-headline font-black text-lg text-foreground group-hover:text-primary transition-colors ${isAr ? 'font-tajawal' : ''}`}>{dept.department_name}</p>
                      <p className="text-[10px] font-mono text-foreground/30 uppercase tracking-widest">{dept.employee_count} {t("dash_operators")} // {t("dash_sec_level")}_3
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-3xl font-mono font-black text-primary leading-none">{dept.average_percentage}%</p>
                      <div className="mt-2 w-32 h-1.5 bg-muted overflow-hidden rounded-full">
                        <div className="h-full bg-primary" style={{ width: `${dept.average_percentage}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-foreground/30 font-mono text-xs italic">{t("dash_no_analytics")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Intelligence */}
        <Card className="lg:col-span-3 bg-surface border border-primary/10 rounded-2xl relative shadow-sm overflow-hidden">
          <CardHeader className="border-b border-primary/5 py-8 flex items-center justify-center text-center">
            <CardTitle className={`font-headline text-xl font-black uppercase text-foreground flex items-center gap-3 ${isAr ? 'font-tajawal' : ''}`}>
              <Activity className="h-5 w-5 text-blue-600" />{t("dashboard_recent_activity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="font-mono text-[11px] space-y-6">
                {([
                  { time: "09:42:11", msg: t("log_skill_matrix_update"), user: t("role_super_admin") },
                  { time: "08:15:04", msg: t("log_campaign_launched"), user: t("role_hr_coordinator") },
                  { time: "07:55:59", msg: t("log_security_verified"), user: t("label_system_intelligence") },
                  { time: "05:12:33", msg: t("log_export_generated"), user: t("role_dept_head") }
                ]).map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-foreground/20 font-black whitespace-nowrap">[{log.time}]</span>
                    <div className="flex-1">
                      <p className={`text-foreground group-hover:text-primary transition-colors ${isAr ? 'font-tajawal' : ''}`}>{log.msg}</p>
                      <span className="text-[9px] text-foreground/30 font-black tracking-widest uppercase mt-1 block">BY IDENTITY :: {log.user}</span>
                    </div>
                  </div>
                ))}
             </div>
             <div className="pt-8 border-t border-primary/5">
                <Button variant="ghost" className={`w-full rounded-xl border border-primary/10 text-[10px] font-headline font-black tracking-widest uppercase hover:bg-primary/5 ${isAr ? 'font-tajawal' : ''}`}>{t("dash_view_all_logs")} <ChevronRight className="h-4 w-4 ms-2" />
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Suite Apps Grid */}
      <div className="space-y-8 pt-10 border-t border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-headline text-3xl font-black text-foreground flex items-center gap-4 uppercase ${isAr ? 'font-tajawal' : ''}`}>
              <LayoutGrid className="h-8 w-8 text-primary" />{t("suite_title")}
            </h3>
            <p className={`text-foreground/40 font-medium text-sm mt-1 ${isAr ? 'font-tajawal' : ''}`}>{t("dash_suite_desc")}</p>
          </div>
          <Badge className="bg-primary/5 text-primary border-primary/20 rounded-full px-4 py-2 font-mono text-[10px] font-black uppercase shadow-sm">{t("dash_cluster_active")}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">{SUITE_APPS.map((app) => (
            <a key={app.id} href={app.href} className="block group">
              <Card className={`h-full border border-primary/10 bg-surface transition-all hover:border-primary rounded-2xl relative shadow-sm overflow-hidden`}>
                <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-6 relative z-10">
                  <div className={`p-8 bg-primary/5 border border-primary/10 ${app.color} transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary rounded-xl`}>
                    <app.icon className="h-12 w-12" />
                  </div>
                  <div>
                    <h4 className={`font-headline font-black text-sm text-foreground uppercase tracking-widest group-hover:text-primary transition-colors ${isAr ? 'font-tajawal' : ''}`}>
                      {t(app.labelKey as any)}
                    </h4>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[9px] text-foreground/30 font-mono font-black uppercase tracking-[0.2em]">
                      <span>{t("dashboard_execute_module")}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
