import { useState } from "react";
import { useListSkills, useListDepartments } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Download, Search, Filter, Shield, Activity, HardDrive, Cpu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";
import { ImportDialog } from "@/components/import-dialog";
import { Upload } from "lucide-react";

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
  const map: Record<string, { bg: string; text: string; key: string }>= {
    Critical: { bg: "bg-rose-500/10", text: "text-rose-500", key: "crit_critical" },
    High: { bg: "bg-amber-500/10", text: "text-amber-500", key: "crit_high" },
    Medium: { bg: "bg-sky-500/10", text: "text-sky-500", key: "crit_medium" },
    Low: { bg: "bg-zinc-500/10", text: "text-zinc-500", key: "crit_low" },
  };
  const config = map[crit] ?? map.Low;
  return (
    <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black border-current/20 px-2 py-0.5 ${config.bg} ${config.text} tracking-widest`}>
      {t(config.key)}
    </Badge>);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<SkillItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<SkillForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { data: departments } = useListDepartments({ request: { headers } });
  const { data: skills, isLoading, queryKey } = useListSkills(
    { department_id: deptFilter !== "all" ? deptFilter : undefined },
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
    <div className="space-y-8 pb-20 font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header - Industrial Style */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">{t("label_skill_repository")}</span>
            </div>
            <h2 className="text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">{t("skills_title")}
            </h2>
            <p className="text-secondary/40 font-medium border-s-2 border-primary/20 ps-4">{t("skills_subtitle")}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 text-white font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto" onClick={() =>exportToPDF({
              title: t("skills_title"),
              filename: "Skills_Library",
              headers: [t("field_name"), t("field_code"), t("skills_col_category"), t("field_department"), t("skills_col_weight"), t("skills_col_criticality")],
              rows: (skills ?? []).map(sk => [sk.name, sk.code ?? "â€”", sk.category ?? "â€”", sk.department?.name ?? "â€”", sk.weight ?? 0, sk.criticality])
            })}>
              <Download className="h-4 w-4 me-2" /> PDF
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 text-white font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto" onClick={() =>exportToExcel({
              title: t("skills_title"),
              filename: "Skills_Library",
              headers: [t("field_name"), t("field_code"), t("skills_col_category"), t("field_department"), t("skills_col_weight"), t("skills_col_criticality")],
              rows: (skills ?? []).map(sk => [sk.name, sk.code ?? "â€”", sk.category ?? "â€”", sk.department?.name ?? "â€”", sk.weight ?? 0, sk.criticality])
            })}>
              <Download className="h-4 w-4 me-2" /> EXCEL
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" className="rounded-none border-white/10 bg-white/5 hover:bg-white/10 text-white font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto" onClick={() => setShowImport(true)}>
                  <Upload className="h-4 w-4 me-2" />{t("action_import_csv")}
                </Button>
                <Button className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto hover:bg-primary/90" onClick={openCreate}>
                  <Plus className="h-4 w-4 me-2" />{t("action_register_skill")}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-80 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary/30" />
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="ps-12 h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                  <SelectValue placeholder={t("filter_by_dept")} />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                  <SelectItem value="all" className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">{t("all_departments")}</SelectItem>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="font-headline font-black text-[9px] tracking-widest uppercase focus:bg-primary/20">
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
      <div className="relative border border-white/10 bg-[#0A0A0A] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">{Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-none" />
             ))}
          </div>
        ) : !filteredSkills?.length ? (
          <div className="p-20 text-center space-y-4">
            <HardDrive className="h-12 w-12 text-secondary/10 mx-auto" />
            <p className="font-mono text-xs text-secondary/30 uppercase tracking-[0.3em]">{t("label_no_records")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("field_name")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("field_code")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("skills_col_category")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("field_department")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap text-center">{t("skills_col_weight")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap">{t("skills_col_criticality")}</th>
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-secondary/40 uppercase whitespace-nowrap text-end">{t("common_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSkills.map((sk) => (
                  <tr key={sk.id} className="group hover:bg-white/2 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 bg-primary/20 group-hover:bg-primary transition-colors" />
                        <div>
                          <p className="font-headline font-black text-white text-base tracking-tight group-hover:text-primary transition-colors uppercase">{sk.name}</p>
                          {sk.description && (
                            <p className="text-[10px] font-medium text-secondary/40 mt-1 max-w-sm truncate">{sk.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-[11px] text-primary/60 whitespace-nowrap">{sk.code ?? "â€”"}</td>
                    <td className="px-8 py-6 font-headline font-black text-[10px] text-secondary/30 tracking-widest uppercase whitespace-nowrap">{sk.category ?? "SYSTEM"}</td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <Badge variant="outline" className="rounded-none border-white/5 bg-white/5 text-[9px] font-mono text-secondary/60 py-1 uppercase">
                        {(sk as any).department?.name ?? "GENERAL"}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center w-10 h-10 border border-white/5 bg-white/5 font-mono font-black text-lg text-white">
                        {sk.weight}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">{critBadge(sk.criticality, t)}</td>
                    <td className="px-8 py-6 text-end whitespace-nowrap">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none border border-transparent hover:border-primary/30 hover:bg-primary/5 text-secondary/30 hover:text-primary" onClick={() => openEdit(sk)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-none border border-transparent hover:border-rose-500/30 hover:bg-rose-500/5 text-secondary/30 hover:text-rose-500" onClick={() => setDeleteTarget({ id: sk.id, name: sk.name })}>
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
        )}
      </div>

      {/* Forms & Dialogs */}
      <Dialog open={showCreate || !!editTarget} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-2xl bg-[#0A0A0A] border-2 border-primary/30 rounded-none p-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <div className="relative z-10">
            <div className="p-8 border-b border-white/10 bg-white/5">
              <h2 className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{editTarget ? t("action_reconfigure") : t("action_init_asset")}
              </h2>
              <p className="text-[10px] font-mono text-primary tracking-[0.3em] mt-2 uppercase">NODE REGISTRATION_v2.0</p>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_name")} *</Label>
                <Input placeholder="ASSET IDENTIFIER" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white focus-visible:ring-primary/50" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_code")}</Label>
                <Input placeholder="HEX UID" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_department")} *</Label>
                <Select value={form.department_id || "none"} onValueChange={(v) =>setForm({ ...form, department_id: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                    <SelectValue placeholder={t("select_none")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                    <SelectItem value="none" className="font-headline font-black text-[9px] tracking-widest uppercase">{t("select_none")}</SelectItem>
                    {departments?.map((d) => <SelectItem key={d.id} value={d.id} className="font-headline font-black text-[9px] tracking-widest uppercase">{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("skills_col_category")}</Label>
                <Input placeholder="SYSTEM CLASS" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
              <div className="space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("skills_col_weight")} *</Label>
                <Input type="number" min="1" max="10" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-lg font-black text-primary" />
              </div>
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("skills_col_criticality")} *</Label>
                <Select value={form.criticality} onValueChange={(v) => setForm({ ...form, criticality: v as Criticality })}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none font-headline font-black text-[10px] tracking-widest text-white uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10 rounded-none text-white">
                    {CRITICALITIES.map((c) => <SelectItem key={c} value={c} className="font-headline font-black text-[9px] tracking-widest uppercase">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-3">
                <Label className="font-headline font-black text-[10px] text-secondary/40 tracking-[0.2em] uppercase">{t("field_description")}</Label>
                <Input placeholder="TECHNICAL SPECIFICATIONS..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-14 bg-white/5 border-white/10 rounded-none font-mono text-sm tracking-widest text-white" />
              </div>
            </div>
            
            <div className="p-8 border-t border-white/10 bg-white/5 flex justify-end gap-4">
              <Button variant="ghost" className="rounded-none font-headline font-black text-[10px] tracking-widest uppercase text-white hover:bg-white/5" onClick={() =>{ setShowCreate(false); setEditTarget(null); }}>{t("common_cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase px-10 py-6 h-auto">{saving ? t("action_synchronizing") : editTarget ? t("action_apply_config") : t("action_init_asset")}
              </Button>
            </div>
          </div>
          <CornerMarks />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-[#0A0A0A] border-2 border-rose-500/30 rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-black text-2xl text-white uppercase tracking-tighter">{t("skills_deactivate_confirm", { name: deleteTarget?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription className="text-secondary/40 font-mono text-xs uppercase tracking-widest">{t("skills_deactivate_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-none border-white/10 bg-white/5 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-white/10 h-auto py-4 px-8">{t("common_cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-none bg-rose-600 text-white font-headline font-black text-[10px] tracking-widest uppercase hover:bg-rose-700 px-8 h-auto py-4">{deleting ? t("action_purging") : t("action_confirm_deactivate")}
            </AlertDialogAction>
          </AlertDialogFooter>
          <CornerMarks color="rose" />
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
