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

const CAMPAIGN_TYPES = ["Monthly", "Quarterly", "Bi-Annually", "Custom"];
const CAMPAIGN_STATUSES = ["Draft", "Active", "Completed", "Archived"];

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

function statusBadge(status: string, t: (k: any) => string) {
  const map: Record<string, { cls: string; key: string }>= {
    Active: { cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500", key: "status_active" },
    Completed: { cls: "border-blue-500/30 bg-blue-500/10 text-blue-500", key: "status_completed" },
    Draft: { cls: "border-amber-500/30 bg-amber-500/10 text-amber-500", key: "status_draft" },
    Archived: { cls: "border-zinc-700 bg-zinc-900 text-zinc-500", key: "status_archived" },
  };
  const cfg = map[status] ?? map.Draft;
  return (
    <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase ${cfg.cls}`}>
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

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: campaigns, isLoading, queryKey } = useListCampaigns(undefined, { request: { headers } });
  const { data: departments } = useListDepartments({ request: { headers } });

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
    <div className="space-y-8 pb-20 font-sans text-white">
      {/* Header */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">{t("label_mission_control")}</span>
            </div>
            <h2 className="text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">{t("campaigns_title")}
            </h2>
            <p className="text-secondary/40 font-medium border-s-2 border-primary/20 ps-4">{t("campaigns_subtitle")}</p>
          </div>

          {isAdmin && (
            <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-10 h-auto hover:bg-primary/90 shadow-[0_0_20px_rgba(255,255,255,0.05)]" onClick={openCreate}>
              <Plus className="h-4 w-4 me-2" />{t("action_init_campaign")}
            </Button>
          )}
        </div>
        <CornerMarks />
      </div>

      {/* Search + Status Filter Control Panel */}
      <Card className="bg-[#121212] border border-white/10 rounded-none">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/30" />
              <Input
                placeholder={t("search_campaigns")}
                className="ps-12 h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white placeholder:text-secondary/20 focus-visible:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/30" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="ps-12 h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                  <SelectValue placeholder={t("filter_by_status_label")} />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                  <SelectItem value="all" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{t("all_statuses")}</SelectItem>{CAMPAIGN_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{t(`status_${s.toLowerCase()}` as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="ghost"
                className="h-14 px-6 rounded-none border border-white/10 text-secondary/40 hover:text-white font-headline font-black text-[10px] tracking-widest uppercase"
                onClick={() =>{ setSearchQuery(""); setStatusFilter("all"); }}
              >
                {t("filter_reset")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-[#0D0D0D] border-zinc-800 rounded-none h-48">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-2/3 bg-zinc-900 mb-4" />
                <Skeleton className="h-3 w-1/2 bg-zinc-900 mb-2" />
                <Skeleton className="h-3 w-full bg-zinc-900" />
              </CardContent>
            </Card>
          ))
        ) : !filteredCampaigns.length ? (
          <div className="col-span-full p-20 text-center border border-zinc-800 bg-[#0D0D0D]">
            <Target className="h-12 w-12 text-zinc-900 mx-auto mb-4" />
            <p className="font-mono text-xs text-zinc-600 uppercase tracking-[0.3em]">{t("label_no_active_missions")}</p>
          </div>) : (
          filteredCampaigns.map((c) => {
            const evaluated = c.evaluated_count;
            const total = c.total_employees;
            const progress = total > 0 ? Math.round((evaluated / total) * 100) : 0;
            return (
              <Card key={c.id} className="bg-[#0D0D0D] border-zinc-800 rounded-none relative overflow-hidden group hover:border-primary/50 transition-all duration-500 shadow-xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity className="h-12 w-12 text-white" />
                </div>
                <CardHeader className="border-b border-zinc-900 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{c.type} // {c.department_id ? t("status_dept_specific") : t("status_global")}
                    </span>
                    {statusBadge(c.status, t)}
                  </div>
                  <CardTitle className="text-xl font-headline font-black text-white group-hover:text-primary transition-colors tracking-tight uppercase leading-tight">
                    {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-500 uppercase">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-primary/60" />{new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
                    </div>
                  </div>

                  {total > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{t("label_deployment_progress")}</span>
                        <span className="text-xs font-black text-white">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 overflow-hidden">
                        <div
                          className="h-full bg-primary shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-1000 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                        <span>{evaluated} {t("label_evaluated")}</span>
                        <span>{total} {t("label_total_nodes")}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-900 flex justify-between gap-3">
                    <Link href={`/campaigns/${c.id}`} className="flex-1">
                      <Button className="w-full rounded-none bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-headline font-black text-[10px] tracking-widest uppercase h-10">{t("campaign_enter_scores")}
                      </Button>
                    </Link>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none border border-zinc-800 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none border border-zinc-800 hover:bg-rose-500/10 hover:text-rose-500" onClick={() => setDeleteTarget({ id: c.id, title: c.title })}>
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

      {/* Forms & Dialogs */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-xl bg-[#0A0A0A] border-2 border-primary/30 rounded-none p-0 overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <div className="relative z-10">
            <div className="p-8 border-b border-white/10 bg-white/5">
              <h2 className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{editTarget ? t("action_reconfigure") : t("action_init_campaign")}
              </h2>
              <p className="text-[10px] font-mono text-primary tracking-[0.3em] mt-2 uppercase">STRATEGIC EVAL_v2.1</p>
            </div>

            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-black text-[10px] text-zinc-500 tracking-[0.2em] uppercase">{t("campaigns_col_title")} *</Label>
                <Input placeholder="Q2 2026 EVALUATION" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-14 bg-zinc-900 border-zinc-800 rounded-none font-mono text-sm tracking-widest text-white focus-visible:ring-primary/50" />
              </div>

              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-zinc-500 tracking-[0.2em] uppercase">{t("field_type")} *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="h-14 bg-zinc-900 border-zinc-800 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-zinc-800 rounded-none text-white">{CAMPAIGN_TYPES.map((tp) => <SelectItem key={tp} value={tp} className="font-headline font-black text-[9px] tracking-widest uppercase">{tp}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-zinc-500 tracking-[0.2em] uppercase">{editTarget ? t("field_status") : t("field_department")}</Label>
                {editTarget ? (
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="h-14 bg-zinc-900 border-zinc-800 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-zinc-800 rounded-none text-white">{CAMPAIGN_STATUSES.map((s) => <SelectItem key={s} value={s} className="font-headline font-black text-[9px] tracking-widest uppercase">{t(`status_${s.toLowerCase()}` as any)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={form.department_id || "all"} onValueChange={(v) =>setForm({ ...form, department_id: v === "all" ? "" : v })}>
                    <SelectTrigger className="h-14 bg-zinc-900 border-zinc-800 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                      <SelectValue placeholder={t("campaigns_all_departments")} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-zinc-800 rounded-none text-white">
                      <SelectItem value="all" className="font-headline font-black text-[9px] tracking-widest uppercase">{t("campaigns_all_departments")}</SelectItem>
                      {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-headline font-black text-[9px] tracking-widest uppercase">{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-zinc-500 tracking-[0.2em] uppercase">{t("field_start_date")} *</Label>
                <Input type="date" value={form.start_date} onChange={(e) =>setForm({ ...form, start_date: e.target.value })} disabled={!!editTarget} className="h-14 bg-zinc-900 border-zinc-800 rounded-none font-mono text-sm tracking-widest text-white uppercase disabled:opacity-30" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-zinc-500 tracking-[0.2em] uppercase">{t("field_end_date")} *</Label>
                <Input type="date" value={form.end_date} onChange={(e) =>setForm({ ...form, end_date: e.target.value })} className="h-14 bg-zinc-900 border-zinc-800 rounded-none font-mono text-sm tracking-widest text-white uppercase" />
              </div>

              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-black text-[10px] text-zinc-500 tracking-[0.2em] uppercase">{t("field_notes")}</Label>
                <Input placeholder="MISSION OBJECTIVES..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-14 bg-zinc-900 border-zinc-800 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
            </div>

            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end gap-4">
              <Button variant="ghost" className="rounded-none font-headline font-black text-[10px] tracking-widest uppercase text-white hover:bg-white/5" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase px-10 py-6 h-auto">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_campaign")}
              </Button>
            </div>
          </div>
          <CornerMarks />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-[#0A0A0A] border-2 border-rose-500/30 rounded-none text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{t("common_delete")} — {deleteTarget?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{t("campaigns_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-none border-zinc-800 bg-zinc-900 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-zinc-800 h-auto py-4 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-none bg-rose-600 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-rose-700 px-8 h-auto py-4">{deleting ? t("action_aborting") : t("action_confirm_abort")}
            </AlertDialogAction>
          </AlertDialogFooter>
          <CornerMarks color="rose" />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
