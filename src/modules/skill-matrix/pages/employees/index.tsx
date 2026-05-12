import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListEmployees, useListDepartments } from "@hrm-development/api-client-react";
import type { Employee, ListEmployeesCurrentClass } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent } from "@shared/components/ui/card";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ExternalLink, Download, Upload, Users, Shield, Search, Filter, HardDrive, CheckSquare, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { exportToPDF, exportToExcel } from "@modules/skill-matrix/lib/export-utils";
import { ImportDialog } from "@modules/skill-matrix/components/import-dialog";
import { useFactory } from "@shared/contexts/FactoryContext";

function classBadge(cls: string | null | undefined, t: any) {
  if (cls === "A") return <Badge variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-50 text-emerald-700 font-bold text-[9px] tracking-wider px-2.5 py-0.5 uppercase shadow-sm">{t("dept_class_a")}</Badge>;
  if (cls === "B") return <Badge variant="outline" className="rounded-full border-amber-500/20 bg-amber-50 text-amber-700 font-bold text-[9px] tracking-wider px-2.5 py-0.5 uppercase shadow-sm">{t("employees_class_b")}</Badge>;
  if (cls === "C") return <Badge variant="outline" className="rounded-full border-rose-500/20 bg-rose-50 text-rose-700 font-bold text-[9px] tracking-wider px-2.5 py-0.5 uppercase shadow-sm">{t("employees_class_c")}</Badge>;
  return <Badge variant="outline" className="rounded-full border-primary/10 bg-muted/30 text-muted-foreground font-bold text-[9px] tracking-wider px-2.5 py-0.5 uppercase">{t("label_unclassified")}</Badge>;
}

interface EmpForm {
  full_name: string;
  department_id: string;
  employee_code: string;
  job_title: string;
  email: string;
  phone: string;
  joined_date: string;
}

const emptyForm = (): EmpForm => ({
  full_name: "", department_id: "", employee_code: "", job_title: "",
  email: "", phone: "", joined_date: "",
});

export default function EmployeesPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "super_admin";
  const t = useT();
  const { activeFactoryId } = useFactory();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<EmpForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { data: departments } = useListDepartments(
    { factory_id: activeFactoryId ?? undefined },
    { request: { headers } },
  );

  const { data, isLoading, queryKey } = useListEmployees(
    {
      search: search || undefined,
      current_class:
        classFilter !== "all"
          ? (classFilter as ListEmployeesCurrentClass)
          : undefined,
      department_id: deptFilter !== "all" ? deptFilter : undefined,
      page,
      page_size: pageSize,
      factory_id: activeFactoryId ?? undefined,
    },
    { request: { headers } },
  );

  const employees = (data?.data ?? []) as Employee[];
  const totalPages = data?.total && data?.page_size ? Math.ceil(data.total / data.page_size) : 1;
  const resetPage = () => setPage(1);

  const openCreate = () => { setForm(emptyForm()); setShowCreate(true); };
  const openEdit = (emp: Employee) => {
    setForm({
      full_name: emp.full_name ?? "",
      department_id: emp.department_id ?? "",
      employee_code: emp.employee_code ?? "",
      job_title: emp.job_title ?? "",
      email: emp.email ?? "",
      phone: emp.phone ?? "",
      joined_date: emp.joined_date ? String(emp.joined_date).split("T")[0] : "",
    });
    setEditTarget(emp);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.department_id) {
      toast({ title: t("employees_required_fields"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/employees/${editTarget!.id}` : `/api/employees`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          full_name: form.full_name,
          department_id: form.department_id,
          employee_code: form.employee_code || undefined,
          job_title: form.job_title || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          joined_date: form.joined_date || undefined,
          factory_id: activeFactoryId ?? undefined,
        }),
      });
      if (res.ok) {
        toast({ title: isEdit ? t("employees_updated") : t("employees_created") });
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
      const ids = Array.from(selectedIds);
      const res = await fetch("/api/employees/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        toast({ title: t("msg_bulk_delete_success") });
        setSelectedIds(new Set());
        setShowBulkDelete(false);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        toast({ title: t("common_failed"), variant: "destructive" });
      }
    } catch {
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
    if (selectedIds.size === employees.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(employees.map(e => e.id)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/employees/${deleteTarget.id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast({ title: t("employees_deactivated") });
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
    <div className="space-y-10 pb-20 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header - Editorial Style */}
      <div className="relative pt-12 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/20" />
                <span className="font-sans font-bold tracking-widest text-[10px] text-primary uppercase">{t("label_personnel_registry")}</span>
              </div>
              <h1 className="text-6xl font-headline font-bold tracking-tight text-foreground leading-none">
                {t("employees_title")}
              </h1>
              <p className="text-muted-foreground font-medium text-lg max-w-2xl">{t("employees_subtitle")}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {selectedIds.size > 0 && (
                <Button variant="destructive" className="rounded-full font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => setShowBulkDelete(true)}>
                  <Trash2 className="h-4 w-4 me-2" /> {t("action_delete_selected", { count: selectedIds.size })}
                </Button>
              )}
              <Button variant="outline" className="rounded-full border-primary/10 bg-surface/50 hover:bg-surface text-foreground font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => exportToPDF({
                title: t("employees_title"),
                filename: "Employees_List",
                headers: [t("field_name"), t("field_code"), t("field_department"), t("field_job_title"), t("field_class")],
                rows: (employees ?? []).map(e => [e.full_name ?? "—", e.employee_code ?? "—", e.department?.name ?? "—", e.job_title ?? "—", e.current_class ?? "—"])
              })}>
                <Download className="h-4 w-4 me-2 opacity-50" /> PDF
              </Button>
              <Button variant="outline" className="rounded-full border-primary/10 bg-surface/50 hover:bg-surface text-foreground font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => exportToExcel({
                title: t("employees_title"),
                filename: "Employees_List",
                headers: [t("field_name"), t("field_code"), t("field_department"), t("field_job_title"), t("field_class")],
                rows: (employees ?? []).map(e => [e.full_name ?? "—", e.employee_code ?? "—", e.department?.name ?? "—", e.job_title ?? "—", e.current_class ?? "—"])
              })}>
                <Download className="h-4 w-4 me-2 opacity-50" /> EXCEL
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" className="rounded-full border-primary/10 bg-surface/50 hover:bg-surface text-foreground font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => setShowImport(true)}>
                    <Upload className="h-4 w-4 me-2 opacity-50" /> IMPORT
                  </Button>
                  <Button className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase px-8 h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all" onClick={openCreate}>
                    <Plus className="h-4 w-4 me-2" /> {t("action_register_operative")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="max-w-7xl mx-auto px-4">
        <Card className="bg-surface border-primary/10 rounded-4xl shadow-sm overflow-hidden border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                <Input 
                  placeholder={t("search_by_name_or_code")} 
                  className="ps-10 h-12 bg-background border-primary/5 rounded-3xl text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); resetPage(); }}>
                  <SelectTrigger className="h-12 bg-background border-primary/5 rounded-3xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                    <SelectValue placeholder={t("all_departments")} />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-primary/10 rounded-3xl">
                    <SelectItem value="all" className="font-bold text-[10px] tracking-wide uppercase">{t("all_departments")}</SelectItem>
                    {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-wide uppercase">{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-56">
                <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); resetPage(); }}>
                  <SelectTrigger className="h-12 bg-background border-primary/5 rounded-3xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                    <SelectValue placeholder={t("all_classes")} />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-primary/10 rounded-3xl">
                    <SelectItem value="all" className="font-bold text-[10px] tracking-wide uppercase">{t("all_classes")}</SelectItem>
                    <SelectItem value="A" className="font-bold text-[10px] tracking-wide uppercase text-emerald-600">{t("employees_class_a")}</SelectItem>
                    <SelectItem value="B" className="font-bold text-[10px] tracking-wide uppercase text-amber-600">{t("employees_class_b")}</SelectItem>
                    <SelectItem value="C" className="font-bold text-[10px] tracking-wide uppercase text-rose-600">{t("employees_class_c")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-surface border border-primary/10 rounded-4xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted/50 rounded-2xl" />
              ))}
            </div>
          ) : !employees.length ? (
            <div className="p-20 text-center space-y-4">
              <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <p className="font-sans text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-50">{t("label_no_records")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/10 border-b border-primary/5 text-start">
                      <th className="px-6 py-5 w-10">
                        <Checkbox 
                          checked={selectedIds.size === employees.length && employees.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-5 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap text-start">{t("employees_col_name")}</th>
                      <th className="px-6 py-5 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap text-start">{t("employees_col_code")}</th>
                      <th className="px-6 py-5 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap text-start">{t("employees_col_department")}</th>
                      <th className="px-6 py-5 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap text-start">{t("employees_col_job_title")}</th>
                      <th className="px-6 py-5 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap text-start">{t("employees_col_class")}</th>
                      <th className="px-6 py-5 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap text-end">{t("common_actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {employees.map((emp) => (
                      <tr key={emp.id} className={`group hover:bg-primary/3 transition-colors ${selectedIds.has(emp.id) ? 'bg-primary/5' : ''}`}>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <Checkbox 
                            checked={selectedIds.has(emp.id)}
                            onCheckedChange={() => toggleSelect(emp.id)}
                          />
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <Link href={`/employees/${emp.id}`} className="group/link">
                            <p className="font-bold text-foreground text-sm tracking-tight group-hover/link:text-primary transition-colors uppercase">{emp.full_name}</p>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground opacity-40 mt-0.5 uppercase tracking-wider">
                              <ExternalLink className="h-3 w-3" /> {t("label_node_profile")}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-6 font-sans text-[11px] font-bold text-primary/60 whitespace-nowrap">{emp.employee_code ?? "—"}</td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <Badge variant="outline" className="rounded-full border-primary/10 bg-background text-[10px] font-bold text-muted-foreground py-0.5 px-3 uppercase">
                            {emp.department?.name ?? "UNASSIGNED"}
                          </Badge>
                        </td>
                        <td className="px-6 py-6 font-bold text-[10px] text-muted-foreground/60 tracking-wider uppercase whitespace-nowrap">{emp.job_title ?? "OPERATIVE"}</td>
                        <td className="px-6 py-6 whitespace-nowrap">{classBadge(emp.current_class, t)}</td>
                        <td className="px-6 py-6 text-end whitespace-nowrap">
                          {isAdmin && (
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => openEdit(emp)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50" onClick={() =>setDeleteTarget({ id: emp.id, name: emp.full_name ?? "" })}>
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

              {totalPages > 1 && (
                <div className="px-6 py-6 border-t border-primary/5 flex items-center justify-between bg-muted/5">
                  <p className="font-sans text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{t("employees_page_info", { page: data?.page ?? page, total: totalPages, count: data?.total ?? 0 })}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-full h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Forms & Dialogs */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-2xl bg-surface border-primary/20 rounded-4xl p-0 overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="p-10 border-b border-primary/5 bg-background/50 backdrop-blur-sm">
              <h2 className="font-headline font-bold text-4xl text-foreground tracking-tight uppercase">{editTarget ? t("action_reconfigure") : t("action_init_operative")}</h2>
              <p className="text-[11px] font-sans font-bold text-primary tracking-widest mt-2 uppercase opacity-60">{t("label_node_assignment")}</p>
            </div>
            
            <div className="p-12 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <Label className="font-bold text-[11px] text-muted-foreground tracking-widest uppercase ps-1">{t("field_name")} *</Label>
                <Input placeholder={t("field_name")} value={form.full_name} onChange={(e) =>setForm({ ...form, full_name: e.target.value })} className="h-14 bg-background border-primary/5 rounded-3xl font-sans text-sm font-bold text-foreground focus-visible:ring-primary/20" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[11px] text-muted-foreground tracking-widest uppercase ps-1">{t("field_department")} *</Label>
                <Select value={form.department_id || "none"} onValueChange={(v) =>setForm({ ...form, department_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-14 bg-background border-primary/5 rounded-3xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                    <SelectValue placeholder={t("select_dept")} />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-primary/10 rounded-3xl">
                    <SelectItem value="none" className="font-bold text-[10px] tracking-wide uppercase">{t("select_none")}</SelectItem>
                    {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-wide uppercase">{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[11px] text-muted-foreground tracking-widest uppercase ps-1">{t("field_employee_code")}</Label>
                <Input placeholder={t("field_employee_code")} value={form.employee_code} onChange={(e) =>setForm({ ...form, employee_code: e.target.value })} className="h-14 bg-background border-primary/5 rounded-3xl font-sans text-sm text-foreground" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[11px] text-muted-foreground tracking-widest uppercase ps-1">{t("field_job_title")}</Label>
                <Input placeholder={t("field_job_title")} value={form.job_title} onChange={(e) =>setForm({ ...form, job_title: e.target.value })} className="h-14 bg-background border-primary/5 rounded-3xl font-sans text-sm text-foreground" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[11px] text-muted-foreground tracking-widest uppercase ps-1">{t("field_email")}</Label>
                <Input type="email" placeholder={t("field_email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-14 bg-background border-primary/5 rounded-3xl font-sans text-sm text-foreground" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[11px] text-muted-foreground tracking-widest uppercase ps-1">{t("field_phone")}</Label>
                <Input placeholder={t("field_phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-14 bg-background border-primary/5 rounded-3xl font-sans text-sm text-foreground" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[11px] text-muted-foreground tracking-widest uppercase ps-1">{t("field_joined_date")}</Label>
                <Input type="date" value={form.joined_date} onChange={(e) =>setForm({ ...form, joined_date: e.target.value })} className="h-14 bg-background border-primary/5 rounded-3xl font-sans text-sm text-foreground uppercase" />
              </div>
            </div>
            
            <div className="p-10 border-t border-primary/5 bg-background/50 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-full font-bold text-[11px] tracking-wide uppercase text-muted-foreground hover:bg-primary/5 px-8 h-12" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase px-12 h-12 shadow-lg shadow-primary/20">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_operative")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent className="bg-surface border-primary/20 rounded-4xl shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-3xl text-foreground tracking-tight uppercase">
              {t("action_confirm_bulk_deactivate", { count: selectedIds.size })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans text-base mt-2">
              {t("employees_bulk_deactivate_desc", { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-full border-primary/10 bg-background text-foreground font-bold text-[11px] tracking-wide uppercase hover:bg-primary/5 h-12 px-10">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={deleting} className="rounded-full bg-rose-600 text-white font-bold text-[11px] tracking-wide uppercase hover:bg-rose-700 px-10 h-12 shadow-lg shadow-rose-600/20">
              {deleting ? t("action_purging") : t("action_confirm_deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-surface border-primary/20 rounded-4xl shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-3xl text-foreground tracking-tight uppercase">{t("action_confirm_deactivate")} — {deleteTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans text-base mt-2">{t("employees_deactivate_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-full border-primary/10 bg-background text-foreground font-bold text-[11px] tracking-wide uppercase hover:bg-primary/5 h-12 px-10">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-full bg-rose-600 text-white font-bold text-[11px] tracking-wide uppercase hover:bg-rose-700 px-10 h-12 shadow-lg shadow-rose-600/20">{deleting ? t("action_purging") : t("action_confirm_deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onSuccess={() => queryClient.invalidateQueries({ queryKey })}
        type="employees"
      />
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent className="bg-surface border-primary/20 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold uppercase tracking-tight">{t("confirm_bulk_delete")}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t("desc_bulk_delete_employees", { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full uppercase text-[10px] font-bold tracking-widest">{t("action_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 uppercase text-[10px] font-bold tracking-widest">
              {deleting ? t("action_deleting") : t("action_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
