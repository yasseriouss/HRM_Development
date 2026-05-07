import { useState } from "react";
import { Link } from "wouter";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, ExternalLink, ChevronRight, CheckCircle2, Clock, Circle, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-amber-500 text-white",
  "In Progress": "bg-blue-600 text-white",
  "Awaiting Approval": "bg-purple-600 text-white",
  Finalized: "bg-emerald-600 text-white",
  Cancelled: "bg-zinc-700 text-zinc-300",
};

function statusBadge(status: string) {
  return <Badge className={`whitespace-nowrap ${STATUS_COLORS[status] ?? "bg-muted"}`}>{status}</Badge>;
}

function stepIcon(status: string) {
  if (status === "approved") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
  if (status === "in_progress" || status === "submitted") return <Clock className="h-3.5 w-3.5 text-blue-400" />;
  return <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
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
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await fetch("/api/workflows", { headers });
      if (!res.ok) throw new Error("Failed to load workflows");
      return res.json() as Promise<WorkflowSummary[]>;
    },
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ["departments-list"],
    queryFn: async () => {
      const res = await fetch("/api/departments", { headers });
      if (!res.ok) return [];
      return res.json() as Promise<Department[]>;
    },
  });

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["campaigns-list"],
    queryFn: async () => {
      const res = await fetch("/api/campaigns", { headers });
      if (!res.ok) return [];
      return res.json() as Promise<Campaign[]>;
    },
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["employees-list-wf"],
    queryFn: async () => {
      const res = await fetch("/api/employees?limit=500", { headers });
      if (!res.ok) return [];
      const data = await res.json() as Employee[] | { data: Employee[] };
      return Array.isArray(data) ? data : (data.data ?? []);
    },
  });

  // Fetch system users (who can log in) — these are stored in the users table.
  // We use the /api/auth/users endpoint for listing user accounts.
  const { data: systemUsers } = useQuery<SystemUser[]>({
    queryKey: ["system-users-list"],
    queryFn: async () => {
      const res = await fetch("/api/auth/users", { headers });
      if (!res.ok) {
        // Fallback: empty list if endpoint unavailable
        return [] as SystemUser[];
      }
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
      toast({ title: "Title and department are required", variant: "destructive" });
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
          campaign_id: form.campaign_id || null,
          notes: form.notes || null,
          assignments: tree,
        }),
      });
      if (res.ok) {
        toast({ title: "Workflow created successfully" });
        setShowCreate(false);
        await queryClient.invalidateQueries({ queryKey: ["workflows"] });
      } else {
        const b = await res.json() as { message?: string };
        toast({ title: "Failed to create workflow", description: b.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
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
        toast({ title: "Workflow deleted" });
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey: ["workflows"] });
      } else {
        const b = await res.json() as { message?: string };
        toast({ title: "Cannot delete", description: b.message, variant: "destructive" });
        setDeleteTarget(null);
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evaluation Workflows</h2>
          <p className="text-muted-foreground">Manage hierarchical evaluation approval chains.</p>
        </div>
        {isManager && (
          <Button size="sm" className="bg-primary text-primary-foreground gap-1 shrink-0" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Create Workflow
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !workflows?.length ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            No workflows found.{isManager ? " Create your first evaluation workflow above." : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => {
            const progress = wf.total_steps > 0 ? Math.round((wf.completed_steps / wf.total_steps) * 100) : 0;
            return (
              <Card key={wf.id} className="border-border hover:border-primary/40 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm leading-tight truncate">{wf.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{wf.department?.name ?? "Unknown Dept"}</p>
                    </div>
                    {statusBadge(wf.status)}
                  </div>

                  {wf.campaign && (
                    <p className="text-xs text-muted-foreground">Campaign: {wf.campaign.title}</p>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{wf.completed_steps}/{wf.total_steps} steps</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(wf.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      {isManager && wf.status !== "Finalized" && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget({ id: wf.id, title: wf.title })}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Link href={`/workflows/${wf.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          View <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) setShowCreate(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Evaluation Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Workflow Title *</Label>
                <Input
                  placeholder="e.g. Q2 2026 Production Evaluation"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Department *</Label>
                <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Campaign (optional)</Label>
                <Select
                  value={form.campaign_id || "_none"}
                  onValueChange={(v) => setForm({ ...form, campaign_id: v === "_none" ? "" : v })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="— None —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— None —</SelectItem>
                    {campaigns?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Input
                  placeholder="Optional notes…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Hierarchy Builder */}
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm">Assign Hierarchy</h4>
              <p className="text-xs text-muted-foreground -mt-2">
                Select system users (those with login accounts) for each role in the approval chain.
              </p>

              {/* Manager */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Production Manager</Label>
                <Select value={form.manager_id} onValueChange={(v) => setForm({ ...form, manager_id: v })}>
                  <SelectTrigger className="bg-background border-border h-8 text-xs">
                    <SelectValue placeholder="Select manager…" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.manager_id && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Manager: {users.find((u) => u.id === form.manager_id)?.full_name ?? form.manager_id}
                  </div>
                )}
              </div>

              {/* Engineers */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Engineers</Label>
                <Select onValueChange={addEngineer} value="">
                  <SelectTrigger className="bg-background border-border h-8 text-xs">
                    <SelectValue placeholder="Add engineer…" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => u.id !== form.manager_id && !engineers.find((e) => e.userId === u.id))
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.email}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {engineers.map((eng) => (
                  <div key={eng.userId} className="border border-border/50 rounded-md p-3 space-y-2 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <ChevronRight className="h-3 w-3 text-blue-400" />
                        <span className="text-blue-400">Engineer:</span> {eng.fullName}
                      </div>
                      <button
                        onClick={() => removeEngineer(eng.userId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Supervisors under engineer */}
                    <div className="pl-4 space-y-1">
                      <Label className="text-xs text-muted-foreground">Supervisors under {eng.fullName}</Label>
                      <Select onValueChange={(v) => addSupervisor(eng.userId, v)} value="">
                        <SelectTrigger className="bg-background border-border h-7 text-xs">
                          <SelectValue placeholder="Add supervisor…" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter(
                              (u) =>
                                u.id !== form.manager_id &&
                                u.id !== eng.userId &&
                                !eng.supervisors.find((s) => s.userId === u.id),
                            )
                            .map((u) => (
                              <SelectItem key={u.id} value={u.id}>{u.full_name ?? u.email}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      {eng.supervisors.map((sup) => (
                        <div key={sup.userId} className="border-l border-border pl-2 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground py-0.5">
                            <span>
                              <ChevronRight className="h-3 w-3 inline me-0.5 text-amber-400" />
                              <span className="text-amber-400">Supervisor:</span> {sup.fullName}
                            </span>
                            <button
                              onClick={() => removeSupervisor(eng.userId, sup.userId)}
                              className="text-muted-foreground hover:text-destructive ml-2"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Workers (Technicians/Helpers) under this supervisor */}
                          <div className="pl-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <Select
                                onValueChange={(v) => {
                                  const [role, empId] = v.split(":");
                                  addWorker(eng.userId, sup.userId, empId, role as "technician" | "helper");
                                }}
                                value=""
                              >
                                <SelectTrigger className="bg-background border-border h-6 text-xs flex-1">
                                  <SelectValue placeholder="Add technician/helper…" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_tech_hdr" disabled className="text-xs font-semibold text-muted-foreground">— Technicians —</SelectItem>
                                  {(employees ?? [])
                                    .filter((e) => !sup.workers.find((w) => w.employeeId === e.id))
                                    .map((e) => (
                                      <SelectItem key={`technician:${e.id}`} value={`technician:${e.id}`} className="text-xs">
                                        {e.full_name} ({e.employee_code}) — Technician
                                      </SelectItem>
                                    ))}
                                  <SelectItem value="_help_hdr" disabled className="text-xs font-semibold text-muted-foreground">— Helpers —</SelectItem>
                                  {(employees ?? [])
                                    .filter((e) => !sup.workers.find((w) => w.employeeId === e.id))
                                    .map((e) => (
                                      <SelectItem key={`helper:${e.id}`} value={`helper:${e.id}`} className="text-xs">
                                        {e.full_name} ({e.employee_code}) — Helper
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {sup.workers.map((w) => (
                              <div key={w.employeeId} className="flex items-center justify-between text-xs text-muted-foreground border-l border-border/50 pl-2 py-0.5">
                                <span>
                                  <ChevronRight className="h-2.5 w-2.5 inline me-0.5 text-muted-foreground" />
                                  <span className="capitalize text-muted-foreground/80">{w.role}:</span> {w.fullName}
                                </span>
                                <button
                                  onClick={() => removeWorker(eng.userId, sup.userId, w.employeeId)}
                                  className="text-muted-foreground hover:text-destructive ml-2"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={saving}
              className="bg-primary text-primary-foreground"
            >
              {saving ? "Creating…" : "Create Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workflow and all its data. Finalized workflows cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
