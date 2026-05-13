import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListDepartments } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, ExternalLink, Download, Terminal, Search, CheckSquare, X, Building2, ArrowRight, Layers } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { useLang } from "@shared/contexts/LangContext";
import { exportToPDF } from "@modules/skill-matrix/lib/export-utils";
import { useFactory } from "@shared/contexts/FactoryContext";
import { cn } from "@shared/utils/cn";

interface DeptForm {
  name: string;
  name_ar: string;
  code: string;
  description: string;
  manager_email: string;
  factory_id: string;
}

interface Factory {
  id: string;
  name: string;
}

const emptyForm = (factoryId?: string): DeptForm => ({ 
  name: "", 
  name_ar: "", 
  code: "", 
  description: "", 
  manager_email: "",
  factory_id: factoryId ?? ""
});

export default function DepartmentsPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "super_admin";
  const t = useT();
  const { lang } = useLang();
  const isRtl = lang === "ar";
  const { activeFactoryId } = useFactory();

  const { data: departments, isLoading, queryKey } = useListDepartments(
    { factory_id: activeFactoryId ?? undefined },
    { request: { headers } },
  );

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<(typeof departments extends (infer T)[] | undefined ? T : never) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<DeptForm>(emptyForm(activeFactoryId ?? ""));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [factories, setFactories] = useState<Factory[]>([]);

  useMemo(() => {
    fetch("/api/factories", { headers }).then(res => res.json()).then(setFactories);
  }, []);

  const filteredDepts = useMemo(() => {
    if (!departments) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.code ?? "").toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q),
    );
  }, [departments, searchQuery]);

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/departments/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.blocked > 0) {
          toast({ 
            title: t("msg_bulk_delete_partial"), 
            description: t("msg_blocked_depts", { count: data.blocked })
          });
        } else {
          toast({ title: t("msg_bulk_delete_success") });
        }
        queryClient.invalidateQueries({ queryKey });
        setSelectedIds(new Set());
        setShowBulkDelete(false);
      }
    } catch (err) {
      toast({ title: t("msg_bulk_delete_error"), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDepts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDepts.map(d => d.id)));
    }
  };

  const openCreate = () => { setForm(emptyForm(activeFactoryId ?? "")); setShowCreate(true); };
  const openEdit = (dept: any) => {
    setForm({ 
      name: dept.name, 
      name_ar: dept.name_ar ?? "",
      code: dept.code ?? "", 
      description: dept.description ?? "", 
      manager_email: dept.manager_email ?? "",
      factory_id: dept.factory_id ?? activeFactoryId ?? ""
    });
    setEditTarget(dept);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: t("departments_name_required"), variant: "destructive" });
      return;
    }
    if (!form.name_ar.trim()) {
      toast({ title: t("departments_name_ar_required"), variant: "destructive" });
      return;
    }
    if (!form.factory_id) {
      toast({ title: t("departments_factory_required"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/departments/${editTarget!.id}` : `/api/departments`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          name: form.name,
          name_ar: form.name_ar,
          code: form.code || undefined,
          description: form.description || undefined,
          manager_email: form.manager_email || undefined,
          factory_id: form.factory_id,
        }),
      });
      if (res.ok) {
        toast({ title: isEdit ? t("departments_updated") : t("departments_created") });
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/departments/${deleteTarget.id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast({ title: t("departments_deleted") });
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const body = await res.json() as { message?: string };
        toast({ title: t("departments_cannot_delete"), description: body.message ?? "Failed to delete.", variant: "destructive" });
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
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{t("label_org_structure")}</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none">
            {t("departments_title")}
          </h1>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl">{t("departments_subtitle")}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" className="rounded-full border-zinc-100 bg-white text-zinc-900 font-bold text-[11px] tracking-widest uppercase px-8 h-14 hover:shadow-lg transition-all" onClick={() => exportToPDF({
            title: t("departments_title"),
            filename: "Departments_List",
            headers: [t("field_name"), t("field_code"), t("field_description"), t("field_manager_email"), t("departments_col_employees")],
            rows: (departments ?? []).map(d => [d.name, d.code ?? "—", d.description ?? "—", d.manager_email ?? "—", d.employee_count ?? 0])
          })}>
            <Download className="h-4 w-4 me-3" /> PDF
          </Button>
          {isAdmin && (
            <Button className="rounded-full bg-zinc-900 text-white font-bold text-[11px] tracking-widest uppercase px-10 h-14 shadow-2xl shadow-zinc-200 hover:scale-[1.02] transition-all" onClick={openCreate}>
              <Plus className="h-4 w-4 me-3" /> {t("action_init_unit")}
            </Button>
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
                placeholder={t("search_departments")} 
                className="ps-14 h-16 bg-zinc-50 border-transparent rounded-3xl text-sm font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-zinc-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                  <Building2 className="h-5 w-5" />
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

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full bg-zinc-50 rounded-4xl" />
          ))
        ) : !filteredDepts.length ? (
          <div className="col-span-full py-32 text-center space-y-6">
            <div className="h-24 w-24 bg-zinc-50 rounded-4xl flex items-center justify-center mx-auto text-zinc-200">
              <Building2 className="h-12 w-12" />
            </div>
            <p className="text-lg font-bold font-comfortaa text-zinc-300 uppercase tracking-widest">{searchQuery ? t("label_no_records") : t("departments_no_data")}</p>
          </div>
        ) : (
          filteredDepts.map((dept) => (
            <motion.div 
              key={dept.id} 
              layout 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="group"
            >
              <Card className={cn(
                "bg-white border-zinc-100 rounded-4xl h-full overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-zinc-100 relative",
                selectedIds.has(dept.id) ? "border-zinc-900 bg-zinc-50/50" : ""
              )}>
                <CardContent className="p-10 space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-5">
                      <Checkbox 
                        checked={selectedIds.has(dept.id)} 
                        onCheckedChange={() => toggleSelect(dept.id)} 
                        className="rounded-lg border-zinc-200 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 mt-1"
                      />
                      <div className="space-y-3">
                        <span className="text-[9px] font-bold text-zinc-400 tracking-[0.3em] uppercase">{dept.code || t("label_unit_code")}</span>
                        <h3 className="text-3xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-tight uppercase group-hover:text-emerald-600 transition-colors">
                          {isRtl ? ((dept as any).name_ar || dept.name) : dept.name}
                        </h3>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100" onClick={() => openEdit(dept)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget({ id: dept.id, name: dept.name })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <p className="text-zinc-500 font-medium text-sm leading-relaxed line-clamp-3 min-h-[4.5rem]">
                      {dept.description || t("label_no_records")}
                    </p>
                    <div className="absolute -left-10 top-0 w-1 h-full bg-zinc-50 rounded-full group-hover:bg-emerald-500 transition-colors" />
                  </div>

                  <div className="pt-10 border-t border-zinc-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                          <Users className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{t("label_personnel_count")}</p>
                          <span className="text-2xl font-bold font-comfortaa text-zinc-900 tracking-tighter">{dept.employee_count}</span>
                       </div>
                    </div>
                    <Link href={`/skill-matrix/departments/${dept.id}`}>
                      <Button variant="ghost" className="rounded-full border border-zinc-100 hover:border-zinc-900 text-[10px] font-bold tracking-widest uppercase h-12 px-6 group/btn hover:bg-zinc-900 hover:text-white transition-all">
                        {t("action_access_details")} <ArrowRight className="ms-3 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Registration/Edit Dialog */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-2xl bg-white border border-zinc-100 rounded-4xl p-0 overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-zinc-50 bg-zinc-50/30">
            <h2 className="font-bold text-3xl text-zinc-900 tracking-tighter uppercase font-comfortaa">{editTarget ? t("action_reconfigure") : t("action_init_unit")}</h2>
            <p className="text-[10px] font-bold text-zinc-400 tracking-[0.3em] mt-3 uppercase">{t("label_struct_init")}</p>
          </div>
          
          <div className="p-12 grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="font-bold text-[10px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_name")} (EN) *</Label>
              <Input placeholder="English Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>
            <div className="space-y-3">
              <Label className="font-bold text-[10px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_name_ar")} *</Label>
              <Input dir="rtl" placeholder="الاسم بالعربي" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>
            <div className="space-y-3">
              <Label className="font-bold text-[10px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_factory")} *</Label>
              <select 
                value={form.factory_id} 
                onChange={(e) => setForm({ ...form, factory_id: e.target.value })}
                className="w-full h-14 bg-zinc-50 border-transparent rounded-2xl px-4 font-bold text-[11px] tracking-widest text-zinc-900 uppercase outline-none focus:ring-2 focus:ring-zinc-100 appearance-none"
              >
                <option value="">SELECT FACTORY</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>{f.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <Label className="font-bold text-[10px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_code")}</Label>
              <Input placeholder={t("field_code")} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold text-zinc-900 uppercase" />
            </div>
            <div className="col-span-2 space-y-3">
              <Label className="font-bold text-[10px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_description")}</Label>
              <Input placeholder={t("field_description")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold text-zinc-900" />
            </div>
            <div className="col-span-2 space-y-3">
              <Label className="font-bold text-[10px] text-zinc-400 tracking-widest uppercase ps-1">{t("departments_col_manager_email")}</Label>
              <Input type="email" placeholder={t("field_manager_email")} value={form.manager_email} onChange={(e) =>setForm({ ...form, manager_email: e.target.value })} className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold text-zinc-900" />
            </div>
          </div>
          
          <div className="p-10 border-t border-zinc-50 bg-zinc-50/30 flex justify-end gap-6">
            <Button variant="ghost" className="rounded-full font-bold text-[11px] tracking-widest uppercase text-zinc-400 hover:text-zinc-900 hover:bg-white px-10 h-14" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-zinc-900 text-white font-bold text-[11px] tracking-widest uppercase px-14 h-14 shadow-2xl shadow-zinc-200">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_unit")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmations */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent className="bg-white border border-zinc-100 rounded-4xl shadow-2xl p-12">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-3xl text-zinc-900 tracking-tighter uppercase font-comfortaa">
              {t("action_confirm_bulk_purge", { count: selectedIds.size })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-lg mt-4">
              {t("desc_bulk_delete_depts", { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 gap-6">
            <AlertDialogCancel className="rounded-full border-zinc-100 bg-white text-zinc-400 font-bold text-[11px] tracking-widest uppercase hover:bg-zinc-50 h-14 px-12">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={deleting} className="rounded-full bg-red-500 text-white font-bold text-[11px] tracking-widest uppercase hover:bg-red-600 px-12 h-14 shadow-xl shadow-red-100">
              {deleting ? t("action_purging") : t("action_confirm_purge")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-white border border-zinc-100 rounded-4xl shadow-2xl p-12">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-3xl text-zinc-900 tracking-tighter uppercase font-comfortaa">{t("common_delete")} — {deleteTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-lg mt-4">{t("departments_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 gap-6">
            <AlertDialogCancel className="rounded-full border-zinc-100 bg-white text-zinc-400 font-bold text-[11px] tracking-widest uppercase hover:bg-zinc-50 h-14 px-12">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-full bg-red-500 text-white font-bold text-[11px] tracking-widest uppercase hover:bg-red-600 px-12 h-14 shadow-xl shadow-red-100">{deleting ? t("action_purging") : t("action_confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
