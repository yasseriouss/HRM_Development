import { useState, useCallback } from "react";
import { useRoute, Link } from "wouter";
import {
  useGetCampaign,
  useGetCampaignSummaries,
  useGetCampaignMatrix,
} from "@hrm-development/api-client-react";
import type { Campaign, EvaluationSummary, SkillMatrix } from "@hrm-development/api-client-react";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Check, Loader2, Target, Shield, Activity, BarChart3, Zap, Layers, ExternalLink, Info, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useT } from "@/i18n";
import { motion, AnimatePresence } from "framer-motion";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

const CornerMarks = ({ color = "primary" }: { color?: string }) => (
  <>
    <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-${color}/40`} />
    <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-${color}/40`} />
    <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-${color}/40`} />
    <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-${color}/40`} />
  </>
);

function classBadge(cls: EmployeeClass) {
  const configs: Record<string, { bg: string; text: string; border: string }> = {
    A: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
    B: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
    C: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/30" },
  };
  const config = cls ? configs[cls] : { bg: "bg-zinc-800", text: "text-zinc-500", border: "border-zinc-700" };
  
  return (
    <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black px-2 py-0.5 uppercase tracking-widest ${config.bg} ${config.text} ${config.border}`}>
      {cls || "NONE"}
    </Badge>
  );
}

const SCORE_STYLES = [
  "border-rose-900/40 bg-rose-900/10 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.1)]", // 0
  "border-orange-900/40 bg-orange-900/10 text-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.1)]", // 1
  "border-amber-900/40 bg-amber-900/10 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.1)]", // 2
  "border-emerald-900/40 bg-emerald-900/10 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.1)]", // 3
  "border-primary/40 bg-primary/10 text-primary shadow-[0_0_10px_rgba(255,255,255,0.15)]", // 4
];

type PendingScores = Record<string, Record<string, number>>;

function ScoreCell({
  score,
  editing,
  onSelect,
  scoreLabels,
}: {
  score: number | null | undefined;
  editing: boolean;
  onSelect: (s: number) => void;
  scoreLabels: string[];
}) {
  if (!editing) {
    if (score === null || score === undefined) {
      return <td className="px-3 py-4 text-center text-zinc-800 font-mono text-[10px]">--</td>;
    }
    return (
      <td className="px-3 py-4 text-center">
        <div className={`inline-flex items-center justify-center w-8 h-8 border font-mono font-black text-xs ${SCORE_STYLES[score]}`}>
          {score}
        </div>
      </td>
    );
  }

  return (
    <td className="px-1 py-4 text-center">
      <div className="flex gap-1 justify-center">
        {[0, 1, 2, 3, 4].map((s) => (
          <button
            key={s}
            title={scoreLabels[s]}
            onClick={() => onSelect(s)}
            className={`w-7 h-7 border font-mono font-black text-[10px] transition-all hover:scale-110 active:scale-95 ${
              score === s
                ? SCORE_STYLES[s]
                : "border-zinc-800 bg-zinc-900/40 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </td>
  );
}

export default function CampaignDetailPage() {
  const [, params] = useRoute("/campaigns/:id");
  const id = params?.id ?? "";
  const headers = getAuthHeaders();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const t = useT();

  const [editMode, setEditMode] = useState(false);
  const [pendingScores, setPendingScores] = useState<PendingScores>({});
  const [saving, setSaving] = useState(false);

  const currentUser = getAuthUser();
  const canEnterScores = currentUser?.role === "super_admin" || currentUser?.role === "dept_head";

  const { data: campaign, isLoading: camLoading } = useGetCampaign(id, { request: { headers } });
  const { data: summaries, queryKey: summariesKey } = useGetCampaignSummaries(id, { request: { headers } });
  const { data: matrix, isLoading: matrixLoading, queryKey: matrixKey } = useGetCampaignMatrix(id, undefined, { request: { headers } });

  const scoreLabels = [
    t("score_0"), t("score_1"), t("score_2"), t("score_3"), t("score_4"),
  ];

  const handleScoreSelect = useCallback(
    (employeeId: string, skillId: string, score: number) => {
      setPendingScores((prev) => ({
        ...prev,
        [employeeId]: { ...(prev[employeeId] ?? {}), [skillId]: score },
      }));
    },
    [],
  );

  const handleSave = async () => {
    const m = matrix as SkillMatrix | undefined;
    if (!m) return;
    setSaving(true);

    const employeeBatches: Array<{
      employee_id: string;
      skill_scores: Array<{ skill_id: string; score: number }>;
    }> = [];

    for (const row of m.rows) {
      const rowPending = pendingScores[row.employee.id];
      if (!rowPending || Object.keys(rowPending).length === 0) continue;
      employeeBatches.push({
        employee_id: row.employee.id,
        skill_scores: Object.entries(rowPending).map(([skill_id, score]) => ({ skill_id, score })),
      });
    }

    if (employeeBatches.length === 0) {
      setEditMode(false);
      setSaving(false);
      return;
    }

    let totalSaved = 0;
    let failed = 0;

    try {
      await Promise.all(
        employeeBatches.map(async (batch) => {
          try {
            const res = await fetch(`/api/evaluations/bulk`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...headers },
              body: JSON.stringify({ campaign_id: id, ...batch }),
            });
            if (res.ok) {
              const body = (await res.json()) as { inserted?: number };
              totalSaved += body.inserted ?? batch.skill_scores.length;
            } else {
              failed++;
            }
          } catch {
            failed++;
          }
        }),
      );

      if (failed > 0) {
        toast({
          title: t("campaign_partial_save"),
          description: t("campaign_partial_save_desc", { saved: totalSaved, failed }),
          variant: "destructive",
        });
      } else {
        toast({ title: t("campaign_scores_saved"), description: t("campaign_scores_saved_desc", { count: totalSaved }) });
      }

      setPendingScores({});
      setEditMode(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: matrixKey }),
        queryClient.invalidateQueries({ queryKey: summariesKey }),
      ]);
    } catch {
      toast({ title: t("campaign_save_failed"), description: t("campaign_save_failed_desc"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (camLoading)
    return (
      <div className="space-y-8 pb-20">
        <Skeleton className="h-48 w-full bg-zinc-900 rounded-none" />
        <div className="grid grid-cols-4 gap-6">
           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 bg-zinc-900 rounded-none" />)}
        </div>
        <Skeleton className="h-[600px] w-full bg-zinc-900 rounded-none" />
      </div>
    );

  if (!campaign) return (
    <div className="p-20 text-center font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-700">
      {t("campaign_not_found")}
    </div>
  );

  const c = campaign as Campaign;
  const s = (summaries ?? []) as EvaluationSummary[];
  const classA = s.filter((x) => x.class === "A").length;
  const classB = s.filter((x) => x.class === "B").length;
  const classC = s.filter((x) => x.class === "C").length;
  const isActive = c.status === "Active";
  const m = matrix as SkillMatrix | undefined;

  return (
    <div className="space-y-10 pb-24 font-sans text-white">
      {/* Back Navigation */}
      <Link href="/campaigns">
        <motion.button 
          whileHover={{ x: -5 }}
          className="group flex items-center gap-3 text-[10px] font-mono font-black text-zinc-500 hover:text-primary transition-colors uppercase tracking-[0.3em]"
        >
          <ArrowLeft className="h-4 w-4" /> {t("campaign_back")}
        </motion.button>
      </Link>

      {/* Header - Industrial Focus */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Target className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">STRATEGIC_MISSION_CONTROL</span>
            </div>
            <h2 className="text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {c.title}
            </h2>
            <p className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest flex items-center justify-center md:justify-start gap-4">
               <span>TYPE::{c.type}</span>
               <span className="h-1 w-1 bg-zinc-800 rounded-full" />
               <span>TIMELINE::{new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={`rounded-none font-mono text-[10px] font-black px-4 py-2 uppercase tracking-widest border-2 ${c.status === "Active" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-zinc-800 bg-zinc-900 text-zinc-600"}`}>
               {c.status}
            </Badge>
            
            {isActive && !editMode && canEnterScores && (
              <Button onClick={() => setEditMode(true)} className="rounded-none bg-primary text-primary-foreground font-headline font-black text-[10px] tracking-widest uppercase py-6 px-10 h-auto hover:bg-primary/90">
                <Pencil className="h-4 w-4 mr-2" /> {t("campaign_enter_scores")}
              </Button>
            )}

            {editMode && (
              <div className="flex gap-3">
                 <Button onClick={handleSave} disabled={saving} className="rounded-none bg-emerald-600 text-white font-headline font-black text-[10px] tracking-widest uppercase py-6 px-10 h-auto hover:bg-emerald-700">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    {saving ? "SYNCING..." : "COMMIT_TELEMETRY"}
                 </Button>
                 {!saving && (
                   <Button variant="ghost" onClick={() => { setEditMode(false); setPendingScores({}); }} className="rounded-none font-headline font-black text-[10px] tracking-widest uppercase text-white hover:bg-white/5 py-6 px-8 h-auto">
                      {t("common_cancel")}
                   </Button>
                 )}
              </div>
            )}
          </div>
        </div>
        <CornerMarks />
      </div>

      {/* Statistics Stream */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: t("evaluations_evaluated"), value: c.evaluated_count, icon: BarChart3, color: "primary" },
          { label: t("class_a"), value: classA, icon: Shield, color: "emerald-400" },
          { label: t("class_b"), value: classB, icon: Zap, color: "amber-400" },
          { label: t("class_c"), value: classC, icon: Activity, color: "rose-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-[#0D0D0D] border-zinc-800 rounded-none relative group overflow-hidden">
             <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-900 border border-zinc-800">
                     <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                  </div>
                  <div>
                     <p className="text-[9px] font-headline font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                     <p className={`text-2xl font-mono font-black text-${stat.color} leading-none mt-1`}>{stat.value}</p>
                  </div>
                </div>
             </CardContent>
             <CornerMarks />
          </Card>
        ))}
      </div>

      {editMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-primary/3 border-2 border-primary/30 relative overflow-hidden group"
        >
          <Info className="absolute -right-4 -top-4 h-24 w-24 text-primary opacity-5" />
          <p className="font-headline font-black text-xs text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Terminal className="h-4 w-4" /> {t("campaign_score_entry_mode")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {scoreLabels.map((l, i) => (
              <div key={i} className="flex flex-col gap-1">
                 <span className="font-mono text-xl font-black text-white">{i}</span>
                 <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Skill Matrix Grid - The Master Table */}
      {matrixLoading ? (
        <Skeleton className="h-96 w-full bg-zinc-900 rounded-none" />
      ) : m && m.skills.length > 0 && m.rows.length > 0 ? (
        <Card className="bg-[#0A0A0A] border-zinc-800 rounded-none relative overflow-hidden">
          <CardHeader className="p-8 border-b border-zinc-900 flex flex-row items-center justify-between">
            <CardTitle className="font-headline font-black text-xl text-white uppercase tracking-tighter flex items-center gap-3">
              <Layers className="h-5 w-5 text-primary" />
              {editMode ? "SCORE_ENTRY_MATRIX" : "MISSION_SKILL_MATRIX"}
            </CardTitle>
            <div className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
               GRID_PROTOCOL_v4.2 // {m.rows.length} NODES // {m.skills.length} VECTORS
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800">
                  <th className="px-8 py-5 font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase sticky left-0 bg-[#0A0A0A] z-20 min-w-[240px]">
                    {t("field_employee")}
                  </th>
                  {m.skills.map((sk) => (
                    <th
                      key={sk.id}
                      className="px-4 py-5 text-center font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase min-w-[140px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-white truncate max-w-[130px]">{sk.code ?? sk.name}</span>
                        <span className="text-[8px] text-primary/40 font-mono">WEIGHT::x{sk.weight}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-5 text-center font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase min-w-[100px]">%</th>
                  <th className="px-8 py-5 text-center font-headline font-black text-[10px] tracking-widest text-zinc-500 uppercase min-w-[100px]">{t("field_class")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {m.rows.map((row) => {
                  const rowPending = pendingScores[row.employee.id] ?? {};
                  const mergedScores: Record<string, number | undefined> = { ...row.scores, ...rowPending };

                  let livePercentage: string | null = null;
                  if (editMode && Object.keys(rowPending).length > 0) {
                    const scored = m.skills.filter((sk) => mergedScores[sk.id] !== undefined);
                    if (scored.length > 0) {
                      const totalWeight = scored.reduce((acc, sk) => acc + sk.weight, 0);
                      const score = scored.reduce(
                        (acc, sk) => acc + ((mergedScores[sk.id]! / 4) * sk.weight),
                        0,
                      );
                      livePercentage = ((score / totalWeight) * 100).toFixed(1);
                    }
                  }

                  return (
                    <tr key={row.employee.id} className="group hover:bg-white/2 transition-colors">
                      <td className="px-8 py-4 sticky left-0 bg-[#0A0A0A] group-hover:bg-[#121212] transition-colors z-20 border-r border-zinc-900">
                        <Link href={`/employees/${row.employee.id}`} className="flex items-center gap-4 group/link">
                          <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-[10px] text-primary group-hover/link:border-primary/50 transition-colors">
                             {row.employee.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-0.5">
                             <p className="font-headline font-black text-sm text-white uppercase tracking-tight group-hover/link:text-primary transition-colors">
                               {row.employee.full_name}
                             </p>
                             <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">{row.employee.employee_code}</p>
                          </div>
                        </Link>
                      </td>
                      {m.skills.map((sk) => (
                        <ScoreCell
                          key={sk.id}
                          score={mergedScores[sk.id]}
                          editing={editMode}
                          onSelect={(s) => handleScoreSelect(row.employee.id, sk.id, s)}
                          scoreLabels={scoreLabels}
                        />
                      ))}
                      <td className="px-8 py-4 text-center">
                        <div className="flex flex-col items-center">
                           <span className={`text-sm font-mono font-black ${livePercentage ? "text-primary animate-pulse" : "text-zinc-400"}`}>
                             {livePercentage !== null ? `${livePercentage}%` : row.percentage != null ? `${Number(row.percentage).toFixed(1)}%` : "--"}
                           </span>
                           {livePercentage && <span className="text-[8px] font-mono text-primary/40 uppercase">LIVE_CALC</span>}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-center">{classBadge(row.class)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
          <CornerMarks />
        </Card>
      ) : (
        <Card className="bg-[#0A0A0A] border-zinc-800 rounded-none p-20 text-center">
           <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-[0.4em]">MATRIX_BUFFER_EMPTY // NO_SKILLS_OR_EMPLOYEES_LINKED</p>
        </Card>
      )}

      {/* Deployment Metadata Footer */}
      <div className="p-8 border-2 border-primary/20 bg-primary/3 relative overflow-hidden group">
         <Shield className="absolute -right-4 -top-4 h-24 w-24 text-primary opacity-5 group-hover:opacity-10 transition-all duration-700" />
         <p className="font-headline font-black text-[11px] text-primary uppercase tracking-[0.3em] mb-4">MISSION_TELEMETRY_LOG</p>
         <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase tracking-tighter">
            SYNCHRONIZING_MATRIX_STATE // ENFORCING_STRICT_VALUATION_PROTOCOLS // ENCRYPTION_LAYER_v2.1_ENABLED
         </p>
         <div className="mt-8 flex items-center justify-between text-[9px] font-mono font-black text-zinc-600 uppercase tracking-widest">
            <span>CAMPAIGN_HASH::{id.substring(0, 16).toUpperCase()}</span>
            <span className="text-emerald-500 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              SYSTEM_SYNC_OK
            </span>
         </div>
      </div>
    </div>
  );
}
