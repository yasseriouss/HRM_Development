import { useState } from "react";
import { Link } from "wouter";
import { useListCampaigns, useGetCampaignSummaries } from "@hrm-development/api-client-react";
import type { Campaign, EvaluationSummary } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { ClipboardList, Users, TrendingUp, FileText, ExternalLink, Table, Download, Activity, Target, ShieldCheck, Database, LayoutPanelLeft } from "lucide-react";
import { useT } from "@modules/skill-matrix/i18n";
import { exportToPDF, exportToExcel } from "@modules/skill-matrix/lib/export-utils";
import { motion } from "framer-motion";
import { useFactory } from "@shared/contexts/FactoryContext";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

function classBadge(cls: EmployeeClass) {
  const map: Record<string, string> = {
    A: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    B: "border-amber-500/20 bg-amber-50 text-amber-700",
    C: "border-rose-500/20 bg-rose-50 text-rose-700",
  };
  return (
    <Badge variant="outline" className={`rounded-full font-bold text-[9px] tracking-wider px-2.5 py-0.5 uppercase shadow-sm ${map[cls ?? ""] ?? "border-primary/10 bg-muted/30 text-muted-foreground"}`}>
      {cls ?? "N/A"}
    </Badge>
  );
}

function statusBadge(status: string, t: (k: any) => string) {
  const map: Record<string, string> = {
    Active: "border-emerald-500/20 bg-emerald-50 text-emerald-700",
    Completed: "border-blue-500/20 bg-blue-50 text-blue-700",
    Draft: "border-amber-500/20 bg-amber-50 text-amber-700",
    Archived: "border-primary/10 bg-muted/30 text-muted-foreground",
  };
  const keyMap: Record<string, string>= {
    Active: "status_active", Completed: "status_completed",
    Draft: "status_draft", Archived: "status_archived",
  };
  return (
    <Badge variant="outline" className={`rounded-full font-bold text-[9px] tracking-wider px-2.5 py-0.5 uppercase shadow-sm ${map[status] ?? ""}`}>{t((keyMap[status] ?? "status_draft") as any)}
    </Badge>
  );
}

function SummaryTable({ campaignId }: { campaignId: string }) {
  const headers = getAuthHeaders();
  const t = useT();
  const { data: summaries, isLoading } = useGetCampaignSummaries(campaignId, { request: { headers } });
  const items: EvaluationSummary[] = summaries ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-zinc-900 rounded-none" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center border border-zinc-900 bg-black/20">
        <Database className="h-8 w-8 text-zinc-800 mx-auto mb-3" />
        <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em]">{t("evaluations_no_results")}</p>
      </div>
    );
  }

  const avgPct = items.reduce((acc, r) => acc + Number(r.percentage), 0) / items.length;
  const classA = items.filter((r) => r.class === "A").length;
  const classB = items.filter((r) => r.class === "B").length;
  const classC = items.filter((r) => r.class === "C").length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">{[
          { label: t("evaluations_evaluated"), value: items.length, color: "primary", icon: Users },
          { label: t("class_a"), value: classA, color: "emerald", icon: Target },
          { label: t("class_b"), value: classB, color: "amber", icon: TrendingUp },
          { label: t("class_c"), value: classC, color: "rose", icon: ShieldCheck }
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-primary/10 p-8 rounded-3xl relative group overflow-hidden shadow-sm hover:shadow-md transition-all">
             <stat.icon className={`absolute -right-4 -bottom-4 h-20 w-20 text-${stat.color}-500/5 group-hover:scale-110 transition-transform`} />
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
             <p className={`text-4xl font-headline font-bold text-foreground mt-3`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-surface border border-primary/10 rounded-3xl shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <Activity className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("evaluations_avg_score")}</p>
            <p className="text-3xl font-headline font-bold text-foreground leading-none">{avgPct.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full border-primary/10 bg-background hover:bg-primary/5 text-foreground font-bold text-[11px] tracking-wide uppercase h-11 px-6 shadow-sm"
            onClick={() =>exportToPDF({
              title: `${t("evaluations_title")} - ${campaignId}`,
              filename: `Evaluation_Report_${campaignId}`,
              headers: [t("field_employee"), t("field_code"), t("evaluations_col_score"), "%", t("field_class")],
              rows: items.map(r => [r.employee_name ?? "—", r.employee_code ?? "—", `${Number(r.total_score).toFixed(0)}/${Number(r.max_possible_score).toFixed(0)}`, `${Number(r.percentage).toFixed(1)}%`, r.class ?? "—"])
            })}
          >
            <Download className="h-4 w-4 me-2 text-primary" /> PDF
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-primary/10 bg-background hover:bg-primary/5 text-foreground font-bold text-[11px] tracking-wide uppercase h-11 px-6 shadow-sm"
            onClick={() =>exportToExcel({
              title: `${t("evaluations_title")} - ${campaignId}`,
              filename: `Evaluation_Export_${campaignId}`,
              headers: [t("field_employee"), t("field_code"), t("evaluations_col_score"), t("field_percentage"), t("field_class")],
              rows: items.map(r => [r.employee_name ?? "—", r.employee_code ?? "—", `${Number(r.total_score).toFixed(0)}/${Number(r.max_possible_score).toFixed(0)}`, Number(r.percentage), r.class ?? "—"])
            })}
          >
            <Table className="h-4 w-4 me-2 text-emerald-500" /> EXCEL
          </Button>
        </div>
      </div>

      <Card className="bg-surface border-primary/10 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/5 bg-muted/30 text-muted-foreground">
              <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-start">{t("field_employee")}</th>
              <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-start">{t("field_code")}</th>
              <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-end">{t("evaluations_col_score")}</th>
              <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-end">%</th>
              <th className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-start">{t("field_class")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-primary/[0.01] transition-all duration-300 group">
                <td className="px-8 py-5 font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors whitespace-nowrap">
                  <Link href={`/employees/${row.employee_id}`}>{row.employee_name ?? "—"}</Link>
                </td>
                <td className="px-8 py-5 font-sans font-bold text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-widest opacity-50">{row.employee_code ?? "—"}</td>
                <td className="px-8 py-5 text-end font-sans font-bold text-[11px] text-muted-foreground whitespace-nowrap uppercase tracking-tighter">{Number(row.total_score).toFixed(0)} / {Number(row.max_possible_score).toFixed(0)}
                </td>
                <td className="px-8 py-5 text-end font-sans font-bold text-foreground whitespace-nowrap">{Number(row.percentage).toFixed(1)}%</td>
                <td className="px-8 py-5 whitespace-nowrap">{classBadge(row.class as EmployeeClass)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function EvaluationsPage() {
  const headers = getAuthHeaders();
  const t = useT();
  const { activeFactoryId } = useFactory();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");

  const { data: campaigns, isLoading: campaignsLoading } = useListCampaigns(
    { factory_id: activeFactoryId ?? undefined },
    { request: { headers } },
  );

  const allCampaigns: Campaign[] = campaigns ?? [];
  const activeCampaigns = allCampaigns.filter((c) => c.status === "Active");
  const completedCampaigns = allCampaigns.filter((c) => c.status === "Completed");

  const selectedCampaign =
    selectedCampaignId !== "all" ? allCampaigns.find((c) => c.id === selectedCampaignId) : null;

  return (
    <div className="space-y-10 pb-20 font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <div className="relative pt-12 pb-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-primary/20" />
                <span className="font-sans font-bold tracking-widest text-[10px] text-primary uppercase">{t("label_mission_control")}</span>
              </div>
              <h1 className="text-6xl font-headline font-bold tracking-tight text-foreground leading-none">
                {t("evaluations_title")}
              </h1>
              <p className="text-muted-foreground font-medium text-lg max-w-2xl ps-4 border-s-2 border-primary/10">{t("evaluations_subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">{campaignsLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full bg-muted/50 rounded-3xl" />)
        ) : (
          <>
            <Card className="bg-surface border-primary/10 rounded-3xl p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <ClipboardList className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("evaluations_total")}</p>
              <h3 className="text-5xl font-headline font-bold text-foreground">{allCampaigns.length}</h3>
            </Card>
            <Card className="bg-surface border-primary/10 rounded-3xl p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/5 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("evaluations_active")}</p>
              <h3 className="text-5xl font-headline font-bold text-emerald-600">{activeCampaigns.length}</h3>
            </Card>
            <Card className="bg-surface border-primary/10 rounded-3xl p-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
              <ShieldCheck className="absolute -right-4 -bottom-4 h-24 w-24 text-blue-500/5 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("evaluations_completed_count")}</p>
              <h3 className="text-5xl font-headline font-bold text-blue-600">{completedCampaigns.length}</h3>
            </Card>
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-10">
          <div className="flex flex-wrap gap-2 p-1.5 bg-muted/30 rounded-2xl border border-primary/5">
            <Button 
              variant={selectedCampaignId === "all" ? "default" : "ghost"}
              className={`rounded-xl font-bold text-[10px] tracking-wide uppercase px-8 h-12 ${selectedCampaignId === "all" ? "bg-primary shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"}`}
              onClick={() =>setSelectedCampaignId("all")}
            >
              {t("evaluations_all_campaigns")}
            </Button>
            {activeCampaigns.map(c => (
              <Button 
                key={c.id}
                variant={selectedCampaignId === c.id ? "default" : "ghost"}
                className={`rounded-xl font-bold text-[10px] tracking-wide uppercase px-8 h-12 ${selectedCampaignId === c.id ? "bg-primary shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"}`}
                onClick={() => setSelectedCampaignId(c.id)}
              >
                {c.title}
              </Button>
            ))}
          </div>

          {selectedCampaign ? (
            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-primary/5 pb-8">
                <div>
                   <h3 className="text-4xl font-headline font-bold text-foreground tracking-tight uppercase leading-tight">{selectedCampaign.title}</h3>
                   <div className="flex items-center gap-6 mt-3">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedCampaign.type}</span>
                      <div className="h-1 w-1 rounded-full bg-primary/20" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{new Date(selectedCampaign.start_date).toLocaleDateString()} — {new Date(selectedCampaign.end_date).toLocaleDateString()}
                      </span>
                   </div>
                </div>
                {statusBadge(selectedCampaign.status, t)}
              </div>
              <SummaryTable campaignId={selectedCampaign.id} />
              
              <div className="pt-8">
                <Link href={`/campaigns/${selectedCampaign.id}`}>
                  <Button className="rounded-full bg-primary text-primary-foreground font-bold text-[11px] tracking-wide uppercase h-12 px-10 shadow-lg shadow-primary/20 transition-all">{t("campaign_enter_scores")} <ExternalLink className="ms-3 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {allCampaigns.map(c => (
                 <motion.div 
                    key={c.id} 
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedCampaignId(c.id)}
                    className="cursor-pointer"
                 >
                    <Card className="bg-surface border-primary/10 rounded-3xl p-8 hover:border-primary/30 transition-all relative group shadow-sm hover:shadow-md flex flex-col h-full">
                       <div className="flex justify-between items-start mb-6">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{c.type}</span>
                          {statusBadge(c.status, t)}
                       </div>
                       <h4 className="text-2xl font-headline font-bold text-foreground uppercase group-hover:text-primary transition-colors tracking-tight leading-tight mb-auto">{c.title}</h4>
                       <div className="mt-8 pt-6 border-t border-primary/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                          <span>{t("evaluations_evaluated_count", { evaluated: c.evaluated_count, total: c.total_employees })}</span>
                          <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
                       </div>
                    </Card>
                 </motion.div>
               ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="bg-surface border border-primary/10 rounded-3xl p-0 overflow-hidden relative shadow-sm">
            <div className="p-8 space-y-10 relative z-10">
              <div className="flex items-center gap-4 border-b border-primary/5 pb-6">
                <LayoutPanelLeft className="h-6 w-6 text-primary" />
                <h3 className="font-bold text-xs uppercase tracking-widest text-foreground">{t("evaluations_bulk_tools")}</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{t("evaluations_spreadsheet_tool")}</p>
                  <Button asChild variant="outline" className="w-full justify-between h-14 rounded-2xl border-primary/10 bg-background hover:bg-primary/5 group transition-all">
                    <a href="/hrm-spreadsheet" className="flex items-center gap-4 w-full">
                      <Table className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-[11px] tracking-wide uppercase text-foreground flex-1 text-start">{t("evaluations_spreadsheet_tool")}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-40" />
                    </a>
                  </Button>
                  <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic opacity-70 ps-1">{t("evaluations_spreadsheet_desc")}
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-primary/5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{t("evaluations_download_template")}</p>
                  <Button asChild variant="outline" className="w-full justify-between h-14 rounded-2xl border-primary/10 bg-background hover:bg-primary/5 group transition-all">
                    <a href="/hrm-skill-matrix-template.xlsx" download className="flex items-center gap-4 w-full">
                      <FileText className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-[11px] tracking-wide uppercase text-foreground flex-1 text-start">{t("evaluations_download_template")}</span>
                      <Download className="h-4 w-4 text-muted-foreground opacity-40" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-8 border border-emerald-500/10 bg-emerald-50/50 rounded-3xl relative overflow-hidden group shadow-sm">
             <Activity className="absolute -right-8 -top-8 h-32 w-32 text-emerald-500/5 group-hover:scale-110 transition-all duration-700 group-hover:rotate-12" />
             <p className="font-bold text-[11px] text-emerald-600 uppercase tracking-widest mb-4">{t("label_system_intelligence")}</p>
             <p className="text-xs text-muted-foreground leading-relaxed font-medium">{t("evaluations_intelligence_desc")}
             </p>
             <div className="mt-8 flex items-center gap-3 group/link cursor-pointer">
                <span className="font-bold text-[11px] text-foreground tracking-widest uppercase border-b border-transparent group-hover/link:border-emerald-500 transition-all">{t("suite_dashboard")}</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 group-hover/link:translate-x-1 transition-transform" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64981 10.6151 7.84212L6.86514 11.8421C6.67627 12.0436 6.35985 12.0538 6.1584 11.8649C5.95694 11.676 5.94674 11.3596 6.13561 11.1582L9.4445 7.5L6.13561 3.84181C5.94674 3.64035 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
  </svg>
);
