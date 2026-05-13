import { useState } from "react";
import { Link } from "wouter";
import { useT } from "@modules/skill-matrix/i18n";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@shared/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@shared/components/ui/alert-dialog";
import { Plus, Trash2, ExternalLink, ChevronRight, CheckCircle2, Clock, Circle, X, GitBranch, Activity, Shield, Terminal, Zap, Cpu, Users, Layers, Workflow } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useFactory } from "@shared/contexts/FactoryContext";

interface WorkflowSummary {
  id: string;
  title: string;
  department_id: string;
  campaign_id: string | null;
  status: string;
  created_at: string;
  finalized_at: string | null;
  notes: string | null;
  department?: { id: string; name: string } | null;
  campaign?: { id: string; title: string } | null;
  completed_steps: number;
  total_steps: number;
}

interface Department { id: string; name: string; }
interface Campaign { id: string; title: string; }
interface SystemUser { id: string; full_name: string | null; email: string; role: string; }

const STATUS_CONFIG: Record<string, { bg: string; text: string; key: string }>= {
  Draft: { bg: "bg-amber-100", text: "text-amber-700", key: "status_draft" },
  "In Progress": { bg: "bg-sky-100", text: "text-sky-700", key: "status_active" },
  "Awaiting Approval": { bg: "bg-violet-100", text: "text-violet-700", key: "status_review" },
  Finalized: { bg: "bg-emerald-100", text: "text-emerald-700", key: "status_finalized" },
  Cancelled: { bg: "bg-zinc-100", text: "text-zinc-700", key: "status_cancelled" },
};

function statusBadge(status: string, t: (k: any) => string) {
  const config = STATUS_CONFIG[status] ?? { bg: "bg-zinc-100", text: "text-zinc-600", key: status };
  return (
    <Badge variant="outline" className={`rounded-full font-medium text-[10px] border-none px-3 py-1 ${config.bg} ${config.text}`}>
      {config.key ? t(config.key as any) : config.key}
    </Badge>);
}

interface Employee { id: string; full_name: string; employee_code: string; }

interface SupEntry {
  userId: string;
  fullName: string;
  workers: Array<{ employeeId: string; fullName: string; role: "technician" | "helper" }>;
}

interface EngEntry {
  userId: string;
  fullName: string;
  supervisors: SupEntry[];
}

export default function WorkflowsPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useT();
  const { activeFactoryId } = useFactory();
  const isManager = user?.role === "super_admin" || user?.role === "dept_head" || user?.role === "hr_coordinator";

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    department_id: "",
    campaign_id: "",
    notes: "",
    manager_id: "",
  });

  const [engineers, setEngineers] = useState<EngEntry[]>([]);

  const { data: workflows, isLoading } = useQuery<WorkflowSummary[]>({
    queryKey: ["workflows", activeFactoryId],
    queryFn: async () => {
      const url = activeFactoryId ? `/api/workflows?factory_id=${activeFactoryId}` : "/api/workflows";
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Failed to load workflows");
      return res.json() as Promise<WorkflowSummary[]>;
    },
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments-list", activeFactoryId],
    queryFn: async () => {
      const url = activeFactoryId ? `/api/departments?factory_id=${activeFactoryId}` : "/api/departments";
      const res = await fetch(url, { headers });
      if (!res.ok) return [];
      return res.json() as Promise<Department[]>;
    },
  });

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["campaigns-list", activeFactoryId],
    queryFn: async () => {
      const url = activeFactoryId ? `/api/campaigns?factory_id=${activeFactoryId}` : "/api/campaigns";
      const res = await fetch(url, { headers });
      if (!res.ok) return [];
      return res.json() as Promise<Campaign[]>;
    },
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["employees-list-wf", activeFactoryId],
    queryFn: async () => {
      const url = activeFactoryId ? `/api/employees?limit=500&factory_id=${activeFactoryId}` : "/api/employees?limit=500";
      const res = await fetch(url, { headers });
      if (!res.ok) return [];
      const data = await res.json() as Employee[] | { data: Employee[] };
      return Array.isArray(data) ? data : (data.data ?? []);
    },
  });

  const { data: systemUsers } = useQuery<SystemUser[]>({
    queryKey: ["system-users-list"],
    queryFn: async () => {
      const res = await fetch("/api/auth/users", { headers });
      if (!res.ok) return [] as SystemUser[];
      const data = await res.json() as SystemUser[] | { data: SystemUser[] };
      return Array.isArray(data) ? data : (data.data ?? []);
    },
  });

  const users = systemUsers ?? [];

  const openCreate = () => {
    setForm({ title: "", department_id: "", campaign_id: "", notes: "", manager_id: "" });
    setEngineers([]);
    setShowCreate(true);
  };

  const buildAssignmentTree = () => {
    const result = [];
    if (form.manager_id) {
      const engNodes = engineers.map((eng) => {
        const supNodes = eng.supervisors.map((sup) => ({
          userId: sup.userId,
          production_role: "supervisor",
          children: sup.workers.map((w) => ({
            employeeId: w.employeeId,
            production_role: w.role,
            children: [],
          })),
        }));
        return {
          userId: eng.userId,
          production_role: "engineer",
          children: supNodes,
        };
      });
      result.push({
        userId: form.manager_id,
        production_role: "manager",
        children: engNodes,
      });
    }
    return result;
  };

  const handleCreate = async () => {
    if (!form.title || !form.department_id) {
      toast({ title: t("workflows_required"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const tree = buildAssignmentTree();
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          title: form.title,
          department_id: form.department_id,
          factory_id: activeFactoryId ?? undefined,
          campaign_id: form.campaign_id || null,
          notes: form.notes || null,
          assignments: tree,
        }),
      });
      if (res.ok) {
        toast({ title: t("workflows_created") });
        setShowCreate(false);
        await queryClient.invalidateQueries({ queryKey: ["workflows"] });
      } else {
        const b = await res.json() as { message?: string };
        toast({ title: t("common_failed"), description: b.message, variant: "destructive" });
      }
    } catch {
      toast({ title: t("common_network_error"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/workflows/${deleteTarget.id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast({ title: t("workflows_deleted") });
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey: ["workflows"] });
      } else {
        const b = await res.json() as { message?: string };
        toast({ title: t("common_failed"), description: b.message, variant: "destructive" });
        setDeleteTarget(null);
      }
    } catch {
      toast({ title: t("common_network_error"), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const addEngineer = (userId: string) => {
    if (!userId || engineers.find((e) => e.userId === userId)) return;
    const u = users.find((x) => x.id === userId);
    if (!u) return;
    setEngineers((prev) => [...prev, { userId, fullName: u.full_name ?? u.email, supervisors: [] }]);
  };

  const removeEngineer = (userId: string) => {
    setEngineers((prev) => prev.filter((e) => e.userId !== userId));
  };

  const addSupervisor = (engUserId: string, supUserId: string) => {
    const u = users.find((x) => x.id === supUserId);
    if (!u) return;
    setEngineers((prev) =>
      prev.map((eng) =>
        eng.userId === engUserId && !eng.supervisors.find((s) => s.userId === supUserId)
          ? { ...eng, supervisors: [...eng.supervisors, { userId: supUserId, fullName: u.full_name ?? u.email, workers: [] }] }
          : eng,
      ),
    );
  };

  const removeSupervisor = (engUserId: string, supUserId: string) => {
    setEngineers((prev) =>
      prev.map((eng) =>
        eng.userId === engUserId
          ? { ...eng, supervisors: eng.supervisors.filter((s) => s.userId !== supUserId) }
          : eng,
      ),
    );
  };

  const addWorker = (engUserId: string, supUserId: string, employeeId: string, role: "technician" | "helper") => {
    const emp = employees?.find((e) => e.id === employeeId);
    if (!emp) return;
    setEngineers((prev) =>
      prev.map((eng) =>
        eng.userId === engUserId
          ? {
              ...eng,
              supervisors: eng.supervisors.map((sup) =>
                sup.userId === supUserId && !sup.workers.find((w) => w.employeeId === employeeId)
                  ? { ...sup, workers: [...sup.workers, { employeeId, fullName: emp.full_name, role }] }
                  : sup,
              ),
            }
          : eng,
      ),
    );
  };

  const removeWorker = (engUserId: string, supUserId: string, employeeId: string) => {
    setEngineers((prev) =>
      prev.map((eng) =>
        eng.userId === engUserId
          ? {
              ...eng,
              supervisors: eng.supervisors.map((sup) =>
                sup.userId === supUserId
                  ? { ...sup, workers: sup.workers.filter((w) => w.employeeId !== employeeId) }
                  : sup,
              ),
            }
          : eng,
      ),
    );
  };

  return (
    <div className="space-y-10 pb-20 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header - Editorial Style */}
      <div className="relative p-10 bg-white/40 backdrop-blur-xl border border-primary/5 rounded-4xl overflow-hidden shadow-soft-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-start">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <span className="font-comfortaa font-bold tracking-wider text-xs text-primary/60 uppercase">{t("label_wf_protocol")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-comfortaa font-bold text-zinc-900 tracking-tight leading-tight">
              {t("label_strategic_workflows")}
            </h1>
            <p className="text-zinc-500 font-medium max-w-xl">{t("label_wf_desc") || "Manage hierarchical evaluation and approval chains with professional precision."}</p>
          </div>
          
          {isManager && (
            <Button 
              className="rounded-2xl bg-primary text-primary-foreground font-comfortaa font-bold px-8 py-6 h-auto shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]" 
              onClick={openCreate}
            >
               <Plus className="h-5 w-5 me-2" />{t("action_initialize_protocol")}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full bg-white/40 rounded-3xl" />
          ))}
        </div>
      ) : !workflows?.length ? (
        <Card className="bg-white/40 backdrop-blur-xl border-primary/5 rounded-4xl shadow-soft-lg overflow-hidden">
          <CardContent className="py-32 text-center space-y-6">
            <div className="p-6 bg-zinc-50 w-fit mx-auto rounded-3xl border border-zinc-100">
              <Layers className="h-12 w-12 text-zinc-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-comfortaa font-bold text-zinc-900">{t("label_no_streams")}</h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">Initializing a new protocol will display it here for tracking and execution.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => {
            const progress = wf.total_steps > 0 ? Math.round((wf.completed_steps / wf.total_steps) * 100) : 0;
            return (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="bg-white/60 backdrop-blur-md border-primary/5 rounded-4xl shadow-soft-lg group-hover:shadow-soft-xl transition-all duration-300 h-full flex flex-col">
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-zinc-400 tracking-tighter uppercase">#{wf.id.substring(0, 8)}</span>
                        </div>
                        <h3 className="font-comfortaa font-bold text-xl text-zinc-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {wf.title}
                        </h3>
                      </div>
                      {statusBadge(wf.status, t)}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                          {wf.department?.name ?? "GENERAL"}
                        </span>
                      </div>
                      {wf.campaign && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                          <Activity className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-bold text-primary/70 uppercase tracking-tight">{wf.campaign.title}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-8 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-tight">
                        <span>{t("label_execution_progress")}</span>
                        <span className="text-zinc-900">{progress}%</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "circOut" }}
                          className={`h-full ${progress === 100 ? "bg-emerald-400" : "bg-primary"} rounded-full`} 
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{t("label_initialized")}</span>
                        <span className="text-[11px] font-bold text-zinc-600">{new Date(wf.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isManager && wf.status !== "Finalized" && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-10 w-10 rounded-2xl border border-zinc-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-colors"
                            onClick={() => setDeleteTarget({ id: wf.id, title: wf.title })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Link href={`/skill-matrix/workflows/${wf.id}`}>
                          <Button className="rounded-2xl bg-zinc-900 text-white hover:bg-primary transition-all duration-300 font-comfortaa font-bold px-6 group/btn shadow-soft-lg">
                             {t("action_access") || "Access"} <ChevronRight className="ms-1.5 h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) setShowCreate(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white/90 backdrop-blur-2xl border-primary/5 rounded-4xl p-0 overflow-hidden text-zinc-900 shadow-soft-2xl border">
          <div className="relative z-10 flex flex-col h-full max-h-[90vh]">
            <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-comfortaa font-bold text-2xl text-zinc-900 tracking-tight">{t("label_init_protocol_chain")}</h2>
              </div>
              <p className="text-[11px] font-bold text-primary/60 tracking-wider uppercase ml-12">{t("label_strat_init")}</p>
            </div>
            
            <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-3">
                  <Label className="font-bold text-[11px] text-zinc-400 tracking-tight uppercase ml-1">{t("label_protocol_title")} *</Label>
                  <Input
                    placeholder="e.g. Q2 PROD EVALUATION"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-14 bg-white border-zinc-200 rounded-2xl font-medium text-sm text-zinc-900 focus-visible:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-bold text-[11px] text-zinc-400 tracking-tight uppercase ml-1">{t("label_target_unit")} *</Label>
                  <Select value={form.department_id} onValueChange={(v) =>setForm({ ...form, department_id: v })}>
                    <SelectTrigger className="h-14 bg-white border-zinc-200 rounded-2xl font-bold text-xs text-zinc-900 uppercase">
                      <SelectValue placeholder="SELECT DEPLOYMENT UNIT" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-100 rounded-2xl text-zinc-900 shadow-soft-xl">
                      {departments?.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] uppercase focus:bg-primary/5">{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="font-bold text-[11px] text-zinc-400 tracking-tight uppercase ml-1">ACTIVE CAMPAIGN</Label>
                  <Select
                    value={form.campaign_id || "_none"}
                    onValueChange={(v) =>setForm({ ...form, campaign_id: v === "_none" ? "" : v })}
                  >
                    <SelectTrigger className="h-14 bg-white border-zinc-200 rounded-2xl font-bold text-xs text-zinc-900 uppercase">
                      <SelectValue placeholder="— NULL —" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-100 rounded-2xl text-zinc-900 shadow-soft-xl">
                      <SelectItem value="_none" className="font-bold text-[10px] uppercase focus:bg-primary/5">— NULL —</SelectItem>
                      {campaigns?.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-bold text-[10px] uppercase focus:bg-primary/5">{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hierarchy Builder */}
              <div className="bg-zinc-50/50 border border-zinc-100 rounded-3xl p-8 space-y-8 relative">
                <div className="flex items-center gap-4 mb-6">
                   <div className="h-px flex-1 bg-zinc-200/50" />
                   <h4 className="font-comfortaa font-bold text-xs text-primary uppercase tracking-widest">{t("label_hierarchy_arch")}</h4>
                   <div className="h-px flex-1 bg-zinc-200/50" />
                </div>

                {/* Manager */}
                <div className="space-y-4">
                  <Label className="font-bold text-[11px] text-zinc-400 tracking-tight uppercase flex items-center gap-2 ml-1">
                    <Shield className="h-3.5 w-3.5 text-amber-500" />{t("label_production_manager")}
                  </Label>
                  <Select value={form.manager_id} onValueChange={(v) =>setForm({ ...form, manager_id: v })}>
                    <SelectTrigger className="h-12 bg-white border-zinc-200 rounded-2xl font-bold text-[11px] text-zinc-900 uppercase">
                      <SelectValue placeholder="ASSIGN TOP LEVEL ADMIN" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-100 rounded-2xl text-zinc-900 shadow-soft-xl">
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="font-bold text-[10px] uppercase focus:bg-primary/5">{u.full_name ?? u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.manager_id && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-tight px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 w-fit animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 className="h-3.5 w-3.5" />AUTHORIZED::{users.find((u) => u.id === form.manager_id)?.full_name ?? "OPERATIVE"}
                    </div>
                  )}
                </div>

                {/* Engineers */}
                <div className="space-y-6">
                  <Label className="font-bold text-[11px] text-zinc-400 tracking-tight uppercase flex items-center gap-2 ml-1">
                     <Cpu className="h-3.5 w-3.5 text-sky-500" />{t("label_system_engineers")}
                  </Label>
                  <Select onValueChange={addEngineer} value="">
                    <SelectTrigger className="h-12 bg-white border-zinc-200 rounded-2xl font-bold text-[11px] text-zinc-900 uppercase">
                      <SelectValue placeholder="ADD ENGINEER NODE..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-zinc-100 rounded-2xl text-zinc-900 shadow-soft-xl">{users
                        .filter((u) => u.id !== form.manager_id && !engineers.find((e) => e.userId === u.id))
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id} className="font-bold text-[10px] uppercase focus:bg-primary/5">{u.full_name ?? u.email}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-1 gap-6">
                    {engineers.map((eng) => (
                      <div key={eng.userId} className="border border-zinc-100 rounded-3xl p-6 space-y-6 bg-white shadow-soft-md relative group/eng animate-in zoom-in-95">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight text-sky-600">
                            <ChevronRight className="h-4 w-4" />
                            <span>ENGINEER::{eng.fullName}</span>
                          </div>
                          <button onClick={() => removeEngineer(eng.userId)} className="p-1.5 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Supervisors under engineer */}
                        <div className="ps-6 space-y-5 border-l-2 border-sky-100">
                          <Label className="font-bold text-[10px] text-zinc-400 tracking-tight uppercase">{t("label_direct_supervisors")}</Label>
                          <Select onValueChange={(v) => addSupervisor(eng.userId, v)} value="">
                            <SelectTrigger className="h-10 bg-zinc-50 border-zinc-100 rounded-xl font-bold text-[10px] text-zinc-900 uppercase">
                              <SelectValue placeholder="ADD SUPERVISOR..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-zinc-100 rounded-2xl shadow-soft-xl text-zinc-900">{users
                                .filter((u) => u.id !== form.manager_id && u.id !== eng.userId && !eng.supervisors.find((s) => s.userId === u.id))
                                .map((u) => (
                                  <SelectItem key={u.id} value={u.id} className="font-bold text-[10px] uppercase focus:bg-primary/5">{u.full_name ?? u.email}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <div className="space-y-4">
                            {eng.supervisors.map((sup) => (
                              <div key={sup.userId} className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-5 space-y-5 animate-in slide-in-from-top-2">
                                <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-tight text-amber-600">
                                  <span>
                                    <ChevronRight className="h-3 w-3 inline me-2" />
                                    SUPERVISOR::{sup.fullName}
                                  </span>
                                  <button onClick={() => removeSupervisor(eng.userId, sup.userId)} className="p-1 rounded-md text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {/* Workers under this supervisor */}
                                <div className="ps-6 space-y-4 border-l-2 border-amber-100">
                                  <div className="flex items-center gap-3">
                                    <Select
                                      onValueChange={(v) => {
                                        const [role, empId] = v.split(":");
                                        addWorker(eng.userId, sup.userId, empId, role as "technician" | "helper");
                                      }}
                                      value=""
                                    >
                                      <SelectTrigger className="h-9 bg-white border-zinc-200 rounded-xl font-bold text-[10px] text-zinc-900 uppercase flex-1">
                                        <SelectValue placeholder={t("label_deploy_operative")} />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border-zinc-100 rounded-2xl shadow-soft-xl text-zinc-900 max-h-[300px]">
                                        <SelectItem value="_tech_hdr" disabled className="font-bold text-primary opacity-50 uppercase tracking-tight text-[10px]">--- TECHNICIANS ---</SelectItem>
                                        {(employees ?? [])
                                          .filter((e) => !sup.workers.find((w) => w.employeeId === e.id))
                                          .map((e) => (
                                            <SelectItem key={`technician:${e.id}`} value={`technician:${e.id}`} className="font-bold text-[10px] uppercase focus:bg-primary/5">{e.full_name} ({e.employee_code})
                                            </SelectItem>
                                          ))}
                                        <SelectItem value="_help_hdr" disabled className="font-bold text-amber-500 opacity-50 uppercase tracking-tight text-[10px]">--- HELPERS ---</SelectItem>
                                        {(employees ?? [])
                                          .filter((e) => !sup.workers.find((w) => w.employeeId === e.id))
                                          .map((e) => (
                                            <SelectItem key={`helper:${e.id}`} value={`helper:${e.id}`} className="font-bold text-[10px] uppercase focus:bg-primary/5">{e.full_name} ({e.employee_code})
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {sup.workers.map((w) => (
                                      <div key={w.employeeId} className="flex items-center justify-between text-[11px] font-bold text-zinc-600 border border-zinc-100 bg-white rounded-xl p-3 shadow-soft-sm group/worker animate-in fade-in">
                                        <div className="flex items-center gap-3">
                                          <div className={`p-1.5 rounded-lg ${w.role === "technician" ? "bg-primary/5 text-primary" : "bg-amber-50 text-amber-600"}`}>
                                            <Users className="h-3.5 w-3.5" />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[9px] uppercase tracking-tighter opacity-50">{w.role}</span>
                                            <span className="leading-none">{w.fullName}</span>
                                          </div>
                                        </div>
                                        <button onClick={() => removeWorker(eng.userId, sup.userId, w.employeeId)} className="p-1 rounded-md text-zinc-200 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/worker:opacity-100">
                                          <X className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-bold text-[11px] text-zinc-400 tracking-tight uppercase ml-1">{t("label_system_notes")}</Label>
                <textarea
                  placeholder={t("label_specify_params")}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full min-h-[120px] p-5 bg-white border border-zinc-200 rounded-3xl font-medium text-sm text-zinc-900 focus:outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-4 shrink-0">
              <Button 
                variant="ghost" 
                className="rounded-2xl font-bold text-xs uppercase text-zinc-400 hover:bg-zinc-100 px-8 transition-colors" 
                onClick={() =>setShowCreate(false)}
              >
                {t("action_cancel_init")}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="rounded-2xl bg-primary text-primary-foreground font-comfortaa font-bold text-sm px-10 py-6 h-auto shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >{saving ? t("action_synchronizing") : t("action_execute_deployment")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-white border-primary/5 rounded-4xl p-8 text-zinc-900 shadow-soft-2xl border max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="p-4 bg-rose-50 w-fit rounded-2xl border border-rose-100">
              <Trash2 className="h-6 w-6 text-rose-500" />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="font-comfortaa font-bold text-2xl text-zinc-900 tracking-tight">{t("label_terminate_protocol")}</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-500 font-medium text-sm leading-relaxed">
                 {t("msg_confirm_wf_purge") || `This action will permanently terminate the workflow "${deleteTarget?.title}" and purge all associated evaluation data.`}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-3">
            <AlertDialogCancel className="rounded-2xl border-zinc-100 bg-zinc-50 text-zinc-600 font-bold text-xs uppercase hover:bg-zinc-100 h-auto py-4 px-8 transition-colors">{t("action_abort_termination")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-2xl bg-rose-500 text-white font-bold text-xs uppercase hover:bg-rose-600 px-8 h-auto py-4 shadow-lg shadow-rose-200 transition-all"
            >{deleting ? t("action_purging") : t("action_confirm_purge")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
