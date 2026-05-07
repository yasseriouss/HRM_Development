import { useState, useCallback } from "react";
import { useRoute, Link } from "wouter";
import {
  useGetCampaign,
  useGetCampaignSummaries,
  useGetCampaignMatrix,
} from "@workspace/api-client-react";
import type { Campaign, EvaluationSummary, SkillMatrix } from "@workspace/api-client-react";
import { getAuthHeaders, getAuthUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useT } from "@/i18n";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

function classBadge(cls: EmployeeClass) {
  if (cls === "A") return <Badge className="bg-emerald-600 text-white text-xs">A</Badge>;
  if (cls === "B") return <Badge className="bg-amber-500 text-white text-xs">B</Badge>;
  if (cls === "C") return <Badge className="bg-rose-600 text-white text-xs">C</Badge>;
  return <Badge variant="secondary" className="text-xs">—</Badge>;
}

const SCORE_COLORS = [
  "bg-rose-900/60 text-rose-300 hover:bg-rose-800",
  "bg-rose-700/60 text-rose-200 hover:bg-rose-600",
  "bg-amber-700/60 text-amber-200 hover:bg-amber-600",
  "bg-emerald-800/60 text-emerald-200 hover:bg-emerald-700",
  "bg-emerald-600/60 text-emerald-100 hover:bg-emerald-500",
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
      return <td className="px-3 py-2 text-center text-muted-foreground text-xs">—</td>;
    }
    return (
      <td className="px-3 py-2 text-center">
        <span className={`inline-block w-7 h-7 rounded text-xs font-bold leading-7 ${SCORE_COLORS[score]}`}>
          {score}
        </span>
      </td>
    );
  }

  return (
    <td className="px-1 py-1 text-center">
      <div className="flex gap-0.5 justify-center">
        {[0, 1, 2, 3, 4].map((s) => (
          <button
            key={s}
            title={scoreLabels[s]}
            onClick={() => onSelect(s)}
            className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${
              score === s
                ? SCORE_COLORS[s].replace("hover:", "")
                : "bg-muted/40 text-muted-foreground hover:bg-muted"
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
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-64" />
      </div>
    );
  if (!campaign) return <div className="text-muted-foreground">{t("campaign_not_found")}</div>;

  const c = campaign as Campaign;
  const s = (summaries ?? []) as EvaluationSummary[];
  const classA = s.filter((x) => x.class === "A").length;
  const classB = s.filter((x) => x.class === "B").length;
  const classC = s.filter((x) => x.class === "C").length;
  const isActive = c.status === "Active";
  const m = matrix as SkillMatrix | undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("campaign_back")}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{c.title}</h2>
          <p className="text-muted-foreground mt-1">
            {c.type} · {new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              c.status === "Active"
                ? "bg-emerald-600 text-white"
                : c.status === "Completed"
                  ? "bg-slate-600 text-white"
                  : "bg-amber-500 text-white"
            }
          >
            {c.status}
          </Badge>
          {isActive && !editMode && canEnterScores && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditMode(true)}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-1"
            >
              <Pencil className="h-3.5 w-3.5" /> {t("campaign_enter_scores")}
            </Button>
          )}
          {editMode && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground gap-1"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {saving ? t("common_saving") : t("campaign_save_scores")}
            </Button>
          )}
          {editMode && !saving && (
            <Button size="sm" variant="ghost" onClick={() => { setEditMode(false); setPendingScores({}); }}>
              {t("common_cancel")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("evaluations_evaluated")}</p>
            <p className="text-2xl font-bold text-primary">{c.evaluated_count}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("class_a")}</p>
            <p className="text-2xl font-bold text-emerald-400">{classA}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("class_b")}</p>
            <p className="text-2xl font-bold text-amber-400">{classB}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">{t("class_c")}</p>
            <p className="text-2xl font-bold text-rose-400">{classC}</p>
          </CardContent>
        </Card>
      </div>

      {editMode && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          <strong>{t("campaign_score_entry_mode")}</strong> — {t("campaign_score_entry_desc")}
          <div className="mt-1 flex gap-3 text-xs text-muted-foreground flex-wrap">
            {scoreLabels.map((l, i) => (
              <span key={i}><strong>{i}</strong> {l}</span>
            ))}
          </div>
        </div>
      )}

      {s.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">{t("campaign_eval_results")}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                  <th className="px-4 py-3 font-medium text-start">{t("field_employee")}</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap text-start">{t("field_code")}</th>
                  <th className="px-4 py-3 font-medium text-end whitespace-nowrap">{t("evaluations_col_score")}</th>
                  <th className="px-4 py-3 font-medium text-end whitespace-nowrap">%</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap text-start">{t("field_class")}</th>
                </tr>
              </thead>
              <tbody>
                {s.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <Link href={`/employees/${row.employee_id}`} className="hover:text-primary transition-colors">
                        {row.employee_name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{row.employee_code}</td>
                    <td className="px-4 py-2.5 text-end whitespace-nowrap">
                      {Number(row.total_score).toFixed(0)} / {Number(row.max_possible_score).toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-end font-semibold whitespace-nowrap">{Number(row.percentage).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{classBadge(row.class)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {matrixLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : m && m.skills.length > 0 && m.rows.length > 0 ? (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">
              {editMode ? t("campaign_score_entry_grid") : t("campaign_skill_matrix")}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-start font-medium text-muted-foreground sticky start-0 bg-card min-w-[160px]">
                    {t("field_employee")}
                  </th>
                  {m.skills.map((sk) => (
                    <th
                      key={sk.id}
                      className="px-2 py-2 text-center font-medium text-muted-foreground"
                      style={{ minWidth: editMode ? "160px" : "80px" }}
                    >
                      <div className="truncate max-w-[150px]" title={sk.name}>
                        {sk.code ?? sk.name}
                        <span className="text-muted-foreground/50 ms-0.5">×{sk.weight}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">%</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">{t("field_class")}</th>
                </tr>
              </thead>
              <tbody>
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
                    <tr key={row.employee.id} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="px-3 py-2 sticky start-0 bg-card">
                        <Link href={`/employees/${row.employee.id}`} className="hover:text-primary transition-colors font-medium">
                          {row.employee.full_name}
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
                      <td className="px-3 py-2 text-center font-semibold">
                        {livePercentage !== null ? (
                          <span className="text-primary">{livePercentage}%</span>
                        ) : row.percentage != null ? (
                          `${Number(row.percentage).toFixed(1)}%`
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{classBadge(row.class)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
