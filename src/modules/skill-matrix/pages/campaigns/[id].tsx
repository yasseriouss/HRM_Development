import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { useT } from "@modules/skill-matrix/i18n";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { 
  ChevronLeft, 
  Target, 
  Users, 
  ShieldCheck, 
  ArrowUpRight, 
  Save, 
  Loader2, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@shared/hooks/use-toast";
import { cn } from "@shared/utils/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import { Input } from "@shared/components/ui/input";

// Types based on server response
interface MatrixRow {
  employee: any;
  scores: Record<string, number>;
  total_score: number | null;
  max_score: number | null;
  percentage: number | null;
  class: string | null;
}

interface CampaignMatrix {
  campaign: any;
  skills: any[];
  rows: MatrixRow[];
}

const SCORE_LABELS: Record<number, string> = {
  0: "Cannot perform",
  1: "With supervision",
  2: "Occasional help",
  3: "Independently",
  4: "Expert / Trainer"
};

const SCORE_COLORS: Record<number, string> = {
  0: "bg-red-50 text-red-600 border-red-100",
  1: "bg-orange-50 text-orange-600 border-orange-100",
  2: "bg-amber-50 text-amber-600 border-amber-100",
  3: "bg-blue-50 text-blue-600 border-blue-100",
  4: "bg-emerald-50 text-emerald-600 border-emerald-100"
};

function classBadge(cls: string | null, t: any) {
  const map: Record<string, string> = {
    A: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
    B: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50",
    C: "bg-red-50 text-red-600 border-red-100 shadow-red-100/50",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border shadow-sm", map[cls ?? ""] ?? "bg-zinc-50 text-zinc-400 border-zinc-100")}>
      {cls || "N/A"}
    </Badge>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams();
  const headers = getAuthHeaders();
  const t = useT();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAr = document.documentElement.dir === "rtl";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  // Fetch Matrix Data
  const { data: matrix, isLoading } = useQuery<CampaignMatrix>({
    queryKey: ["campaign-matrix", id],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${id}/matrix`, { headers });
      if (!res.ok) throw new Error("Failed to fetch matrix");
      return res.json();
    }
  });

  // Save Score Mutation
  const saveScoreMutation = useMutation({
    mutationFn: async ({ employeeId, skillId, score }: { employeeId: string, skillId: string, score: number }) => {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ campaign_id: id, employee_id: employeeId, skill_id: skillId, score })
      });
      if (!res.ok) throw new Error("Failed to save score");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-matrix", id] });
    },
    onError: () => {
      toast({ title: t("common_failed"), variant: "destructive" });
    }
  });

  const filteredRows = useMemo(() => {
    if (!matrix) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matrix.rows;
    return matrix.rows.filter(r => 
      r.employee.full_name.toLowerCase().includes(q) || 
      r.employee.employee_code.toLowerCase().includes(q)
    );
  }, [matrix, searchQuery]);

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-12 py-16 px-8 animate-pulse">
        <Skeleton className="h-10 w-48 bg-zinc-100 rounded-full" />
        <div className="space-y-6">
          <Skeleton className="h-32 w-full bg-zinc-100 rounded-4xl" />
          <Skeleton className="h-[600px] w-full bg-zinc-100 rounded-4xl" />
        </div>
      </div>
    );
  }

  if (!matrix) return null;

  const campaign = matrix.campaign;
  const skills = matrix.skills;

  return (
    <div className="max-w-[1800px] mx-auto space-y-12 py-16 px-8 pb-32">
      {/* Top Navigation & Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        <div className="space-y-6">
          <Link href="/skill-matrix/campaigns">
            <Button variant="ghost" className="rounded-full gap-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 px-6 -ms-4">
              <ChevronLeft className={cn("h-5 w-5", isAr ? 'rotate-180' : '')} />
              <span className="font-bold text-[11px] tracking-widest uppercase">{t("action_back_to_missions")}</span>
            </Button>
          </Link>
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-zinc-200">
                   <Target className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400">{campaign.type} DEPLOYMENT</span>
             </div>
             <h1 className="text-6xl lg:text-7xl font-bold font-comfortaa text-zinc-900 tracking-tighter leading-none uppercase">
                {campaign.title}
             </h1>
             <p className="text-zinc-500 font-medium text-lg max-w-2xl leading-relaxed italic">{campaign.notes || "No mission objectives specified."}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-full border border-zinc-100 shadow-sm">
           <div className="px-6 py-3 border-r border-zinc-100">
              <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">TOTAL NODES</p>
              <p className="text-xl font-bold font-comfortaa text-zinc-900">{campaign.total_employees}</p>
           </div>
           <div className="px-6 py-3">
              <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">EVALUATED</p>
              <p className="text-xl font-bold font-comfortaa text-zinc-900">{campaign.evaluated_count}</p>
           </div>
           <div className="ps-2">
              <Button variant="outline" className="rounded-full border-zinc-100 font-bold text-[10px] tracking-widest uppercase h-14 px-8">
                 <Download className="h-4 w-4 me-3" /> EXPORT MATRIX
              </Button>
           </div>
        </div>
      </div>

      {/* Control Bar */}
      <Card className="bg-white border-zinc-100 rounded-4xl shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
           <div className="flex-1 w-full relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
              <Input
                placeholder={t("search_nodes_placeholder")}
                className="ps-14 h-16 bg-zinc-50 border-transparent rounded-3xl text-sm font-bold text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-zinc-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-4 text-zinc-300">
              <Filter className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("label_active_filters")}: NONE</span>
           </div>
        </CardContent>
      </Card>

      {/* Spreadsheet Evaluation Grid */}
      <div className="bg-white border border-zinc-100 rounded-4xl shadow-sm overflow-hidden relative">
        <div className="overflow-auto max-h-[800px] scrollbar-thin scrollbar-thumb-zinc-200">
          <table className="w-full text-start border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-zinc-50/80 backdrop-blur-md border-b border-zinc-100">
                <th className="sticky left-0 z-30 bg-zinc-50/80 backdrop-blur-md px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-400 uppercase text-start min-w-[300px] border-e border-zinc-100/50">
                  {t("employees_col_name")}
                </th>
                {skills.map((skill) => (
                  <th key={skill.id} className={cn(
                    "px-6 py-8 font-bold text-[10px] tracking-widest uppercase text-center min-w-[140px] border-e border-zinc-100/50 transition-colors",
                    activeSkillId === skill.id ? "text-zinc-900 bg-zinc-100/50" : "text-zinc-400"
                  )}>
                    <div className="space-y-2">
                       <p className="line-clamp-1">{skill.name}</p>
                       <p className="text-[8px] opacity-40">W: {skill.weight}</p>
                    </div>
                  </th>
                ))}
                <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-900 uppercase text-center min-w-[120px] bg-zinc-100/30">
                  {t("evaluations_col_score")}
                </th>
                <th className="px-10 py-8 font-bold text-[10px] tracking-widest text-zinc-900 uppercase text-start min-w-[100px] bg-zinc-100/30">
                  {t("evaluations_col_class")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredRows.map((row) => (
                <tr key={row.employee.id} className="group hover:bg-zinc-50/50 transition-all">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-zinc-50/80 backdrop-blur-md px-10 py-8 border-e border-zinc-100/50">
                    <div className="flex items-center gap-5">
                       <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white text-sm font-bold font-comfortaa">
                          {row.employee.full_name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-zinc-900 text-base tracking-tight font-comfortaa">{row.employee.full_name}</p>
                          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mt-1">{row.employee.employee_code}</p>
                       </div>
                    </div>
                  </td>
                  
                  {skills.map((skill) => {
                    const score = row.scores[skill.id] ?? null;
                    const isSaving = saveScoreMutation.variables?.employeeId === row.employee.id && 
                                   saveScoreMutation.variables?.skillId === skill.id &&
                                   saveScoreMutation.isPending;

                    return (
                      <td 
                        key={skill.id} 
                        className={cn(
                          "px-4 py-8 text-center border-e border-zinc-100/50 transition-all",
                          activeSkillId === skill.id && "bg-zinc-50/50"
                        )}
                        onMouseEnter={() => setActiveSkillId(skill.id)}
                        onMouseLeave={() => setActiveSkillId(null)}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={cn(
                              "w-12 h-12 rounded-2xl font-bold font-comfortaa text-lg border transition-all flex items-center justify-center relative group/btn overflow-hidden shadow-sm",
                              score !== null ? SCORE_COLORS[score] : "bg-white text-zinc-200 border-zinc-100 hover:border-zinc-300"
                            )}>
                              <AnimatePresence mode="wait">
                                {isSaving ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                                ) : (
                                  <motion.span 
                                    key={score}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative z-10"
                                  >
                                    {score ?? "—"}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                              {score === null && !isSaving && (
                                <div className="absolute inset-0 bg-zinc-900 opacity-0 group-hover/btn:opacity-[0.03] transition-opacity" />
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3 bg-white border border-zinc-100 rounded-3xl shadow-2xl z-[50]">
                            <div className="space-y-1">
                              {[4, 3, 2, 1, 0].map((s) => (
                                <button
                                  key={s}
                                  className={cn(
                                    "w-full text-start p-3 rounded-2xl flex items-center justify-between group/opt transition-all",
                                    score === s ? "bg-zinc-900 text-white" : "hover:bg-zinc-50"
                                  )}
                                  onClick={() => saveScoreMutation.mutate({ employeeId: row.employee.id, skillId: skill.id, score: s })}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={cn(
                                      "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold font-comfortaa border",
                                      score === s ? "bg-white/10 border-white/20" : SCORE_COLORS[s]
                                    )}>
                                      {s}
                                    </span>
                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", score === s ? "text-white/60" : "text-zinc-400")}>
                                      {SCORE_LABELS[s]}
                                    </span>
                                  </div>
                                  {score === s && <CheckCircle2 className="h-4 w-4 text-white" />}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                    );
                  })}

                  <td className="px-10 py-8 text-center bg-zinc-50/20">
                    <div className="inline-flex flex-col items-center">
                       <span className="text-xl font-bold font-comfortaa text-zinc-900">{row.percentage ? `${row.percentage}%` : "—"}</span>
                       {row.total_score !== null && (
                         <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest mt-1">
                           {row.total_score} / {row.max_score}
                         </span>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-8 bg-zinc-50/20">{classBadge(row.class, t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Info & Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10">
         <div className="lg:col-span-8 bg-zinc-50/50 rounded-4xl p-10 flex flex-wrap gap-10">
            <div className="space-y-4">
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">SCORING LEGEND</p>
               <div className="flex flex-wrap gap-6">
                  {[0,1,2,3,4].map(s => (
                    <div key={s} className="flex items-center gap-3">
                       <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-comfortaa border", SCORE_COLORS[s])}>{s}</span>
                       <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{SCORE_LABELS[s]}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
         
         <div className="lg:col-span-4 flex items-center justify-end gap-6 text-zinc-300">
            <div className="h-px w-12 bg-zinc-100" />
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em]">
               <ShieldCheck className="h-4 w-4 text-zinc-900" />
               ENCRYPTED MISSION LOG
            </div>
         </div>
      </div>
    </div>
  );
}
