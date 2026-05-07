import { useGetMyProfile } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, CalendarDays, Building2 } from "lucide-react";
import type { EvaluationSummary } from "@workspace/api-client-react";
import { useT } from "@/i18n";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

function scoreBar(score: number) {
  const pct = (score / 4) * 100;
  const colors = ["bg-rose-700", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-400"];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colors[score]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-4 text-end">{score}</span>
    </div>
  );
}

export default function MyProfilePage() {
  const headers = getAuthHeaders();
  const t = useT();

  function classBadge(cls: EmployeeClass) {
    if (cls === "A") return <Badge className="bg-emerald-600 text-white">{t("class_a_badge")}</Badge>;
    if (cls === "B") return <Badge className="bg-amber-500 text-white">{t("class_b_badge")}</Badge>;
    if (cls === "C") return <Badge className="bg-rose-600 text-white">{t("class_c_badge")}</Badge>;
    return <Badge variant="secondary">{t("unclassified")}</Badge>;
  }

  const scoreLabels: Parameters<typeof t>[0][] = ["score_0", "score_1", "score_2", "score_3", "score_4"];

  const { data: profile, isLoading, isError } = useGetMyProfile({ request: { headers } });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <Card className="border-border">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">{t("profile_no_record")}</p>
        </CardContent>
      </Card>
    );
  }

  const emp = profile.employee;
  const latestSummary = profile.latest_summary;
  const skillScores = profile.skill_scores ?? [];
  const training = profile.training_recommendations ?? [];
  const historicalSummaries: EvaluationSummary[] = profile.historical_summaries ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("profile_title")}</h2>
        <p className="text-muted-foreground">{t("profile_subtitle")}</p>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {emp.full_name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{emp.full_name}</h2>
                {classBadge(emp.current_class as EmployeeClass)}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {emp.job_title && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {emp.job_title}
                  </span>
                )}
                {emp.department?.name && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {emp.department.name}
                  </span>
                )}
                {emp.joined_date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {t("profile_joined")} {new Date(emp.joined_date).toLocaleDateString()}
                  </span>
                )}
                {emp.employee_code && (
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    {emp.employee_code}
                  </span>
                )}
              </div>
            </div>
            {latestSummary && (
              <div className="text-end">
                <p className="text-4xl font-bold text-primary">{Number(latestSummary.percentage).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{t("profile_latest_score")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">{t("profile_skill_competencies")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {skillScores.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("profile_no_skills")}</p>
            ) : (
              skillScores.map((sk) => (
                <div key={sk.skill_id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium truncate max-w-[200px]" title={sk.skill_name}>
                      {sk.skill_name}
                    </span>
                    <span className="text-muted-foreground ms-2">
                      {sk.score != null ? t(scoreLabels[sk.score]) : t("profile_not_evaluated")}
                    </span>
                  </div>
                  {sk.score != null ? scoreBar(sk.score) : <div className="h-2 bg-muted/30 rounded-full" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">{t("profile_eval_history")}</CardTitle>
            </CardHeader>
            <CardContent>
              {historicalSummaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("profile_no_evals")}</p>
              ) : (
                <div className="space-y-3">
                  {historicalSummaries.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {s.campaign_title ?? "Campaign"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("profile_skills_assessed", { count: s.evaluated_skills_count })}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-bold text-primary">{Number(s.percentage).toFixed(1)}%</p>
                        {classBadge(s.class as EmployeeClass)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {training.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm">{t("profile_training_recs")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {training.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-start justify-between gap-2 py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{rec.skill_name ?? rec.recommendation_type}</p>
                      {rec.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.notes}</p>
                      )}
                    </div>
                    <Badge
                      className={
                        rec.status === "Completed"
                          ? "bg-emerald-600 text-white text-xs"
                          : "bg-amber-500 text-white text-xs"
                      }
                    >
                      {rec.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
