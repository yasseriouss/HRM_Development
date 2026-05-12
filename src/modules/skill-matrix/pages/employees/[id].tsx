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
  User
} from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="p-12 space-y-8 animate-pulse">
        <Skeleton className="h-10 w-48 bg-muted/5 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[500px] md:col-span-1 bg-muted/5 rounded-4xl" />
          <Skeleton className="h-[500px] md:col-span-2 bg-muted/5 rounded-4xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-20 text-center space-y-6">
        <div className="w-20 h-20 bg-muted/5 rounded-full flex items-center justify-center mx-auto">
          <User className="h-10 w-10 text-muted-foreground/20" />
        </div>
        <p className="font-sans text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">{t("common_not_found")}</p>
        <Link href="/employees">
          <Button variant="outline" className="rounded-full">{t("action_back")}</Button>
        </Link>
      </div>
    );
  }

  const emp = profile.employee;

  return (
    <div className="space-y-10 pb-20 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Top Navigation */}
      <div className="pt-12 px-4 max-w-7xl mx-auto w-full">
        <Link href="/employees">
          <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 px-6 -ms-4">
            <ChevronLeft className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
            <span className="font-bold text-[11px] tracking-widest uppercase">{t("action_back_to_registry")}</span>
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-primary/10 rounded-4xl p-10 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150">
              <User className="h-32 w-32" />
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-2">
                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-bold px-4 py-1 uppercase tracking-widest">
                  {emp?.employee_code || "N/A"}
                </Badge>
                <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground leading-tight uppercase">
                  {emp?.full_name}
                </h1>
                <p className="text-muted-foreground font-medium text-lg">{emp?.job_title || "Personnel"}</p>
              </div>

              <div className="space-y-4 pt-8 border-t border-primary/5">
                <div className="flex items-center gap-4 text-sm font-medium text-foreground/70">
                  <div className="h-10 w-10 rounded-2xl bg-muted/5 flex items-center justify-center text-primary/40">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t("field_department")}</p>
                    <p className="uppercase">{emp?.department?.name || "Unassigned"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium text-foreground/70">
                  <div className="h-10 w-10 rounded-2xl bg-muted/5 flex items-center justify-center text-primary/40">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t("field_email")}</p>
                    <p className="lowercase truncate max-w-[200px]">{emp?.email || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium text-foreground/70">
                  <div className="h-10 w-10 rounded-2xl bg-muted/5 flex items-center justify-center text-primary/40">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t("field_phone")}</p>
                    <p>{emp?.phone || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium text-foreground/70">
                  <div className="h-10 w-10 rounded-2xl bg-muted/5 flex items-center justify-center text-primary/40">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t("field_joined_date")}</p>
                    <p>{emp?.joined_date ? new Date(emp.joined_date).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-surface border-primary/5 rounded-3xl shadow-sm border p-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t("label_skill_count")}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-headline font-bold text-foreground">{(profile as any).evaluations?.length || 0}</h3>
                  <Award className="h-5 w-5 text-primary/20 mb-1" />
                </div>
              </div>
            </Card>
            <Card className="bg-surface border-primary/5 rounded-3xl shadow-sm border p-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{t("label_current_class")}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-headline font-bold text-primary">{emp?.current_class || "—"}</h3>
                  <Target className="h-5 w-5 text-primary/20 mb-1" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Detailed Insights */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Skill Matrix Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface border border-primary/10 rounded-4xl p-10 shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-headline font-bold tracking-tight text-foreground uppercase">{t("label_competency_overview")}</h2>
                <p className="text-xs text-muted-foreground font-medium">{t("desc_competency_overview")}</p>
              </div>
              <Button variant="outline" className="rounded-full border-primary/10 font-bold text-[10px] tracking-widest uppercase h-10 px-6">
                {t("action_view_full_matrix")} <ArrowUpRight className="h-3 w-3 ms-2 opacity-40" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* This would ideally be a radar chart or a detailed list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(profile as any).evaluations?.slice(0, 6).map((ev: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-5 border border-primary/5 rounded-3xl bg-primary/[0.02] group hover:bg-primary/[0.04] transition-colors">
                    <div className="space-y-1">
                      <p className="font-headline font-bold text-sm tracking-tight text-foreground/80 group-hover:text-primary transition-colors uppercase">{ev.skill?.name}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest">{ev.skill?.category || "General"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-headline font-black text-primary/40 group-hover:text-primary transition-all">{ev.level}</span>
                      <div className="h-8 w-1 rounded-full bg-primary/10 overflow-hidden">
                        <div className="w-full bg-primary transition-all duration-500" style={{ height: `${(ev.level / 5) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Training Recommendations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface border border-primary/10 rounded-4xl p-10 shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <h2 className="text-2xl font-headline font-bold tracking-tight text-foreground uppercase">{t("label_development_path")}</h2>
                <p className="text-xs text-muted-foreground font-medium">{t("desc_development_path")}</p>
              </div>
              <Badge className="rounded-full bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-black tracking-widest uppercase px-4 py-1">
                {t("status_active_learning")}
              </Badge>
            </div>

            <div className="space-y-4">
              {(profile as any).recommendations?.length > 0 ? (
                (profile as any).recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-6 border border-primary/5 rounded-3xl bg-surface hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <Badge variant="outline" className="rounded-full text-[9px] font-bold uppercase tracking-widest opacity-60">
                          {rec.priority || "MEDIUM"} PRIORITY
                        </Badge>
                        <h4 className="font-headline font-bold text-lg tracking-tight text-foreground uppercase">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{rec.description}</p>
                      </div>
                      <Button size="sm" className="rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all font-bold text-[10px] tracking-widest uppercase">
                        {t("action_enroll")}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-primary/5 rounded-4xl">
                  <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">{t("msg_no_recommendations")}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
