import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListDepartments } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Skeleton } from "@shared/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, ExternalLink, Download, Building2, Terminal, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { exportToPDF, exportToExcel } from "@modules/skill-matrix/lib/export-utils";
import { Badge } from "@shared/components/ui/badge";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-${color}/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-${color}/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-${color}/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]`} />
    <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-${color}/60 shadow-[0_0_8px_rgba(var(--primary),0.2)]`} />
  </>);

interface DeptForm {
  name: string;
  code: string;
  description: string;
  manager_email: string;
}

const emptyForm = (): DeptForm => ({ name: "", code: "", description: "", manager_email: "" });

export default function DepartmentsPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "super_admin";
  const t = useT();

  const { data: departments, isLoading, queryKey } = useListDepartments({ request: { headers } });

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<(typeof departments extends (infer T)[] | undefined ? T : never) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<DeptForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side filter
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

  const openCreate = () => { setForm(emptyForm()); setShowCreate(true); };
  const openEdit = (dept: NonNullable<typeof departments>[number]) => {
    setForm({ name: dept.name, code: dept.code ?? "", description: dept.description ?? "", manager_email: dept.manager_email ?? "" });
    setEditTarget(dept);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: t("departments_name_required"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/departments/${editTarget!.id}` : `/api/departments`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ name: form.name, code: form.code || undefined, description: form.description || undefined, manager_email: form.manager_email || undefined }),
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
    <div className="space-y-8 pb-20 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header - Industrial Style */}
      <div className="relative p-12 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Building2 className="h-4 w-4 text-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              <span className="font-headline font-black tracking-[0.5em] text-[10px] text-primary/60 uppercase">{t("label_org_structure")}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-headline font-black tracking-tighter text-white uppercase leading-none text-shimmer">{t("departments_title")}
            </h2>
            <p className="text-zinc-500 font-medium border-s-2 border-primary/20 ps-6 text-[11px] uppercase tracking-widest max-w-xl leading-relaxed">{t("departments_subtitle")}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 text-white font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto" onClick={() =>exportToPDF({
              title: t("departments_title"),
              filename: "Departments_List",
              headers: [t("field_name"), t("field_code"), t("field_description"), t("field_manager_email"), t("departments_col_employees")],
              rows: (departments ?? []).map(d => [d.name, d.code ?? "—", d.description ?? "—", d.manager_email ?? "—", d.employee_count ?? 0])
            })}>
              <Download className="h-4 w-4 me-2" /> PDF
            </Button>
            {isAdmin && (
              <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto hover:bg-primary/90" onClick={openCreate}>
                <Plus className="h-4 w-4 me-2" />{t("action_init_unit")}
              </Button>
            )}
          </div>
        </div>
        <CornerMarks />
      </div>

      {/* Search / Filter Control Panel */}
      <Card className="bg-[#121212] border border-zinc-900 rounded-none relative shadow-xl overflow-hidden group">
        <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={t("search_departments")}
                className="ps-14 h-16 bg-white/5 border-zinc-800 rounded-none font-mono text-sm tracking-[0.2em] text-white placeholder:text-zinc-700 focus-visible:ring-primary/30 transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                className="h-16 px-10 rounded-none border border-zinc-800 text-zinc-600 hover:text-white hover:bg-white/5 font-headline font-black text-[10px] tracking-[0.3em] uppercase transition-all duration-300"
                onClick={() =>setSearchQuery("")}
              >
                {t("filter_reset")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full bg-white/5 rounded-none" />
          ))}
        </div>
      ) : !filteredDepts.length ? (
        <Card className="bg-[#121212] border-white/10 rounded-none relative">
          <CardContent className="py-20 text-center space-y-4">
            <Terminal className="h-12 w-12 text-secondary/10 mx-auto" />
            <p className="font-mono text-xs text-secondary/30 uppercase tracking-[0.3em]">{searchQuery ? t("label_no_records") : t("departments_no_data")}
            </p>
          </CardContent>
          <CornerMarks />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-[#0D0D0D] border border-zinc-900 rounded-none relative group h-full overflow-hidden transition-all duration-500 hover:border-primary/30 shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-16 -translate-y-16 transition-transform duration-1000 group-hover:scale-150 group-hover:bg-primary/10" />
                <CardContent className="p-10 space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[9px] text-primary/40 tracking-[0.4em] uppercase">{dept.code ?? t("label_unit_code")}</span>
                        <div className="h-px w-8 bg-primary/10" />
                      </div>
                      <h3 className="font-headline font-black text-3xl text-white uppercase tracking-tighter group-hover:text-primary transition-colors duration-500">
                        {dept.name}
                      </h3>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <Button size="icon" variant="ghost" className="h-12 w-12 rounded-none border border-zinc-800 hover:border-primary/30 hover:bg-white/5 text-zinc-600 hover:text-primary transition-all duration-300" onClick={() => openEdit(dept)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-12 w-12 rounded-none border border-zinc-800 hover:border-rose-500/30 hover:bg-rose-500/5 text-zinc-600 hover:text-rose-500 transition-all duration-300" onClick={() => setDeleteTarget({ id: dept.id, name: dept.name })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-zinc-600 font-medium text-[11px] line-clamp-3 uppercase tracking-widest leading-relaxed min-h-[60px] border-l-2 border-zinc-900 ps-6 group-hover:border-primary/20 group-hover:text-zinc-500 transition-all duration-500">
                    {dept.description ?? t("label_no_records")}
                  </p>

                  <div className="pt-10 border-t border-zinc-900 flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[8px] text-zinc-800 uppercase tracking-[0.3em]">{t("label_personnel_count")}</span>
                      <div className="flex items-center gap-4">
                        <Users className="h-4 w-4 text-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.2)]" />
                        <span className="font-headline font-black text-3xl text-white tracking-tighter">{dept.employee_count}</span>
                      </div>
                    </div>
                    <Link href={`/departments/${dept.id}`}>
                      <Button variant="ghost" className="rounded-none border border-zinc-800 hover:border-primary/50 text-[10px] font-headline font-black tracking-[0.3em] uppercase h-auto py-5 px-8 group/btn transition-all duration-500 hover:bg-primary/5">
                        {t("action_access_details")} <ExternalLink className="ms-4 h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-500 text-primary" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
                <CornerMarks />
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Forms & Dialogs */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-md bg-[#0A0A0A] border-2 border-primary/30 rounded-none p-0 overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <div className="relative z-10">
            <div className="p-8 border-b border-white/10 bg-white/5">
              <h2 className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{editTarget ? t("action_reconfigure") : t("action_init_unit")}
              </h2>
              <p className="text-[10px] font-mono text-primary tracking-[0.3em] mt-2 uppercase">{t("label_struct_init")}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_name")} *</Label>
                <Input placeholder={t("field_name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_code")}</Label>
                <Input placeholder={t("field_code")} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_description")}</Label>
                <Input placeholder={t("field_description")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white uppercase" />
              </div>
              <div className="space-y-2">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("departments_col_manager_email")}</Label>
                <Input type="email" placeholder={t("field_manager_email")} value={form.manager_email} onChange={(e) =>setForm({ ...form, manager_email: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
            </div>

            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end gap-4">
              <Button variant="ghost" className="rounded-none font-headline font-black text-[10px] tracking-widest uppercase text-white hover:bg-white/5" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase px-10 py-6 h-auto">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_unit")}
              </Button>
            </div>
          </div>
          <CornerMarks />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-[#0A0A0A] border-2 border-rose-500/30 rounded-none text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{t("common_delete")} — {deleteTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary/40 font-mono text-xs uppercase tracking-widest">{t("departments_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-none border-white/10 bg-white/5 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-white/10 h-auto py-4 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-none bg-rose-600 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-rose-700 px-8 h-auto py-4">{deleting ? t("action_purging") : t("action_confirm_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
          <CornerMarks color="rose" />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
