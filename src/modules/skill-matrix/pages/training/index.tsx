import { useState } from "react";
import { Link } from "wouter";
import {
  useListTrainingRecommendations,
  useListEmployees,
  useListSkills,
} from "@hrm-development/api-client-react";
import type {
  TrainingRecommendation,
  ListTrainingRecommendationsStatus,
  Employee,
  Skill,
} from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useFactory } from "@shared/contexts/FactoryContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@shared/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ExternalLink, ShieldCheck, Zap, Target, GraduationCap, ChevronRight, Search, Filter, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@shared/hooks/use-toast";
import { useT } from "@modules/skill-matrix/i18n";
import { cn } from "@shared/utils/cn";

const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"] as const;
const TYPES = ["Immediate", "Short-term", "Long-term", "Promotion"] as const;
type TrainingType = (typeof TYPES)[number];
type TrainingStatus = (typeof STATUSES)[number];

function statusBadge(status: string, t: any) {
  const map: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-100",
    Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Cancelled: "bg-zinc-50 text-zinc-400 border-zinc-100",
  };
  const keyMap: Record<string, string> = {
    Pending: "training_pending",
    "In Progress": "training_in_progress",
    Completed: "training_completed",
    Cancelled: "training_cancelled",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border", map[status] ?? map.Pending)}>
      {t(keyMap[status] ?? "training_pending")}
    </Badge>
  );
}

function typeBadge(type: string, t: any) {
  const map: Record<string, string> = {
    Immediate: "bg-red-50 text-red-600 border-red-100",
    "Short-term": "bg-amber-50 text-amber-600 border-amber-100",
    "Long-term": "bg-blue-50 text-blue-600 border-blue-100",
    Promotion: "bg-purple-50 text-purple-600 border-purple-100",
  };
  const keyMap: Record<string, string> = {
    Immediate: "training_type_immediate",
    "Short-term": "training_type_short",
    "Long-term": "training_type_long",
    Promotion: "training_type_promotion",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border", map[type] ?? map.Immediate)}>
      {t(keyMap[type] ?? "training_type_short")}
    </Badge>
  );
}

export default function TrainingPage() {
  const headers = getAuthHeaders();
  const user = getAuthUser();
  const { toast } = useToast();
  const { activeFactoryId } = useFactory();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "super_admin";
  const t = useT();
  const isAr = document.documentElement.dir === "rtl";

  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<TrainingRecommendation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [createForm, setCreateForm] = useState({ employee_id: "", skill_id: "", recommendation_type: "Short-term" as TrainingType, target_date: "", notes: "" });
  const [editForm, setEditForm] = useState({ status: "Pending" as TrainingStatus, target_date: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: recommendations, isLoading, queryKey } = useListTrainingRecommendations(
    { status: statusFilter === "all" ? undefined : (statusFilter as any), factory_id: activeFactoryId ?? undefined },
    { request: { headers } },
  );

  const { data: employeesData } = useListEmployees({ page_size: 200 }, { request: { headers } });
  const { data: skills } = useListSkills({}, { request: { headers } });

  const items = recommendations ?? [];
  const metrics = [
    { label: t("training_pending"), value: items.filter(r => r.status === "Pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50/50" },
    { label: t("training_in_progress"), value: items.filter(r => r.status === "In Progress").length, icon: Zap, color: "text-blue-500", bg: "bg-blue-50/50" },
    { label: t("training_completed"), value: items.filter(r => r.status === "Completed").length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50/50" },
  ];

  const handleCreate = async () => {
    if (!createForm.employee_id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/training`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        toast({ title: t("training_created") });
        setShowCreate(false);
        queryClient.invalidateQueries({ queryKey });
      }
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/training/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast({ title: t("training_updated") });
        setEditTarget(null);
        queryClient.invalidateQueries({ queryKey });
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/training/${deleteTarget.id}`, { method: "DELETE", headers });
      if (res.ok) {
        toast({ title: t("training_deleted") });
        setDeleteTarget(null);
        queryClient.invalidateQueries({ queryKey });
      }
    } finally { setDeleting(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 pb-32 selection:bg-zinc-900 selection:text-white">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
                 <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{t("training_protocol_label")}</span>
           </div>
           <h1 className="text-6xl lg:text-7xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none uppercase">
              {t("training_title")}
           </h1>
           <p className="text-zinc-500 font-medium text-lg max-w-2xl leading-relaxed">{t("training_subtitle")}</p>
        </div>

        {isAdmin && (
          <Button 
            className="rounded-full bg-zinc-900 text-white hover:scale-105 transition-all font-bold text-[10px] tracking-widest uppercase h-16 px-10 shadow-2xl shadow-zinc-200"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-5 w-5 me-3" /> {t("training_new")}
          </Button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white border-zinc-100 rounded-4xl p-10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group relative">
               <div className={cn("absolute top-0 right-0 p-8 opacity-[0.03] scale-150 transition-transform duration-700 group-hover:scale-125", m.color)}>
                  <m.icon className="h-24 w-24" />
               </div>
               <div className="space-y-4 relative z-10">
                  <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{m.label}</p>
                  <div className="flex items-end justify-between">
                     <h3 className={cn("text-5xl font-bold font-comfortaa", m.color)}>{m.value}</h3>
                     <div className={cn("p-3 rounded-2xl", m.bg)}>
                        <m.icon className={cn("h-5 w-5", m.color)} />
                     </div>
                  </div>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Control Panel */}
      <Card className="bg-white border-zinc-100 rounded-4xl shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
           <div className="flex-1 w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
              <Input
                placeholder={t("search_nodes_placeholder")}
                className="ps-14 h-16 bg-zinc-50 border-transparent rounded-3xl text-sm font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-zinc-100"
              />
           </div>
           <div className="w-full sm:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-[10px] tracking-widest uppercase text-zinc-900 focus:ring-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-3xl border-zinc-100 shadow-2xl">
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="font-bold text-[10px] tracking-widest uppercase focus:bg-zinc-50">{s}</SelectItem>
                  ))}
                  <SelectItem value="all" className="font-bold text-[10px] tracking-widest uppercase focus:bg-zinc-50">ALL STATUS</SelectItem>
                </SelectContent>
              </Select>
           </div>
        </CardContent>
      </Card>

      {/* Data List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full bg-zinc-50 rounded-4xl" />
            ))
          ) : items.length === 0 ? (
            <div className="py-32 text-center bg-white border border-dashed border-zinc-200 rounded-4xl">
               <BookOpen className="h-12 w-12 text-zinc-100 mx-auto mb-6" />
               <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{t("label_no_records")}</p>
            </div>
          ) : (
            items.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-white border-zinc-100 rounded-4xl p-10 shadow-sm hover:shadow-2xl hover:shadow-zinc-100 transition-all duration-500 group relative overflow-hidden">
                   <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 rounded-3xl bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500">
                            <Target className="h-6 w-6" />
                         </div>
                         <div className="space-y-2">
                            <Link href={`/skill-matrix/employees/${r.employee_id}`}>
                               <h3 className="text-2xl font-bold font-comfortaa text-zinc-900 hover:text-zinc-600 transition-colors uppercase tracking-tight">
                                  {r.employee_name}
                               </h3>
                            </Link>
                            <div className="flex items-center gap-4">
                               <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{r.skill_name || "GENERAL DEVELOPMENT"}</span>
                               <div className="h-1 w-1 rounded-full bg-zinc-200" />
                               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{r.target_date ? new Date(r.target_date).toLocaleDateString() : 'NO TARGET DATE'}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                         {typeBadge(r.recommendation_type, t)}
                         {statusBadge(r.status, t)}
                         <div className="h-10 w-px bg-zinc-100 mx-2 hidden lg:block" />
                         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50" onClick={() => {
                               setEditTarget(r);
                               setEditForm({ status: r.status as any, target_date: r.target_date ? String(r.target_date).split('T')[0] : '', notes: r.notes || '' });
                            }}>
                               <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl text-zinc-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget({ id: r.id, name: r.employee_name || '' })}>
                               <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      </div>
                   </div>
                   
                   {r.notes && (
                     <div className="mt-8 p-6 bg-zinc-50/50 rounded-3xl border border-transparent group-hover:border-zinc-100 group-hover:bg-white transition-all">
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">"{r.notes}"</p>
                     </div>
                   )}
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modals - Simplified & Styled */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
         <DialogContent className="max-w-2xl bg-white border-none rounded-4xl p-12 shadow-2xl shadow-zinc-200">
            <div className="space-y-10">
               <div className="space-y-4">
                  <h2 className="text-4xl font-bold font-comfortaa text-zinc-900 tracking-tighter uppercase">{t("training_new")}</h2>
                  <p className="text-xs font-bold text-zinc-400 tracking-widest uppercase">{t("label_protocol_sequence")}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-3">
                     <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("field_employee")}</Label>
                     <Select onValueChange={(v) => setCreateForm({...createForm, employee_id: v})}>
                        <SelectTrigger className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold text-xs uppercase focus:ring-zinc-100">
                           <SelectValue placeholder="SELECT EMPLOYEE" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl">
                           {employeesData?.data?.map(e => (
                             <SelectItem key={e.id} value={e.id} className="font-bold text-xs uppercase focus:bg-zinc-50">{e.full_name}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("field_type")}</Label>
                     <Select onValueChange={(v) => setCreateForm({...createForm, recommendation_type: v as any})}>
                        <SelectTrigger className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold text-xs uppercase focus:ring-zinc-100">
                           <SelectValue placeholder="TYPE" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-zinc-100 shadow-2xl">
                           {TYPES.map(t => <SelectItem key={t} value={t} className="font-bold text-xs uppercase focus:bg-zinc-50">{t}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">TARGET DATE</Label>
                     <Input type="date" className="h-14 bg-zinc-50 border-transparent rounded-2xl font-bold text-xs uppercase focus-visible:ring-zinc-100" onChange={e => setCreateForm({...createForm, target_date: e.target.value})} />
                  </div>
               </div>

               <Button 
                  className="w-full h-16 rounded-full bg-zinc-900 text-white font-bold text-[10px] tracking-widest uppercase hover:scale-[1.02] transition-all shadow-xl shadow-zinc-200"
                  onClick={handleCreate}
                  disabled={saving}
               >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "DEPLOY RECOMMENDATION"}
               </Button>
            </div>
         </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
         <AlertDialogContent className="rounded-4xl border-none p-12 bg-white shadow-2xl shadow-zinc-200">
            <div className="space-y-6">
               <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-600">
                  <Trash2 className="h-8 w-8" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-3xl font-bold font-comfortaa text-zinc-900 tracking-tighter uppercase">{t("action_confirm_delete")}</h2>
                  <p className="text-zinc-500 font-medium">{t("training_delete_desc")}</p>
               </div>
               <div className="flex gap-4 pt-4">
                  <Button variant="ghost" className="flex-1 h-14 rounded-full font-bold text-[10px] tracking-widest uppercase text-zinc-400" onClick={() => setDeleteTarget(null)}>CANCEL</Button>
                  <Button className="flex-1 h-14 rounded-full bg-red-600 text-white font-bold text-[10px] tracking-widest uppercase hover:bg-red-700" onClick={handleDelete} disabled={deleting}>
                     {deleting ? "PURGING..." : "DELETE"}
                  </Button>
               </div>
            </div>
         </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Missing icons from view_file, adding them here
const Clock = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const Loader2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
