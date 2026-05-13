import { useParams, Link } from "wouter";
import { useGetEmployeeProfile } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { useT } from "@modules/skill-matrix/i18n";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building2, 
  Award, 
  Target,
  ArrowUpRight,
  User,
  Fingerprint,
  ShieldCheck,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@shared/utils/cn";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const headers = getAuthHeaders();
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";

  const { data: profile, isLoading } = useGetEmployeeProfile(id!, {
    request: { headers }
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 animate-pulse">
        <Skeleton className="h-10 w-48 bg-zinc-100 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Skeleton className="h-[600px] lg:col-span-4 bg-zinc-100 rounded-4xl" />
          <Skeleton className="h-[600px] lg:col-span-8 bg-zinc-100 rounded-4xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto py-32 px-8 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-4xl bg-zinc-50 text-zinc-300 mb-6">
           <User className="h-10 w-10" />
        </div>
        <p className="text-xl font-bold font-comfortaa text-zinc-400">{t("common_not_found")}</p>
        <Link href="/skill-matrix/employees">
          <Button variant="outline" className="rounded-full mt-8">{t("action_back")}</Button>
        </Link>
      </div>
    );
  }

  const emp = profile.employee;

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 pb-32 selection:bg-zinc-900 selection:text-white">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/skill-matrix/employees">
          <Button variant="ghost" className="rounded-full gap-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 px-6 -ms-4">
            <ChevronLeft className={cn("h-5 w-5", isAr ? 'rotate-180' : '')} />
            <span className="font-bold text-[11px] tracking-widest uppercase">{t("action_back_to_registry")}</span>
          </Button>
        </Link>
        <div className="flex items-center gap-3 text-zinc-300">
           <Fingerprint className="h-5 w-5" />
           <span className="text-[10px] font-bold tracking-widest uppercase">{emp?.employee_code || "N/A"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-4 space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-100 rounded-4xl p-12 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] scale-150 text-zinc-900">
              <User className="h-48 w-48" />
            </div>

            <div className="space-y-10 relative z-10">
              <div className="space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center text-white text-3xl font-bold font-comfortaa shadow-2xl shadow-zinc-200">
                   {emp?.full_name?.charAt(0)}
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-bold font-comfortaa tracking-tighter text-zinc-900 leading-tight">
                    {emp?.full_name}
                  </h1>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">{emp?.job_title || "Personnel"}</p>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-zinc-50">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{t("field_department")}</p>
                    <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight">{emp?.department?.name || "Unassigned"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{t("field_email")}</p>
                    <p className="text-sm font-bold text-zinc-900 lowercase truncate max-w-[200px]">{emp?.email || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{t("field_phone")}</p>
                    <p className="text-sm font-bold text-zinc-900">{emp?.phone || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{t("field_joined_date")}</p>
                    <p className="text-sm font-bold text-zinc-900">{emp?.joined_date ? new Date(emp.joined_date).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white border-zinc-100 rounded-4xl shadow-sm p-10 hover:shadow-lg transition-all duration-500 overflow-hidden group">
              <div className="space-y-4">
                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{t("label_skill_count")}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-5xl font-bold font-comfortaa text-zinc-900 group-hover:scale-110 transition-transform duration-500">{(profile as any).evaluations?.length || 0}</h3>
                  <Award className="h-8 w-8 text-zinc-100 group-hover:text-zinc-900 transition-colors" />
                </div>
              </div>
            </Card>
            <Card className="bg-zinc-900 rounded-4xl shadow-2xl shadow-zinc-200 p-10 group overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#3F3F46_0%,transparent_60%)] opacity-20" />
              <div className="space-y-4 relative z-10">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{t("label_current_class")}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-5xl font-bold font-comfortaa text-white group-hover:scale-110 transition-transform duration-500">{emp?.current_class || "—"}</h3>
                  <Target className="h-8 w-8 text-white/20" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Detailed Insights */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Skill Matrix Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-zinc-100 rounded-4xl p-12 shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold font-comfortaa tracking-tighter text-zinc-900 uppercase">{t("label_competency_overview")}</h2>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{t("desc_competency_overview")}</p>
              </div>
              <Button variant="outline" className="rounded-full border-zinc-100 font-bold text-[10px] tracking-widest uppercase h-12 px-8 hover:bg-zinc-50 transition-all">
                {t("action_view_full_matrix")} <ArrowUpRight className="h-4 w-4 ms-3 opacity-20" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(profile as any).evaluations?.slice(0, 8).map((ev: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-8 bg-zinc-50/50 border border-transparent rounded-4xl hover:bg-white hover:border-zinc-100 hover:shadow-lg transition-all duration-500 group">
                  <div className="space-y-2">
                    <p className="font-bold text-sm tracking-tight text-zinc-900 group-hover:translate-x-1 transition-transform uppercase">{ev.skill?.name}</p>
                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{ev.skill?.category || "General"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold font-comfortaa text-zinc-200 group-hover:text-zinc-900 transition-colors">{ev.level}</span>
                    <div className="h-10 w-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div 
                        className="w-full bg-zinc-900 transition-all duration-1000 delay-300" 
                        style={{ height: `${(ev.level / 5) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Training Recommendations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-zinc-100 rounded-4xl p-12 shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold font-comfortaa tracking-tighter text-zinc-900 uppercase">{t("label_development_path")}</h2>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{t("desc_development_path")}</p>
              </div>
              <Badge className="rounded-full bg-amber-50 text-amber-600 border-none text-[10px] font-bold tracking-widest uppercase px-6 py-2 shadow-sm">
                {t("status_active_learning")}
              </Badge>
            </div>

            <div className="space-y-6">
              {(profile as any).recommendations?.length > 0 ? (
                (profile as any).recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-10 border border-zinc-100 rounded-4xl bg-white hover:shadow-2xl hover:shadow-zinc-100 transition-all duration-500 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-10 transition-all">
                       <GraduationCap className="h-16 w-16 text-zinc-900" />
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                      <div className="space-y-4">
                        <Badge variant="outline" className="rounded-full border-zinc-100 bg-zinc-50 text-zinc-400 text-[9px] font-bold uppercase tracking-widest px-4 py-1">
                          {rec.priority || "MEDIUM"} PRIORITY
                        </Badge>
                        <h4 className="font-bold text-2xl tracking-tighter text-zinc-900 uppercase font-comfortaa">{rec.title}</h4>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xl">{rec.description}</p>
                      </div>
                      <Button className="rounded-full bg-zinc-900 text-white hover:scale-105 transition-all font-bold text-[10px] tracking-widest uppercase px-10 h-14 shadow-xl shadow-zinc-200">
                        {t("action_enroll")}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-24 text-center border-2 border-dashed border-zinc-100 rounded-4xl group hover:border-zinc-200 transition-all">
                   <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-200 mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Zap className="h-8 w-8" />
                   </div>
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{t("msg_no_recommendations")}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="pt-20 flex flex-col items-center gap-10">
        <div className="flex items-center gap-6 w-full max-w-md">
          <div className="h-px flex-1 bg-zinc-100" />
          <div className="flex items-center gap-4 px-10 py-4 bg-zinc-50 border border-zinc-100 text-[10px] text-zinc-400 font-bold tracking-[0.5em] uppercase rounded-full">
            <ShieldCheck className="h-4 w-4 text-zinc-900" />
            SECURED NODE
          </div>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
