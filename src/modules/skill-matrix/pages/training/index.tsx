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
  Employee,
  Skill,
} from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { motion } from "framer-motion";
import { useFactory } from "@shared/contexts/FactoryContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink, Shield, Activity, Cpu, HardDrive, Target } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";

const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"] as const;
const TYPES = ["Immediate", "Short-term", "Long-term", "Promotion"] as const;
type TrainingType = (typeof TYPES)[number];
type TrainingStatus = (typeof STATUSES)[number];

// CornerMarks removed - legacy industrial element


function statusBadge(status: string, t: (k: any) => string) {
  const map: Record<string, { bg: string; text: string; key: string }>= {
    Pending: { bg: "bg-amber-100 text-amber-700 border-amber-200", text: "", key: "training_pending" },
    "In Progress": { bg: "bg-sky-100 text-sky-700 border-sky-200", text: "", key: "training_in_progress" },
    Completed: { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", text: "", key: "training_completed" },
    Cancelled: { bg: "bg-zinc-100 text-zinc-700 border-zinc-200", text: "", key: "training_cancelled" },
  };
  const config = map[status] ?? map.Pending;
  return (
    <Badge variant="outline" className={`rounded-full font-headline text-[10px] font-bold px-3 py-1 uppercase tracking-tight whitespace-nowrap ${config.bg}`}>
      {t(config.key)}
    </Badge>);
}

const TRAINING_TYPE_KEYS: Record<string, string>= {
  Immediate: "training_type_immediate",
  "Short-term": "training_type_short",
  "Long-term": "training_type_long",
  Promotion: "training_type_promotion",
};

function typeBadge(type: string, t: (k: any) => string) {
  const map: Record<string, { bg: string; text: string }> = {
    Immediate: { bg: "bg-rose-100 text-rose-700 border-rose-200", text: "" },
    "Short-term": { bg: "bg-amber-100 text-amber-700 border-amber-200", text: "" },
    "Long-term": { bg: "bg-sky-100 text-sky-700 border-sky-200", text: "" },
    Promotion: { bg: "bg-violet-100 text-violet-700 border-violet-200", text: "" },
  };
  const config = map[type] ?? map.Immediate;
  return (
    <Badge variant="outline" className={`rounded-full font-headline text-[10px] font-bold px-3 py-1 uppercase tracking-tight whitespace-nowrap ${config.bg}`}>{t((TRAINING_TYPE_KEYS[type] ?? "training_type_short") as any)}
    </Badge>);
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
  const { activeFactoryId } = useFactory();
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

  const STATUS_LABELS: Record<string, string>= {
    all: t("all_statuses"),
    Pending: t("training_pending"),
    "In Progress": t("training_in_progress"),
    Completed: t("training_completed"),
    Cancelled: t("training_cancelled"),
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
    { status: apiStatus, factory_id: activeFactoryId ?? undefined },
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
    <div className="space-y-8 pb-20 font-sans selection:bg-primary/30">
      {/* Header - Editorial Style */}
      <div className="relative p-12 bg-surface border border-muted/20 rounded-3xl overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span className="font-headline font-bold tracking-tight text-sm text-primary uppercase">{t("training_protocol_label")}</span>
            </div>
            <h2 className="text-5xl font-headline font-extrabold tracking-tight text-foreground leading-none">{t("training_title")}
            </h2>
            <p className="text-muted-foreground font-medium border-s-2 border-primary/20 ps-6 max-w-2xl">{t("training_subtitle")}</p>
          </div>
          
          {isAdmin && (
            <Button className="rounded-2xl bg-primary text-primary-foreground font-headline font-bold text-sm tracking-tight py-7 px-10 h-auto hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" onClick={() => { setCreateForm(emptyCreateForm()); setShowCreate(true); }}>
              <Plus className="h-5 w-5 me-2" />{t("training_new")}
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[
          { label: t("training_pending"), value: pending, icon: Target, color: "text-amber-600", bg: "bg-amber-50" },
          { label: t("training_in_progress"), value: inProgress, icon: Cpu, color: "text-sky-600", bg: "bg-sky-50" },
          { label: t("training_completed"), value: completed, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((m, i) => (
          <Card key={i} className="bg-surface border border-muted/20 rounded-3xl relative group overflow-hidden hover:border-primary/30 transition-all duration-300">
             <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity ${m.color}`}>
                <m.icon className="h-16 w-16" />
             </div>
             <CardContent className="p-8">
                <p className="font-headline font-bold text-xs tracking-tight text-muted-foreground uppercase mb-3">{m.label}</p>
                <div className="flex items-baseline gap-2">
                   <p className={`text-4xl font-headline font-extrabold tracking-tight ${m.color}`}>{m.value}</p>
                   <span className="text-[10px] font-medium text-muted-foreground/40 uppercase">{t("label_total_nodes")}</span>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Panel */}
      <Card className="bg-surface border border-muted/20 rounded-3xl relative">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-80 relative">
              <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase mb-3 block">{t("filter_by_status_label")}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 bg-background border-muted/20 rounded-xl font-headline font-bold text-sm tracking-tight text-foreground">
                  <SelectValue placeholder={t("filter_by_status")} />
                </SelectTrigger>
                <SelectContent className="bg-surface border-muted/20 rounded-xl">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="font-headline font-medium text-sm focus:bg-primary/10">
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
      <div className="relative border border-muted/20 bg-surface rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4">{Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted/5 rounded-xl" />
             ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-24 text-center space-y-6">
            <div className="p-6 bg-background rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <HardDrive className="h-10 w-10 text-muted/30" />
            </div>
            <p className="font-headline font-bold text-sm text-muted-foreground uppercase tracking-widest">{t("label_no_records")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-sm">
              <thead>
                <tr className="bg-muted/5 border-b border-muted/10">
                  <th className="px-8 py-6 font-headline font-bold text-xs tracking-tight text-muted-foreground uppercase whitespace-nowrap">{t("field_employee")}</th>
                  <th className="px-8 py-6 font-headline font-bold text-xs tracking-tight text-muted-foreground uppercase whitespace-nowrap">{t("field_skill")}</th>
                  <th className="px-8 py-6 font-headline font-bold text-xs tracking-tight text-muted-foreground uppercase whitespace-nowrap">{t("field_type")}</th>
                  <th className="px-8 py-6 font-headline font-bold text-xs tracking-tight text-muted-foreground uppercase whitespace-nowrap">{t("field_status")}</th>
                  <th className="px-8 py-6 font-headline font-bold text-xs tracking-tight text-muted-foreground uppercase whitespace-nowrap">{t("training_col_target_date")}</th>
                  <th className="px-8 py-6 font-headline font-bold text-xs tracking-tight text-muted-foreground uppercase whitespace-nowrap">{t("field_notes")}</th>
                  <th className="px-8 py-6 font-headline font-bold text-xs tracking-tight text-muted-foreground uppercase whitespace-nowrap text-end">{t("common_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/10">
                {items.map((r) => (
                  <tr key={r.id} className="group hover:bg-muted/5 transition-colors">
                    <td className="px-8 py-7 whitespace-nowrap">
                      <Link href={`/employees/${r.employee_id}`} className="group/link">
                        <p className="font-headline font-bold text-foreground text-base tracking-tight group-hover/link:text-primary transition-colors whitespace-nowrap">{r.employee_name ?? "—"}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase whitespace-nowrap">
                          <ExternalLink className="h-3 w-3" />{t("label_node_profile")}
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-7 font-headline font-bold text-xs text-primary/70 whitespace-nowrap">{r.skill_name ?? "—"}</td>
                    <td className="px-8 py-7 whitespace-nowrap">{typeBadge(r.recommendation_type, t)}</td>
                    <td className="px-8 py-7 whitespace-nowrap">{statusBadge(r.status, t)}</td>
                    <td className="px-8 py-7 font-headline font-bold text-xs text-muted-foreground whitespace-nowrap">{r.target_date ? new Date(r.target_date).toLocaleDateString() : t("common_no_data")}
                    </td>
                    <td className="px-8 py-7">
                       <p className="text-xs font-medium text-muted-foreground max-w-xs truncate italic">{r.notes ?? "—"}</p>
                    </td>
                    <td className="px-8 py-7 text-end">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/10 text-muted-foreground hover:text-primary" onClick={() => openEdit(r)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl border border-transparent hover:border-rose-500/30 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500" onClick={() =>setDeleteTarget({ id: r.id, name: r.employee_name ?? r.id })}>
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
        <DialogContent className="max-w-2xl bg-surface border border-muted/20 rounded-3xl p-0 overflow-hidden text-foreground">
          <div className="relative z-10">
            <div className="p-8 border-b border-muted/10 bg-muted/5">
              <h2 className="font-headline font-extrabold text-3xl text-foreground tracking-tight">{t("training_create_title")}
              </h2>
              <p className="text-xs font-bold text-primary tracking-widest mt-2 uppercase">{t("label_protocol_sequence")}</p>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase">{t("field_employee")} *</Label>
                <Select value={createForm.employee_id || "none"} onValueChange={(v) =>setCreateForm({ ...createForm, employee_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-14 bg-background border-muted/20 rounded-2xl font-headline font-bold text-sm text-foreground">
                    <SelectValue placeholder={t("select_none")} />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-muted/20 rounded-2xl">
                    <SelectItem value="none" className="font-headline font-bold text-xs focus:bg-primary/10">{t("select_none")}</SelectItem>
                    {(employeesData?.data ?? []).map((e: Employee) => (
                      <SelectItem key={e.id} value={e.id} className="font-headline font-bold text-xs focus:bg-primary/10">{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase">{t("field_type")} *</Label>
                <Select value={createForm.recommendation_type} onValueChange={(v) =>setCreateForm({ ...createForm, recommendation_type: v as TrainingType })}>
                  <SelectTrigger className="h-14 bg-background border-muted/20 rounded-2xl font-headline font-bold text-sm text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-muted/20 rounded-2xl">
                    {TYPES.map((tp) => <SelectItem key={tp} value={tp} className="font-headline font-bold text-xs focus:bg-primary/10">{tp}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase">{t("field_related_skill")}</Label>
                <Select value={createForm.skill_id || "none"} onValueChange={(v) =>setCreateForm({ ...createForm, skill_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-14 bg-background border-muted/20 rounded-2xl font-headline font-bold text-sm text-foreground">
                    <SelectValue placeholder={t("optional")} />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-muted/20 rounded-2xl">
                    <SelectItem value="none" className="font-headline font-bold text-xs focus:bg-primary/10">{t("select_none")}</SelectItem>
                    {(skills ?? []).map((s: Skill) => <SelectItem key={s.id} value={s.id} className="font-headline font-bold text-xs focus:bg-primary/10">{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase">{t("training_col_target_date")}</Label>
                <Input type="date" value={createForm.target_date} onChange={(e) =>setCreateForm({ ...createForm, target_date: e.target.value })} className="h-14 bg-background border-muted/20 rounded-2xl font-headline font-bold text-sm text-foreground" />
              </div>
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase">{t("field_notes")}</Label>
                <Input placeholder={t("label_remarks_spec")} value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} className="h-14 bg-background border-muted/20 rounded-2xl font-headline font-bold text-sm text-foreground" />
              </div>
            </div>
            
            <div className="p-8 border-t border-muted/10 bg-muted/5 flex justify-end gap-4">
              <Button variant="ghost" className="rounded-2xl font-headline font-bold text-sm text-muted-foreground hover:bg-muted/10" onClick={() =>setShowCreate(false)}>{t("common_cancel")}</Button>
              <Button onClick={handleCreate} disabled={saving} className="rounded-2xl bg-primary text-primary-foreground font-headline font-bold text-sm px-10 py-7 h-auto shadow-lg shadow-primary/20">{saving ? t("action_synchronizing") : t("training_new")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-md bg-surface border border-muted/20 rounded-3xl p-0 overflow-hidden text-foreground">
          <div className="relative z-10">
            <div className="p-8 border-b border-muted/10 bg-muted/5">
              <h2 className="font-headline font-extrabold text-2xl text-foreground tracking-tight">{t("action_reconfigure")}</h2>
              <p className="text-xs font-bold text-primary tracking-widest mt-2 uppercase">{t("label_update_sequence")}</p>
            </div>
            
            <div className="p-8 space-y-6">
              {editTarget && (
                <div className="bg-muted/5 p-5 border border-muted/20 rounded-2xl">
                  <p className="font-headline font-bold text-[10px] text-primary tracking-widest uppercase mb-2">{t("label_target_node")}</p>
                  <p className="text-lg font-extrabold text-foreground tracking-tight">{editTarget.employee_name}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1">{editTarget.skill_name || t("label_general_development")}</p>
                </div>
              )}
              <div className="space-y-3">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase">{t("field_status")}</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as TrainingStatus })}>
                  <SelectTrigger className="h-14 bg-background border-muted/20 rounded-2xl font-headline font-bold text-sm text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-muted/20 rounded-2xl">
                    {STATUSES.map((s) => <SelectItem key={s} value={s} className="font-headline font-bold text-xs focus:bg-primary/10">{STATUS_LABELS[s] ?? s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase">{t("training_col_target_date")}</Label>
                <Input type="date" value={editForm.target_date} onChange={(e) =>setEditForm({ ...editForm, target_date: e.target.value })} className="h-14 bg-background border-muted/20 rounded-2xl font-headline font-bold text-sm text-foreground" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-bold text-xs text-muted-foreground tracking-tight uppercase">{t("field_notes")}</Label>
                <Input placeholder="REMARKS..." value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="h-14 bg-background border-muted/20 rounded-2xl font-headline font-bold text-sm text-foreground" />
              </div>
            </div>
            
            <div className="p-8 border-t border-muted/10 bg-muted/5 flex justify-end gap-4">
              <Button variant="ghost" className="rounded-2xl font-headline font-bold text-sm text-muted-foreground hover:bg-muted/10" onClick={() =>setEditTarget(null)}>{t("common_cancel")}</Button>
              <Button size="sm" onClick={handleEdit} disabled={saving} className="rounded-2xl bg-primary text-primary-foreground font-headline font-bold text-sm px-10 py-7 h-auto shadow-lg shadow-primary/20">{saving ? t("action_synchronizing") : t("action_apply_config")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-surface border border-rose-500/30 rounded-3xl overflow-hidden shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-extrabold text-3xl text-foreground tracking-tight">{t("action_confirm_delete")} — {deleteTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium text-sm">{t("training_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-3">
            <AlertDialogCancel className="rounded-2xl border-muted/20 bg-background text-foreground font-headline font-bold text-sm tracking-tight hover:bg-muted/10 h-auto py-4 px-8 transition-colors">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-2xl bg-rose-600 text-white font-headline font-bold text-sm tracking-tight hover:bg-rose-700 px-10 h-auto py-4 shadow-lg shadow-rose-600/20 transition-all">{deleting ? t("action_purging") : t("action_confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
