import { useState } from "react";
import { Link } from "wouter";
import { useListEmployees, useListDepartments } from "@hrm-development/api-client-react";
import type { Employee, ListEmployeesCurrentClass } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ExternalLink, Download, Upload, Users, Shield, Search, Filter, HardDrive } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";
import { ImportDialog } from "@/components/import-dialog";

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

function classBadge(cls: string | null | undefined, t: any) {
  if (cls === "A") return <Badge variant="outline" className="rounded-none border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase">{t("dept_class_a")}</Badge>;
  if (cls === "B") return <Badge variant="outline" className="rounded-none border-amber-500/30 bg-amber-500/10 text-amber-500 font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase">{t("employees_class_b")}</Badge>;
  if (cls === "C") return <Badge variant="outline" className="rounded-none border-rose-500/30 bg-rose-500/10 text-rose-500 font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase">{t("employees_class_c")}</Badge>;
  return <Badge variant="outline" className="rounded-none border-white/10 bg-white/5 text-secondary/30 font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase">{t("label_unclassified")}</Badge>;
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
  const [showImport, setShowImport] = useState(false);

  const { data: departments } = useListDepartments({ request: { headers } });

  const { data, isLoading, queryKey } = useListEmployees(
    {
      search: search || undefined,
      current_class: classFilter !== "all" ? (classFilter as ListEmployeesCurrentClass) : undefined,
      department_id: deptFilter !== "all" ? deptFilter : undefined,
      page,
      page_size: pageSize,
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
    <div className="space-y-8 pb-20 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header - Industrial Style */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">{t("label_personnel_registry")}</span>
            </div>
            <h2 className="text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {t("employees_title")}
            </h2>
            <p className="text-secondary/40 font-medium border-s-2 border-primary/20 ps-4">{t("employees_subtitle")}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 text-white font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto" onClick={() => exportToPDF({
              title: t("employees_title"),
              filename: "Employees_List",
              headers: [t("field_name"), t("field_code"), t("field_department"), t("field_job_title"), t("field_class")],
              rows: (employees ?? []).map(e => [e.full_name ?? "â€”", e.employee_code ?? "â€”", e.department?.name ?? "â€”", e.job_title ?? "â€”", e.current_class ?? "â€”"])
            })}>
              <Download className="h-4 w-4 me-2" /> PDF
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 text-white font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto" onClick={() => exportToExcel({
              title: t("employees_title"),
              filename: "Employees_List",
              headers: [t("field_name"), t("field_code"), t("field_department"), t("field_job_title"), t("field_class")],
              rows: (employees ?? []).map(e => [e.full_name ?? "â€”", e.employee_code ?? "â€”", e.department?.name ?? "â€”", e.job_title ?? "â€”", e.current_class ?? "â€”"])
            })}>
              <Download className="h-4 w-4 me-2" /> EXCEL
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 text-white font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto" onClick={() => setShowImport(true)}>
                  <Upload className="h-4 w-4 me-2" /> {t("action_import_csv")}
                </Button>
                <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto hover:bg-primary/90" onClick={openCreate}>
                  <Plus className="h-4 w-4 me-2" /> {t("action_register_operative")}
                </Button>
              </>
            )}
          </div>
        </div>
        <CornerMarks />
      </div>

      {/* Control Panel */}
      <Card className="bg-[#121212] border border-white/10 rounded-none relative">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/30" />
              <Input 
                placeholder={t("search_by_name_or_code")} 
                className="ps-12 h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white placeholder:text-secondary/20 focus-visible:ring-primary/50"
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              />
            </div>
            <div className="w-full md:w-64 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/30" />
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); resetPage(); }}>
                <SelectTrigger className="ps-12 h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                  <SelectValue placeholder={t("all_departments")} />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                  <SelectItem value="all" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{t("all_departments")}</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-56 relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/30" />
              <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); resetPage(); }}>
                <SelectTrigger className="ps-12 h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                  <SelectValue placeholder={t("all_classes")} />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                  <SelectItem value="all" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{t("all_classes")}</SelectItem>
                  <SelectItem value="A" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20 text-emerald-500">{t("employees_class_a")}</SelectItem>
                  <SelectItem value="B" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20 text-amber-500">{t("employees_class_b")}</SelectItem>
                  <SelectItem value="C" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20 text-rose-500">{t("employees_class_c")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="relative border border-white/10 bg-[#0A0A0A] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
             {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-none" />
             ))}
          </div>
        ) : !employees.length ? (
          <div className="p-20 text-center space-y-4">
            <HardDrive className="h-12 w-12 text-secondary/10 mx-auto" />
            <p className="font-mono text-xs text-secondary/30 uppercase tracking-[0.3em]">{t("label_no_records")}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("employees_col_name")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("employees_col_code")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("employees_col_department")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("employees_col_job_title")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("employees_col_class")}</th>
                    <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap text-end">{t("common_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="group hover:bg-white/2 transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <Link href={`/employees/${emp.id}`} className="group/link">
                          <p className="font-headline font-black text-white text-base tracking-tight group-hover/link:text-primary transition-colors uppercase">
                            {emp.full_name}
                          </p>
                          <div className="flex items-center gap-1 text-[9px] font-mono text-secondary/20 mt-1 uppercase">
                            <ExternalLink className="h-3 w-3" /> {t("label_node_profile")}
                          </div>
                        </Link>
                      </td>
                      <td className="px-8 py-6 font-mono text-[11px] text-primary/60 whitespace-nowrap">{emp.employee_code ?? "—"}</td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <Badge variant="outline" className="rounded-none border-white/5 bg-white/5 text-[9px] font-mono text-secondary/60 py-1 uppercase px-2">
                          {emp.department?.name ?? "UNASSIGNED"}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 font-headline font-black text-[10px] text-secondary/30 tracking-widest uppercase whitespace-nowrap">{emp.job_title ?? "OPERATIVE"}</td>
                      <td className="px-8 py-6 whitespace-nowrap">{classBadge(emp.current_class, t)}</td>
                      <td className="px-8 py-6 text-end whitespace-nowrap">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none border border-transparent hover:border-primary/30 hover:bg-primary/5 text-secondary/30 hover:text-primary" onClick={() => openEdit(emp)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none border border-transparent hover:border-rose-500/30 hover:bg-rose-500/5 text-secondary/30 hover:text-rose-500" onClick={() => setDeleteTarget({ id: emp.id, name: emp.full_name ?? "" })}>
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
              <div className="p-8 border-t border-white/10 flex items-center justify-between bg-white/5">
                <p className="font-mono text-[10px] text-secondary/30 uppercase tracking-widest">
                  {t("employees_page_info", { page: data?.page ?? page, total: totalPages, count: data?.total ?? 0 })}
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 h-10 w-10 p-0 text-white">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 h-10 w-10 p-0 text-white">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Forms & Dialogs */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-2xl bg-[#0A0A0A] border-2 border-primary/30 rounded-none p-0 overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <div className="relative z-10">
            <div className="p-8 border-b border-white/10 bg-white/5">
              <h2 className="font-headline font-black text-2xl text-white uppercase tracking-tighter">
                {editTarget ? t("action_reconfigure") : t("action_init_operative")}
              </h2>
              <p className="text-[10px] font-mono text-primary tracking-[0.3em] mt-2 uppercase">{t("label_node_assignment")}</p>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_name")} *</Label>
                <Input placeholder={t("field_name")} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_department")} *</Label>
                <Select value={form.department_id || "none"} onValueChange={(v) => setForm({ ...form, department_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                    <SelectValue placeholder={t("select_dept")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                    <SelectItem value="none" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{t("select_none")}</SelectItem>
                    {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_employee_code")}</Label>
                <Input placeholder={t("field_employee_code")} value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_job_title")}</Label>
                <Input placeholder={t("field_job_title")} value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_email")}</Label>
                <Input type="email" placeholder={t("field_email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_phone")}</Label>
                <Input placeholder={t("field_phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_joined_date")}</Label>
                <Input type="date" value={form.joined_date} onChange={(e) => setForm({ ...form, joined_date: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white uppercase" />
              </div>
            </div>
            
            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end gap-4">
              <Button variant="ghost" className="rounded-none font-headline font-black text-[10px] tracking-widest uppercase text-white hover:bg-white/5" onClick={() => { setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase px-10 py-6 h-auto">
                {saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_operative")}
              </Button>
            </div>
          </div>
          <CornerMarks />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-[#0A0A0A] border-2 border-rose-500/30 rounded-none text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{t("action_confirm_deactivate")} — {deleteTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary/40 font-mono text-xs uppercase tracking-widest">{t("employees_deactivate_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-none border-white/10 bg-white/5 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-white/10 h-auto py-4 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-none bg-rose-600 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-rose-700 px-8 h-auto py-4">
              {deleting ? t("action_purging") : t("action_confirm_deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
          <CornerMarks color="rose" />
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
