import { useState } from "react";
import { Link } from "wouter";
import {
  useListTrainingRecommendations,
  useListEmployees,
  useListSkills,
} from "@hrm-development/api-client-react";
import type {
  TrainingRecommendation,
  ListTrainingRecommendationsStatus,
} from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink, Shield, Activity, Cpu, HardDrive, Target } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";

const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"] as const;
const TYPES = ["Immediate", "Short-term", "Long-term", "Promotion"] as const;
type TrainingType = (typeof TYPES)[number];
type TrainingStatus = (typeof STATUSES)[number];

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "bg-amber-500/10", text: "text-amber-500" },
    "In Progress": { bg: "bg-sky-500/10", text: "text-sky-500" },
    Completed: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
    Cancelled: { bg: "bg-zinc-500/10", text: "text-zinc-500" },
  };
  const config = map[status] ?? map.Pending;
  return (
    <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black border-current/20 px-2 py-0.5 uppercase tracking-widest ${config.bg} ${config.text}`}>
      {status}
    </Badge>
  );
}

function typeBadge(type: string) {
  const map: Record<string, { bg: string; text: string }> = {
    Immediate: { bg: "bg-rose-500/10", text: "text-rose-500" },
    "Short-term": { bg: "bg-amber-500/10", text: "text-amber-500" },
    "Long-term": { bg: "bg-sky-500/10", text: "text-sky-500" },
    Promotion: { bg: "bg-violet-500/10", text: "text-violet-500" },
  };
  const config = map[type] ?? map.Immediate;
  return (
    <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black border-current/20 px-2 py-0.5 uppercase tracking-widest ${config.bg} ${config.text}`}>
      {type}
    </Badge>
  );
}

type StatusOption = { value: string; apiValue?: ListTrainingRecommendationsStatus };

interface TrainingForm {
  employee_id: string;
  skill_id: string;
  recommendation_type: TrainingType;
  target_date: string;
  notes: string;
}

interface EditForm {
  status: TrainingStatus;
  target_date: string;
  notes: string;
}

const emptyCreateForm = (): TrainingForm => ({
  employee_id: "", skill_id: "", recommendation_type: "Short-term", target_date: "", notes: "",
});

export default function TrainingPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "super_admin";
  const t = useT();

  const STATUS_OPTIONS: StatusOption[] = [
    { value: "all" },
    { value: "Pending", apiValue: "Pending" },
    { value: "In Progress", apiValue: "In Progress" },
    { value: "Completed", apiValue: "Completed" },
    { value: "Cancelled", apiValue: "Cancelled" },
  ];

  const STATUS_LABELS: Record<string, string> = {
    all: "ALL_VECTORS",
    Pending: "STATUS_PENDING",
    "In Progress": "STATUS_IN_PROGRESS",
    Completed: "STATUS_COMPLETED",
    Cancelled: "STATUS_CANCELLED",
  };

  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<TrainingRecommendation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [createForm, setCreateForm] = useState<TrainingForm>(emptyCreateForm());
  const [editForm, setEditForm] = useState<EditForm>({ status: "Pending", target_date: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const apiStatus = STATUS_OPTIONS.find((o) => o.value === statusFilter)?.apiValue;

  const { data: recommendations, isLoading, queryKey } = useListTrainingRecommendations(
    { status: apiStatus },
    { request: { headers } },
  );

  const { data: employeesData } = useListEmployees({ page_size: 200 }, { request: { headers } });
  const { data: skills } = useListSkills({}, { request: { headers } });

  const items: TrainingRecommendation[] = recommendations ?? [];
  const pending = items.filter((r) => r.status === "Pending").length;
  const inProgress = items.filter((r) => r.status === "In Progress").length;
  const completed = items.filter((r) => r.status === "Completed").length;

  const openEdit = (r: TrainingRecommendation) => {
    setEditForm({
      status: r.status as TrainingStatus,
      target_date: r.target_date ? String(r.target_date).split("T")[0] : "",
      notes: r.notes ?? "",
    });
    setEditTarget(r);
  };

  const handleCreate = async () => {
    if (!createForm.employee_id || !createForm.recommendation_type) {
      toast({ title: t("training_required"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/training`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          employee_id: createForm.employee_id,
          skill_id: createForm.skill_id || undefined,
          recommendation_type: createForm.recommendation_type,
          target_date: createForm.target_date || undefined,
          notes: createForm.notes || undefined,
        }),
      });
      if (res.ok) {
        toast({ title: t("training_created") });
        setShowCreate(false);
        setCreateForm(emptyCreateForm());
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const body = await res.json() as { message?: string };
        toast({ title: t("common_failed"), description: body.message ?? "Could not create.", variant: "destructive" });
      }
    } catch {
      toast({ title: t("common_network_error"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/training/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          status: editForm.status,
          target_date: editForm.target_date || null,
          notes: editForm.notes || null,
        }),
      });
      if (res.ok) {
        toast({ title: t("training_updated") });
        setEditTarget(null);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const body = await res.json() as { message?: string };
        toast({ title: t("common_failed"), description: body.message ?? "Could not update.", variant: "destructive" });
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
      const res = await fetch(`/api/training/${deleteTarget.id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast({ title: t("training_deleted") });
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const body = await res.json() as { message?: string };
        toast({ title: t("common_failed"), description: body.message ?? "Could not delete.", variant: "destructive" });
        setDeleteTarget(null);
      }
    } catch {
      toast({ title: t("common_network_error"), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header - Industrial Style */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">TRAINING_VECTOR_PROTOCOL</span>
            </div>
            <h2 className="text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {t("training_title")}
            </h2>
            <p className="text-secondary/40 font-medium border-l-2 border-primary/20 pl-4">{t("training_subtitle")}</p>
          </div>
          
          {isAdmin && (
            <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto hover:bg-primary/90" onClick={() => { setCreateForm(emptyCreateForm()); setShowCreate(true); }}>
              <Plus className="h-4 w-4 mr-2" /> INITIALIZE_NEW_VECTOR
            </Button>
          )}
        </div>
        <CornerMarks />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "VECTORS_PENDING", value: pending, icon: Target, color: "text-amber-500" },
          { label: "VECTORS_ACTIVE", value: inProgress, icon: Cpu, color: "text-sky-500" },
          { label: "VECTORS_FINALIZED", value: completed, icon: Shield, color: "text-emerald-500" },
        ].map((m, i) => (
          <Card key={i} className="bg-[#121212] border border-white/10 rounded-none relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <m.icon className="h-16 w-16" />
             </div>
             <CardContent className="p-8">
                <p className="font-headline font-black text-[9px] tracking-[0.3em] text-secondary/40 uppercase mb-2">{m.label}</p>
                <div className="flex items-baseline gap-2">
                   <p className={`text-4xl font-headline font-black tracking-tighter ${m.color}`}>{m.value}</p>
                   <span className="text-[10px] font-mono text-secondary/20">UNIT_RECORDS</span>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Panel */}
      <Card className="bg-[#121212] border border-white/10 rounded-none relative">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-80 relative">
              <Label className="font-headline font-black text-[9px] text-secondary/40 tracking-widest uppercase mb-2 block">PROTOCOL_FILTER</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                  <SelectValue placeholder={t("filter_by_status")} />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">
                      {STATUS_LABELS[opt.value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="relative border border-white/10 bg-[#0A0A0A] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
             {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-none" />
             ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <HardDrive className="h-12 w-12 text-secondary/10 mx-auto" />
            <p className="font-mono text-xs text-secondary/30 uppercase tracking-[0.3em]">NO_DATA_STREAMS_DETECTED</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase">{t("field_employee")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase">{t("field_skill")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase">{t("field_type")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase">{t("field_status")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase">{t("training_col_target_date")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase">{t("field_notes")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase text-right">{t("common_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((r) => (
                  <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <Link href={`/employees/${r.employee_id}`} className="group/link">
                        <p className="font-headline font-black text-white text-base tracking-tight group-hover/link:text-primary transition-colors uppercase">
                          {r.employee_name ?? "UNIDENTIFIED_OPERATOR"}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] font-mono text-secondary/20 mt-1 uppercase">
                          <ExternalLink className="h-3 w-3" /> NODE_PROFILE_LINK
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-6 font-mono text-[11px] text-primary/60">{r.skill_name ?? "—"}</td>
                    <td className="px-8 py-6">{typeBadge(r.recommendation_type)}</td>
                    <td className="px-8 py-6">{statusBadge(r.status)}</td>
                    <td className="px-8 py-6 font-mono text-[11px] text-secondary/40">
                      {r.target_date ? new Date(r.target_date).toLocaleDateString() : "TBD"}
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-[11px] font-medium text-secondary/40 max-w-xs truncate italic">{r.notes ?? "NO_REMARKS"}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none border border-transparent hover:border-primary/30 hover:bg-primary/5 text-secondary/30 hover:text-primary" onClick={() => openEdit(r)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none border border-transparent hover:border-rose-500/30 hover:bg-rose-500/5 text-secondary/30 hover:text-rose-500" onClick={() => setDeleteTarget({ id: r.id, name: r.employee_name ?? r.id })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Forms & Dialogs */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) setShowCreate(false); }}>
        <DialogContent className="max-w-2xl bg-[#0A0A0A] border-2 border-primary/30 rounded-none p-0 overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <div className="relative z-10">
            <div className="p-8 border-b border-white/10 bg-white/5">
              <h2 className="font-headline font-black text-2xl text-white uppercase tracking-tighter">
                INITIALIZE_TRAINING_VECTOR
              </h2>
              <p className="text-[10px] font-mono text-primary tracking-[0.3em] mt-2 uppercase">PROTOCOL_SEQUENCE_v1.2</p>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_employee")} *</Label>
                <Select value={createForm.employee_id || "none"} onValueChange={(v) => setCreateForm({ ...createForm, employee_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                    <SelectValue placeholder={t("select_none")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                    <SelectItem value="none" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{t("select_none")}</SelectItem>
                    {(employeesData?.data ?? []).map((e) => (
                      <SelectItem key={e.id} value={e.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_type")} *</Label>
                <Select value={createForm.recommendation_type} onValueChange={(v) => setCreateForm({ ...createForm, recommendation_type: v as TrainingType })}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                    {TYPES.map((tp) => <SelectItem key={tp} value={tp} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{tp}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_related_skill")}</Label>
                <Select value={createForm.skill_id || "none"} onValueChange={(v) => setCreateForm({ ...createForm, skill_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                    <SelectValue placeholder={t("optional")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                    <SelectItem value="none" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{t("select_none")}</SelectItem>
                    {(skills ?? []).map((s) => <SelectItem key={s.id} value={s.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("training_col_target_date")}</Label>
                <Input type="date" value={createForm.target_date} onChange={(e) => setCreateForm({ ...createForm, target_date: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white uppercase" />
              </div>
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_notes")}</Label>
                <Input placeholder="REMARKS_AND_SPECIFICATIONS..." value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
            </div>
            
            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end gap-4">
              <Button variant="ghost" className="rounded-none font-headline font-black text-[10px] tracking-widest uppercase text-white hover:bg-white/5" onClick={() => setShowCreate(false)}>{t("common_cancel")}</Button>
              <Button onClick={handleCreate} disabled={saving} className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase px-10 py-6 h-auto">
                {saving ? "SYNCHRONIZING..." : "EXECUTE_INIT"}
              </Button>
            </div>
          </div>
          <CornerMarks />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-md bg-[#0A0A0A] border-2 border-primary/30 rounded-none p-0 overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <div className="relative z-10">
            <div className="p-8 border-b border-white/10 bg-white/5">
              <h2 className="font-headline font-black text-2xl text-white uppercase tracking-tighter">RECONFIGURE_VECTOR</h2>
              <p className="text-[10px] font-mono text-primary tracking-[0.3em] mt-2 uppercase">UPDATE_SEQUENCE</p>
            </div>
            
            <div className="p-8 space-y-6">
              {editTarget && (
                <div className="bg-white/5 p-4 border border-white/10">
                  <p className="font-headline font-black text-[10px] text-primary tracking-widest uppercase mb-1">TARGET_NODE</p>
                  <p className="text-sm font-black text-white uppercase">{editTarget.employee_name}</p>
                  <p className="text-[9px] font-mono text-secondary/40 mt-1 uppercase">{editTarget.skill_name || "GENERAL_DEVELOPMENT"}</p>
                </div>
              )}
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_status")}</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as TrainingStatus })}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                    {STATUSES.map((s) => <SelectItem key={s} value={s} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("training_col_target_date")}</Label>
                <Input type="date" value={editForm.target_date} onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white uppercase" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_notes")}</Label>
                <Input placeholder="REMARKS..." value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
            </div>
            
            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end gap-4">
              <Button variant="ghost" className="rounded-none font-headline font-black text-[10px] tracking-widest uppercase text-white hover:bg-white/5" onClick={() => setEditTarget(null)}>{t("common_cancel")}</Button>
              <Button size="sm" onClick={handleEdit} disabled={saving} className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase px-10 py-6 h-auto">
                {saving ? "SYNCING..." : "APPLY_CONFIG"}
              </Button>
            </div>
          </div>
          <CornerMarks />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-[#0A0A0A] border-2 border-rose-500/30 rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-black text-2xl text-white uppercase tracking-tighter">TERMINATE_VECTOR_SEQUENCE?</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary/40 font-mono text-xs uppercase tracking-widest">{t("training_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-none border-white/10 bg-white/5 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-white/10 h-auto py-4 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-none bg-rose-600 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-rose-700 px-8 h-auto py-4">
              {deleting ? "PURGING..." : "CONFIRM_TERMINATION"}
            </AlertDialogAction>
          </AlertDialogFooter>
          <CornerMarks color="rose" />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
