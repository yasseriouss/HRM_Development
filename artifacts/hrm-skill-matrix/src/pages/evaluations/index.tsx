import { useState } from "react";
import { Link } from "wouter";
import { useListCampaigns, useGetCampaignSummaries } from "@hrm-development/api-client-react";
import type { Campaign, EvaluationSummary } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Users, TrendingUp, FileText, ExternalLink, Table, Download } from "lucide-react";
import { useT } from "@/i18n";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

function classBadge(cls: EmployeeClass) {
  if (cls === "A") return <Badge className="bg-emerald-600 text-white text-xs">A</Badge>;
  if (cls === "B") return <Badge className="bg-amber-500 text-white text-xs">B</Badge>;
  if (cls === "C") return <Badge className="bg-rose-600 text-white text-xs">C</Badge>;
  return <Badge variant="secondary" className="text-xs">—</Badge>;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Active: "bg-emerald-600 text-white",
    Completed: "bg-slate-600 text-white",
    Draft: "bg-amber-500 text-white",
    Archived: "bg-zinc-700 text-zinc-300",
  };
  return <Badge className={`text-xs ${map[status] ?? ""}`}>{status}</Badge>;
}

function SummaryTable({ campaignId }: { campaignId: string }) {
  const headers = getAuthHeaders();
  const t = useT();
  const { data: summaries, isLoading } = useGetCampaignSummaries(campaignId, { request: { headers } });
  const items: EvaluationSummary[] = summaries ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">{t("evaluations_no_results")}</p>;
  }

  const avgPct = items.reduce((acc, r) => acc + Number(r.percentage), 0) / items.length;
  const classA = items.filter((r) => r.class === "A").length;
  const classB = items.filter((r) => r.class === "B").length;
  const classC = items.filter((r) => r.class === "C").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">{t("evaluations_evaluated")}</p>
          <p className="text-xl font-bold text-primary">{items.length}</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">{t("class_a")}</p>
          <p className="text-xl font-bold text-emerald-400">{classA}</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">{t("class_b")}</p>
          <p className="text-xl font-bold text-amber-400">{classB}</p>
        </div>
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="text-xs text-muted-foreground">{t("class_c")}</p>
          <p className="text-xl font-bold text-rose-400">{classC}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("evaluations_avg_score")}{" "}
          <span className="font-semibold text-primary">{avgPct.toFixed(1)}%</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            className="h-7 text-[10px] gap-1 border-border"
            onClick={() => exportToPDF({
              title: `${t("evaluations_title")} - ${campaignId}`,
              filename: `Evaluation_Report_${campaignId}`,
              headers: [t("field_employee"), t("field_code"), t("evaluations_col_score"), "%", t("field_class")],
              rows: items.map(r => [r.employee_name ?? "—", r.employee_code ?? "—", `${Number(r.total_score).toFixed(0)}/${Number(r.max_possible_score).toFixed(0)}`, `${Number(r.percentage).toFixed(1)}%`, r.class ?? "—"])
            })}
          >
            <Download className="h-3 w-3" /> PDF
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="h-7 text-[10px] gap-1 border-border"
            onClick={() => exportToExcel({
              title: `${t("evaluations_title")} - ${campaignId}`,
              filename: `Evaluation_Export_${campaignId}`,
              headers: [t("field_employee"), t("field_code"), t("evaluations_col_score"), "Percentage", t("field_class")],
              rows: items.map(r => [r.employee_name ?? "—", r.employee_code ?? "—", `${Number(r.total_score).toFixed(0)}/${Number(r.max_possible_score).toFixed(0)}`, Number(r.percentage), r.class ?? "—"])
            })}
          >
            <Download className="h-3 w-3" /> EXCEL
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-start text-muted-foreground">
              <th className="px-4 py-3 font-medium text-start">{t("field_employee")}</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap text-start">{t("field_code")}</th>
              <th className="px-4 py-3 font-medium text-end whitespace-nowrap">{t("evaluations_col_score")}</th>
              <th className="px-4 py-3 font-medium text-end whitespace-nowrap">%</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap text-start">{t("field_class")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20">
                <td className="px-4 py-2.5">
                  <Link href={`/employees/${row.employee_id}`} className="hover:text-primary transition-colors">
                    {row.employee_name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{row.employee_code ?? "—"}</td>
                <td className="px-4 py-2.5 text-end whitespace-nowrap">
                  {Number(row.total_score).toFixed(0)} / {Number(row.max_possible_score).toFixed(0)}
                </td>
                <td className="px-4 py-2.5 text-end font-semibold whitespace-nowrap">{Number(row.percentage).toFixed(1)}%</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{classBadge(row.class as EmployeeClass)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function EvaluationsPage() {
  const headers = getAuthHeaders();
  const t = useT();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");

  const { data: campaigns, isLoading: campaignsLoading } = useListCampaigns(undefined, { request: { headers } });

  const allCampaigns: Campaign[] = campaigns ?? [];
  const activeCampaigns = allCampaigns.filter((c) => c.status === "Active");
  const completedCampaigns = allCampaigns.filter((c) => c.status === "Completed");

  const selectedCampaign =
    selectedCampaignId !== "all" ? allCampaigns.find((c) => c.id === selectedCampaignId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("evaluations_title")}</h2>
        <p className="text-muted-foreground">{t("evaluations_subtitle")}</p>
      </div>

      {campaignsLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ClipboardList className="h-4 w-4" />
                <p className="text-xs">{t("evaluations_total")}</p>
              </div>
              <p className="text-2xl font-bold text-primary">{allCampaigns.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <p className="text-xs">{t("evaluations_active")}</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{activeCampaigns.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <p className="text-xs">{t("evaluations_completed_count")}</p>
              </div>
              <p className="text-2xl font-bold text-slate-400">{completedCampaigns.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger className="max-w-sm bg-card border-border">
                <SelectValue placeholder={t("evaluations_select_prompt_short")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("evaluations_select_prompt_short")}</SelectItem>
                {activeCampaigns.length > 0 && (
                  <>
                    <SelectItem value="group-active" disabled>Active</SelectItem>
                    {activeCampaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </>
                )}
                {completedCampaigns.length > 0 && (
                  <>
                    <SelectItem value="group-completed" disabled>Completed</SelectItem>
                    {completedCampaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </>
                )}
              </SelectContent>
            </Select>
            {selectedCampaign && (
              <Link href={`/campaigns/${selectedCampaign.id}`} className="text-sm text-primary hover:underline">
                {t("evaluations_open_campaign")}
              </Link>
            )}
          </div>

          {selectedCampaign ? (
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{selectedCampaign.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedCampaign.type} · {new Date(selectedCampaign.start_date).toLocaleDateString()} —{" "}
                      {new Date(selectedCampaign.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  {statusBadge(selectedCampaign.status)}
                </div>
              </CardHeader>
              <CardContent>
                <SummaryTable campaignId={selectedCampaign.id} />
              </CardContent>
            </Card>
          ) : selectedCampaignId !== "all" ? null : (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("evaluations_select_prompt")}</p>
              </CardContent>
            </Card>
          )}

          {selectedCampaignId === "all" && allCampaigns.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {t("evaluations_all_campaigns")}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {allCampaigns.map((c) => (
                  <Card
                    key={c.id}
                    className="border-border hover:border-primary/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedCampaignId(c.id)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{c.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t("evaluations_evaluated_count", { evaluated: c.evaluated_count, total: c.total_employees })}
                          </p>
                        </div>
                        {statusBadge(c.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Table className="h-4 w-4" />
                {t("evaluations_bulk_tools")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Spreadsheet Mode</p>
                <Button asChild variant="outline" className="w-full justify-start gap-2 border-primary/30 hover:bg-primary/10">
                  <a href="/hrm-spreadsheet">
                    <Table className="h-4 w-4" />
                    <span className="truncate">{t("evaluations_spreadsheet_tool")}</span>
                  </a>
                </Button>
                <p className="text-[10px] text-muted-foreground leading-tight italic">
                  {t("evaluations_spreadsheet_desc")}
                </p>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-primary/10">
                <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Offline Templates</p>
                <Button asChild variant="ghost" className="w-full justify-start gap-2 text-primary hover:bg-primary/10">
                  <a href="/hrm-skill-matrix-template.xlsx" download>
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{t("evaluations_download_template")}</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-500">System Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[11px] text-muted-foreground">
                HRM Suite connects evaluation data directly to the analytics engine for real-time factory intelligence.
              </p>
              <Button asChild variant="link" className="p-0 h-auto text-[11px] text-emerald-500 hover:text-emerald-400">
                <a href="/hrm-dashboard" className="flex items-center gap-1">
                  View Enterprise Analytics <ExternalLink className="h-2 w-2" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
