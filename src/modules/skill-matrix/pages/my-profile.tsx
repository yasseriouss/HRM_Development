import { useGetMyProfile } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Briefcase, CalendarDays, Building2, Target, Zap, ShieldCheck, History, GraduationCap, ChevronRight, Fingerprint } from "lucide-react";
import type { EvaluationSummary } from "@hrm-development/api-client-react";
import { useT } from "@modules/skill-matrix/i18n";
import { motion } from "framer-motion";
import { cn } from "@shared/utils/cn";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

function scoreBar(score: number) {
  const pct = (score / 4) * 100;
  const colorMap = ["bg-red-400", "bg-red-300", "bg-amber-400", "bg-green-400", "bg-zinc-900"];
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full transition-colors", colorMap[score])} 
        />
      </div>
      <span className="font-bold text-[11px] text-zinc-900 w-4 text-end">{score}</span>
    </div>
  );
}

export default function MyProfilePage() {
  const headers = getAuthHeaders();
  const t = useT();

  function classBadge(cls: EmployeeClass) {
    const map: Record<string, string> = {
      A: "bg-green-50 text-green-600 border-green-100",
      B: "bg-amber-50 text-amber-600 border-amber-100",
      C: "bg-red-50 text-red-600 border-red-100",
    };
    return (
      <Badge variant="outline" className={cn("rounded-full font-bold text-[10px] tracking-widest px-4 py-1.5 uppercase border-none shadow-sm", map[cls ?? ""] ?? "bg-zinc-50 text-zinc-400")}>
        {cls ? `Class ${cls}` : "N/A"}
      </Badge>
    );
  }

  const scoreLabels: Parameters<typeof t>[0][] = ["score_0", "score_1", "score_2", "score_3", "score_4"];

  const { data: profile, isLoading, isError } = useGetMyProfile({ request: { headers } });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 py-16 px-8">
        <Skeleton className="h-64 w-full bg-zinc-100 rounded-4xl" />
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
           <Skeleton className="lg:col-span-4 h-[600px] w-full bg-zinc-100 rounded-4xl" />
           <Skeleton className="lg:col-span-3 h-[600px] w-full bg-zinc-100 rounded-4xl" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-7xl mx-auto py-32 px-8 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-4xl bg-zinc-50 text-zinc-300 mb-6">
           <Fingerprint className="h-10 w-10" />
        </div>
        <p className="text-xl font-bold font-comfortaa text-zinc-400">{t("profile_no_record")}</p>
      </div>);
  }

  const emp = profile.employee;
  const latestSummary = profile.latest_summary;
  const skillScores = profile.skill_scores ?? [];
  const training = profile.training_recommendations ?? [];
  const historicalSummaries: EvaluationSummary[] = profile.historical_summaries ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 pb-32">
      {/* Header - Profile Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-16 bg-white border border-zinc-100 overflow-hidden shadow-sm rounded-4xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#F4F4F5_0%,transparent_50%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="relative group shrink-0">
            <div className="w-40 h-40 rounded-4xl bg-zinc-900 flex items-center justify-center text-6xl font-bold font-comfortaa text-white shadow-2xl shadow-zinc-200 relative overflow-hidden transition-transform duration-500 group-hover:scale-105">
               <span className="relative z-10">{emp.full_name?.charAt(0) ?? "?"}</span>
            </div>
            <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-white rounded-2xl border border-zinc-100 flex items-center justify-center shadow-lg text-zinc-900">
               <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex-1 space-y-8 text-center lg:text-start">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <h2 className="text-5xl lg:text-7xl font-bold font-comfortaa tracking-tighter text-zinc-900 leading-none">{emp.full_name}</h2>
                {classBadge(emp.current_class as EmployeeClass)}
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {emp.job_title && (
                  <span className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-zinc-900" />
                    <span>{emp.job_title}</span>
                  </span>
                )}
                {emp.department?.name && (
                  <span className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-zinc-900" />
                    <span>{emp.department.name}</span>
                  </span>)}
                {emp.joined_date && (
                  <span className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-zinc-900" />
                    <span>{t("profile_joined")} {new Date(emp.joined_date).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="inline-flex items-center gap-4 px-6 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest shadow-xs">
              <Fingerprint className="h-3.5 w-3.5 text-zinc-900" />
              <span>{t("label_node_id")}::{emp.employee_code || t("profile_unknown")}</span>
            </div>
          </div>

          {latestSummary && (
            <div className="text-center lg:text-end lg:border-s lg:border-zinc-100 lg:ps-16 shrink-0">
              <div className="relative inline-block">
                <p className="text-8xl font-bold font-comfortaa text-zinc-900 leading-none tracking-tighter">{Number(latestSummary.percentage).toFixed(0)}<span className="text-zinc-300">%</span></p>
                <div className="absolute -top-4 -right-4 h-8 w-8 bg-zinc-900 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                   <Target className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 mt-6 uppercase tracking-[0.4em]">{t("profile_latest_score")}</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
        {/* Skills Matrix */}
        <Card className="lg:col-span-4 bg-white border-zinc-100 rounded-4xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
          <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
            <CardTitle className="font-bold text-2xl font-comfortaa text-zinc-900 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Target className="h-5 w-5" />
              </div>
              {t("profile_skill_competencies")}
            </CardTitle>
            <div className="flex items-center gap-3 text-zinc-300">
               <Zap className="h-5 w-5 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-10">
            {skillScores.length === 0 ? (
              <div className="py-20 text-center text-zinc-300">
                <p className="text-xs font-bold uppercase tracking-widest">{t("label_no_skill_sync")}</p>
              </div>
            ) : (
              <div className="grid gap-10">
                {skillScores.map((sk) => (
                  <div key={sk.skill_id} className="group/skill">
                    <div className="flex justify-between items-end mb-4">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-zinc-900 tracking-tight group-hover/skill:translate-x-1 transition-transform inline-block">{sk.skill_name}</span>
                        <div className="h-0.5 w-8 bg-zinc-100 group-hover/skill:w-full transition-all" />
                      </div>
                      <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                        {sk.score != null ? t(scoreLabels[sk.score]) : t("score_uneval")}
                      </span>
                    </div>
                    {sk.score != null ? scoreBar(sk.score) : (
                      <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-zinc-100 animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluation History & Training */}
        <div className="lg:col-span-3 space-y-10">
          <Card className="bg-white border-zinc-100 rounded-4xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="font-bold text-2xl font-comfortaa text-zinc-900 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <History className="h-5 w-5" />
                </div>
                {t("profile_eval_history")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {historicalSummaries.length === 0 ? (
                <div className="p-20 text-center text-zinc-300">
                  <p className="text-xs font-bold uppercase tracking-widest">{t("label_empty_log_stream")}</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {historicalSummaries.slice(0, 5).map((s) => (
                    <div key={s.id} className="p-10 hover:bg-zinc-50 transition-all flex items-center justify-between group/eval">
                      <div className="space-y-2">
                        <p className="font-bold text-sm text-zinc-900 tracking-tight group-hover/eval:translate-x-1 transition-transform">{s.campaign_title ?? t("nav_campaigns")}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {t("profile_skills_assessed", { count: s.evaluated_skills_count })} • {new Date(s.updated_at || "").toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-end flex flex-col items-end gap-3">
                        <span className="font-comfortaa font-bold text-xl text-zinc-900 leading-none">{Number(s.percentage).toFixed(0)}%</span>
                        {classBadge(s.class as EmployeeClass)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {training.length > 0 && (
            <Card className="bg-zinc-900 text-white rounded-4xl shadow-2xl shadow-zinc-200 overflow-hidden relative group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#3F3F46_0%,transparent_60%)] opacity-20" />
              <CardHeader className="p-10 pb-6 relative z-10">
                <CardTitle className="font-bold text-2xl font-comfortaa text-white flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  {t("profile_training_recs")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-6 relative z-10">
                {training.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group/rec"
                  >
                    <div className="flex-1 pr-6">
                      <p className="font-bold text-sm text-white tracking-tight group-hover/rec:translate-x-1 transition-transform">{rec.skill_name ?? rec.recommendation_type}</p>
                      {rec.notes && (
                        <p className="text-[10px] font-bold text-white/40 mt-2 uppercase tracking-widest leading-relaxed italic line-clamp-1">{rec.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                       <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest uppercase px-3 py-1 border-none shadow-sm", rec.status === "Completed" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400")}>
                          {rec.status}
                       </Badge>
                       <ChevronRight className="h-4 w-4 text-white/20" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          <div className="p-10 bg-white border border-zinc-100 rounded-4xl shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                <ShieldCheck className="h-24 w-24 text-zinc-900" />
             </div>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-6">{t("label_security_status")}</p>
             <p className="text-sm font-bold font-comfortaa text-zinc-900 leading-relaxed uppercase tracking-tight max-w-[80%]">{t("label_profile_verified")}</p>
             <div className="mt-10 flex items-center justify-between text-[10px] font-bold text-zinc-300 uppercase tracking-widest pt-6 border-t border-zinc-50">
                 <span>{t("label_identity_sync")}</span>
                 <span className="text-green-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t("label_encrypted_stream_active")}
                 </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
