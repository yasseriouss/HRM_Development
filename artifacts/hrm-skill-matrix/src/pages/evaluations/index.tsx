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
import { ClipboardList, Users, TrendingUp, FileText, ExternalLink, Table, Download, Activity, Target, ShieldCheck, Database, LayoutPanelLeft } from "lucide-react";
import { useT } from "@/i18n";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";
import { motion } from "framer-motion";

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
  const map: Record<string, string> = {
    A: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    B: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    C: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  };
  return (
    <Badge variant="outline" className={`rounded-none font-mono text-[10px] font-black px-2 py-0.5 ${map[cls ?? ""] ?? "border-zinc-800 text-zinc-500"}`}>
      {cls ?? "N/A"}
    </Badge>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
    Completed: "border-blue-500/30 bg-blue-500/10 text-blue-500",
    Draft: "border-amber-500/30 bg-amber-500/10 text-amber-500",
    Archived: "border-zinc-700 bg-zinc-900 text-zinc-500",
  };
  return (
    <Badge variant="outline" className={`rounded-none font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase ${map[status] ?? ""}`}>
      {status}
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
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-zinc-900 rounded-none" />)}
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t("evaluations_evaluated"), value: items.length, color: "primary", icon: Users },
          { label: t("class_a"), value: classA, color: "emerald", icon: Target },
          { label: t("class_b"), value: classB, color: "amber", icon: TrendingUp },
          { label: t("class_c"), value: classC, color: "rose", icon: ShieldCheck }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 relative group overflow-hidden">
             <stat.icon className={`absolute -right-2 -bottom-2 h-12 w-12 text-${stat.color}-500 opacity-5 group-hover:opacity-10 transition-opacity`} />
             <p className="text-[9px] font-headline font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
             <p className={`text-3xl font-mono font-black text-white mt-2`}>{stat.value}</p>
             <CornerMarks color={stat.color} />
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-zinc-900/30 border-l-4 border-primary">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-none bg-primary/10 flex items-center justify-center border border-primary/20">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{t("evaluations_avg_score")}</p>
            <p className="text-2xl font-mono font-black text-white">{avgPct.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-none border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white font-headline font-black text-[10px] tracking-widest uppercase h-auto py-3 px-6"
            onClick={() => exportToPDF({
              title: `${t("evaluations_title")} - ${campaignId}`,
              filename: `Evaluation_Report_${campaignId}`,
              headers: [t("field_employee"), t("field_code"), t("evaluations_col_score"), "%", t("field_class")],
              rows: items.map(r => [r.employee_name ?? "—", r.employee_code ?? "—", `${Number(r.total_score).toFixed(0)}/${Number(r.max_possible_score).toFixed(0)}`, `${Number(r.percentage).toFixed(1)}%`, r.class ?? "—"])
            })}
          >
            <Download className="h-4 w-4 mr-2 text-primary" /> PDF_EXPORT
          </Button>
          <Button
            variant="outline"
            className="rounded-none border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white font-headline font-black text-[10px] tracking-widest uppercase h-auto py-3 px-6"
            onClick={() => exportToExcel({
              title: `${t("evaluations_title")} - ${campaignId}`,
              filename: `Evaluation_Export_${campaignId}`,
              headers: [t("field_employee"), t("field_code"), t("evaluations_col_score"), "Percentage", t("field_class")],
              rows: items.map(r => [r.employee_name ?? "—", r.employee_code ?? "—", `${Number(r.total_score).toFixed(0)}/${Number(r.max_possible_score).toFixed(0)}`, Number(r.percentage), r.class ?? "—"])
            })}
          >
            <Table className="h-4 w-4 mr-2 text-emerald-500" /> EXCEL_SYNC
          </Button>
        </div>
      </div>

      <div className="border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-500">
              <th className="px-6 py-4 font-headline font-black text-[10px] uppercase tracking-widest text-start">{t("field_employee")}</th>
              <th className="px-6 py-4 font-headline font-black text-[10px] uppercase tracking-widest text-start">{t("field_code")}</th>
              <th className="px-6 py-4 font-headline font-black text-[10px] uppercase tracking-widest text-end">{t("evaluations_col_score")}</th>
              <th className="px-6 py-4 font-headline font-black text-[10px] uppercase tracking-widest text-end">%</th>
              <th className="px-6 py-4 font-headline font-black text-[10px] uppercase tracking-widest text-start">{t("field_class")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4 font-headline font-black text-white uppercase group-hover:text-primary transition-colors">
                  <Link href={`/employees/${row.employee_id}`}>
                    {row.employee_name ?? "—"}
                  </Link>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-zinc-500 whitespace-nowrap uppercase tracking-tighter">{row.employee_code ?? "—"}</td>
                <td className="px-6 py-4 text-end font-mono text-sm text-zinc-400 whitespace-nowrap uppercase tracking-tighter">
                  {Number(row.total_score).toFixed(0)} / {Number(row.max_possible_score).toFixed(0)}
                </td>
                <td className="px-6 py-4 text-end font-mono font-black text-white whitespace-nowrap">{Number(row.percentage).toFixed(1)}%</td>
                <td className="px-6 py-4 whitespace-nowrap">{classBadge(row.class as EmployeeClass)}</td>
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
    <div className="space-y-10 pb-20 font-sans text-white">
      {/* Header */}
      <div className="relative p-10 bg-[#0A0A0A] border-2 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="font-headline font-black tracking-[0.4em] text-[9px] text-primary uppercase">EVALUATION_INTELLIGENCE</span>
            </div>
            <h2 className="text-5xl font-headline font-black tracking-tighter text-white uppercase leading-none">
              {t("evaluations_title")}
            </h2>
            <p className="text-secondary/40 font-medium border-l-2 border-primary/20 pl-4">{t("evaluations_subtitle")}</p>
          </div>
        </div>
        <CornerMarks />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaignsLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full bg-zinc-900 rounded-none" />)
        ) : (
          <>
            <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none p-8 relative overflow-hidden group">
              <ClipboardList className="absolute -right-2 -bottom-2 h-16 w-16 text-primary opacity-5 group-hover:opacity-10 transition-opacity" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{t("evaluations_total")}</p>
              <h3 className="text-4xl font-mono font-black text-white">{allCampaigns.length}</h3>
              <CornerMarks />
            </Card>
            <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none p-8 relative overflow-hidden group">
              <Activity className="absolute -right-2 -bottom-2 h-16 w-16 text-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{t("evaluations_active")}</p>
              <h3 className="text-4xl font-mono font-black text-emerald-500">{activeCampaigns.length}</h3>
              <CornerMarks color="emerald" />
            </Card>
            <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none p-8 relative overflow-hidden group">
              <ShieldCheck className="absolute -right-2 -bottom-2 h-16 w-16 text-blue-500 opacity-5 group-hover:opacity-10 transition-opacity" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">{t("evaluations_completed_count")}</p>
              <h3 className="text-4xl font-mono font-black text-blue-400">{completedCampaigns.length}</h3>
              <CornerMarks color="blue" />
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-8">
          <div className="p-1 bg-zinc-900/50 border border-zinc-800 flex flex-wrap gap-2">
            <Button 
              variant={selectedCampaignId === "all" ? "default" : "ghost"}
              className={`rounded-none font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto ${selectedCampaignId === "all" ? "bg-primary" : "text-zinc-500 hover:text-white"}`}
              onClick={() => setSelectedCampaignId("all")}
            >
              ALL_MISSIONS
            </Button>
            {activeCampaigns.map(c => (
              <Button 
                key={c.id}
                variant={selectedCampaignId === c.id ? "default" : "ghost"}
                className={`rounded-none font-headline font-black text-[10px] tracking-widest uppercase py-6 px-8 h-auto ${selectedCampaignId === c.id ? "bg-primary" : "text-zinc-500 hover:text-white"}`}
                onClick={() => setSelectedCampaignId(c.id)}
              >
                {c.title}
              </Button>
            ))}
          </div>

          {selectedCampaign ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                <div>
                   <h3 className="text-3xl font-headline font-black text-white uppercase tracking-tighter">{selectedCampaign.title}</h3>
                   <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">{selectedCampaign.type}</span>
                      <div className="h-1 w-1 rounded-full bg-zinc-800" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                         {new Date(selectedCampaign.start_date).toLocaleDateString()} — {new Date(selectedCampaign.end_date).toLocaleDateString()}
                      </span>
                   </div>
                </div>
                {statusBadge(selectedCampaign.status)}
              </div>
              <SummaryTable campaignId={selectedCampaign.id} />
              
              <div className="pt-6">
                <Link href={`/campaigns/${selectedCampaign.id}`}>
                  <Button className="rounded-none border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-headline font-black text-[11px] tracking-widest uppercase h-auto py-5 px-10">
                     ENTER_SCORE_INTERFACE <ExternalLink className="ml-3 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {allCampaigns.map(c => (
                 <motion.div 
                    key={c.id} 
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedCampaignId(c.id)}
                    className="cursor-pointer"
                 >
                    <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none p-8 hover:border-primary/50 transition-all relative group">
                       <div className="flex justify-between items-start mb-6">
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{c.type}</span>
                          {statusBadge(c.status)}
                       </div>
                       <h4 className="text-xl font-headline font-black text-white uppercase group-hover:text-primary transition-colors tracking-tight leading-tight">{c.title}</h4>
                       <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                          <span className="text-zinc-500">{t("evaluations_evaluated_count", { evaluated: c.evaluated_count, total: c.total_employees })}</span>
                          <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <CornerMarks />
                    </Card>
                 </motion.div>
               ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="bg-[#0A0A0A] border-2 border-primary/20 rounded-none p-0 overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="p-8 space-y-8 relative z-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                <LayoutPanelLeft className="h-5 w-5 text-primary" />
                <h3 className="font-headline font-black text-sm uppercase tracking-widest text-white">OPERATIONAL_TOOLS</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">SPREADSHEET_MODULE</p>
                  <Button asChild variant="outline" className="w-full justify-between h-auto py-5 rounded-none border-zinc-800 bg-zinc-900 hover:bg-zinc-800 group border-l-4 border-l-emerald-500">
                    <a href="/hrm-spreadsheet" className="flex items-center gap-3 w-full">
                      <Table className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="font-headline font-black text-[10px] tracking-widest uppercase text-white flex-1 text-left">{t("evaluations_spreadsheet_tool")}</span>
                      <ExternalLink className="h-3 w-3 text-zinc-600" />
                    </a>
                  </Button>
                  <p className="text-[9px] font-mono text-zinc-600 leading-relaxed uppercase tracking-tighter italic">
                    {t("evaluations_spreadsheet_desc")}
                  </p>
                </div>

                <div className="space-y-2 pt-6 border-t border-white/5">
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">OFFLINE_SYNCHRONIZATION</p>
                  <Button asChild variant="outline" className="w-full justify-between h-auto py-5 rounded-none border-zinc-800 bg-zinc-900 hover:bg-zinc-800 group border-l-4 border-l-blue-500">
                    <a href="/hrm-skill-matrix-template.xlsx" download className="flex items-center gap-3 w-full">
                      <FileText className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                      <span className="font-headline font-black text-[10px] tracking-widest uppercase text-white flex-1 text-left">{t("evaluations_download_template")}</span>
                      <Download className="h-3 w-3 text-zinc-600" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            <CornerMarks />
          </Card>

          <div className="p-8 border-2 border-emerald-500/10 bg-emerald-500/[0.02] relative overflow-hidden group">
             <Activity className="absolute -right-4 -top-4 h-24 w-24 text-emerald-500 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12" />
             <p className="font-headline font-black text-[11px] text-emerald-500 uppercase tracking-[0.3em] mb-4">SYSTEM_INTELLIGENCE</p>
             <p className="text-xs text-zinc-500 leading-relaxed uppercase tracking-tight font-medium">
               HRM Suite connects evaluation data directly to the analytics engine for real-time factory intelligence.
             </p>
             <div className="mt-8 flex items-center gap-3 group/link cursor-pointer">
                <span className="font-headline font-black text-[10px] text-white tracking-widest uppercase border-b border-transparent group-hover/link:border-emerald-500 transition-all">ACCESS_ANALYTICS</span>
                <TrendingUp className="h-3 w-3 text-emerald-500 group-hover/link:translate-x-1 transition-transform" />
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
