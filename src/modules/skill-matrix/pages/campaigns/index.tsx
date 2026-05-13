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
import { CalendarDays, Plus, Pencil, Trash2, Activity, Target, Search, Filter, Rocket, ShieldCheck, ChevronRight, ArrowUpRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { useFactory } from "@shared/contexts/FactoryContext";
import { cn } from "@shared/utils/cn";

const CAMPAIGN_TYPES = ["Monthly", "Quarterly", "Bi-Annually", "Custom"];
const CAMPAIGN_STATUSES = ["Draft", "Active", "Completed", "Archived"];

function statusBadge(status: string, t: (k: any) => string) {
  const map: Record<string, { cls: string; key: string }>= {
    Active: { cls: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50", key: "status_active" },
    Completed: { cls: "bg-zinc-900 text-white border-zinc-900 shadow-zinc-200/50", key: "status_completed" },
    Draft: { cls: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50", key: "status_draft" },
    Archived: { cls: "bg-zinc-50 text-zinc-400 border-zinc-100", key: "status_archived" },
  };
  const cfg = map[status] ?? map.Draft;
  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border shadow-sm", cfg.cls)}>
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
    <div className="max-w-7xl mx-auto space-y-16 py-16 px-8 pb-32">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
               <Rocket className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{t("label_mission_control")}</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none">
            {t("campaigns_title")}
          </h1>
          <p className="text-zinc-500 font-medium text-xl max-w-2xl leading-relaxed">{t("campaigns_subtitle")}</p>
        </div>
        
        {isAdmin && (
          <Button className="rounded-full bg-zinc-900 text-white font-bold text-[11px] tracking-widest uppercase px-10 h-16 shadow-2xl shadow-zinc-200 hover:scale-[1.02] transition-all" onClick={openCreate}>
            <Plus className="h-5 w-5 me-3" /> {t("action_init_campaign")}
          </Button>
        )}
      </div>

      {/* Filter Station */}
      <Card className="bg-white border-zinc-100 rounded-4xl shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
            <Input
              placeholder={t("search_campaigns")}
              className="ps-14 h-16 bg-zinc-50 border-transparent rounded-3xl text-sm font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-zinc-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-72">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-16 bg-white border-zinc-100 rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                <SelectValue placeholder={t("filter_by_status_label")} />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                <SelectItem value="all" className="font-bold text-[10px] tracking-widest uppercase">{t("all_statuses")}</SelectItem>
                {CAMPAIGN_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="font-bold text-[10px] tracking-widest uppercase">
                    {t(`status_${s.toLowerCase()}` as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              className="h-16 px-8 rounded-3xl font-bold text-[10px] tracking-widest uppercase text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
              onClick={() =>{ setSearchQuery(""); setStatusFilter("all"); }}
            >
              {t("filter_reset")}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full bg-zinc-50 rounded-4xl" />
          ))
        ) : !filteredCampaigns.length ? (
          <div className="col-span-full py-40 text-center space-y-8">
            <div className="h-24 w-24 bg-zinc-50 rounded-4xl flex items-center justify-center mx-auto text-zinc-200">
               <Target className="h-12 w-12" />
            </div>
            <p className="text-lg font-bold font-comfortaa text-zinc-300 uppercase tracking-widest">{t("label_no_active_missions")}</p>
          </div>
        ) : (
          filteredCampaigns.map((c) => {
            const evaluated = c.evaluated_count || 0;
            const total = c.total_employees || 0;
            const progress = total > 0 ? Math.round((evaluated / total) * 100) : 0;
            
            return (
              <motion.div
                key={c.id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white border-zinc-100 rounded-4xl shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-zinc-100 transition-all h-full flex flex-col">
                  <CardHeader className="p-10 pb-6 border-b border-zinc-50 bg-zinc-50/20">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <ShieldCheck className="h-4 w-4 text-zinc-900" />
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {c.type} • {c.department_id ? "SPECIFIC" : "GLOBAL"}
                          </span>
                       </div>
                       {statusBadge(c.status, t)}
                    </div>
                    <CardTitle className="text-3xl font-bold text-zinc-900 tracking-tight font-comfortaa leading-none uppercase">
                      {c.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-10 flex-1 flex flex-col space-y-8">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                       <CalendarDays className="h-4 w-4 text-zinc-900" />
                       {new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end px-1">
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{t("label_deployment_progress")}</span>
                          <span className="text-sm font-bold font-comfortaa text-zinc-900">{progress}%</span>
                       </div>
                       <div className="h-4 bg-zinc-50 rounded-full overflow-hidden p-1 border border-zinc-100/50 shadow-inner">
                          <div
                            className="h-full bg-zinc-900 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-zinc-200"
                            style={{ width: `${progress}%` }}
                          />
                       </div>
                       <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                          <span>{evaluated} {t("label_evaluated")}</span>
                          <span>{total} {t("label_total_nodes")}</span>
                       </div>
                    </div>

                    <p className="text-zinc-400 text-sm font-medium line-clamp-2 min-h-10 leading-relaxed italic">
                       {c.notes || "No mission objectives specified."}
                    </p>

                    <div className="pt-8 mt-auto border-t border-zinc-50 flex items-center gap-4">
                       <Link href={`/skill-matrix/campaigns/${c.id}`} className="flex-1">
                          <Button className="w-full rounded-2xl bg-zinc-900 text-white font-bold text-[10px] tracking-widest uppercase h-14 hover:scale-[1.02] transition-all">
                             {t("campaign_enter_scores")} <ChevronRight className="ms-2 h-4 w-4" />
                          </Button>
                       </Link>
                       {isAdmin && (
                          <div className="flex gap-2">
                             <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl border-zinc-100 hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900" onClick={() => openEdit(c)}>
                                <Pencil className="h-4 w-4" />
                             </Button>
                             <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl border-zinc-100 hover:bg-red-50 hover:text-red-600 transition-all text-zinc-400" onClick={() => setDeleteTarget({ id: c.id, title: c.title })}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          </div>
                       )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Mission Config Dialog */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-2xl bg-white border border-zinc-100 rounded-4xl p-0 overflow-hidden shadow-2xl">
          <div className="p-12 border-b border-zinc-50 bg-zinc-50/30">
            <h2 className="font-bold text-4xl text-zinc-900 tracking-tighter uppercase font-comfortaa">{editTarget ? t("action_reconfigure") : t("action_init_campaign")}</h2>
            <p className="text-[10px] font-bold text-zinc-400 tracking-[0.3em] mt-4 uppercase">STRATEGIC EVAL_v2.1</p>
          </div>

          <div className="p-16 grid grid-cols-2 gap-10">
            <div className="col-span-2 space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("campaigns_col_title")} *</Label>
              <Input placeholder="MISSION TITLE" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_type")} *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 rounded-3xl">{CAMPAIGN_TYPES.map((tp) => <SelectItem key={tp} value={tp} className="font-bold text-[10px] tracking-widest uppercase">{tp}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{editTarget ? t("field_status") : t("field_department")}</Label>
              {editTarget ? (
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-zinc-100 rounded-3xl">{CAMPAIGN_STATUSES.map((s) => <SelectItem key={s} value={s} className="font-bold text-[10px] tracking-widest uppercase">{t(`status_${s.toLowerCase()}` as any)}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={form.department_id || "all"} onValueChange={(v) =>setForm({ ...form, department_id: v === "all" ? "" : v })}>
                  <SelectTrigger className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                    <SelectValue placeholder={t("campaigns_all_departments")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                    <SelectItem value="all" className="font-bold text-[10px] tracking-widest uppercase">{t("campaigns_all_departments")}</SelectItem>
                    {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-widest uppercase">{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_start_date")} *</Label>
              <Input type="date" value={form.start_date} onChange={(e) =>setForm({ ...form, start_date: e.target.value })} disabled={!!editTarget} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 uppercase disabled:opacity-30" />
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_end_date")} *</Label>
              <Input type="date" value={form.end_date} onChange={(e) =>setForm({ ...form, end_date: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 uppercase" />
            </div>

            <div className="col-span-2 space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_notes")}</Label>
              <Input placeholder="MISSION OBJECTIVES..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900" />
            </div>
          </div>

          <div className="p-12 border-t border-zinc-50 bg-zinc-50/30 flex justify-end gap-6">
            <Button variant="ghost" className="rounded-full font-bold text-[11px] tracking-widest uppercase text-zinc-400 hover:text-zinc-900 hover:bg-white px-10 h-16" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-zinc-900 text-white font-bold text-[11px] tracking-widest uppercase px-14 h-16 shadow-2xl shadow-zinc-200">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_campaign")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-white border border-zinc-100 rounded-4xl shadow-2xl p-12">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-3xl text-zinc-900 tracking-tighter uppercase font-comfortaa">{t("common_delete")} — {deleteTarget?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-lg mt-4">{t("campaigns_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 gap-6">
            <AlertDialogCancel className="rounded-full border-zinc-100 bg-white text-zinc-400 font-bold text-[11px] tracking-widest uppercase hover:bg-zinc-50 h-16 px-12">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-full bg-red-500 text-white font-bold text-[11px] tracking-widest uppercase hover:bg-red-600 px-12 h-16 shadow-xl shadow-red-100">{deleting ? t("action_aborting") : t("action_confirm_abort")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
