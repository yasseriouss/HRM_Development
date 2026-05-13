import { useState, useMemo } from "react";
import { useListSkills, useListDepartments } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Checkbox } from "@shared/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Download, Search, Filter, Shield, Activity, HardDrive, Cpu, X, CheckSquare, Zap, Target, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { exportToPDF, exportToExcel } from "@modules/skill-matrix/lib/export-utils";
import { ImportDialog } from "@modules/skill-matrix/components/import-dialog";
import { Upload } from "lucide-react";
import { useFactory } from "@shared/contexts/FactoryContext";
import { useLang } from "@shared/contexts/LangContext";
import { cn } from "@shared/utils/cn";
import {
  dataTableBase,
  dataTableBody,
  dataTableHeadRow,
  dataTableRow,
  dataTableRowSelected,
  dataTableScroll,
  dataTableShell,
  dataTableTdSpacious,
  dataTableThSpacious,
} from "@shared/components/data/data-table-styles";

const CRITICALITIES = ["Low", "Medium", "High", "Critical"] as const;
type Criticality = (typeof CRITICALITIES)[number];

function critBadge(crit: string, t: (k: any) => string) {
  const map: Record<string, { bg: string; text: string; border: string; key: string }> = {
    Critical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", key: "crit_critical" },
    High: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", key: "crit_high" },
    Medium: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", key: "crit_medium" },
    Low: { bg: "bg-zinc-50", text: "text-zinc-600", border: "border-zinc-100", key: "crit_low" },
  };
  const config = map[crit] ?? map.Low;
  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border shadow-sm", config.bg, config.text, config.border)}>
      {t(config.key)}
    </Badge>
  );
}

interface SkillForm {
  name: string;
  name_ar: string;
  code: string;
  department_id: string;
  category: string;
  weight: string;
  criticality: Criticality;
  description: string;
}

type SkillItem = {
  id: string;
  name: string;
  code?: string | null;
  department_id: string;
  category?: string | null;
  weight?: number | null;
  criticality: string;
  description?: string | null;
  name_ar?: string | null;
  department?: { name: string } | null;
};

const emptyForm = (): SkillForm => ({
  name: "", name_ar: "", code: "", department_id: "", category: "", weight: "1",
  criticality: "Medium", description: "",
});

export default function SkillsPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "super_admin";
  const t = useT();
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const { activeFactoryId } = useFactory();

  const [deptFilter, setDeptFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<SkillItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<SkillForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { data: departments } = useListDepartments(
    { factory_id: activeFactoryId ?? undefined },
    { request: { headers } },
  );
  const { data: skills, isLoading, queryKey } = useListSkills(
    {
      department_id: deptFilter !== "all" ? deptFilter : undefined,
      factory_id: activeFactoryId ?? undefined,
    },
    { request: { headers } },
  );

  const filteredSkills = skills?.filter(sk => 
    sk.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sk.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sk.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const openCreate = () => { setForm(emptyForm()); setShowCreate(true); };
  const openEdit = (sk: SkillItem) => {
    setForm({
      name: sk.name,
      name_ar: sk.name_ar ?? "",
      code: sk.code ?? "",
      department_id: sk.department_id ?? "",
      category: sk.category ?? "",
      weight: String(sk.weight ?? 3),
      criticality: (sk.criticality as Criticality) ?? "Medium",
      description: sk.description ?? "",
    });
    setEditTarget(sk);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: t("skills_name_required"), variant: "destructive" }); return; }
    if (!form.name_ar.trim()) { toast({ title: t("skills_name_ar_required"), variant: "destructive" }); return; }
    if (!form.department_id) { toast({ title: t("skills_dept_required"), variant: "destructive" }); return; }
    if (!form.weight || !form.criticality) {
      toast({ title: t("skills_required"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/skills/${editTarget!.id}` : `/api/skills`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          name: form.name,
          name_ar: form.name_ar,
          code: form.code || undefined,
          department_id: form.department_id,
          category: form.category || undefined,
          weight: Number(form.weight),
          criticality: form.criticality,
          description: form.description || undefined,
        }),
      });
      if (res.ok) {
        toast({ title: isEdit ? t("skills_updated") : t("skills_created") });
        setShowCreate(false);
        setEditTarget(null);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const body = await res.json() as { message?: string };
        toast({ title: t("common_failed"), description: body.message ?? "Could not save.", variant: "destructive" });
      }
    } catch {
      toast({ title: t("common_network_error"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/skills/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        toast({ title: t("msg_bulk_delete_success") });
        queryClient.invalidateQueries({ queryKey });
        setSelectedIds(new Set());
        setShowBulkDelete(false);
      } else {
        toast({ title: t("common_failed"), variant: "destructive" });
      }
    } catch {
      toast({ title: t("msg_bulk_delete_error"), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSkills.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredSkills.map(s => s.id)));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/skills/${deleteTarget.id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast({ title: t("skills_deactivated") });
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const body = await res.json() as { message?: string };
        toast({ title: t("common_failed"), description: body.message ?? "Could not deactivate.", variant: "destructive" });
        setDeleteTarget(null);
      }
    } catch {
      toast({ title: t("common_network_error"), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
              <Zap className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{t("label_skill_repository")}</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none">
            {t("skills_title")}
          </h1>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl">{t("skills_subtitle")}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" className="rounded-full border-zinc-100 bg-white text-zinc-900 font-bold text-[11px] tracking-widest uppercase px-8 h-14 hover:shadow-lg transition-all" onClick={() => exportToPDF({
            title: t("skills_title"),
            filename: "Skills_Library",
            headers: [t("field_name"), t("field_code"), t("skills_col_category"), t("field_department"), t("skills_col_weight"), t("skills_col_criticality")],
            rows: (skills ?? []).map(sk => [sk.name, sk.code ?? "—", sk.category ?? "—", sk.department?.name ?? "—", sk.weight ?? 0, sk.criticality])
          })}>
            <Download className="h-4 w-4 me-3" /> PDF
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" className="rounded-full border-zinc-100 bg-white text-zinc-900 font-bold text-[11px] tracking-widest uppercase px-8 h-14 hover:shadow-lg transition-all" onClick={() => setShowImport(true)}>
                <Upload className="h-4 w-4 me-3" /> IMPORT
              </Button>
              <Button className="rounded-full bg-zinc-900 text-white font-bold text-[11px] tracking-widest uppercase px-10 h-14 shadow-2xl shadow-zinc-200 hover:scale-[1.02] transition-all" onClick={openCreate}>
                <Plus className="h-4 w-4 me-3" /> {t("action_register_skill")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <Card className="bg-white border-zinc-100 rounded-4xl shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
              <Input 
                placeholder={t("search_by_name_or_code")} 
                className="ps-14 h-16 bg-zinc-50 border-transparent rounded-3xl text-sm font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-zinc-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full lg:w-72">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="h-16 bg-white border-zinc-100 rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                  <SelectValue placeholder={t("filter_by_dept")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                  <SelectItem value="all" className="font-bold text-[10px] tracking-widest uppercase">{t("all_departments")}</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-widest uppercase">{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="h-16 px-8 rounded-3xl border-zinc-100 font-bold text-[11px] tracking-widest uppercase text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all" onClick={toggleSelectAll}>
              <CheckSquare className="h-4 w-4 me-3" /> {selectedIds.size > 0 ? t("action_deselect_all") : t("action_select_all")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center justify-between p-6 bg-zinc-900 text-white rounded-4xl shadow-2xl shadow-zinc-200"
          >
            <div className="flex items-center gap-6 px-4">
               <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Target className="h-5 w-5" />
               </div>
               <div>
                  <p className="text-sm font-bold font-comfortaa">{t("action_delete_selected", { count: selectedIds.size })}</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Selection</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <Button variant="ghost" className="rounded-full text-white/60 hover:text-white hover:bg-white/10 uppercase text-[10px] font-bold tracking-widest px-8" onClick={() => setSelectedIds(new Set())}>
                  {t("common_cancel")}
               </Button>
               <Button variant="destructive" className="rounded-full bg-red-500 hover:bg-red-600 uppercase text-[10px] font-bold tracking-widest px-10 h-12" onClick={() => setShowBulkDelete(true)}>
                  <Trash2 className="h-4 w-4 me-2" /> {t("action_delete")}
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills Registry */}
      <div className={dataTableShell} data-testid="skills-data-table">
        {isLoading ? (
          <div className="p-12 space-y-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-zinc-50 rounded-3xl" />
            ))}
          </div>
        ) : !filteredSkills.length ? (
          <div className="p-32 text-center space-y-6">
            <div className="h-24 w-24 bg-zinc-50 rounded-4xl flex items-center justify-center mx-auto text-zinc-200">
              <Zap className="h-12 w-12" />
            </div>
            <p className="text-lg font-bold font-comfortaa text-zinc-300 uppercase tracking-widest">{t("label_no_records")}</p>
          </div>
        ) : (
          <div className={dataTableScroll}>
            <table className={dataTableBase}>
              <thead>
                <tr className={dataTableHeadRow}>
                  <th className={cn(dataTableThSpacious, "w-10")}>
                    <Checkbox
                      checked={selectedIds.size === filteredSkills.length && filteredSkills.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="rounded-lg border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </th>
                  <th className={cn(dataTableThSpacious, "text-start")}>{t("field_name")}</th>
                  <th className={cn(dataTableThSpacious, "text-start")}>{t("field_code")}</th>
                  <th className={cn(dataTableThSpacious, "text-start")}>{t("skills_col_category")}</th>
                  <th className={cn(dataTableThSpacious, "text-start")}>{t("field_department")}</th>
                  <th className={cn(dataTableThSpacious, "text-center")}>{t("skills_col_weight")}</th>
                  <th className={cn(dataTableThSpacious, "text-start")}>{t("skills_col_criticality")}</th>
                  <th className={cn(dataTableThSpacious, "text-end")}>{t("common_actions")}</th>
                </tr>
              </thead>
              <tbody className={dataTableBody}>
                {filteredSkills.map((sk) => (
                  <tr
                    key={sk.id}
                    className={cn(dataTableRow, "group", selectedIds.has(sk.id) ? dataTableRowSelected : "")}
                  >
                    <td className={cn(dataTableTdSpacious, "whitespace-nowrap")}>
                      <Checkbox
                        checked={selectedIds.has(sk.id)}
                        onCheckedChange={() => toggleSelect(sk.id)}
                        className="rounded-lg border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </td>
                    <td className={cn(dataTableTdSpacious, "whitespace-nowrap")}>
                      <div className="flex items-center gap-5">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                          {sk.name.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-foreground text-lg tracking-tight group-hover:translate-x-1 transition-transform font-comfortaa">
                            {isRtl ? (sk.name_ar || sk.name) : sk.name}
                          </p>
                          {sk.description && (
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-xs truncate">{sk.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={cn(dataTableTdSpacious, "font-bold text-[11px] text-muted-foreground tracking-widest whitespace-nowrap uppercase")}>
                      {sk.code ?? "—"}
                    </td>
                    <td className={cn(dataTableTdSpacious, "font-bold text-[10px] text-muted-foreground tracking-widest uppercase whitespace-nowrap")}>
                      {sk.category ?? "SYSTEM"}
                    </td>
                    <td className={cn(dataTableTdSpacious, "whitespace-nowrap")}>
                      <Badge variant="outline" className="rounded-full border-border bg-background text-[10px] font-bold text-muted-foreground py-1.5 px-4 uppercase tracking-tight shadow-xs">
                        {(sk as any).department?.name ?? "GENERAL"}
                      </Badge>
                    </td>
                    <td className={cn(dataTableTdSpacious, "text-center whitespace-nowrap")}>
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-muted/50 font-bold text-lg text-foreground font-comfortaa border border-border/60">
                        {sk.weight}
                      </span>
                    </td>
                    <td className={cn(dataTableTdSpacious, "whitespace-nowrap")}>{critBadge(sk.criticality, t)}</td>
                    <td className={cn(dataTableTdSpacious, "text-end whitespace-nowrap")}>
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            onClick={() => openEdit(sk)}
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget({ id: sk.id, name: sk.name })}
                          >
                            <Trash2 className="h-5 w-5" />
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

      {/* Asset Registration Dialog */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-3xl bg-white border border-zinc-100 rounded-4xl p-0 overflow-hidden shadow-2xl">
          <div className="p-12 border-b border-zinc-50 bg-zinc-50/30">
            <h2 className="font-bold text-4xl text-zinc-900 tracking-tighter uppercase font-comfortaa">{editTarget ? t("action_reconfigure") : t("action_init_asset")}</h2>
            <p className="text-[10px] font-bold text-zinc-400 tracking-[0.3em] mt-4 uppercase">NODE REGISTRATION_v2.0</p>
          </div>
          
          <div className="p-16 grid grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_name")} (EN) *</Label>
              <Input placeholder="English Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_name_ar")} *</Label>
              <Input dir="rtl" placeholder="الاسم بالعربي" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_code")}</Label>
              <Input placeholder="HEX UID" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 uppercase" />
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_department")} *</Label>
              <Select value={form.department_id || "none"} onValueChange={(v) =>setForm({ ...form, department_id: v === "none" ? "" : v })}>
                <SelectTrigger className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                  <SelectValue placeholder={t("select_none")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                  <SelectItem value="none" className="font-bold text-[10px] tracking-widest uppercase">{t("select_none")}</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-widest uppercase">{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("skills_col_category")}</Label>
              <Input placeholder="SYSTEM CLASS" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900" />
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("skills_col_weight")} *</Label>
              <Input type="number" min="1" max="10" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900" />
            </div>
            <div className="col-span-2 space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("skills_col_criticality")} *</Label>
              <Select value={form.criticality} onValueChange={(v) => setForm({ ...form, criticality: v as Criticality })}>
                <SelectTrigger className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                  {CRITICALITIES.map((c) => <SelectItem key={c} value={c} className="font-bold text-[10px] tracking-widest uppercase">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_description")}</Label>
              <Input placeholder="TECHNICAL SPECIFICATIONS..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900" />
            </div>
          </div>
          
          <div className="p-12 border-t border-zinc-50 bg-zinc-50/30 flex justify-end gap-6">
            <Button variant="ghost" className="rounded-full font-bold text-[11px] tracking-widest uppercase text-zinc-400 hover:text-zinc-900 hover:bg-white px-10 h-14" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-zinc-900 text-white font-bold text-[11px] tracking-widest uppercase px-14 h-14 shadow-2xl shadow-zinc-200">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_asset")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-white border border-zinc-100 rounded-4xl shadow-2xl p-12">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-3xl text-zinc-900 tracking-tighter uppercase font-comfortaa">{t("skills_deactivate_confirm", { name: deleteTarget?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-lg mt-4">{t("skills_deactivate_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 gap-6">
            <AlertDialogCancel className="rounded-full border-zinc-100 bg-white text-zinc-400 font-bold text-[11px] tracking-widest uppercase hover:bg-zinc-50 h-14 px-12">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-full bg-red-500 text-white font-bold text-[11px] tracking-widest uppercase hover:bg-red-600 px-12 h-14 shadow-xl shadow-red-100">{deleting ? t("action_purging") : t("action_confirm_deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onSuccess={() => queryClient.invalidateQueries({ queryKey })}
        type="skills"
      />
    </div>
  );
}
