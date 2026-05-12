import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListCampaigns, useListDepartments } from "@hrm-development/api-client-react";
import type { Campaign } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { CalendarDays, Plus, Pencil, Trash2, Activity, Target, Search, Filter } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { useFactory } from "@shared/contexts/FactoryContext";

const CAMPAIGN_TYPES = ["Monthly", "Quarterly", "Bi-Annually", "Custom"];
const CAMPAIGN_STATUSES = ["Draft", "Active", "Completed", "Archived"];

function statusBadge(status: string, t: (k: any) => string) {
  const map: Record<string, { cls: string; key: string }>= {
    Active: { cls: "border-emerald-500/20 bg-emerald-50 text-emerald-700", key: "status_active" },
    Completed: { cls: "border-blue-500/20 bg-blue-50 text-blue-700", key: "status_completed" },
    Draft: { cls: "border-amber-500/20 bg-amber-50 text-amber-700", key: "status_draft" },
    Archived: { cls: "border-primary/10 bg-muted/30 text-muted-foreground", key: "status_archived" },
  };
  const cfg = map[status] ?? map.Draft;
  return (
    <Badge variant="outline" className={`rounded-full font-bold text-[9px] tracking-wider px-2.5 py-0.5 uppercase shadow-sm ${cfg.cls}`}>
      {t(cfg.key as any)}
    </Badge>);
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
  const { activeFactoryId } = useFactory();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: campaigns, isLoading, queryKey } = useListCampaigns(
    { factory_id: activeFactoryId ?? undefined },
    { request: { headers } },
  );
  const { data: departments } = useListDepartments(
    { factory_id: activeFactoryId ?? undefined },
    { request: { headers } },
  );

  // Client-side search + status filter
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    let list = campaigns as Campaign[];
    const q = searchQuery.toLowerCase().trim();
    if (q) list = list.filter((c) => c.title.toLowerCase().includes(q) || (c.notes ?? "").toLowerCase().includes(q));
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    return list;
  }, [campaigns, searchQuery, statusFilter]);

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
        : {
          title: form.title,
          type: form.type,
          department_id: form.department_id || undefined,
          factory_id: activeFactoryId ?? undefined,
          start_date: form.start_date,
          end_date: form.end_date,
          notes: form.notes || undefined,
        };
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
    <div className="space-y-10 pb-20 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header - Editorial Style */}
      <div className="relative pt-12 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/20" />
                <span className="font-sans font-bold tracking-widest text-[10px] text-primary uppercase">{t("label_mission_control")}</span>
              </div>
              <h1 className="text-6xl font-headline font-bold tracking-tight text-foreground leading-none">
                {t("campaigns_title")}
              </h1>
              <p className="text-muted-foreground font-medium text-lg max-w-2xl">{t("campaigns_subtitle")}</p>
            </div>
            
            {isAdmin && (
              <Button className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={openCreate}>
                <Plus className="h-4 w-4 me-2" /> {t("action_init_campaign")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search + Status Filter Control Panel */}
      {/* Control Panel */}
      <div className="max-w-7xl mx-auto px-4">
        <Card className="bg-surface border-primary/10 rounded-2xl shadow-sm overflow-hidden border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                <Input
                  placeholder={t("search_campaigns")}
                  className="ps-10 h-12 bg-background border-primary/5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 bg-background border-primary/5 rounded-xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                    <SelectValue placeholder={t("filter_by_status_label")} />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-primary/10 rounded-xl">
                    <SelectItem value="all" className="font-bold text-[10px] tracking-wide uppercase">{t("all_statuses")}</SelectItem>
                    {CAMPAIGN_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="font-bold text-[10px] tracking-wide uppercase">
                        {t(`status_${s.toLowerCase()}` as any)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  className="rounded-full font-bold text-[11px] tracking-wide uppercase text-muted-foreground hover:bg-primary/5 h-12 px-6"
                  onClick={() =>{ setSearchQuery(""); setStatusFilter("all"); }}
                >
                  {t("filter_reset")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-surface border-primary/10 rounded-2xl h-64 shadow-sm overflow-hidden">
                <CardContent className="p-8 space-y-4">
                  <Skeleton className="h-6 w-2/3 bg-muted/50 rounded-lg" />
                  <Skeleton className="h-4 w-1/2 bg-muted/50 rounded-lg" />
                  <Skeleton className="h-2 w-full bg-muted/50 rounded-lg mt-8" />
                  <Skeleton className="h-10 w-full bg-muted/50 rounded-xl mt-auto" />
                </CardContent>
              </Card>
            ))
          ) : !filteredCampaigns.length ? (
            <div className="col-span-full p-20 text-center border border-primary/10 bg-surface rounded-2xl shadow-sm space-y-4">
              <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <p className="font-sans text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-50">{t("label_no_active_missions")}</p>
            </div>
          ) : (
            filteredCampaigns.map((c) => {
              const evaluated = c.evaluated_count;
              const total = c.total_employees;
              const progress = total > 0 ? Math.round((evaluated / total) * 100) : 0;
              return (
                <Card key={c.id} className="bg-surface border-primary/10 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-md flex flex-col">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        {c.type} • {c.department_id ? t("status_dept_specific") : t("status_global")}
                      </span>
                      {statusBadge(c.status, t)}
                    </div>
                    <CardTitle className="text-2xl font-headline font-bold text-foreground group-hover:text-primary transition-colors tracking-tight uppercase leading-tight">
                      {c.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-2 flex-1 flex flex-col space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
                    </div>

                    {total > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">{t("label_deployment_progress")}</span>
                          <span className="text-xs font-bold text-foreground">{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-primary/5">
                          <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                          <span>{evaluated} {t("label_evaluated")}</span>
                          <span>{total} {t("label_total_nodes")}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-6 mt-auto border-t border-primary/5 flex justify-between gap-3">
                      <Link href={`/campaigns/${c.id}`} className="flex-1">
                        <Button className="w-full rounded-full bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground font-bold text-[11px] tracking-wide uppercase h-11 transition-all">
                          {t("campaign_enter_scores")}
                        </Button>
                      </Link>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-11 w-11 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" onClick={() => openEdit(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-11 w-11 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors" onClick={() => setDeleteTarget({ id: c.id, title: c.title })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Forms & Dialogs */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-xl bg-surface border-primary/20 rounded-3xl p-0 overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="p-8 border-b border-primary/5 bg-background/50 backdrop-blur-sm">
              <h2 className="font-headline font-bold text-3xl text-foreground tracking-tight uppercase">{editTarget ? t("action_reconfigure") : t("action_init_campaign")}</h2>
              <p className="text-[10px] font-sans font-bold text-primary tracking-widest mt-2 uppercase opacity-50">STRATEGIC EVAL_v2.1</p>
            </div>

            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("campaigns_col_title")} *</Label>
                <Input placeholder="Q2 2026 EVALUATION" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm font-bold text-foreground focus-visible:ring-primary/20" />
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_type")} *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="h-14 bg-background border-primary/5 rounded-xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-primary/10 rounded-xl">{CAMPAIGN_TYPES.map((tp) => <SelectItem key={tp} value={tp} className="font-bold text-[10px] tracking-wide uppercase">{tp}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{editTarget ? t("field_status") : t("field_department")}</Label>
                {editTarget ? (
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="h-14 bg-background border-primary/5 rounded-xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-primary/10 rounded-xl">{CAMPAIGN_STATUSES.map((s) => <SelectItem key={s} value={s} className="font-bold text-[10px] tracking-wide uppercase">{t(`status_${s.toLowerCase()}` as any)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={form.department_id || "all"} onValueChange={(v) =>setForm({ ...form, department_id: v === "all" ? "" : v })}>
                    <SelectTrigger className="h-14 bg-background border-primary/5 rounded-xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                      <SelectValue placeholder={t("campaigns_all_departments")} />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-primary/10 rounded-xl">
                      <SelectItem value="all" className="font-bold text-[10px] tracking-wide uppercase">{t("campaigns_all_departments")}</SelectItem>
                      {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-wide uppercase">{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_start_date")} *</Label>
                <Input type="date" value={form.start_date} onChange={(e) =>setForm({ ...form, start_date: e.target.value })} disabled={!!editTarget} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground uppercase disabled:opacity-30" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_end_date")} *</Label>
                <Input type="date" value={form.end_date} onChange={(e) =>setForm({ ...form, end_date: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground uppercase" />
              </div>

              <div className="col-span-2 space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_notes")}</Label>
                <Input placeholder="MISSION OBJECTIVES..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground" />
              </div>
            </div>

            <div className="p-8 border-t border-primary/5 bg-background/50 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-full font-bold text-[11px] tracking-wide uppercase text-muted-foreground hover:bg-primary/5" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase px-10 h-12 shadow-lg shadow-primary/20 transition-all">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_campaign")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-surface border-primary/20 rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-2xl text-foreground tracking-tight uppercase">{t("common_delete")} — {deleteTarget?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans text-sm">{t("campaigns_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-full border-primary/10 bg-background text-foreground font-bold text-[11px] tracking-wide uppercase hover:bg-primary/5 h-12 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-full bg-rose-600 text-white font-bold text-[11px] tracking-wide uppercase hover:bg-rose-700 px-8 h-12 shadow-lg shadow-rose-600/20">{deleting ? t("action_aborting") : t("action_confirm_abort")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
