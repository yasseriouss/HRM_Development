import { useGetMyProfile } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, CalendarDays, Building2, User, Target, Activity, Zap, ShieldCheck, History, GraduationCap, ChevronRight, HardDrive } from "lucide-react";
import type { EvaluationSummary } from "@hrm-development/api-client-react";
import { useT } from "@/i18n";
import { motion } from "framer-motion";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

function scoreBar(score: number) {
  const pct = (score / 4) * 100;
  const colorMap = ["bg-rose-500", "bg-rose-400", "bg-amber-500", "bg-emerald-500", "bg-primary"];
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-zinc-900 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className={`h-full ${colorMap[score]}`} 
        />
      </div>
      <span className="font-mono text-[10px] font-black text-white w-4 text-end uppercase">{score}</span>
    </div>
  );
}

export default function MyProfilePage() {
  const headers = getAuthHeaders();
  const t = useT();

  function classBadge(cls: EmployeeClass) {
    const map: Record<string, string> = {
      A: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
      B: "border-amber-500/30 bg-amber-500/10 text-amber-500",
      C: "border-rose-500/30 bg-rose-500/10 text-rose-500",
    };
    return (
      <Badge variant="outline" className={`rounded-none font-mono text-[10px] font-black px-2 py-0.5 uppercase ${map[cls ?? ""] ?? "border-zinc-800 text-zinc-500"}`}>
        {cls ?? "N/A"}
      </Badge>
    );
  }

  const scoreLabels: Parameters<typeof t>[0][] = ["score_0", "score_1", "score_2", "score_3", "score_4"];

  const { data: profile, isLoading, isError } = useGetMyProfile({ request: { headers } });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <Skeleton className="h-40 w-full bg-zinc-900 rounded-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Skeleton className="h-[400px] w-full bg-zinc-900 rounded-none" />
           <Skeleton className="h-[400px] w-full bg-zinc-900 rounded-none" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-20 text-center border-2 border-zinc-900 bg-black/20 font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">
        {t("profile_no_record")}
      </div>
    );
  }

  const emp = profile.employee;
  const latestSummary = profile.latest_summary;
  const skillScores = profile.skill_scores ?? [];
  const training = profile.training_recommendations ?? [];
  const historicalSummaries: EvaluationSummary[] = profile.historical_summaries ?? [];

  return (
    <div className="space-y-10 pb-24 font-sans text-white">
      {/* Header - Profile Dashboard */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl font-headline font-black text-primary transition-transform group-hover:scale-105">
              {emp.full_name?.charAt(0) ?? "?"}
            </div>
            <CornerMarks />
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-start">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h2 className="text-5xl font-headline font-black tracking-tighter uppercase leading-none">{emp.full_name}</h2>
              {classBadge(emp.current_class as EmployeeClass)}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">
              {emp.job_title && (
                <span className="flex items-center gap-2 border-r border-zinc-800 pe-6 last:border-0">
                  <Briefcase className="h-3.5 w-3.5 text-primary" />
                  {emp.job_title}
                </span>
              )}
              {emp.department?.name && (
                <span className="flex items-center gap-2 border-r border-zinc-800 pe-6 last:border-0">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {emp.department.name}
                </span>
              )}
              {emp.joined_date && (
                <span className="flex items-center gap-2 border-r border-zinc-800 pe-6 last:border-0">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  {t("profile_joined")} {new Date(emp.joined_date).toLocaleDateString()}
                </span>
              )}
              <span className="bg-primary/10 text-primary px-3 py-1 border border-primary/20">
                {t("label_node_id")}::{emp.employee_code || t("profile_unknown")}
              </span>
            </div>
          </div>

          {latestSummary && (
            <div className="text-center md:text-end border-s-2 border-zinc-900 ps-10 hidden md:block">
              <p className="text-5xl font-mono font-black text-primary leading-none shadow-[0_0_20px_rgba(255,255,255,0.05)]">{Number(latestSummary.percentage).toFixed(1)}%</p>
              <p className="text-[9px] font-headline font-black text-zinc-500 mt-2 uppercase tracking-[0.3em]">{t("profile_latest_score")}</p>
            </div>
          )}
        </div>
        <CornerMarks />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Skills Matrix */}
        <Card className="lg:col-span-4 bg-[#0D0D0D] border-zinc-800 rounded-none relative overflow-hidden group">
          <CardHeader className="border-b border-zinc-900 py-8 flex flex-row items-center justify-between">
            <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              {t("profile_skill_competencies")}
            </CardTitle>
            <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {skillScores.length === 0 ? (
              <div className="py-10 text-center font-mono text-[10px] text-zinc-600 uppercase tracking-widest italic">
                {t("label_no_skill_sync")}
              </div>
            ) : (
              <div className="grid gap-6">
                {skillScores.map((sk) => (
                  <div key={sk.skill_id} className="group/skill">
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-headline font-black text-xs text-white uppercase tracking-tight group-hover/skill:text-primary transition-colors">
                        {sk.skill_name}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                        {sk.score != null ? t(scoreLabels[sk.score]) : t("score_uneval")}
                      </span>
                    </div>
                    {sk.score != null ? scoreBar(sk.score) : (
                      <div className="h-1.5 bg-zinc-900/50 border border-zinc-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CornerMarks />
        </Card>

        {/* Evaluation History & Training */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none relative group overflow-hidden">
            <CardHeader className="border-b border-zinc-900 py-8">
              <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                <History className="h-5 w-5 text-blue-500" />
                {t("profile_eval_history")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-zinc-900">
              {historicalSummaries.length === 0 ? (
                <div className="p-12 text-center font-mono text-[10px] text-zinc-600 uppercase tracking-widest italic">
                   {t("label_empty_log_stream")}
                </div>
              ) : (
                historicalSummaries.slice(0, 5).map((s) => (
                  <div key={s.id} className="p-6 hover:bg-zinc-800/50 transition-colors flex items-center justify-between group/eval">
                    <div className="space-y-1">
                      <p className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover/eval:text-primary transition-colors">
                        {s.campaign_title ?? t("nav_campaigns")}
                      </p>
                      <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                        {t("profile_skills_assessed", { count: s.evaluated_skills_count })} // {new Date(s.updated_at || "").toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-end flex flex-col items-end gap-2">
                      <span className="font-mono font-black text-lg text-primary leading-none">{Number(s.percentage).toFixed(1)}%</span>
                      {classBadge(s.class as EmployeeClass)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CornerMarks color="blue" />
          </Card>

          {training.length > 0 && (
            <Card className="bg-[#0D0D0D] border-2 border-emerald-500/20 rounded-none relative group">
              <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
              <CardHeader className="border-b border-zinc-900 py-8">
                <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-emerald-500" />
                  {t("profile_training_recs")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                {training.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800 hover:border-emerald-500/50 transition-all group/rec"
                  >
                    <div className="flex-1">
                      <p className="font-headline font-black text-xs text-white uppercase tracking-tight group-hover/rec:text-emerald-500 transition-colors">
                        {rec.skill_name ?? rec.recommendation_type}
                      </p>
                      {rec.notes && (
                        <p className="font-mono text-[9px] text-zinc-500 mt-1 uppercase leading-relaxed line-clamp-1 italic">{rec.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                       <Badge variant="outline" className={`rounded-none font-mono text-[8px] font-black tracking-tighter uppercase px-2 py-0.5 ${rec.status === "Completed" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-amber-500/30 bg-amber-500/10 text-amber-500"}`}>
                          {rec.status}
                       </Badge>
                       <ChevronRight className="h-3 w-3 text-zinc-800" />
                    </div>
                  </div>
                ))}
              </CardContent>
              <CornerMarks color="emerald" />
            </Card>
          )}
          
          <div className="p-8 border-2 border-primary/20 bg-primary/3 relative overflow-hidden group">
             <ShieldCheck className="absolute -right-4 -top-4 h-24 w-24 text-primary opacity-5 group-hover:opacity-10 transition-all duration-700" />
             <p className="font-headline font-black text-[11px] text-primary uppercase tracking-[0.3em] mb-4">{t("label_security_status")}</p>
             <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase tracking-tighter">
               {t("label_profile_verified")}
             </p>
             <div className="mt-8 flex items-center justify-between text-[9px] font-mono font-black text-zinc-600 uppercase tracking-widest">
                 <span>{t("label_identity_sync")}</span>
                 <span className="text-emerald-500">{t("label_encrypted_stream_active")}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
