import { useGetDashboardMetrics, useGetDepartmentPerformance } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n";

export default function Dashboard() {
  const headers = getAuthHeaders();
  const t = useT();
  const { data: metrics, isLoading: isMetricsLoading } = useGetDashboardMetrics({ request: { headers } });
  const { data: deptPerformance, isLoading: isDeptLoading } = useGetDepartmentPerformance({ request: { headers } });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("dashboard_title")}</h2>
        <p className="text-muted-foreground">{t("dashboard_subtitle")}</p>
      </div>

      {isMetricsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : metrics ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard_total_employees")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.total_employees}</div>
              <p className="text-xs text-muted-foreground">{metrics.active_employees} {t("dashboard_active")}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard_avg_skill_match")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.average_skill_percentage}%</div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard_active_campaigns")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.active_campaigns}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {metrics ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-emerald-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard_class_a")}</CardTitle>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded">A</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{metrics.class_a_count}</div>
              <p className="text-xs text-muted-foreground">{metrics.class_a_percentage}{t("dashboard_of_workforce")}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard_class_b")}</CardTitle>
              <span className="text-xs font-bold text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded">B</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">{metrics.class_b_count}</div>
              <p className="text-xs text-muted-foreground">{metrics.class_b_percentage}{t("dashboard_of_workforce")}</p>
            </CardContent>
          </Card>
          <Card className="border-rose-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard_class_c")}</CardTitle>
              <span className="text-xs font-bold text-rose-400 bg-rose-900/40 px-2 py-0.5 rounded">C</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-400">{metrics.class_c_count}</div>
              <p className="text-xs text-muted-foreground">{metrics.class_c_percentage}{t("dashboard_of_workforce")}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-primary/20">
          <CardHeader>
            <CardTitle>{t("dashboard_dept_performance")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isDeptLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : deptPerformance ? (
              <div className="space-y-4">
                {deptPerformance.map(dept => (
                  <div key={dept.department_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dept.department_name}</p>
                      <p className="text-sm text-muted-foreground">{dept.employee_count} {t("dashboard_employees")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{dept.average_percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("dashboard_no_data")}</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-primary/20">
          <CardHeader>
            <CardTitle>{t("dashboard_recent_activity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("dashboard_activity_feed")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
