import { useState } from "react";
import { useListSkills, useListDepartments } from "@workspace/api-client-react";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";

const CRITICALITIES = ["Low", "Medium", "High", "Critical"] as const;
type Criticality = (typeof CRITICALITIES)[number];

function critBadge(crit: string) {
  const map: Record<string, string> = {
    Critical: "bg-rose-700 text-white",
    High: "bg-amber-600 text-white",
    Medium: "bg-sky-700 text-white",
    Low: "bg-zinc-600 text-zinc-200",
  };
  return <Badge className={`text-xs whitespace-nowrap ${map[crit] ?? ""}`}>{crit}</Badge>;
}

interface SkillForm {
  name: string;
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
  department?: { name: string } | null;
};

const emptyForm = (): SkillForm => ({
  name: "", code: "", department_id: "", category: "", weight: "1",
  criticality: "Medium", description: "",
});

export default function SkillsPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "super_admin";
  const t = useT();

  const [deptFilter, setDeptFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<SkillItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<SkillForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: departments } = useListDepartments({ request: { headers } });
  const { data: skills, isLoading, queryKey } = useListSkills(
    { department_id: deptFilter !== "all" ? deptFilter : undefined },
    { request: { headers } },
  );

  const openCreate = () => { setForm(emptyForm()); setShowCreate(true); };
  const openEdit = (sk: SkillItem) => {
    setForm({
      name: sk.name,
      code: sk.code ?? "",
      department_id: sk.department_id ?? "",
      category: sk.category ?? "",
      weight: String(sk.weight ?? 1),
      criticality: (sk.criticality as Criticality) ?? "Medium",
      description: sk.description ?? "",
    });
    setEditTarget(sk);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.department_id || !form.weight || !form.criticality) {
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("skills_title")}</h2>
          <p className="text-muted-foreground">{t("skills_subtitle")}</p>
        </div>
        {isAdmin && (
          <Button size="sm" className="bg-primary text-primary-foreground gap-1 shrink-0" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> {t("skills_new")}
          </Button>
        )}
      </div>

      <Select value={deptFilter} onValueChange={setDeptFilter}>
        <SelectTrigger className="max-w-[280px] bg-card border-border">
          <SelectValue placeholder={t("filter_by_dept")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("all_departments")}</SelectItem>
          {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[t("field_name"), t("field_code"), t("skills_col_category"), t("field_department"), t("skills_col_weight"), t("skills_col_criticality"), ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !skills?.length ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("skills_no_data")}{isAdmin ? t("skills_no_data_admin") : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">{t("field_name")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_code")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("skills_col_category")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("field_department")}</th>
                <th className="px-4 py-3 text-end font-medium whitespace-nowrap">{t("skills_col_weight")}</th>
                <th className="px-4 py-3 text-start font-medium whitespace-nowrap">{t("skills_col_criticality")}</th>
                <th className="px-4 py-3 text-end font-medium whitespace-nowrap">{t("common_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((sk) => (
                <tr key={sk.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {sk.name}
                    {sk.description && (
                      <p className="text-xs text-muted-foreground font-normal mt-0.5 max-w-xs truncate">{sk.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{sk.code ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{sk.category ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {(sk as { department?: { name: string } | null }).department?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-end font-semibold text-primary whitespace-nowrap">{sk.weight}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{critBadge(sk.criticality)}</td>
                  <td className="px-4 py-3 text-end whitespace-nowrap">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(sk)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget({ id: sk.id, name: sk.name })}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? t("skills_edit_title") : t("skills_create_title")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">{t("field_name")} *</Label>
              <Input placeholder={t("skills_name_placeholder")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_code")}</Label>
              <Input placeholder={t("skills_code_placeholder")} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("field_department")} *</Label>
              <Select value={form.department_id || "none"} onValueChange={(v) => setForm({ ...form, department_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-background border-border"><SelectValue placeholder={t("select_none")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("select_none")}</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("skills_col_category")}</Label>
              <Input placeholder={t("skills_category_placeholder")} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("skills_col_weight")} *</Label>
              <Input type="number" min="1" max="10" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("skills_col_criticality")} *</Label>
              <Select value={form.criticality} onValueChange={(v) => setForm({ ...form, criticality: v as Criticality })}>
                <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CRITICALITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">{t("field_description")}</Label>
              <Input placeholder={t("skills_desc_placeholder")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-background border-border" />
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
            <AlertDialogTitle>{t("skills_deactivate_confirm", { name: deleteTarget?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("skills_deactivate_desc")}</AlertDialogDescription>
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
