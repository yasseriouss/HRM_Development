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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";

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

  function classBadge(cls: string | null | undefined) {
    if (cls === "A") return <Badge className="bg-emerald-600 text-white text-xs whitespace-nowrap">{t("dept_class_a")}</Badge>;
    if (cls === "B") return <Badge className="bg-amber-500 text-white text-xs whitespace-nowrap">B</Badge>;
    if (cls === "C") return <Badge className="bg-rose-600 text-white text-xs whitespace-nowrap">C</Badge>;
    return <Badge variant="secondary" className="text-xs whitespace-nowrap">—</Badge>;
  }

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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("employees_title")}</h2>
          <p className="text-muted-foreground">{t("employees_subtitle")}</p>
        </div>
        {isAdmin && (
          <Button size="sm" className="bg-primary text-primary-foreground gap-1 shrink-0" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> {t("employees_new")}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Input
          placeholder={t("search_by_name")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="max-w-sm bg-card border-border"
        />
        <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); resetPage(); }}>
          <SelectTrigger className="max-w-[220px] bg-card border-border">
            <SelectValue placeholder={t("all_departments")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_departments")}</SelectItem>
            {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); resetPage(); }}>
          <SelectTrigger className="max-w-[180px] bg-card border-border">
            <SelectValue placeholder={t("all_classes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_classes")}</SelectItem>
            <SelectItem value="A">{t("employees_class_a")}</SelectItem>
            <SelectItem value="B">{t("employees_class_b")}</SelectItem>
            <SelectItem value="C">{t("employees_class_c")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("employees_col_name"), t("employees_col_code"), t("employees_col_department"), t("employees_col_job_title"), t("employees_col_class"), ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !employees.length ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("employees_no_match")}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                  <th className="px-4 py-3 text-start font-medium">{t("employees_col_name")}</th>
                  <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("employees_col_code")}</th>
                  <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("employees_col_department")}</th>
                  <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("employees_col_job_title")}</th>
                  <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("employees_col_email")}</th>
                  <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("employees_col_class")}</th>
                  <th className="px-4 py-3 text-end font-medium whitespace-nowrap">{t("common_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/employees/${emp.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                        {emp.full_name}
                        <ExternalLink className="h-3 w-3 opacity-40" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{emp.employee_code ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{emp.department?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{emp.job_title ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{emp.email ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{classBadge(emp.current_class)}</td>
                    <td className="px-4 py-3 text-end whitespace-nowrap">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(emp)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget({ id: emp.id, name: emp.full_name ?? "" })}>
                            <Trash2 className="h-3.5 w-3.5" />
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t("employees_page_info", { page: data?.page ?? page, total: totalPages, count: data?.total ?? 0 })}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-border">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="border-border">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? t("employees_edit_title") : t("employees_create_title")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">{t("field_name")} *</Label>
              <Input placeholder={t("employees_name_placeholder")} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_department")} *</Label>
              <Select value={form.department_id || "none"} onValueChange={(v) => setForm({ ...form, department_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder={t("select_dept")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("select_none")}</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_employee_code")}</Label>
              <Input placeholder={t("employees_code_placeholder")} value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_job_title")}</Label>
              <Input placeholder={t("employees_title_placeholder")} value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_email")}</Label>
              <Input type="email" placeholder="ahmed@ebdaa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_phone")}</Label>
              <Input placeholder={t("employees_phone_placeholder")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_joined_date")}</Label>
              <Input type="date" value={form.joined_date} onChange={(e) => setForm({ ...form, joined_date: e.target.value })} className="bg-background border-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? t("common_saving") : editTarget ? t("common_save_changes") : t("common_create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("employees_deactivate_confirm", { name: deleteTarget?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("employees_deactivate_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? t("common_deactivating") : t("common_deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
