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
import { Plus, Pencil, Trash2, Users, ExternalLink, Download, Terminal, Search, CheckSquare, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { useLang } from "@shared/contexts/LangContext";
import { exportToPDF } from "@modules/skill-matrix/lib/export-utils";
import { useFactory } from "@shared/contexts/FactoryContext";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]`} />
  </>);

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

  // Fetch factories manually since hook is missing
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
    <div className="space-y-10 pb-20 font-sans selection:bg-primary/20 selection:text-primary">
      <div className="relative pt-12 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/20" />
                <span className="font-sans font-bold tracking-widest text-[10px] text-primary uppercase">{t("label_org_structure")}</span>
              </div>
              <h1 className="text-6xl font-headline font-bold tracking-tight text-foreground leading-none">
                {t("departments_title")}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {selectedIds.size > 0 && (
                <Button variant="destructive" className="rounded-full font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => setShowBulkDelete(true)}>
                  <Trash2 className="h-4 w-4 me-2" /> {t("action_delete_selected", { count: selectedIds.size })}
                </Button>
              )}
              <Button variant="outline" className="rounded-full border-primary/10 bg-surface/50 hover:bg-surface text-foreground font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => exportToPDF({
                title: t("departments_title"),
                filename: "Departments_List",
                headers: [t("field_name"), t("field_code"), t("field_description"), t("field_manager_email"), t("departments_col_employees")],
                rows: (departments ?? []).map(d => [d.name, d.code ?? "—", d.description ?? "—", d.manager_email ?? "—", d.employee_count ?? 0])
              })}>
                <Download className="h-4 w-4 me-2 opacity-50" /> PDF
              </Button>
              {isAdmin && (
                <Button className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={openCreate}>
                  <Plus className="h-4 w-4 me-2" /> {t("action_init_unit")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <Card className="bg-surface border-primary/10 rounded-3xl shadow-sm overflow-hidden border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <Input
                placeholder={t("search_departments")}
                className="ps-10 h-12 bg-background border-primary/5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-12 px-6 rounded-xl border-primary/10" onClick={toggleSelectAll}>
              <CheckSquare className="h-4 w-4 me-2" /> {selectedIds.size > 0 ? t("action_deselect_all") : t("action_select_all")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4">
            <div className="bg-foreground text-background rounded-full shadow-2xl px-6 py-3 flex items-center gap-4 border border-primary/20 backdrop-blur-xl">
              <span className="font-bold text-sm uppercase">{selectedIds.size} Selected</span>
              <Button variant="ghost" className="text-rose-400 hover:text-rose-300" onClick={() => setShowBulkDelete(true)}>
                <Trash2 className="h-4 w-4 me-2" /> Delete
              </Button>
              <Button variant="ghost" onClick={() => setSelectedIds(new Set())}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full bg-muted/50 rounded-3xl" />
            ))}
          </div>
        ) : !filteredDepts.length ? (
          <Card className="bg-surface border-primary/10 rounded-3xl border">
            <CardContent className="py-20 text-center space-y-4">
              <Terminal className="h-8 w-8 text-muted-foreground opacity-20 mx-auto" />
              <p className="font-sans text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                {searchQuery ? t("label_no_records") : t("departments_no_data")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepts.map((dept) => (
              <motion.div key={dept.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className={`bg-surface border-primary/10 rounded-3xl group h-full overflow-hidden transition-all duration-300 border ${selectedIds.has(dept.id) ? 'border-primary/40 bg-primary/5' : ''}`}>
                  <CardContent className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedIds.has(dept.id)} onCheckedChange={() => toggleSelect(dept.id)} />
                        <div className="space-y-1">
                          <span className="font-sans text-[10px] text-primary/60 font-bold tracking-widest uppercase">{dept.code ?? t("label_unit_code")}</span>
                          <h3 className="font-headline font-bold text-3xl text-foreground uppercase tracking-tight">
                            {isRtl ? ((dept as any).name_ar || dept.name) : dept.name}
                          </h3>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => openEdit(dept)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50" onClick={() => setDeleteTarget({ id: dept.id, name: dept.name })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <p className="text-muted-foreground font-medium text-[12px] line-clamp-3 leading-relaxed min-h-[54px] border-l-2 border-primary/5 ps-4 group-hover:border-primary/20 transition-colors">
                      {dept.description ?? t("label_no_records")}
                    </p>

                    <div className="pt-8 border-t border-primary/5 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-sans text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-50">{t("label_personnel_count")}</span>
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-primary opacity-50" />
                          <span className="font-headline font-bold text-2xl text-foreground tracking-tight">{dept.employee_count}</span>
                        </div>
                      </div>
                      <Link href={`/departments/${dept.id}`}>
                        <Button variant="ghost" className="rounded-full border border-primary/10 hover:border-primary/30 text-[10px] font-bold tracking-widest uppercase h-11 px-6 group/btn hover:bg-primary/5">
                          {t("action_access_details")} <ExternalLink className="ms-2.5 h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform text-primary" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Forms & Dialogs */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-md bg-surface border-primary/20 rounded-4xl p-0 overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="p-8 border-b border-primary/5 bg-background/50 backdrop-blur-sm">
              <h2 className="font-headline font-bold text-3xl text-foreground tracking-tight uppercase">{editTarget ? t("action_reconfigure") : t("action_init_unit")}</h2>
              <p className="text-[10px] font-sans font-bold text-primary tracking-widest mt-2 uppercase opacity-50">{t("label_struct_init")}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_name")} (EN) *</Label>
                <Input placeholder="English Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm font-bold text-foreground focus-visible:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_name_ar")} *</Label>
                <Input dir="rtl" placeholder="الاسم بالعربي" value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm font-bold text-foreground focus-visible:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_factory")} *</Label>
                <select 
                  value={form.factory_id} 
                  onChange={(e) => setForm({ ...form, factory_id: e.target.value })}
                  className="w-full h-14 bg-background border-primary/5 rounded-xl px-4 font-sans text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                >
                  <option value="">Select Factory</option>
                  {factories.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_code")}</Label>
                <Input placeholder={t("field_code")} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_description")}</Label>
                <Input placeholder={t("field_description")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("departments_col_manager_email")}</Label>
                <Input type="email" placeholder={t("field_manager_email")} value={form.manager_email} onChange={(e) =>setForm({ ...form, manager_email: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground" />
              </div>
            </div>

            <div className="p-8 border-t border-primary/5 bg-background/50 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-full font-bold text-[11px] tracking-wide uppercase text-muted-foreground hover:bg-primary/5" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase px-10 h-12 shadow-lg shadow-primary/20">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_unit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent className="bg-surface border-primary/20 rounded-4xl shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-3xl text-foreground tracking-tight uppercase">
              {t("action_confirm_bulk_purge", { count: selectedIds.size })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans text-base mt-2">
              {t("desc_bulk_delete_depts", { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-full border-primary/10 bg-background text-foreground font-bold text-[11px] tracking-wide uppercase hover:bg-primary/5 h-12 px-10">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={deleting} className="rounded-full bg-rose-600 text-white font-bold text-[11px] tracking-wide uppercase hover:bg-rose-700 px-10 h-12 shadow-lg shadow-rose-600/20">
              {deleting ? t("action_purging") : t("action_confirm_purge")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-surface border-primary/20 rounded-4xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-2xl text-foreground tracking-tight uppercase">{t("common_delete")} — {deleteTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans text-sm">{t("departments_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-full border-primary/10 bg-background text-foreground font-bold text-[11px] tracking-wide uppercase hover:bg-primary/5 h-12 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-full bg-rose-600 text-white font-bold text-[11px] tracking-wide uppercase hover:bg-rose-700 px-8 h-12 shadow-lg shadow-rose-600/20">{deleting ? t("action_purging") : t("action_confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent className="bg-surface border-primary/20 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold uppercase tracking-tight">{t("confirm_bulk_delete")}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t("desc_bulk_delete_depts", { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full uppercase text-[10px] font-bold tracking-widest">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 uppercase text-[10px] font-bold tracking-widest">
              {deleting ? t("action_purging") : t("action_confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
