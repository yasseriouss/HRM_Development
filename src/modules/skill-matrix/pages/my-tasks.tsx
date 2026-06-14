import { useT } from "@modules/skill-matrix/i18n";
import { Link } from "wouter";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Skeleton } from "@shared/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle2, Send, Circle, ArrowRight, ClipboardCheck, LayoutList, Activity, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface TaskItem {
  id: string;
  level: string;
  status: string;
  notes: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  workflow: {
    id: string;
    title: string;
    status: string;
    department?: { name: string } | null;
  };
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-muted" />,
  in_progress: <Clock className="h-4 w-4 text-blue-500 animate-pulse" />,
  submitted: <Send className="h-4 w-4 text-amber-500" />,
  approved: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
};

const LEVEL_DESC: Record<string, string>= {
  manager: "Execute final mission certification.",
  engineer: "Review and synchronize unit inputs.",
  supervisor: "Deploy node evaluations for your unit.",
  peer_eval: "Optional collateral evaluation submission.",
};

const LEVEL_BADGE: Record<string, string>= {
  manager: "border-purple-500/20 bg-purple-500/5 text-purple-600 shadow-sm",
  engineer: "border-blue-500/20 bg-blue-500/5 text-blue-600 shadow-sm",
  supervisor: "border-amber-500/20 bg-amber-500/5 text-amber-600 shadow-sm",
  peer_eval: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 shadow-sm",
};

const STATUS_BADGE: Record<string, string>= {
  pending: "border-muted/20 bg-background text-muted shadow-sm",
  in_progress: "border-blue-500/20 bg-blue-500/5 text-blue-600 shadow-sm",
  submitted: "border-amber-500/20 bg-amber-500/5 text-amber-600 shadow-sm",
  approved: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 shadow-sm",
};

export default function MyTasksPage() {
  const t = useT();
  const LEVEL_LABELS: Record<string, string>= {
    manager: t("task_level_manager"),
    engineer: t("task_level_engineer"),
    supervisor: t("task_level_supervisor"),
    peer_eval: t("task_level_peer"),
  };
  const LEVEL_DESC_T: Record<string, string>= {
    manager: t("task_desc_manager"),
    engineer: t("task_desc_engineer"),
    supervisor: t("task_desc_supervisor"),
    peer_eval: t("task_desc_peer"),
  };
  const headers = getAuthHeaders();

  const { data: tasks, isLoading } = useQuery<TaskItem[]>({
    queryKey: ["my-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/workflows/my/tasks", { headers });
      if (!res.ok) return [];
      return res.json() as Promise<TaskItem[]>;
    },
  });

  const pending = tasks?.filter((t) => t.status === "in_progress" || t.status === "submitted") ?? [];
  const completed = tasks?.filter((t) => t.status === "approved") ?? [];

  return (
    <div className="space-y-10 pb-24 font-sans text-foreground">
      {/* Header */}
      <div className="relative p-10 bg-surface/50 border border-muted/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              <span className="font-headline font-bold tracking-[0.2em] text-[10px] text-primary uppercase">{t("label_task_sync")}</span>
            </div>
            <h2 className="text-5xl font-headline font-bold tracking-tighter text-foreground uppercase leading-none">{t("nav_tasks")}
            </h2>
            <p className="text-muted font-medium border-s-2 border-primary/20 ps-4 uppercase tracking-widest text-xs">{t("tasks_subtitle_desc")}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="p-6 bg-background border border-muted/10 rounded-2xl text-center min-w-[140px] shadow-sm">
              <p className="text-[9px] font-headline font-bold text-muted tracking-widest uppercase">{t("label_pending_que")}</p>
              <p className="text-3xl font-headline font-bold text-primary mt-1">{pending.length}</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-muted/10 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
                 <h3 className="font-headline font-bold text-[10px] text-muted uppercase tracking-[0.2em]">{t("label_active_que")}</h3>
                 <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
               </div>
               
              <div className="grid gap-4">
                {pending.map((task) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.002, x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="relative overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-md border-muted/10">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <Zap className="h-16 w-16 text-foreground" />
                      </div>
                      <CardContent className="p-10">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                          <div className="shrink-0">
                            <div className="w-14 h-14 bg-background border border-muted/20 rounded-2xl flex items-center justify-center relative shadow-sm">
                               {STEP_ICONS[task.status]}
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-4 text-center md:text-start">
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                              <Badge variant="outline" className={`rounded-full font-headline text-[9px] font-bold tracking-widest uppercase px-3 py-1 ${LEVEL_BADGE[task.level] || ''}`}>{LEVEL_LABELS[task.level] || task.level}
                              </Badge>
                              <Badge variant="outline" className={`rounded-full font-headline text-[9px] font-bold tracking-widest uppercase px-3 py-1 ${STATUS_BADGE[task.status] || ''}`}>{task.status.replace("_", " ")}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                               <h4 className="text-2xl font-headline font-bold text-foreground uppercase group-hover:text-primary transition-colors duration-300 tracking-tight leading-none">
                                 {task.workflow.title}
                               </h4>
                               <p className="font-headline text-[9px] text-muted uppercase tracking-widest flex items-center justify-center md:justify-start gap-3">
                                 <Activity className="h-3 w-3 text-primary/60" />
                                 <span>{task.workflow.department?.name || "GLOBAL UNIT"}</span>
                                 <span className="text-muted/40">//</span>
                                 <span className="italic">{LEVEL_DESC_T[task.level]}</span>
                               </p>
                            </div>
                          </div>

                          <Link href={`/workflows/${task.workflow.id}`}>
                            <Button className="rounded-full bg-primary text-primary-foreground font-headline font-bold text-[10px] tracking-widest uppercase py-6 px-10 h-auto shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                              <span className="flex items-center gap-2">{t("action_execute_action")} <ArrowRight className="h-4 w-4" /></span>
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-6 pt-10">
               <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
                 <h3 className="font-headline font-bold text-[10px] text-muted uppercase tracking-[0.2em]">{t("label_archived_log")}</h3>
                 <div className="h-px flex-1 bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
               </div>

              <div className="grid gap-4 opacity-70">
                {completed.map((task) => (
                  <Card key={task.id} className="overflow-hidden hover:opacity-100 transition-opacity border-muted/10 bg-background/50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`rounded-full font-headline text-[9px] font-bold tracking-widest uppercase px-3 py-0.5 border-muted/20 bg-background text-muted`}>{LEVEL_LABELS[task.level] || task.level}
                            </Badge>
                            <h5 className="font-headline font-bold text-sm text-foreground uppercase tracking-tight">{task.workflow.title}</h5>
                          </div>{task.approved_at && (
                            <p className="font-headline text-[9px] text-muted uppercase tracking-widest">CERTIFIED AT::{new Date(task.approved_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Link href={`/workflows/${task.workflow.id}`}>
                          <Button variant="ghost" className="rounded-full border border-muted/20 text-muted font-headline font-bold text-[9px] tracking-widest uppercase h-auto py-3 px-6 hover:bg-muted/5">{t("action_view_log")}</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!pending.length && !completed.length && (
            <div className="py-32 text-center border border-dashed border-muted/20 bg-surface/50 rounded-3xl relative group overflow-hidden shadow-sm">
               <ShieldCheck className="absolute -right-4 -top-4 h-32 w-32 text-emerald-500/20" />
               <LayoutList className="h-12 w-12 text-muted mx-auto mb-6" />
               <h4 className="font-headline font-bold text-xl text-foreground uppercase tracking-tight">{t("label_all_queues_clear")}</h4>
               <p className="font-headline text-[10px] text-muted uppercase tracking-widest mt-2">{t("label_no_actions_required")}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64981 10.6151 7.84212L6.86514 11.8421C6.67627 12.0436 6.35985 12.0538 6.1584 11.8649C5.95694 11.676 5.94674 11.3596 6.13561 11.1582L9.4445 7.5L6.13561 3.84181C5.94674 3.64035 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
  </svg>
);