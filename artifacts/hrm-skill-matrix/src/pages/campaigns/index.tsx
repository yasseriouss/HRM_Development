import { useState } from "react";
import { Link } from "wouter";
import { useListCampaigns, useListDepartments } from "@hrm-development/api-client-react";
import type { Campaign } from "@hrm-development/api-client-react";
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
import { CalendarDays, Users, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";

const CAMPAIGN_TYPES = ["Monthly", "Quarterly", "Bi-Annually", "Custom"];
const CAMPAIGN_STATUSES = ["Draft", "Active", "Completed", "Archived"];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Active: "bg-emerald-600 text-white",
    Completed: "bg-slate-600 text-white",
    Draft: "bg-amber-500 text-white",
    Archived: "bg-zinc-700 text-zinc-300",
  };
  return <Badge className={`whitespace-nowrap ${map[status] ?? ""}`}>{status}</Badge>;
}

interface CampaignForm {
  title: string;
  type: string;
  department_id: string;
  start_date: string;
  end_date: string;
  notes: string;
  status: string;
}

const defaultDates = () => ({
  start_date: new Date().toISOString().split("T")[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
});

const emptyForm = (): CampaignForm => ({
  title: "", type: "Quarterly", department_id: "", notes: "", status: "Draft",
  ...defaultDates(),
});

export default function CampaignsPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "super_admin";
  const t = useT();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: campaigns, isLoading, queryKey } = useListCampaigns(undefined, { request: { headers } });
  const { data: departments } = useListDepartments({ request: { headers } });

  const openCreate = () => { setForm(emptyForm()); setShowCreate(true); };
  const openEdit = (c: Campaign) => {
    setForm({
      title: c.title,
      type: c.type ?? "Quarterly",
      department_id: c.department_id ?? "",
      start_date: String(c.start_date).split("T")[0],
      end_date: String(c.end_date).split("T")[0],
      notes: c.notes ?? "",
      status: c.status,
    });
    setEditTarget(c);
  };

  const handleSave = async () => {
    if (!form.title || !form.type || !form.start_date || !form.end_date) {
      toast({ title: t("campaigns_required"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/campaigns/${editTarget!.id}` : `/api/campaigns`;
      const body = isEdit
        ? { title: form.title, status: form.status, end_date: form.end_date, notes: form.notes || null }
        : { title: form.title, type: form.type, department_id: form.department_id || undefined, start_date: form.start_date, end_date: form.end_date, notes: form.notes || undefined };
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: isEdit ? t("campaigns_updated") : t("campaigns_created") });
        setShowCreate(false);
        setEditTarget(null);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const b = await res.json() as { message?: string };
        toast({ title: t("common_failed"), description: b.message ?? "Could not save.", variant: "destructive" });
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
      const res = await fetch(`/api/campaigns/${deleteTarget.id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast({ title: t("campaigns_deleted") });
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const b = await res.json() as { message?: string };
        toast({ title: t("campaigns_cannot_delete"), description: b.message ?? "Failed.", variant: "destructive" });
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
          <h2 className="text-3xl font-bold tracking-tight">{t("campaigns_title")}</h2>
          <p className="text-muted-foreground">{t("campaigns_subtitle")}</p>
        </div>
        {isAdmin && (
          <Button size="sm" className="bg-primary text-primary-foreground gap-1 shrink-0" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> {t("campaigns_new")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("campaigns_col_title"), t("field_type"), t("field_department"), t("campaigns_col_dates"), t("campaigns_col_progress"), t("field_status"), ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !campaigns?.length ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("campaigns_no_data")}{isAdmin ? t("campaigns_no_data_admin") : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">{t("campaigns_col_title")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_type")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_department")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("campaigns_col_dates")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("campaigns_col_progress")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_status")}</th>
                <th className="px-4 py-3 text-end font-medium whitespace-nowrap">{t("common_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {(campaigns as Campaign[]).map((c) => {
                const evaluated = c.evaluated_count;
                const total = c.total_employees;
                const progress = total > 0 ? Math.round((evaluated / total) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/campaigns/${c.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                        {c.title}
                        <ExternalLink className="h-3 w-3 opacity-40" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.type}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {c.department_id ? (c as Campaign & { department?: { name: string } | null }).department?.name ?? "—" : t("all")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        {new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {total > 0 ? (
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            <Users className="h-3 w-3 inline me-0.5" />{evaluated}/{total}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-end whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(c)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget({ id: c.id, title: c.title })}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? t("campaigns_edit_title") : t("campaigns_create_title")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">{t("campaigns_col_title")} *</Label>
              <Input placeholder={t("campaigns_title_placeholder")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_type")} *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>{CAMPAIGN_TYPES.map((tp) => <SelectItem key={tp} value={tp}>{tp}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {editTarget ? (
              <div className="space-y-1.5">
                <Label className="text-xs">{t("field_status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>{CAMPAIGN_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs">{t("field_department")}</Label>
                <Select value={form.department_id || "all"} onValueChange={(v) => setForm({ ...form, department_id: v === "all" ? "" : v })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder={t("campaigns_all_departments")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("campaigns_all_departments")}</SelectItem>
                    {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_start_date")} *</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} disabled={!!editTarget} className="bg-background border-border disabled:opacity-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_end_date")} *</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">{t("field_notes")}</Label>
              <Input placeholder={t("campaigns_notes_placeholder")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-background border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? t("common_saving") : editTarget ? t("common_save_changes") : t("common_create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("campaigns_delete_confirm", { name: deleteTarget?.title ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("campaigns_delete_desc")}</AlertDialogDescription>
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
