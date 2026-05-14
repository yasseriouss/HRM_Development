import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  ArrowRight,
  ClipboardList,
  MoreVertical,
  Activity,
  History,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { useT } from "@modules/skill-matrix/i18n";
import { hrmClient } from "@shared/api/hrm-client";
import { cn } from "@shared/utils/cn";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  Draft: { color: "bg-zinc-100 text-zinc-600 border-zinc-200", icon: ClipboardList, label: "Draft" },
  "In Progress": { color: "bg-blue-50 text-blue-600 border-blue-100", icon: Activity, label: "In Progress" },
  Finalized: { color: "bg-green-50 text-green-600 border-green-100", icon: ShieldCheck, label: "Finalized" },
  Terminated: { color: "bg-red-50 text-red-600 border-red-100", icon: AlertCircle, label: "Terminated" },
};

const STEP_STATUS: Record<string, { color: string; icon: any }> = {
  pending: { color: "text-zinc-400 bg-zinc-50", icon: Clock },
  in_progress: { color: "text-blue-500 bg-blue-50/50", icon: Activity },
  approved: { color: "text-green-500 bg-green-50/50", icon: CheckCircle2 },
  rejected: { color: "text-red-500 bg-red-50/50", icon: AlertCircle },
};

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const t = useT();
  const queryClient = useQueryClient();

  const { data: workflow, isLoading, error } = useQuery({
    queryKey: ["workflow", id],
    queryFn: () => hrmClient.get(`/workflows/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  const startMutation = useMutation({
    mutationFn: () => hrmClient.post(`/workflows/${id}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-4xl col-span-2" />
          <Skeleton className="h-[400px] rounded-4xl" />
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Workflow Not Found</h1>
        <p className="text-zinc-500 mb-6">The requested evaluation protocol does not exist or access was denied.</p>
        <Button variant="outline" onClick={() => setLocation("/skill-matrix/workflows")} className="rounded-2xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workflows
        </Button>
      </div>
    );
  }

  const status = STATUS_CONFIG[workflow.status] || STATUS_CONFIG.Draft;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-6 lg:p-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => setLocation("/skill-matrix/workflows")}
            className="flex items-center text-zinc-400 hover:text-zinc-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium uppercase tracking-widest">{t("nav_workflows")}</span>
          </button>
          
          <div className="flex items-start gap-4">
            <div className={cn("p-4 rounded-3xl border shadow-sm", status.color)}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 tracking-tight font-comfortaa">
                {workflow.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className={cn("rounded-full px-3 py-1 font-medium", status.color)}>
                  {workflow.status}
                </Badge>
                <span className="text-zinc-400 text-sm">•</span>
                <span className="text-zinc-500 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {format(new Date(workflow.created_at), "PPP")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {workflow.status === "Draft" && (
            <Button 
              onClick={() => startMutation.mutate()} 
              disabled={startMutation.isPending}
              className="rounded-3xl h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200/50 transition-all active:scale-95"
            >
              {startMutation.isPending ? "Starting Protocol..." : "START EVALUATION"}
            </Button>
          )}
          <Button variant="outline" className="rounded-3xl h-12 px-6 border-zinc-200 text-zinc-600 hover:bg-zinc-50">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Hierarchy & Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Card */}
          <Card className="rounded-4xl p-8 border-none bg-white shadow-sm ring-1 ring-zinc-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <ClipboardList className="w-64 h-64 rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-zinc-900 font-comfortaa">
                  {t("label_wf_protocol")}
                </h3>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <span className="font-medium text-zinc-900">{workflow.completed_steps}</span>
                  <span>/</span>
                  <span>{workflow.total_steps} {t("dashboard_active")}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-zinc-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(workflow.completed_steps / (workflow.total_steps || 1)) * 100}%` }}
                  className="h-full bg-linear-to-r from-zinc-800 to-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t("field_department")}</p>
                  <p className="font-semibold text-zinc-900">{workflow.department?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t("common_created_by")}</p>
                  <p className="font-semibold text-zinc-900">{workflow.created_by_user?.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Campaign</p>
                  <p className="font-semibold text-zinc-900">{workflow.campaign?.title || "Standalone"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Factory Node</p>
                  <p className="font-semibold text-zinc-900">Woodworking-01</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Assignment Hierarchy Visualization */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-zinc-900 font-comfortaa px-2">
              {t("label_hierarchy_arch")}
            </h3>
            
            <div className="space-y-4">
              {workflow.assignments?.filter((a: any) => !a.parent_assignment_id).map((assignment: any) => (
                <AssignmentNode key={assignment.id} assignment={assignment} allAssignments={workflow.assignments} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Audit Trail & Steps */}
        <div className="space-y-8">
          <Card className="rounded-4xl p-8 border-none bg-white shadow-sm ring-1 ring-zinc-100">
            <h3 className="text-xl font-semibold text-zinc-900 font-comfortaa mb-6 flex items-center gap-3">
              <History className="w-5 h-5 text-zinc-400" />
              Evaluation Audit
            </h3>

            <div className="space-y-6">
              {workflow.steps?.map((step: any, idx: number) => {
                const config = STEP_STATUS[step.status] || STEP_STATUS.pending;
                const Icon = config.icon;
                
                return (
                  <div key={step.id} className="relative flex gap-4 group">
                    {idx !== workflow.steps.length - 1 && (
                      <div className="absolute left-[11px] top-8 w-[2px] h-[calc(100%-16px)] bg-zinc-100" />
                    )}
                    
                    <div className={cn(
                      "relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all group-hover:scale-110",
                      config.color
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-sm text-zinc-900 uppercase tracking-tight">
                          {step.level.replace("_", " ")}
                        </p>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">{format(new Date(step.created_at), "HH:mm")}</span>
                      </div>
                      <p className="text-sm text-zinc-600 font-medium">{step.assigned_user?.full_name}</p>
                      {step.notes && (
                        <div className="mt-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 italic text-xs text-zinc-500">
                          "{step.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {(!workflow.steps || workflow.steps.length === 0) && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto">
                    <History className="w-6 h-6 text-zinc-300" />
                  </div>
                  <p className="text-sm text-zinc-400 font-medium uppercase tracking-widest">{t("label_no_streams")}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-4xl p-8 border-none bg-zinc-900 text-white shadow-2xl shadow-zinc-900/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <ShieldCheck className="w-24 h-24" />
            </div>
            
            <h3 className="text-lg font-semibold font-comfortaa mb-4 relative z-10">System Ops</h3>
            <div className="space-y-3 relative z-10">
              <Button className="w-full justify-start h-12 rounded-2xl bg-white/10 hover:bg-white/20 border-none text-white text-sm font-medium">
                <MessageSquare className="w-4 h-4 mr-3 opacity-60" />
                Add Protocol Note
              </Button>
              <Button variant="outline" className="w-full justify-start h-12 rounded-2xl bg-transparent hover:bg-white/5 border-white/10 text-white text-sm font-medium">
                <UserCheck className="w-4 h-4 mr-3 opacity-60" />
                Delegate Auth
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AssignmentNode({ assignment, allAssignments }: { assignment: any; allAssignments: any[] }) {
  const children = allAssignments.filter((a) => a.parent_assignment_id === assignment.id);
  const isWorker = assignment.production_role === "technician" || assignment.production_role === "helper";
  const t = useT();

  return (
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-6 rounded-4xl border transition-all hover:shadow-md",
          isWorker ? "bg-zinc-50/50 border-zinc-100" : "bg-white border-zinc-200"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-3xl flex items-center justify-center border shadow-sm",
              assignment.production_role === "manager" ? "bg-amber-50 border-amber-100 text-amber-600" :
              assignment.production_role === "engineer" ? "bg-blue-50 border-blue-100 text-blue-600" :
              assignment.production_role === "supervisor" ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
              "bg-zinc-100 border-zinc-200 text-zinc-600"
            )}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.15em]">
                {assignment.production_role}
              </p>
              <h4 className="text-lg font-bold text-zinc-900 font-comfortaa">
                {assignment.user?.full_name || assignment.employee?.full_name || "Unassigned"}
              </h4>
              {assignment.employee?.employee_code && (
                <p className="text-xs text-zinc-500 font-medium">#{assignment.employee.employee_code}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {!isWorker && children.length > 0 && (
               <Badge className="rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-none px-3 font-bold">
                 {children.length} SUB-NODES
               </Badge>
             )}
             <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
               <ChevronRight className="w-5 h-5 text-zinc-400" />
             </Button>
          </div>
        </div>
      </motion.div>

      {children.length > 0 && (
        <div className="pl-8 md:pl-12 relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-100" />
          <div className="space-y-4">
            {children.map((child) => (
              <AssignmentNode key={child.id} assignment={child} allAssignments={allAssignments} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
