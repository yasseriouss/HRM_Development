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
import { Plus, Trash2, ExternalLink, ChevronRight, CheckCircle2, Clock, Circle, X, GitBranch, Activity, Shield, Terminal, Zap, Cpu, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useFactory } from "@shared/contexts/FactoryContext";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>);

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
  Draft: { bg: "bg-amber-500/10", text: "text-amber-500", key: "status_draft" },
  "In Progress": { bg: "bg-sky-500/10", text: "text-sky-500", key: "status_active" },
  "Awaiting Approval": { bg: "bg-violet-500/10", text: "text-violet-500", key: "status_review" },
  Finalized: { bg: "bg-emerald-500/10", text: "text-emerald-500", key: "status_finalized" },
  Cancelled: { bg: "bg-zinc-700/10", text: "text-zinc-500", key: "status_cancelled" },
};

function statusBadge(status: string, t: (k: any) => string) {
  const config = STATUS_CONFIG[status] ?? { bg: "bg-zinc-500/10", text: "text-zinc-500", key: status };
  return (
    <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black border-current/20 px-2 py-0.5 uppercase tracking-widest ${config.bg} ${config.text}`}>
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
    <div className="space-y-8 pb-20 font-sans selection:bg-primary selection:text-primary-foreground text-white">
      {/* Header - Industrial Style */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-start">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <GitBranch className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">{t("workflows_protocol_label")}</span>
            </div>
            <h2 className="text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">{t("workflows_title")}
            </h2>
            <p className="text-zinc-500 font-medium border-s-2 border-primary/20 ps-4">{t("workflows_subtitle")}</p>
          </div>
          
          {isManager && (
            <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto hover:bg-primary/90" onClick={openCreate}>
              <Plus className="h-4 w-4 me-2" />INITIALIZE PROTOCOL
            </Button>
          )}
        </div>
        <CornerMarks />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full bg-white/5 rounded-none" />
          ))}
        </div>
      ) : !workflows?.length ? (
        <Card className="bg-[#121212] border-white/10 rounded-none relative">
          <CardContent className="py-24 text-center space-y-4">
             <Terminal className="h-12 w-12 text-zinc-800 mx-auto" />
             <p className="font-mono text-xs text-zinc-600 uppercase tracking-[0.3em]">{t("label_no_records")}
             </p>
          </CardContent>
          <CornerMarks />
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{workflows.map((wf) => {
            const progress = wf.total_steps > 0 ? Math.round((wf.completed_steps / wf.total_steps) * 100) : 0;
            return (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-[#0D0D0D] border border-white/10 rounded-none relative group h-full overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="font-mono text-[9px] text-primary/60 tracking-widest uppercase">ID::{wf.id.substring(0, 8)}</span>
                        </div>
                        <h3 className="font-headline font-black text-xl text-white uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                          {wf.title}
                        </h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{t("workflows_unit")}::{wf.department?.name ?? t("workflows_general")}
                        </p>
                      </div>
                      {statusBadge(wf.status, t)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {wf.campaign && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 w-fit">
                         <Activity className="h-3 w-3 text-primary" />
                         <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">{t("campaigns_col_type")}::{wf.campaign.title}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                        <span>{t("workflows_progress")}</span>
                        <span className="text-white">{progress}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-none overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${progress === 100 ? "bg-emerald-500" : "bg-primary"} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} 
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="font-mono text-[9px] text-zinc-700 uppercase">{t("workflows_init_date")}::{new Date(wf.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {isManager && wf.status !== "Finalized" && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-none border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5 text-zinc-600 hover:text-rose-500"
                            onClick={() => setDeleteTarget({ id: wf.id, title: wf.title })}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Link href={`/workflows/${wf.id}`}>
                          <Button variant="ghost" className="rounded-none border border-white/10 hover:border-primary/50 text-[10px] font-headline font-black tracking-widest uppercase h-auto py-3 px-5 group/btn">
                             ACCESS <ExternalLink className="ms-2 h-3 w-3 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                  <CornerMarks />
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) setShowCreate(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-[#0A0A0A] border-2 border-primary/30 rounded-none p-0 overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <div className="relative z-10 flex flex-col h-full max-h-[90vh]">
            <div className="p-8 border-b border-white/10 bg-white/5 shrink-0">
              <h2 className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{t("workflows_create_title")}</h2>
              <p className="text-[10px] font-mono text-primary tracking-[0.3em] mt-2 uppercase">STRAT INIT_v9.4</p>
            </div>
            
            <div className="p-10 space-y-10 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-3">
                  <Label className="font-headline font-black text-[10px] text-zinc-500 tracking-[0.2em] uppercase">PROTOCOL TITLE *</Label>
                  <Input
                    placeholder="e.g. Q2 PROD EVALUATION"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-headline font-black text-[10px] text-zinc-500 tracking-[0.2em] uppercase">TARGET UNIT *</Label>
                  <Select value={form.department_id} onValueChange={(v) =>setForm({ ...form, department_id: v })}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                      <SelectValue placeholder="SELECT DEPLOYMENT UNIT" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                      {departments?.map((d) => (
                        <SelectItem key={d.id} value={d.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">ACTIVE CAMPAIGN</Label>
                  <Select
                    value={form.campaign_id || "_none"}
                    onValueChange={(v) =>setForm({ ...form, campaign_id: v === "_none" ? "" : v })}
                  >
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                      <SelectValue placeholder="— NULL —" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                      <SelectItem value="_none" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">— NULL —</SelectItem>
                      {campaigns?.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Hierarchy Builder */}
              <div className="bg-white/5 border border-white/10 rounded-none p-8 space-y-8 relative">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-px flex-1 bg-white/10" />
                   <h4 className="font-headline font-black text-xs text-primary uppercase tracking-[0.4em]">HIERARCHY ARCHITECTURE</h4>
                   <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Manager */}
                <div className="space-y-3">
                  <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase flex items-center gap-2">
                    <Shield className="h-3 w-3 text-amber-500" />PRODUCTION MANAGER
                  </Label>
                  <Select value={form.manager_id} onValueChange={(v) =>setForm({ ...form, manager_id: v })}>
                    <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                      <SelectValue placeholder="ASSIGN TOP LEVEL ADMIN" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{u.full_name ?? u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>{form.manager_id && (
                    <div className="flex items-center gap-2 text-[10px] font-mono font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 w-fit">
                      <CheckCircle2 className="h-3 w-3" />{t("workflows_authorized")}::{users.find((u) => u.id === form.manager_id)?.full_name ?? "OPERATIVE"}
                    </div>
                  )}
                </div>

                {/* Engineers */}
                <div className="space-y-4">
                  <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase flex items-center gap-2">
                     <Cpu className="h-3 w-3 text-sky-500" />SYSTEM ENGINEERS
                  </Label>
                  <Select onValueChange={addEngineer} value="">
                    <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                      <SelectValue placeholder="ADD ENGINEER NODE..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">{users
                        .filter((u) => u.id !== form.manager_id && !engineers.find((e) => e.userId === u.id))
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{u.full_name ?? u.email}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-1 gap-6">
                    {engineers.map((eng) => (
                      <div key={eng.userId} className="border border-white/10 rounded-none p-6 space-y-6 bg-black/40 relative group/eng">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 font-headline font-black text-[11px] uppercase tracking-widest text-sky-500">
                            <ChevronRight className="h-4 w-4" />
                            <span>ENGINEER::{eng.fullName}</span>
                          </div>
                          <button onClick={() => removeEngineer(eng.userId)} className="text-secondary/20 hover:text-rose-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Supervisors under engineer */}
                        <div className="ps-6 space-y-4 border-l border-sky-500/20">
                          <Label className="font-headline font-black text-[9px] text-secondary/30 tracking-[0.2em] uppercase">DIRECT SUPERVISORS</Label>
                          <Select onValueChange={(v) => addSupervisor(eng.userId, v)} value="">
                            <SelectTrigger className="h-10 bg-white/5 border-white/5 rounded-none font-headline font-black text-[9px] tracking-widest text-white uppercase">
                              <SelectValue placeholder="ADD SUPERVISOR..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">{users
                                .filter((u) => u.id !== form.manager_id && u.id !== eng.userId && !eng.supervisors.find((s) => s.userId === u.id))
                                .map((u) => (
                                  <SelectItem key={u.id} value={u.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{u.full_name ?? u.email}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <div className="space-y-4">
                            {eng.supervisors.map((sup) => (
                              <div key={sup.userId} className="bg-white/2 border border-white/5 p-4 space-y-4">
                                <div className="flex items-center justify-between font-headline font-black text-[10px] uppercase tracking-widest text-amber-500">
                                  <span>
                                    <ChevronRight className="h-3 w-3 inline me-2" />
                                    SUPERVISOR::{sup.fullName}
                                  </span>
                                  <button onClick={() => removeSupervisor(eng.userId, sup.userId)} className="text-secondary/20 hover:text-rose-500 transition-colors">
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>

                                {/* Workers under this supervisor */}
                                <div className="ps-6 space-y-4 border-l border-amber-500/20">
                                  <div className="flex items-center gap-3">
                                    <Select
                                      onValueChange={(v) => {
                                        const [role, empId] = v.split(":");
                                        addWorker(eng.userId, sup.userId, empId, role as "technician" | "helper");
                                      }}
                                      value=""
                                    >
                                      <SelectTrigger className="h-9 bg-black/40 border-white/5 rounded-none font-headline font-black text-[9px] tracking-widest text-white uppercase flex-1">
                                        <SelectValue placeholder="DEPLOY OPERATIVE..." />
                                      </SelectTrigger>
                                      <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white max-h-[300px]">
                                        <SelectItem value="_tech_hdr" disabled className="font-black text-primary opacity-50 uppercase tracking-widest text-[9px]">--- TECHNICIANS ---</SelectItem>
                                        {(employees ?? [])
                                          .filter((e) => !sup.workers.find((w) => w.employeeId === e.id))
                                          .map((e) => (
                                            <SelectItem key={`technician:${e.id}`} value={`technician:${e.id}`} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{e.full_name} ({e.employee_code})
                                            </SelectItem>
                                          ))}
                                        <SelectItem value="_help_hdr" disabled className="font-black text-amber-500 opacity-50 uppercase tracking-widest text-[9px]">--- HELPERS ---</SelectItem>
                                        {(employees ?? [])
                                          .filter((e) => !sup.workers.find((w) => w.employeeId === e.id))
                                          .map((e) => (
                                            <SelectItem key={`helper:${e.id}`} value={`helper:${e.id}`} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{e.full_name} ({e.employee_code})
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    {sup.workers.map((w) => (
                                      <div key={w.employeeId} className="flex items-center justify-between text-[10px] font-mono font-black text-secondary/40 border border-white/5 bg-black/20 p-3 uppercase tracking-tighter group/worker">
                                        <div className="flex items-center gap-2">
                                          <Users className="h-3 w-3 text-secondary/20" />
                                          <span className={`${w.role === "technician" ? "text-primary/60" : "text-amber-500/60"}`}>{w.role.substring(0, 4)}:</span> {w.fullName}
                                        </div>
                                        <button onClick={() => removeWorker(eng.userId, sup.userId, w.employeeId)} className="text-secondary/10 hover:text-rose-500 opacity-0 group-hover/worker:opacity-100 transition-opacity">
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <CornerMarks color="sky" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">SYSTEM NOTES</Label>
                <textarea
                  placeholder="SPECIFY OPERATIONAL PARAMETERS..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full min-h-[100px] p-4 bg-white/5 border border-white/10 rounded-none font-mono text-sm tracking-widest text-white focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end gap-4 shrink-0">
              <Button variant="ghost" className="rounded-none font-headline font-black text-[10px] tracking-widest uppercase text-white hover:bg-white/5" onClick={() =>setShowCreate(false)}>CANCEL INIT</Button>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase px-10 py-6 h-auto"
              >{saving ? t("action_synchronizing") : t("workflows_new")}
              </Button>
            </div>
          </div>
          <CornerMarks />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-[#0A0A0A] border-2 border-rose-500/30 rounded-none text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{t("action_confirm_delete")}</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary/40 font-mono text-xs uppercase tracking-widest">{t("workflows_delete_desc", { name: deleteTarget?.title || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-none border-white/10 bg-white/5 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-white/10 h-auto py-4 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-none bg-rose-600 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-rose-700 px-8 h-auto py-4"
            >{deleting ? t("action_purging") : t("action_confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
          <CornerMarks color="rose" />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
