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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";

const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"] as const;
const TYPES = ["Immediate", "Short-term", "Long-term", "Promotion"] as const;
type TrainingType = (typeof TYPES)[number];
type TrainingStatus = (typeof STATUSES)[number];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Pending: "bg-amber-500 text-white",
    "In Progress": "bg-sky-600 text-white",
    Completed: "bg-emerald-600 text-white",
    Cancelled: "bg-zinc-600 text-zinc-300",
  };
  return <Badge className={`text-xs whitespace-nowrap ${map[status] ?? ""}`}>{status}</Badge>;
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    Immediate: "bg-rose-700 text-white",
    "Short-term": "bg-amber-600 text-white",
    "Long-term": "bg-sky-700 text-white",
    Promotion: "bg-violet-700 text-white",
  };
  return <Badge className={`text-xs whitespace-nowrap ${map[type] ?? ""}`}>{type}</Badge>;
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
    all: t("training_all_statuses"),
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("training_title")}</h2>
          <p className="text-muted-foreground">{t("training_subtitle")}</p>
        </div>
        {isAdmin && (
          <Button size="sm" className="bg-primary text-primary-foreground gap-1 shrink-0" onClick={() => { setCreateForm(emptyCreateForm()); setShowCreate(true); }}>
            <Plus className="h-3.5 w-3.5" /> {t("training_new")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("training_pending")}</p>
            <p className="text-2xl font-bold text-amber-400">{pending}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("training_in_progress")}</p>
            <p className="text-2xl font-bold text-sky-400">{inProgress}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("training_completed")}</p>
            <p className="text-2xl font-bold text-emerald-400">{completed}</p>
          </CardContent>
        </Card>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="max-w-[220px] bg-card border-border">
          <SelectValue placeholder={t("filter_by_status")} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{STATUS_LABELS[opt.value]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("field_employee"), t("field_skill"), t("field_type"), t("field_status"), t("training_col_target_date"), t("field_notes"), ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("training_no_data")}{isAdmin ? t("training_no_data_admin") : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_employee")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_skill")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_type")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_status")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("training_col_target_date")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("field_notes")}</th>
                <th className="px-4 py-3 text-end font-medium whitespace-nowrap">{t("common_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    <Link href={`/employees/${r.employee_id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                      {r.employee_name ?? "—"}
                      <ExternalLink className="h-3 w-3 opacity-40" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.skill_name ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{typeBadge(r.recommendation_type)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {r.target_date ? new Date(r.target_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.notes ?? "—"}</td>
                  <td className="px-4 py-3 text-end whitespace-nowrap">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(r)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget({ id: r.id, name: r.employee_name ?? r.id })}>
                          <Trash2 className="h-3.5 w-3.5" />
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

      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) setShowCreate(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t("training_create_title")}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">{t("field_employee")} *</Label>
              <Select value={createForm.employee_id || "none"} onValueChange={(v) => setCreateForm({ ...createForm, employee_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder={t("select_none")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("select_none")}</SelectItem>
                  {(employeesData?.data ?? []).map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_type")} *</Label>
              <Select value={createForm.recommendation_type} onValueChange={(v) => setCreateForm({ ...createForm, recommendation_type: v as TrainingType })}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_related_skill")}</Label>
              <Select value={createForm.skill_id || "none"} onValueChange={(v) => setCreateForm({ ...createForm, skill_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder={t("optional")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("select_none")}</SelectItem>
                  {(skills ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("training_col_target_date")}</Label>
              <Input type="date" value={createForm.target_date} onChange={(e) => setCreateForm({ ...createForm, target_date: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">{t("field_notes")}</Label>
              <Input placeholder={t("training_notes_placeholder")} value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} className="bg-background border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>{t("common_cancel")}</Button>
            <Button size="sm" onClick={handleCreate} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? t("common_saving") : t("common_create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("training_edit_title")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {editTarget && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{editTarget.employee_name}</span>
                {editTarget.skill_name ? ` · ${editTarget.skill_name}` : ""}
              </p>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_status")}</Label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as TrainingStatus })}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("training_col_target_date")}</Label>
              <Input type="date" value={editForm.target_date} onChange={(e) => setEditForm({ ...editForm, target_date: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_notes")}</Label>
              <Input placeholder={t("training_notes_placeholder")} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="bg-background border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setEditTarget(null)}>{t("common_cancel")}</Button>
            <Button size="sm" onClick={handleEdit} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? t("common_saving") : t("common_save_changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("training_delete_confirm", { name: deleteTarget?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("training_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? t("common_deleting") : t("common_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
