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
import { ClipboardList, Users, TrendingUp, FileText, ExternalLink, Table, Download, Activity, Target, ShieldCheck, Database, LayoutPanelLeft, ArrowUpRight, Zap, ChevronRight } from "lucide-react";
import { useT } from "@modules/skill-matrix/i18n";
import { exportToPDF, exportToExcel } from "@modules/skill-matrix/lib/export-utils";
import { motion } from "framer-motion";
import { useFactory } from "@shared/contexts/FactoryContext";
import { cn } from "@shared/utils/cn";

type EmployeeClass = "A" | "B" | "C" | null | undefined;

function classBadge(cls: EmployeeClass) {
  const map: Record<string, string> = {
    A: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
    B: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
    C: "bg-red-50 text-red-600 border-red-100 shadow-red-100/50",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border shadow-sm", map[cls ?? ""] ?? "bg-zinc-50 text-zinc-400 border-zinc-100")}>
      {cls ?? "N/A"}
    </Badge>
  );
}

function statusBadge(status: string, t: (k: any) => string) {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Completed: "bg-zinc-900 text-white border-zinc-900",
    Draft: "bg-amber-50 text-amber-600 border-amber-100",
    Archived: "bg-zinc-50 text-zinc-400 border-zinc-100",
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
      <div className="space-y-6 pt-10">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full bg-zinc-50 rounded-3xl" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-40 text-center space-y-8">
        <div className="h-20 w-20 bg-zinc-50 rounded-4xl flex items-center justify-center mx-auto text-zinc-200">
           <Database className="h-10 w-10" />
        </div>
        <p className="text-lg font-bold font-comfortaa text-zinc-300 uppercase tracking-widest">{t("evaluations_no_results")}</p>
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
          { label: t("evaluations_evaluated"), value: items.length, icon: Users, color: "zinc" },
          { label: t("class_a"), value: classA, icon: Target, color: "emerald" },
          { label: t("class_b"), value: classB, icon: TrendingUp, color: "amber" },
          { label: t("class_c"), value: classC, icon: ShieldCheck, color: "red" }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-zinc-100 p-10 rounded-4xl relative group overflow-hidden shadow-sm hover:shadow-xl transition-all"
          >
             <div className={cn("absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 group-hover:rotate-6 transition-transform duration-700")}>
                <stat.icon className="h-32 w-32" />
             </div>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
             <p className="text-6xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Global Average Bar */}
      <div className="p-12 bg-zinc-900 rounded-4xl shadow-2xl shadow-zinc-200 relative overflow-hidden group">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#3F3F46_0%,transparent_60%)] opacity-20" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
               <div className="h-20 w-20 bg-white/10 rounded-3xl flex items-center justify-center text-white/40 border border-white/5 shadow-inner">
                  <Activity className="h-10 w-10" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-2">{t("evaluations_avg_score")}</p>
                  <p className="text-5xl font-bold font-comfortaa text-white tracking-tighter leading-none">{avgPct.toFixed(1)}%</p>
               </div>
            </div>
            <div className="flex-1 max-w-md w-full space-y-4">
               <div className="h-4 bg-white/5 rounded-full p-1 border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-1000 ease-out"
                    style={{ width: `${avgPct}%` }}
                  />
               </div>
               <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">System-wide performance aggregate</p>
            </div>
         </div>
      </div>

      {/* Result Table */}
      <div className="bg-white border border-zinc-100 rounded-4xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-50">
                <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-start">{t("employees_col_name")}</th>
                <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-start">{t("field_department")}</th>
                <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-center">{t("evaluations_col_score")}</th>
                <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-start">{t("evaluations_col_class")}</th>
                <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase whitespace-nowrap text-end">{t("common_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-sans">
              {items.map((row) => (
                <tr key={row.employee_id} className="group transition-all hover:bg-zinc-50/50">
                  <td className="px-10 py-10 whitespace-nowrap">
                    <p className="font-bold text-zinc-900 text-lg tracking-tight group-hover:translate-x-1 transition-transform font-comfortaa">{row.employee_name}</p>
                    <p className="text-[9px] font-bold text-zinc-300 mt-2 uppercase tracking-widest">{row.employee_code}</p>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap uppercase font-bold text-[10px] text-zinc-400 tracking-widest">{(row as any).department_name}</td>
                  <td className="px-10 py-10 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-50 font-bold text-lg text-zinc-900 font-comfortaa">
                      {row.percentage}%
                    </span>
                  </td>
                  <td className="px-10 py-10 whitespace-nowrap">{classBadge(row.class as EmployeeClass)}</td>
                  <td className="px-10 py-10 text-end whitespace-nowrap">
                    <Link href={`/skill-matrix/employees/${row.employee_id}`}>
                      <Button variant="ghost" className="rounded-full h-12 px-6 border border-zinc-50 hover:border-zinc-900 transition-all font-bold text-[10px] tracking-widest uppercase">
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
    <div className="max-w-7xl mx-auto space-y-16 py-16 px-8 pb-32">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
                <LayoutPanelLeft className="h-6 w-6" />
             </div>
             <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{t("label_analytics_hub")}</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none">
            {t("evaluations_title")}
          </h1>
          <p className="text-zinc-500 font-medium text-xl max-w-2xl leading-relaxed">{t("evaluations_subtitle")}</p>
        </div>

        <div className="flex items-center gap-4">
           <Button variant="outline" className="rounded-full border-zinc-100 bg-white text-zinc-900 font-bold text-[11px] tracking-widest uppercase px-8 h-16 hover:shadow-lg transition-all" onClick={() => exportToPDF({
              title: t("evaluations_title"),
              filename: "Campaign_Results",
              headers: ["Employee", "Dept", "Score", "Class"],
              rows: [] // Real rows would be fetched based on selection
           })}>
              <Download className="h-4 w-4 me-3" /> PDF
           </Button>
           <Button variant="outline" className="rounded-full border-zinc-100 bg-white text-zinc-900 font-bold text-[11px] tracking-widest uppercase px-8 h-16 hover:shadow-lg transition-all" onClick={() => exportToExcel({
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
      <Card className="bg-white border-zinc-100 rounded-4xl shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-10">
          <div className="flex items-center gap-6 text-zinc-400">
             <Target className="h-6 w-6" />
             <p className="text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">{t("label_select_mission")}</p>
          </div>
          <div className="flex-1 w-full">
            {isLoading ? (
              <Skeleton className="h-16 w-full bg-zinc-50 rounded-3xl" />
            ) : (
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger className="h-16 bg-zinc-50 border-transparent rounded-3xl font-bold text-[12px] tracking-widest text-zinc-900 uppercase px-8">
                  <SelectValue placeholder={t("select_campaign_placeholder")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-100 rounded-3xl">
                  <SelectItem value="all" className="font-bold text-[11px] tracking-widest uppercase text-zinc-400">
                     {t("all_missions")}
                  </SelectItem>
                  {activeCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="font-bold text-[11px] tracking-widest uppercase py-4">
                      <div className="flex items-center gap-4">
                         <span className="text-zinc-900">{c.title}</span>
                         <span className="opacity-20">/</span>
                         <span className="text-[9px] text-zinc-400 tracking-[0.2em]">{c.type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Link href="/skill-matrix/campaigns">
             <Button variant="ghost" className="h-16 px-8 rounded-3xl font-bold text-[10px] tracking-widest uppercase text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all">
                {t("action_manage_missions")} <ChevronRight className="ms-2 h-4 w-4" />
             </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Results View */}
      {selectedCampaignId === "all" ? (
        <div className="py-48 text-center space-y-10 border-2 border-dashed border-zinc-100 rounded-4xl">
          <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
             <Zap className="h-12 w-12" />
          </div>
          <div className="space-y-4">
             <p className="text-2xl font-bold font-comfortaa text-zinc-300 uppercase tracking-widest">Awaiting Mission Selection</p>
             <p className="text-sm font-medium text-zinc-400 uppercase tracking-[0.2em]">Select an active deployment to view tactical analytics</p>
          </div>
        </div>
      ) : (
        <SummaryTable campaignId={selectedCampaignId} />
      )}
    </div>
  );
}
