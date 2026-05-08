import { useState } from "react";
import { useGetDashboardMetrics, useGetDepartmentPerformance } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
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
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Loader2, RefreshCcw } from "lucide-react";

interface AIInsight {
  title: string;
  content: string;
  priority: "Low" | "Medium" | "High";
}

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r border-${color}/40`} />
  </>
);

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
  const { data: metrics, isLoading: isMetricsLoading } = useGetDashboardMetrics({ request: { headers } });
  const { data: deptPerformance, isLoading: isDeptLoading } = useGetDepartmentPerformance({ request: { headers } });

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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative p-12 bg-[#0A0A0A] border-2 border-primary/30 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.5em] text-[10px] text-primary uppercase">
                {isAr ? "مركز القيادة الموحد" : "COMMAND_CENTER_v2.4"}
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {t("dashboard_title")}
            </h2>
            <p className="text-secondary/50 font-medium border-l-2 border-primary/20 pl-4">{t("dashboard_subtitle")}</p>
          </div>
          <div className="flex gap-4">
            <div className="p-6 bg-white/5 border border-white/10 text-center min-w-[120px]">
              <p className="text-[9px] font-headline font-black text-secondary/40 tracking-widest">UPTIME</p>
              <p className="text-2xl font-mono font-black text-white mt-1">99.9%</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 text-center min-w-[120px]">
              <p className="text-[9px] font-headline font-black text-secondary/40 tracking-widest">LATENCY</p>
              <p className="text-2xl font-mono font-black text-emerald-500 mt-1">12ms</p>
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
      >
        {isMetricsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-white/5 rounded-none" />)
        ) : metrics ? (
          <>
            <motion.div variants={item}>
              <Card className="bg-[#121212] border border-white/10 rounded-none relative group hover:border-primary/50 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-headline font-black tracking-widest text-secondary/40 uppercase">{t("dashboard_total_employees")}</p>
                      <h3 className="text-4xl font-mono font-black text-white mt-4 leading-none">{metrics.total_employees}</h3>
                      <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-500">
                        <Activity className="h-3 w-3" />
                        {metrics.active_employees} {t("dashboard_active")}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 group-hover:border-primary/30 transition-colors">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
                <CornerMarks />
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-[#121212] border border-white/10 rounded-none relative group hover:border-emerald-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-headline font-black tracking-widest text-secondary/40 uppercase">{t("dashboard_avg_skill_match")}</p>
                      <h3 className="text-4xl font-mono font-black text-white mt-4 leading-none">{metrics.average_skill_percentage}%</h3>
                      <div className="mt-4 w-full h-1 bg-white/5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${metrics.average_skill_percentage}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                      <Target className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
                <CornerMarks />
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-[#121212] border border-white/10 rounded-none relative group hover:border-amber-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-headline font-black tracking-widest text-secondary/40 uppercase">{t("dashboard_active_campaigns")}</p>
                      <h3 className="text-4xl font-mono font-black text-white mt-4 leading-none">{metrics.active_campaigns}</h3>
                      <p className="mt-4 text-[10px] font-bold text-amber-500">SYSTEM_IN_SYNC</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 group-hover:border-amber-500/30 transition-colors">
                      <Zap className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
                <CornerMarks />
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-[#121212] border border-white/10 rounded-none relative group hover:border-rose-500/50 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-headline font-black tracking-widest text-secondary/40 uppercase">THREAT_LEVEL</p>
                      <h3 className="text-4xl font-mono font-black text-white mt-4 leading-none">LOW</h3>
                      <p className="mt-4 text-[10px] font-bold text-rose-500 uppercase">NO_FAILURES_DETECTED</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 group-hover:border-rose-500/30 transition-colors">
                      <ShieldAlert className="h-6 w-6 text-rose-500" />
                    </div>
                  </div>
                </CardContent>
                <CornerMarks />
              </Card>
            </motion.div>
          </>
        ) : null}
      </motion.div>

      {/* Class Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metrics && [
          { label: t("dashboard_class_a"), count: metrics.class_a_count, pct: metrics.class_a_percentage, color: "emerald", tier: "EXPERT" },
          { label: t("dashboard_class_b"), count: metrics.class_b_count, pct: metrics.class_b_percentage, color: "amber", tier: "DEVELOPING" },
          { label: t("dashboard_class_c"), count: metrics.class_c_count, pct: metrics.class_c_percentage, color: "rose", tier: "TRAINEE" }
        ].map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
          >
            <Card className={`bg-[#0A0A0A] border border-white/5 border-t-4 border-t-${c.color}-500 rounded-none p-6 relative`}>
              <div className="flex justify-between items-center mb-6">
                <span className={`font-headline font-black text-lg text-${c.color}-400`}>{c.tier}</span>
                <span className={`text-[9px] font-mono font-black px-2 py-1 bg-${c.color}-500/10 text-${c.color}-500 border border-${c.color}-500/20`}>LEVEL_{3-i}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-secondary/40 tracking-widest">{c.label}</p>
                  <p className="text-3xl font-mono font-black text-white mt-1">{c.count}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-black text-white/20">{c.pct}</p>
                </div>
              </div>
              <CornerMarks color={c.color} />
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
          <h3 className="font-headline text-2xl font-black text-white flex items-center gap-4 uppercase">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            AI_STRATEGIC_INTELLIGENCE
          </h3>
          <Button 
            onClick={fetchAIInsights} 
            disabled={isAiLoading}
            variant="outline"
            className="rounded-none border-primary/20 bg-primary/5 text-primary font-headline font-black text-[10px] tracking-widest uppercase hover:bg-primary/10 h-auto py-3 px-6 group"
          >
            {isAiLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            )}
            {aiInsights ? "REGENERATE_ANALYSIS" : "INITIALIZE_INTELLIGENCE_STREAM"}
          </Button>
        </div>

        {!aiInsights && !isAiLoading ? (
          <Card className="bg-[#0A0A0A] border-2 border-dashed border-white/5 rounded-none p-12 text-center group hover:border-primary/20 transition-colors">
            <Sparkles className="h-12 w-12 text-secondary/10 mx-auto mb-6 group-hover:text-primary/20 transition-colors" />
            <p className="text-secondary/40 font-mono text-xs uppercase tracking-widest max-w-md mx-auto leading-relaxed">
              Tactical insights engine idle. Initialize the stream to analyze organizational performance vectors and critical skill-gap trajectories.
            </p>
          </Card>
        ) : isAiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-[#121212] border border-white/5 rounded-none h-48 animate-pulse" />
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
                <Card className="bg-[#121212] border border-white/10 rounded-none relative h-full group hover:border-primary/50 transition-all">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className={`rounded-none font-mono text-[9px] font-black tracking-widest uppercase ${
                        insight.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        insight.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        PRIORITY_{insight.priority.toUpperCase()}
                      </Badge>
                      <div className="w-1 h-8 bg-primary/20 group-hover:bg-primary transition-colors" />
                    </div>
                    <h4 className="font-headline font-black text-white text-sm uppercase tracking-tighter mb-4 group-hover:text-primary transition-colors">
                      {insight.title}
                    </h4>
                    <p className="text-secondary/40 font-mono text-xs leading-relaxed uppercase">
                      {insight.content}
                    </p>
                  </CardContent>
                  <CornerMarks />
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Performance Stream */}
        <Card className="lg:col-span-4 bg-[#0A0A0A] border border-white/10 rounded-none relative overflow-hidden">
          <CardHeader className="border-b border-white/5 py-8">
            <CardTitle className="font-headline text-xl font-black uppercase flex items-center gap-3">
              <Cpu className="h-5 w-5 text-primary" />
              {t("dashboard_dept_performance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isDeptLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : deptPerformance ? (
              <div className="divide-y divide-white/5">
                {deptPerformance.map(dept => (
                  <div key={dept.department_id} className="p-8 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="font-headline font-black text-lg text-white group-hover:text-primary transition-colors">{dept.department_name}</p>
                      <p className="text-[10px] font-mono text-secondary/30 uppercase tracking-widest">
                        {dept.employee_count} OPERATORS // SEC_LEVEL_3
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-mono font-black text-primary leading-none">{dept.average_percentage}%</p>
                      <div className="mt-2 w-32 h-1 bg-white/5 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${dept.average_percentage}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-secondary/30 font-mono text-xs italic">
                NO_ANALYTICS_AVAILABLE_FOR_CURRENT_NODE
              </div>
            )}
          </CardContent>
          <CornerMarks />
        </Card>

        {/* Activity Intelligence */}
        <Card className="lg:col-span-3 bg-[#0A0A0A] border border-white/10 rounded-none relative">
          <CardHeader className="border-b border-white/5 py-8">
            <CardTitle className="font-headline text-xl font-black uppercase flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-500" />
              {t("dashboard_recent_activity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="font-mono text-[11px] space-y-6">
                {[
                  { time: "09:42:11", msg: "SKILL_MATRIX_UPDATE: DEP_PRODUCTION", user: "SYS_ADMIN" },
                  { time: "08:15:04", msg: "EVALUATION_CAMPAIGN_LAUNCHED: ALL_DEPT", user: "HR_COORD" },
                  { time: "07:55:59", msg: "SECURITY_PROTOCOL_VERIFIED", user: "SYSTEM" },
                  { time: "05:12:33", msg: "EXPORT_GENERATED: XLSX_MONTHLY_REPORT", user: "DEPT_HEAD" }
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-secondary/20 font-black whitespace-nowrap">[{log.time}]</span>
                    <div className="flex-1">
                      <p className="text-white group-hover:text-primary transition-colors">{log.msg}</p>
                      <span className="text-[9px] text-secondary/40 font-black tracking-widest uppercase mt-1 block">BY_IDENTITY :: {log.user}</span>
                    </div>
                  </div>
                ))}
             </div>
             <div className="pt-8 border-t border-white/5">
                <Button variant="ghost" className="w-full rounded-none border border-white/10 text-[10px] font-headline font-black tracking-widest uppercase hover:bg-white/5">
                  VIEW_ALL_LOGS <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
             </div>
          </CardContent>
          <CornerMarks color="blue" />
        </Card>
      </div>

      {/* Suite Apps Grid */}
      <div className="space-y-8 pt-10 border-t-2 border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline text-3xl font-black text-white flex items-center gap-4 uppercase">
              <LayoutGrid className="h-8 w-8 text-primary" />
              {t("suite_title")}
            </h3>
            <p className="text-secondary/50 font-medium text-sm mt-1">Cross-module operational synchronization layer.</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-none px-4 py-2 font-mono text-[10px] font-black uppercase">
            CLUSTER_ACTIVE
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {SUITE_APPS.map((app) => (
            <a key={app.id} href={app.href} className="block group">
              <Card className={`h-full border border-white/10 bg-[#121212] transition-all hover:border-primary/50 rounded-none relative`}>
                <CardContent className="p-8 flex flex-col items-center text-center gap-6">
                  <div className={`p-6 bg-white/5 border border-white/5 ${app.color} transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary`}>
                    <app.icon className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="font-headline font-black text-sm text-white uppercase tracking-widest group-hover:text-primary transition-colors">
                      {t(app.labelKey as any)}
                    </h4>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[9px] text-secondary/40 font-mono font-black uppercase tracking-[0.2em]">
                      <span>EXECUTE_MODULE</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
                <CornerMarks />
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
