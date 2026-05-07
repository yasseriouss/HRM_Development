import { useState } from "react";
import { Link } from "wouter";
import { useListDepartments } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";

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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("departments_title")}</h2>
          <p className="text-muted-foreground">{t("departments_subtitle")}</p>
        </div>
        {isAdmin && (
          <Button size="sm" className="bg-primary text-primary-foreground gap-1 shrink-0" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> {t("departments_new")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("field_name"), t("field_code"), t("departments_col_employees"), t("departments_col_manager_email"), ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !departments?.length ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("departments_no_data")}{isAdmin ? t("departments_no_data_admin") : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">{t("field_name")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_code")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("departments_col_description")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("departments_col_manager_email")}</th>
                <th className="px-4 py-3 text-end font-medium whitespace-nowrap">{t("departments_col_employees")}</th>
                <th className="px-4 py-3 text-end font-medium whitespace-nowrap">{t("common_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/departments/${dept.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                      {dept.name}
                      <ExternalLink className="h-3 w-3 opacity-40" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{dept.code ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{dept.description ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{dept.manager_email ?? "—"}</td>
                  <td className="px-4 py-3 text-end whitespace-nowrap">
                    <span className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {dept.employee_count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end whitespace-nowrap">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(dept)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget({ id: dept.id, name: dept.name })}>
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
      )}

      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? t("departments_edit_title") : t("departments_create_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_name")} *</Label>
              <Input placeholder="e.g. Assembly" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_code")}</Label>
              <Input placeholder="e.g. ASM" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_description")}</Label>
              <Input placeholder="Brief description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("departments_col_manager_email")}</Label>
              <Input type="email" placeholder="manager@ebdaa.com" value={form.manager_email} onChange={(e) => setForm({ ...form, manager_email: e.target.value })} className="bg-background border-border" />
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
            <AlertDialogTitle>{t("departments_delete_confirm", { name: deleteTarget?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("departments_delete_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? t("common_deleting") : t("common_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
