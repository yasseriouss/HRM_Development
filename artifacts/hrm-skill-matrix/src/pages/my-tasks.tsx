import { useT } from "@/i18n";
import { Link } from "wouter";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>);

const STEP_ICONS: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-zinc-700" />,
  in_progress: <Clock className="h-4 w-4 text-blue-500 animate-pulse" />,
  submitted: <Send className="h-4 w-4 text-amber-500" />,
  approved: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
};

// LEVEL_LABELS moved inside component

const LEVEL_DESC: Record<string, string>= {
  manager: "Execute final mission certification.",
  engineer: "Review and synchronize unit inputs.",
  supervisor: "Deploy node evaluations for your unit.",
  peer_eval: "Optional collateral evaluation submission.",
};

const LEVEL_BADGE: Record<string, string>= {
  manager: "border-purple-500/30 bg-purple-500/10 text-purple-500",
  engineer: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  supervisor: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  peer_eval: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

const STATUS_BADGE: Record<string, string>= {
  pending: "border-zinc-800 bg-zinc-900 text-zinc-500",
  in_progress: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  submitted: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
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
    <div className="space-y-10 pb-24 font-sans text-white">
      {/* Header */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">{t("label_task_sync")}</span>
            </div>
            <h2 className="text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">{t("nav_tasks")}
            </h2>
            <p className="text-secondary/40 font-medium border-s-2 border-primary/20 ps-4 uppercase tracking-widest text-xs">{t("tasks_subtitle_desc")}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="p-6 bg-white/5 border border-white/10 text-center min-w-[140px]">
              <p className="text-[9px] font-headline font-black text-secondary/40 tracking-widest uppercase">{t("label_pending_que")}</p>
              <p className="text-3xl font-mono font-black text-primary mt-1">{pending.length}</p>
            </div>
          </div>
        </div>
        <CornerMarks />
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-zinc-900 rounded-none" />
          ))}
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
                 <h3 className="font-headline font-black text-[10px] text-zinc-500 uppercase tracking-[0.4em]">{t("label_active_que")}</h3>
                 <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
               </div>
               
              <div className="grid gap-4">
                {pending.map((task) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-[#0D0D0D] border border-zinc-800 rounded-none relative overflow-hidden group hover:border-primary/50 transition-all">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="h-12 w-12 text-white" />
                      </div>
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="shrink-0">
                            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center relative">{STEP_ICONS[task.status]}
                               <CornerMarks color="primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-4 text-center md:text-start">
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                              <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black tracking-widest uppercase px-2 py-0.5 ${LEVEL_BADGE[task.level]}`}>{LEVEL_LABELS[task.level] || task.level}
                              </Badge>
                              <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black tracking-widest uppercase px-2 py-0.5 ${STATUS_BADGE[task.status]}`}>{task.status.replace("_", " ")}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1">
                               <h4 className="text-xl font-headline font-black text-white uppercase group-hover:text-primary transition-colors tracking-tight leading-tight">
                                 {task.workflow.title}
                               </h4>
                               <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                                 <Activity className="h-3 w-3" />{task.workflow.department?.name || "GLOBAL UNIT"} // {LEVEL_DESC_T[task.level]}
                               </p>
                            </div>
                          </div>

                          <Link href={`/workflows/${task.workflow.id}`}>
                            <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover:scale-105 transition-transform">{t("action_execute_action")} <ArrowRight className="h-4 w-4 ms-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                      <CornerMarks />
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-6 pt-10">
               <div className="flex items-center gap-4">
                 <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
                 <h3 className="font-headline font-black text-[10px] text-zinc-700 uppercase tracking-[0.4em]">{t("label_archived_log")}</h3>
                 <div className="h-px flex-1 bg-linear-to-r from-transparent via-zinc-800 to-transparent" />
               </div>

              <div className="grid gap-4 opacity-40">
                {completed.map((task) => (
                  <Card key={task.id} className="bg-[#0D0D0D] border border-zinc-900 rounded-none overflow-hidden hover:opacity-100 transition-opacity">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <CheckCircle2 className="h-6 w-6 text-emerald-900 shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`rounded-none font-mono text-[8px] font-black tracking-widest uppercase px-2 py-0.5 border-zinc-800 text-zinc-600`}>{LEVEL_LABELS[task.level] || task.level}
                            </Badge>
                            <h5 className="font-headline font-black text-sm text-zinc-400 uppercase tracking-tight">{task.workflow.title}</h5>
                          </div>{task.approved_at && (
                            <p className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">CERTIFIED AT::{new Date(task.approved_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Link href={`/workflows/${task.workflow.id}`}>
                          <Button variant="ghost" className="rounded-none border border-zinc-900 text-zinc-500 font-headline font-black text-[9px] tracking-widest uppercase h-auto py-3 px-6">{t("action_view_log")}</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!pending.length && !completed.length && (
            <div className="py-32 text-center border-2 border-dashed border-zinc-900 bg-[#0A0A0A] relative group overflow-hidden">
               <ShieldCheck className="absolute -right-4 -top-4 h-32 w-32 text-emerald-500 opacity-5" />
               <LayoutList className="h-12 w-12 text-zinc-800 mx-auto mb-6" />
               <h4 className="font-headline font-black text-xl text-zinc-600 uppercase tracking-tighter">{t("label_all_queues_clear")}</h4>
               <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-[0.3em] mt-2">{t("label_no_actions_required")}</p>
               <CornerMarks />
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
