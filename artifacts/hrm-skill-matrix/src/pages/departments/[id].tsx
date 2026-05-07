import { useRoute, Link } from "wouter";
import {
  useGetDepartment,
  useGetDepartmentStats,
  useListEmployees,
  useListSkills,
} from "@hrm-development/api-client-react";
import type { DepartmentStats } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, BookOpen } from "lucide-react";
import { useT } from "@/i18n";

export default function DepartmentDetailPage() {
  const [, params] = useRoute("/departments/:id");
  const id = params?.id ?? "";
  const headers = getAuthHeaders();
  const t = useT();

  const { data: dept, isLoading } = useGetDepartment(id, { request: { headers } });
  const { data: stats } = useGetDepartmentStats(id, { request: { headers } });
  const { data: employees } = useListEmployees(
    { department_id: id, page: 1, page_size: 50 },
    { request: { headers } },
  );
  const { data: skills } = useListSkills({ department_id: id }, { request: { headers } });

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-48" />
      </div>
    );
  if (!dept) return <div className="text-muted-foreground">{t("dept_not_found")}</div>;

  const s = stats as DepartmentStats | undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/departments"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t("dept_back")}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{dept.name}</h2>
          {dept.code && <p className="font-mono text-sm text-primary/70">{dept.code}</p>}
          {dept.description && (
            <p className="text-muted-foreground mt-1 text-sm">{dept.description}</p>
          )}
        </div>
      </div>

      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{t("dept_stat_employees")}</p>
              <p className="text-2xl font-bold text-primary">{s.employee_count}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{t("class_a")}</p>
              <p className="text-2xl font-bold text-emerald-400">{s.class_a_count}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{t("dept_stat_avg_score")}</p>
              <p className="text-2xl font-bold text-primary">{Number(s.average_percentage ?? 0).toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{t("dept_stat_skills")}</p>
              <p className="text-2xl font-bold text-primary">{s.skill_count}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" /> {t("dept_team_members")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {employees?.data.map((emp) => (
                <Link key={emp.id} href={`/employees/${emp.id}`}>
                  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 hover:text-primary transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{emp.full_name}</p>
                      <p className="text-xs text-muted-foreground">{emp.job_title ?? "—"}</p>
                    </div>
                    {emp.current_class && (
                      <Badge
                        className={
                          emp.current_class === "A"
                            ? "bg-emerald-600 text-white text-xs"
                            : emp.current_class === "B"
                              ? "bg-amber-500 text-white text-xs"
                              : "bg-rose-600 text-white text-xs"
                        }
                      >
                        {emp.current_class}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> {t("dept_required_skills")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {skills?.map((sk) => (
                <div
                  key={sk.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{sk.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sk.category} · {t("skills_col_weight")} {sk.weight}
                    </p>
                  </div>
                  <Badge
                    className={
                      sk.criticality === "Critical"
                        ? "bg-rose-700 text-white text-xs"
                        : sk.criticality === "High"
                          ? "bg-amber-600 text-white text-xs"
                          : "bg-slate-600 text-white text-xs"
                    }
                  >
                    {sk.criticality}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
