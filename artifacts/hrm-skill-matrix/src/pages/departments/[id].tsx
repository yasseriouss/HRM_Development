import { useRoute, Link } from "wouter";
import {
  useGetDepartment,
  useGetDepartmentStats,
  useListEmployees,
  useListSkills,
} from "@hrm-development/api-client-react";
import type { DepartmentStats } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, BookOpen, Building2, Activity, Zap, ShieldCheck, ExternalLink, Target, Briefcase } from "lucide-react";
import { useT } from "@/i18n";
import { motion } from "framer-motion";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

export default function DepartmentDetailPage() {
  const [, params] = useRoute("/departments/:id");
  const id = params?.id ?? "";
  const headers = getAuthHeaders();
  const t = useT();

  const { data: dept, isLoading } = useGetDepartment(id, { request: { headers } });
  const { data: stats } = useGetDepartmentStats(id, { request: { headers } });
  const { data: employees } = useListEmployees(
    { department_id: id, page: 1, page_size: 50 },
    { request: { headers } },
  );
  const { data: skills } = useListSkills({ department_id: id }, { request: { headers } });

  if (isLoading)
    return (
      <div className="space-y-6 pb-20">
        <Skeleton className="h-40 w-full bg-zinc-900 rounded-none" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 bg-zinc-900 rounded-none" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Skeleton className="h-[400px] bg-zinc-900 rounded-none" />
           <Skeleton className="h-[400px] bg-zinc-900 rounded-none" />
        </div>
      </div>
    );

  if (!dept) return (
    <div className="p-20 text-center border-2 border-zinc-900 bg-black/20 font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">
      {t("dept_not_found")}
    </div>
  );

  const s = stats as DepartmentStats | undefined;

  return (
    <div className="space-y-10 pb-24 font-sans text-white">
      {/* Back Navigation */}
      <Link href="/departments">
        <motion.button 
          whileHover={{ x: -5 }}
          className="group flex items-center gap-3 text-[10px] font-mono font-black text-zinc-500 hover:text-primary transition-colors uppercase tracking-[0.3em]"
        >
          <ArrowLeft className="h-4 w-4" /> {t("dept_back")}
        </motion.button>
      </Link>

      {/* Header - Unit Detail */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl font-headline font-black text-primary transition-transform group-hover:scale-105">
              <Building2 className="h-10 w-10" />
            </div>
            <CornerMarks />
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h2 className="text-5xl font-headline font-black tracking-tighter uppercase leading-none">{dept.name}</h2>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 rounded-none font-mono text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                ACTIVE_UNIT
              </Badge>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest">
              <span className="bg-primary/10 text-primary px-3 py-1 border border-primary/20">
                UNIT_ID::{dept.code || "UNKNOWN"}
              </span>
              {dept.description && (
                <span className="flex items-center gap-2 border-l border-zinc-800 pl-6 text-zinc-600">
                  {dept.description}
                </span>
              )}
            </div>
          </div>

          <div className="text-center md:text-right border-l-2 border-zinc-900 pl-10 hidden md:block">
            <p className="text-4xl font-mono font-black text-primary leading-none">{s?.employee_count || 0}</p>
            <p className="text-[9px] font-headline font-black text-zinc-500 mt-2 uppercase tracking-[0.3em]">UNIT_PERSONNEL</p>
          </div>
        </div>
        <CornerMarks />
      </div>

      {/* Metrics Grid */}
      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: t("dept_stat_employees"), value: s.employee_count, icon: Users, color: "primary" },
            { label: t("class_a"), value: s.class_a_count, icon: ShieldCheck, color: "emerald-400" },
            { label: t("dept_stat_avg_score"), value: `${Number(s.average_percentage ?? 0).toFixed(1)}%`, icon: Activity, color: "primary" },
            { label: t("dept_stat_skills"), value: s.skill_count, icon: Target, color: "primary" }
          ].map((stat, i) => (
            <Card key={i} className="bg-[#0D0D0D] border-zinc-800 rounded-none relative group overflow-hidden">
               <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-900 border border-zinc-800">
                       <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                    </div>
                    <div>
                       <p className="text-[9px] font-headline font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                       <p className={`text-2xl font-mono font-black text-${stat.color} leading-none mt-1`}>{stat.value}</p>
                    </div>
                  </div>
               </CardContent>
               <CornerMarks />
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personnel Registry */}
        <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none relative overflow-hidden group">
          <CardHeader className="border-b border-zinc-900 py-8 flex flex-row items-center justify-between">
            <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              {t("dept_team_members")}
            </CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-900">
              {employees?.data.map((emp) => (
                <Link key={emp.id} href={`/employees/${emp.id}`}>
                  <div className="p-6 hover:bg-zinc-800/50 transition-all flex items-center justify-between group/emp cursor-pointer">
                    <div className="space-y-1">
                      <p className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover/emp:text-primary transition-colors">
                        {emp.full_name}
                      </p>
                      <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                        <Briefcase className="h-3 w-3" /> {emp.job_title ?? "OPERATIVE"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                       {emp.current_class && (
                         <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase ${emp.current_class === "A" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : emp.current_class === "B" ? "border-amber-500/30 bg-amber-500/10 text-amber-500" : "border-rose-500/30 bg-rose-500/10 text-rose-500"}`}>
                           {emp.current_class}
                         </Badge>
                       )}
                       <ExternalLink className="h-3 w-3 text-zinc-800 group-hover/emp:text-primary" />
                    </div>
                  </div>
                </Link>
              ))}
              {!employees?.data.length && (
                <div className="p-12 text-center font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
                   NO_OPERATIVES_DEPLOYED_TO_THIS_UNIT
                </div>
              )}
            </div>
          </CardContent>
          <CornerMarks />
        </Card>

        {/* Technical Requirements */}
        <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none relative overflow-hidden group">
          <CardHeader className="border-b border-zinc-900 py-8">
            <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-blue-500" />
              {t("dept_required_skills")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-900">
              {skills?.map((sk) => (
                <div key={sk.id} className="p-6 hover:bg-zinc-800/50 transition-all flex items-center justify-between group/skill">
                  <div className="space-y-1">
                    <p className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover/skill:text-blue-500 transition-colors">
                      {sk.name}
                    </p>
                    <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                      {sk.category} // WEIGHT::{sk.weight}
                    </p>
                  </div>
                  <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase ${sk.criticality === "Critical" ? "border-rose-500/30 bg-rose-500/10 text-rose-500" : sk.criticality === "High" ? "border-amber-500/30 bg-amber-500/10 text-amber-500" : "border-zinc-800 text-zinc-600"}`}>
                    {sk.criticality}
                  </Badge>
                </div>
              ))}
              {!skills?.length && (
                <div className="p-12 text-center font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
                   NO_TECHNICAL_MATRICES_DEFINED
                </div>
              )}
            </div>
          </CardContent>
          <CornerMarks color="blue" />
        </Card>
      </div>

      {/* Deployment Footer */}
      <div className="p-8 border-2 border-primary/20 bg-primary/[0.03] relative overflow-hidden group">
         <ShieldCheck className="absolute -right-4 -top-4 h-24 w-24 text-primary opacity-5 group-hover:opacity-10 transition-all duration-700" />
         <p className="font-headline font-black text-[11px] text-primary uppercase tracking-[0.3em] mb-4">UNIT_OPERATIONAL_STATUS</p>
         <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase tracking-tighter">
            SYNCHRONIZING_UNIT_TELEMETRY // SECURITY_PROTOCOL_ALPHA_ACTIVE // ALL_NODES_REPORTING
         </p>
         <div className="mt-8 flex items-center justify-between text-[9px] font-mono font-black text-zinc-600 uppercase tracking-widest">
            <span>UNIT_HASH::{id.substring(0, 12).toUpperCase()}</span>
            <span className="text-emerald-500 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              OPERATIONAL
            </span>
         </div>
      </div>
    </div>
  );
}
