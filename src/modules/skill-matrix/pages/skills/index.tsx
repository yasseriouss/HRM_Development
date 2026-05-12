import { useState } from "react";
import { useListSkills, useListDepartments } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Download, Search, Filter, Shield, Activity, HardDrive, Cpu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { exportToPDF, exportToExcel } from "@modules/skill-matrix/lib/export-utils";
import { ImportDialog } from "@modules/skill-matrix/components/import-dialog";
import { Upload } from "lucide-react";
import { useFactory } from "@shared/contexts/FactoryContext";

const CRITICALITIES = ["Low", "Medium", "High", "Critical"] as const;
type Criticality = (typeof CRITICALITIES)[number];

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

function critBadge(crit: string, t: (k: any) => string) {
  const map: Record<string, { bg: string; text: string; border: string; key: string }> = {
    Critical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", key: "crit_critical" },
    High: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", key: "crit_high" },
    Medium: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", key: "crit_medium" },
    Low: { bg: "bg-stone-50", text: "text-stone-700", border: "border-stone-200", key: "crit_low" },
  };
  const config = map[crit] ?? map.Low;
  return (
    <Badge variant="outline" className={`rounded-full font-sans text-[10px] font-bold border ${config.border} ${config.bg} ${config.text} px-2.5 py-0.5`}>
      {t(config.key)}
    </Badge>
  );
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
  const { activeFactoryId } = useFactory();

  const [deptFilter, setDeptFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<SkillItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<SkillForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    <div className="space-y-10 pb-20 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header - Editorial Style */}
      <div className="relative pt-12 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/20" />
                <span className="font-sans font-bold tracking-widest text-[10px] text-primary uppercase">{t("label_skill_repository")}</span>
              </div>
              <h1 className="text-6xl font-headline font-bold tracking-tight text-foreground leading-none">
                {t("skills_title")}
              </h1>
              <p className="text-muted-foreground font-medium text-lg max-w-2xl">{t("skills_subtitle")}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="rounded-full border-primary/10 bg-surface/50 hover:bg-surface text-foreground font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => exportToPDF({
                title: t("skills_title"),
                filename: "Skills_Library",
                headers: [t("field_name"), t("field_code"), t("skills_col_category"), t("field_department"), t("skills_col_weight"), t("skills_col_criticality")],
                rows: (skills ?? []).map(sk => [sk.name, sk.code ?? "—", sk.category ?? "—", sk.department?.name ?? "—", sk.weight ?? 0, sk.criticality])
              })}>
                <Download className="h-4 w-4 me-2 opacity-50" /> PDF
              </Button>
              <Button variant="outline" className="rounded-full border-primary/10 bg-surface/50 hover:bg-surface text-foreground font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => exportToExcel({
                title: t("skills_title"),
                filename: "Skills_Library",
                headers: [t("field_name"), t("field_code"), t("skills_col_category"), t("field_department"), t("skills_col_weight"), t("skills_col_criticality")],
                rows: (skills ?? []).map(sk => [sk.name, sk.code ?? "—", sk.category ?? "—", sk.department?.name ?? "—", sk.weight ?? 0, sk.criticality])
              })}>
                <Download className="h-4 w-4 me-2 opacity-50" /> EXCEL
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" className="rounded-full border-primary/10 bg-surface/50 hover:bg-surface text-foreground font-bold text-[11px] tracking-wide uppercase px-6 h-12" onClick={() => setShowImport(true)}>
                    <Upload className="h-4 w-4 me-2 opacity-50" /> {t("action_import_csv")}
                  </Button>
                  <Button className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={openCreate}>
                    <Plus className="h-4 w-4 me-2" /> {t("action_register_skill")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="max-w-7xl mx-auto px-4">
        <Card className="bg-surface border-primary/10 rounded-2xl shadow-sm overflow-hidden border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                <Input 
                  placeholder={t("search_by_name_or_code")} 
                  className="ps-10 h-12 bg-background border-primary/5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64 relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="ps-10 h-12 bg-background border-primary/5 rounded-xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                    <SelectValue placeholder={t("filter_by_dept")} />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-primary/10 rounded-xl">
                    <SelectItem value="all" className="font-bold text-[10px] tracking-wide uppercase">{t("all_departments")}</SelectItem>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-wide uppercase">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
          {/* Data Table */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-surface border border-primary/10 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-muted/50 rounded-xl" />
              ))}
            </div>
          ) : !filteredSkills?.length ? (
            <div className="p-20 text-center space-y-4">
              <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                <HardDrive className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <p className="font-sans text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-50">{t("label_no_records")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-primary/5">
                    <th className="px-6 py-4 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap">{t("field_name")}</th>
                    <th className="px-6 py-4 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap">{t("field_code")}</th>
                    <th className="px-6 py-4 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap">{t("skills_col_category")}</th>
                    <th className="px-6 py-4 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap">{t("field_department")}</th>
                    <th className="px-6 py-4 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap text-center">{t("skills_col_weight")}</th>
                    <th className="px-6 py-4 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap">{t("skills_col_criticality")}</th>
                    <th className="px-6 py-4 font-bold text-[10px] tracking-wider text-muted-foreground uppercase whitespace-nowrap text-end">{t("common_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {filteredSkills.map((sk) => (
                    <tr key={sk.id} className="group hover:bg-primary/[0.02] transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                          <div>
                            <p className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors uppercase">{sk.name}</p>
                            {sk.description && (
                              <p className="text-[10px] font-medium text-muted-foreground mt-0.5 max-w-xs truncate">{sk.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-sans text-[11px] font-bold text-primary/60 whitespace-nowrap">{sk.code ?? "—"}</td>
                      <td className="px-6 py-5 font-bold text-[10px] text-muted-foreground/60 tracking-wider uppercase whitespace-nowrap">{sk.category ?? "SYSTEM"}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <Badge variant="outline" className="rounded-full border-primary/10 bg-background text-[10px] font-bold text-muted-foreground py-0.5 px-2.5 uppercase">
                          {(sk as any).department?.name ?? "GENERAL"}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-primary/10 bg-background font-sans font-bold text-sm text-foreground">
                          {sk.weight}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">{critBadge(sk.criticality, t)}</td>
                      <td className="px-6 py-5 text-end whitespace-nowrap">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => openEdit(sk)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-600 hover:bg-rose-50" onClick={() => setDeleteTarget({ id: sk.id, name: sk.name })}>
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
        </div>
      </div>
    </div>

      {/* Forms & Dialogs */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-2xl bg-surface border-primary/20 rounded-3xl p-0 overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="p-8 border-b border-primary/5 bg-background/50 backdrop-blur-sm">
              <h2 className="font-headline font-bold text-3xl text-foreground tracking-tight uppercase">{editTarget ? t("action_reconfigure") : t("action_init_asset")}</h2>
              <p className="text-[10px] font-sans font-bold text-primary tracking-widest mt-2 uppercase opacity-50">NODE REGISTRATION_v2.0</p>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_name")} *</Label>
                <Input placeholder="ASSET IDENTIFIER" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm font-bold text-foreground focus-visible:ring-primary/20" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_code")}</Label>
                <Input placeholder="HEX UID" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_department")} *</Label>
                <Select value={form.department_id || "none"} onValueChange={(v) =>setForm({ ...form, department_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-14 bg-background border-primary/5 rounded-xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                    <SelectValue placeholder={t("select_none")} />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-primary/10 rounded-xl">
                    <SelectItem value="none" className="font-bold text-[10px] tracking-wide uppercase">{t("select_none")}</SelectItem>
                    {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-bold text-[10px] tracking-wide uppercase">{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("skills_col_category")}</Label>
                <Input placeholder="SYSTEM CLASS" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground" />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("skills_col_weight")} *</Label>
                <Input type="number" min="1" max="10" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-lg font-bold text-primary" />
              </div>
              <div className="col-span-2 space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("skills_col_criticality")} *</Label>
                <Select value={form.criticality} onValueChange={(v) => setForm({ ...form, criticality: v as Criticality })}>
                  <SelectTrigger className="h-14 bg-background border-primary/5 rounded-xl font-bold text-[11px] tracking-wide text-foreground uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-primary/10 rounded-xl">
                    {CRITICALITIES.map((c) => <SelectItem key={c} value={c} className="font-bold text-[10px] tracking-wide uppercase">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-3">
                <Label className="font-bold text-[10px] text-muted-foreground tracking-widest uppercase">{t("field_description")}</Label>
                <Input placeholder="TECHNICAL SPECIFICATIONS..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-14 bg-background border-primary/5 rounded-xl font-sans text-sm text-foreground" />
              </div>
            </div>
            
            <div className="p-8 border-t border-primary/5 bg-background/50 flex justify-end gap-3">
              <Button variant="ghost" className="rounded-full font-bold text-[11px] tracking-wide uppercase text-muted-foreground hover:bg-primary/5" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase px-10 h-12 shadow-lg shadow-primary/20">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_asset")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-surface border-primary/20 rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-2xl text-foreground tracking-tight uppercase">{t("skills_deactivate_confirm", { name: deleteTarget?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans text-sm">{t("skills_deactivate_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-full border-primary/10 bg-background text-foreground font-bold text-[11px] tracking-wide uppercase hover:bg-primary/5 h-12 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-full bg-rose-600 text-white font-bold text-[11px] tracking-wide uppercase hover:bg-rose-700 px-8 h-12 shadow-lg shadow-rose-600/20">{deleting ? t("action_purging") : t("action_confirm_deactivate")}
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
