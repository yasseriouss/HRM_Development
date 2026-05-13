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
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ExternalLink, Download, Upload, Users, Search, Filter, X, ArrowRight, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { exportToPDF, exportToExcel } from "@modules/skill-matrix/lib/export-utils";
import { ImportDialog } from "@modules/skill-matrix/components/import-dialog";
import { useFactory } from "@shared/contexts/FactoryContext";
import { cn } from "@shared/utils/cn";

function classBadge(cls: string | null | undefined, t: any) {
  const map: Record<string, string> = {
    A: "bg-green-50 text-green-600 border-green-100",
    B: "bg-amber-50 text-amber-600 border-amber-100",
    C: "bg-red-50 text-red-600 border-red-100",
  };
  const labelMap: Record<string, string> = {
    A: t("dept_class_a"),
    B: t("employees_class_b"),
    C: t("employees_class_c"),
  };

  if (!cls || !map[cls]) {
     return <Badge variant="outline" className="rounded-full border-zinc-100 bg-zinc-50 text-zinc-400 font-bold text-[9px] tracking-widest px-3 py-1 uppercase">{t("label_unclassified")}</Badge>;
  }

  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border shadow-sm", map[cls])}>
      {labelMap[cls]}
    </Badge>
  );
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
    <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{t("label_personnel_registry")}</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none">
            {t("employees_title")}
          </h1>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl">{t("employees_subtitle")}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" className="rounded-full border-zinc-100 bg-white text-zinc-900 font-bold text-[11px] tracking-widest uppercase px-8 h-14 hover:shadow-lg transition-all" onClick={() => exportToPDF({
            title: t("employees_title"),
            filename: "Employees_List",
            headers: [t("field_name"), t("field_code"), t("field_department"), t("field_job_title"), t("field_class")],
            rows: (employees ?? []).map(e => [e.full_name ?? "—", e.employee_code ?? "—", e.department?.name ?? "—", e.job_title ?? "—", e.current_class ?? "—"])
          })}>
            <Download className="h-4 w-4 me-3" /> PDF
          </Button>
          <Button variant="outline" className="rounded-full border-zinc-100 bg-white text-zinc-900 font-bold text-[11px] tracking-widest uppercase px-8 h-14 hover:shadow-lg transition-all" onClick={() => exportToExcel({
            title: t("employees_title"),
            filename: "Employees_List",
            headers: [t("field_name"), t("field_code"), t("field_department"), t("field_job_title"), t("field_class")],
            rows: (employees ?? []).map(e => [e.full_name ?? "—", e.employee_code ?? "—", e.department?.name ?? "—", e.job_title ?? "—", e.current_class ?? "—"])
          })}>
            <Download className="h-4 w-4 me-3" /> EXCEL
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" className="rounded-full border-zinc-100 bg-white text-zinc-900 font-bold text-[11px] tracking-widest uppercase px-8 h-14 hover:shadow-lg transition-all" onClick={() => setShowImport(true)}>
                <Upload className="h-4 w-4 me-3" /> IMPORT
              </Button>
              <Button className="rounded-full bg-zinc-900 text-white font-bold text-[11px] tracking-widest uppercase px-10 h-14 shadow-2xl shadow-zinc-200 hover:scale-[1.02] transition-all" onClick={openCreate}>
                <UserPlus className="h-4 w-4 me-3" /> {t("action_register_operative")}
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
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              />
            </div>
            <div className="w-full lg:w-72">
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); resetPage(); }}>
                <SelectTrigger className="h-16 bg-white border-zinc-100 rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                  <SelectValue placeholder={t("all_departments")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                  <SelectItem value="all" className="font-bold text-[10px] tracking-widest uppercase">{t("all_departments")}</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-widest uppercase">{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-64">
              <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); resetPage(); }}>
                <SelectTrigger className="h-16 bg-white border-zinc-100 rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                  <SelectValue placeholder={t("all_classes")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                  <SelectItem value="all" className="font-bold text-[10px] tracking-widest uppercase">{t("all_classes")}</SelectItem>
                  <SelectItem value="A" className="font-bold text-[10px] tracking-widest uppercase text-green-600">{t("employees_class_a")}</SelectItem>
                  <SelectItem value="B" className="font-bold text-[10px] tracking-widest uppercase text-amber-600">{t("employees_class_b")}</SelectItem>
                  <SelectItem value="C" className="font-bold text-[10px] tracking-widest uppercase text-red-600">{t("employees_class_c")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <Users className="h-5 w-5" />
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

      {/* Table Section */}
      <div className="bg-white border border-zinc-100 rounded-4xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 space-y-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-zinc-50 rounded-3xl" />
            ))}
          </div>
        ) : !employees.length ? (
          <div className="p-32 text-center space-y-6">
            <div className="h-24 w-24 bg-zinc-50 rounded-4xl flex items-center justify-center mx-auto text-zinc-200">
              <Users className="h-12 w-12" />
            </div>
            <p className="text-lg font-bold font-comfortaa text-zinc-300 uppercase tracking-widest">{t("label_no_records")}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-50">
                    <th className="px-10 py-8 w-10">
                      <Checkbox 
                        checked={selectedIds.size === employees.length && employees.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="rounded-lg border-zinc-200 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                      />
                    </th>
                    <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-start">{t("employees_col_name")}</th>
                    <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-start">{t("employees_col_code")}</th>
                    <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-start">{t("employees_col_department")}</th>
                    <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-start">{t("employees_col_job_title")}</th>
                    <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-start">{t("employees_col_class")}</th>
                    <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-end">{t("common_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {employees.map((emp) => (
                    <tr key={emp.id} className={cn("group transition-all hover:bg-zinc-50/50", selectedIds.has(emp.id) ? "bg-zinc-50" : "")}>
                      <td className="px-10 py-10 whitespace-nowrap">
                        <Checkbox 
                          checked={selectedIds.has(emp.id)}
                          onCheckedChange={() => toggleSelect(emp.id)}
                          className="rounded-lg border-zinc-200 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                        />
                      </td>
                      <td className="px-10 py-10 whitespace-nowrap">
                        <Link href={`/skill-matrix/employees/${emp.id}`} className="block">
                          <p className="font-bold text-zinc-900 text-lg tracking-tight group-hover:translate-x-1 transition-transform font-comfortaa">{emp.full_name}</p>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-300 mt-2 uppercase tracking-widest">
                            <ExternalLink className="h-3 w-3" /> {t("label_node_profile")}
                          </div>
                        </Link>
                      </td>
                      <td className="px-10 py-10 font-bold text-[11px] text-zinc-400 tracking-widest whitespace-nowrap">{emp.employee_code ?? "—"}</td>
                      <td className="px-10 py-10 whitespace-nowrap">
                        <Badge variant="outline" className="rounded-full border-zinc-100 bg-white text-[10px] font-bold text-zinc-500 py-1.5 px-4 uppercase tracking-tight shadow-xs">
                          {emp.department?.name ?? "UNASSIGNED"}
                        </Badge>
                      </td>
                      <td className="px-10 py-10 font-bold text-[10px] text-zinc-400 tracking-widest uppercase whitespace-nowrap">{emp.job_title ?? "OPERATIVE"}</td>
                      <td className="px-10 py-10 whitespace-nowrap">{classBadge(emp.current_class, t)}</td>
                      <td className="px-10 py-10 text-end whitespace-nowrap">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100" onClick={() => openEdit(emp)}>
                              <Pencil className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl text-zinc-400 hover:text-red-600 hover:bg-red-50" onClick={() =>setDeleteTarget({ id: emp.id, name: emp.full_name ?? "" })}>
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

            {totalPages > 1 && (
              <div className="px-10 py-10 border-t border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("employees_page_info", { page: data?.page ?? page, total: totalPages, count: data?.total ?? 0 })}</p>
                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-2xl h-12 w-12 p-0 hover:bg-white hover:shadow-lg transition-all disabled:opacity-30">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-2xl h-12 w-12 p-0 hover:bg-white hover:shadow-lg transition-all disabled:opacity-30">
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Registration/Edit Dialog */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-3xl bg-white border border-zinc-100 rounded-4xl p-0 overflow-hidden shadow-2xl">
          <div className="p-12 border-b border-zinc-50 bg-zinc-50/30">
            <h2 className="font-bold text-4xl text-zinc-900 tracking-tighter uppercase font-comfortaa">{editTarget ? t("action_reconfigure") : t("action_init_operative")}</h2>
            <p className="text-[10px] font-bold text-zinc-400 tracking-[0.3em] mt-4 uppercase">{t("label_node_assignment")}</p>
          </div>
          
          <div className="p-16 grid grid-cols-2 gap-10">
            <div className="col-span-2 space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_name")} *</Label>
              <Input placeholder={t("field_name")} value={form.full_name} onChange={(e) =>setForm({ ...form, full_name: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_department")} *</Label>
              <Select value={form.department_id || "none"} onValueChange={(v) =>setForm({ ...form, department_id: v === "none" ? "" : v })}>
                <SelectTrigger className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-[11px] tracking-widest text-zinc-900 uppercase">
                  <SelectValue placeholder={t("select_dept")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                  <SelectItem value="none" className="font-bold text-[10px] tracking-widest uppercase">{t("select_none")}</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-widest uppercase">{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_employee_code")}</Label>
              <Input placeholder={t("field_employee_code")} value={form.employee_code} onChange={(e) =>setForm({ ...form, employee_code: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_job_title")}</Label>
              <Input placeholder={t("field_job_title")} value={form.job_title} onChange={(e) =>setForm({ ...form, job_title: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-[11px] text-zinc-400 tracking-widest uppercase ps-1">{t("field_email")}</Label>
              <Input type="email" placeholder={t("field_email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-zinc-900 focus-visible:ring-zinc-100" />
            </div>
          </div>
          
          <div className="p-12 border-t border-zinc-50 bg-zinc-50/30 flex justify-end gap-6">
            <Button variant="ghost" className="rounded-full font-bold text-[11px] tracking-widest uppercase text-zinc-400 hover:text-zinc-900 hover:bg-white px-10 h-14" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full bg-zinc-900 text-white font-bold text-[11px] tracking-widest uppercase px-14 h-14 shadow-2xl shadow-zinc-200">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_operative")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-white border border-zinc-100 rounded-4xl shadow-2xl p-12">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-3xl text-zinc-900 tracking-tighter uppercase font-comfortaa">{t("action_confirm_deactivate")} — {deleteTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-lg mt-4">{t("employees_deactivate_desc")}</AlertDialogDescription>
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
        type="employees"
      />
    </div>
  );
}
