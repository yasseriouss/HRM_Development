import { useState } from "react";
import { Link } from "wouter";
import { useListCampaigns, useGetCampaignSummaries } from "../../../../api";
import type { Campaign, EvaluationSummary } from "../../../../api";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { ClipboardList, Users, TrendingUp, FileText, ExternalLink, Table, Download, Activity, Target, ShieldCheck, Database, LayoutPanelLeft, ArrowUpRight, Zap, ChevronRight } from "lucide-react";
import { useT } from "@modules/skill-matrix/i18n";
import { exportToPDF, exportToExcel } from "@modules/skill-matrix/lib/export-utils";
import { motion } from "framer-motion";
import { useFactory } from "@shared/contexts/FactoryContext";
import { cn } from "@shared/utils/cn";
import {
  dataTableBase,
  dataTableBody,
  dataTableHeadRow,
  dataTableRow,
  dataTableScroll,
  dataTableShell,
  dataTableTdSpacious,
  dataTableThSpacious,
} from "@shared/components/data/data-table-styles";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

function classBadge(cls: EmployeeClass) {
  const map: Record<string, string> = {
    A: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm",
    B: "bg-amber-50 text-amber-600 border-amber-100 shadow-sm",
    C: "bg-red-50 text-red-600 border-red-100 shadow-sm",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border", map[cls ?? ""] ?? "bg-muted/5 text-muted border-muted/10")}>
      {cls ?? "N/A"}
    </Badge>
  );
}

function statusBadge(status: string, t: (k: any) => string) {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Completed: "bg-primary text-primary-foreground border-primary",
    Draft: "bg-amber-50 text-amber-600 border-amber-100",
    Archived: "bg-muted/5 text-muted border-muted/10",
  };
  const keyMap: Record<string, string>= {
    Active: "status_active", Completed: "status_completed",
    Draft: "status_draft", Archived: "status_archived",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border", map[status] ?? "")}>
      {t((keyMap[status] ?? "status_draft") as any)}
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
      <div className="space-y-6 pt-10">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full bg-muted/5 rounded-3xl" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-40 text-center space-y-8">
        <div className="h-20 w-20 bg-muted/5 rounded-3xl flex items-center justify-center mx-auto text-muted/20">
           <Database className="h-10 w-10" />
        </div>
        <p className="text-lg font-headline font-bold text-muted uppercase tracking-widest">{t("evaluations_no_results")}</p>
      </div>
    );
  }

  const avgPct = items.reduce((acc, r) => acc + Number(r.percentage), 0) / items.length;
  const classA = items.filter((r) => r.class === "A").length;
  const classB = items.filter((r) => r.class === "B").length;
  const classC = items.filter((r) => r.class === "C").length;

  return (
    <div className="space-y-16 pt-10">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t("evaluations_evaluated"), value: items.length, icon: Users, color: "text-primary" },
          { label: t("class_a"), value: classA, icon: Target, color: "text-emerald-600" },
          { label: t("class_b"), value: classB, icon: TrendingUp, color: "text-amber-600" },
          { label: t("class_c"), value: classC, icon: ShieldCheck, color: "text-red-600" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface/50 border border-muted/10 p-10 rounded-3xl relative group overflow-hidden shadow-sm hover:shadow-xl transition-all"
          >
             <div className={cn("absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 group-hover:rotate-6 transition-transform duration-700", stat.color)}>
                <stat.icon className="h-32 w-32" />
             </div>
             <p className="text-[10px] font-headline font-bold text-muted uppercase tracking-[0.2em] mb-4">{stat.label}</p>
             <p className="text-6xl font-headline font-bold text-foreground tracking-tighter leading-none">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Global Average Bar */}
      <div className="p-12 bg-primary text-primary-foreground rounded-3xl shadow-xl shadow-primary/10 relative overflow-hidden group">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
               <div className="h-20 w-20 bg-background/10 rounded-2xl flex items-center justify-center text-inherit/40 border border-background/5 shadow-inner">
                  <Activity className="h-10 w-10" />
               </div>
               <div>
                  <p className="text-[10px] font-headline font-bold text-inherit/60 uppercase tracking-[0.4em] mb-2">{t("evaluations_avg_score")}</p>
                  <p className="text-5xl font-headline font-bold text-inherit tracking-tighter leading-none">{avgPct.toFixed(1)}%</p>
               </div>
            </div>
            <div className="flex-1 max-w-md w-full space-y-4">
               <div className="h-4 bg-background/10 rounded-full p-1 border border-background/5 shadow-inner">
                  <div 
                    className="h-full bg-current rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-1000 ease-out"
                    style={{ width: `${avgPct}%` }}
                  />
               </div>
               <p className="text-[10px] font-headline font-bold text-inherit/60 uppercase tracking-widest text-center">System-wide performance aggregate</p>
            </div>
         </div>
      </div>

      {/* Result Table */}
      <div className={dataTableShell} data-testid="evaluations-summary-table">
        <div className={dataTableScroll}>
          <table className={dataTableBase}>
            <thead>
              <tr className={dataTableHeadRow}>
                <th className={cn(dataTableThSpacious, "text-start")}>{t("employees_col_name")}</th>
                <th className={cn(dataTableThSpacious, "text-start")}>{t("field_department")}</th>
                <th className={cn(dataTableThSpacious, "text-center")}>{t("evaluations_col_score")}</th>
                <th className={cn(dataTableThSpacious, "text-start")}>{t("evaluations_col_class")}</th>
                <th className={cn(dataTableThSpacious, "text-end")}>{t("common_actions")}</th>
              </tr>
            </thead>
            <tbody className={cn(dataTableBody, "font-sans")}>
              {items.map((row) => (
                <tr key={row.employee_id} className={cn(dataTableRow, "group")}>
                  <td className={cn(dataTableTdSpacious, "whitespace-nowrap")}>
                    <p className="font-headline font-bold text-foreground text-lg tracking-tight group-hover:translate-x-1 transition-transform">{row.employee_name}</p>
                    <p className="text-[9px] font-headline font-bold text-muted mt-2 uppercase tracking-widest">{row.employee_code}</p>
                  </td>
                  <td className={cn(dataTableTdSpacious, "whitespace-nowrap uppercase font-headline font-bold text-[10px] text-muted tracking-widest")}>
                    {(row as any).department_name}
                  </td>
                  <td className={cn(dataTableTdSpacious, "whitespace-nowrap text-center")}>
                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-background font-headline font-bold text-lg text-foreground border border-muted/10 shadow-sm">
                      {row.percentage}%
                    </span>
                  </td>
                  <td className={cn(dataTableTdSpacious, "whitespace-nowrap")}>{classBadge(row.class as EmployeeClass)}</td>
                  <td className={cn(dataTableTdSpacious, "text-end whitespace-nowrap")}>
                    <Link href={`/skill-matrix/employees/${row.employee_id}`}>
                      <Button
                        variant="ghost"
                        className="rounded-full h-12 px-6 border border-muted/20 hover:border-primary hover:text-primary transition-all font-headline font-bold text-[10px] tracking-widest uppercase"
                      >
                        {t("label_node_profile")} <ArrowUpRight className="ms-2 h-3 w-3 opacity-40" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const headers = getAuthHeaders();
  const t = useT();
  const { activeFactoryId } = useFactory();
  const { data: campaigns, isLoading } = useListCampaigns({ factory_id: activeFactoryId ?? undefined }, { request: { headers } });
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");

  const activeCampaigns = campaigns?.filter((c) => c.status !== "Draft") || [];

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-16 px-8 pb-32 text-foreground">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <LayoutPanelLeft className="h-6 w-6" />
             </div>
             <span className="text-[10px] font-headline font-bold tracking-[0.3em] uppercase text-muted">{t("label_analytics_hub" as any)}</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-headline font-bold text-foreground tracking-tighter leading-none">
            {t("evaluations_title")}
          </h1>
          <p className="text-muted font-medium text-xl max-w-2xl leading-relaxed">{t("evaluations_subtitle")}</p>
        </div>

        <div className="flex items-center gap-4">
           <Button variant="outline" className="rounded-full border-muted/20 bg-background text-foreground font-headline font-bold text-[11px] tracking-widest uppercase px-8 h-16 hover:shadow-lg transition-all" onClick={() => exportToPDF({
              title: t("evaluations_title"),
              filename: "Campaign_Results",
              headers: ["Employee", "Dept", "Score", "Class"],
              rows: [] // Real rows would be fetched based on selection
           })}>
              <Download className="h-4 w-4 me-3" /> PDF
           </Button>
           <Button variant="outline" className="rounded-full border-muted/20 bg-background text-foreground font-headline font-bold text-[11px] tracking-widest uppercase px-8 h-16 hover:shadow-lg transition-all" onClick={() => exportToExcel({
              title: t("evaluations_title"),
              filename: "Campaign_Results",
              headers: ["Employee", "Dept", "Score", "Class"],
              rows: []
           })}>
              <Download className="h-4 w-4 me-3" /> EXCEL
           </Button>
        </div>
      </div>

      {/* Campaign Selector Control */}
      <Card className="bg-surface/50 border border-muted/10 rounded-3xl shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-10">
          <div className="flex items-center gap-6 text-muted">
             <Target className="h-6 w-6" />
             <p className="text-[11px] font-headline font-bold tracking-widest uppercase whitespace-nowrap">{t("label_select_mission" as any)}</p>
          </div>
          <div className="flex-1 w-full">
            {isLoading ? (
              <Skeleton className="h-16 w-full bg-muted/5 rounded-2xl" />
            ) : (
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger className="h-16 bg-background border-muted/10 rounded-2xl font-headline font-bold text-[12px] tracking-widest text-foreground uppercase px-8 focus:border-primary/50">
                  <SelectValue placeholder={t("select_campaign_placeholder" as any)} />
                </SelectTrigger>
                <SelectContent className="bg-background border border-muted/10 rounded-2xl">
                  <SelectItem value="all" className="font-headline font-bold text-[11px] tracking-widest uppercase text-muted">
                     {t("all_missions" as any)}
                  </SelectItem>
                  {activeCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="font-headline font-bold text-[11px] tracking-widest uppercase py-4">
                      <div className="flex items-center gap-4">
                         <span className="text-foreground">{c.title}</span>
                         <span className="opacity-20">/</span>
                         <span className="text-[9px] text-muted tracking-[0.2em]">{c.type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Link href="/skill-matrix/campaigns">
             <Button variant="ghost" className="h-16 px-8 rounded-2xl font-headline font-bold text-[10px] tracking-widest uppercase text-muted hover:text-foreground hover:bg-muted/5 transition-all">
                {t("action_manage_missions" as any)} <ChevronRight className="ms-2 h-4 w-4" />
             </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Results View */}
      {selectedCampaignId === "all" ? (
        <div className="py-48 text-center space-y-10 border-2 border-dashed border-muted/10 rounded-3xl bg-surface/30">
          <div className="h-24 w-24 bg-muted/5 rounded-full flex items-center justify-center mx-auto text-muted/20">
             <Zap className="h-12 w-12" />
          </div>
          <div className="space-y-4">
             <p className="text-2xl font-headline font-bold text-muted uppercase tracking-widest">Awaiting Mission Selection</p>
             <p className="text-sm font-headline font-bold text-muted/60 uppercase tracking-[0.2em]">Select an active deployment to view tactical analytics</p>
          </div>
        </div>
      ) : (
        <SummaryTable campaignId={selectedCampaignId} />
      )}
    </div>
  );
}
