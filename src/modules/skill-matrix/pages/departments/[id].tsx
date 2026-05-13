import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetDepartment, useListEmployees } from "@hrm-development/api-client-react";
import { getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Skeleton } from "@shared/components/ui/skeleton";
import { Input } from "@shared/components/ui/input";
import { 
  ChevronLeft, 
  Users, 
  Building2, 
  Mail, 
  MapPin, 
  Calendar,
  ExternalLink,
  ArrowUpRight,
  Target,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { useT } from "@modules/skill-matrix/i18n";
import { useLang } from "@shared/contexts/LangContext";
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

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const headers = getAuthHeaders();
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === "ar";

  const { data: department, isLoading: loadingDept } = useGetDepartment(id!, {
    request: { headers }
  });

  const { data: employeesData, isLoading: loadingEmps } = useListEmployees(
    { department_id: id, page_size: 100 },
    { request: { headers } }
  );

  const employees = employeesData?.data || [];

  if (loadingDept) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 animate-pulse">
        <Skeleton className="h-10 w-48 bg-zinc-100 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Skeleton className="h-[400px] lg:col-span-12 bg-zinc-100 rounded-4xl" />
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="max-w-7xl mx-auto py-32 px-8 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-4xl bg-zinc-50 text-zinc-300 mb-6">
           <Building2 className="h-10 w-10" />
        </div>
        <p className="text-xl font-bold font-comfortaa text-zinc-400">{t("common_not_found")}</p>
        <Link href="/skill-matrix/departments">
          <Button variant="outline" className="rounded-full mt-8">{t("action_back")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-16 px-8 pb-32 selection:bg-zinc-900 selection:text-white">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/skill-matrix/departments">
          <Button variant="ghost" className="rounded-full gap-3 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 px-6 -ms-4">
            <ChevronLeft className={cn("h-5 w-5", isAr ? 'rotate-180' : '')} />
            <span className="font-bold text-[11px] tracking-widest uppercase">{t("action_back_to_structure")}</span>
          </Button>
        </Link>
        <div className="flex items-center gap-3 text-zinc-300">
           <ShieldCheck className="h-5 w-5" />
           <span className="text-[10px] font-bold tracking-widest uppercase">{department.code || "UNIT"}</span>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-4xl p-16 shadow-2xl shadow-zinc-200 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#3F3F46_0%,transparent_60%)] opacity-20" />
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 text-white">
           <Building2 className="h-64 w-64" />
        </div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <Badge className="rounded-full bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold tracking-widest uppercase px-6 py-2">
                 ACTIVE NODE
               </Badge>
               <span className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase">Structural Unit v4.0</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-bold font-comfortaa text-white tracking-tighter leading-none">
              {isAr ? ((department as any).name_ar || department.name) : department.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-10">
             <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                   <Users className="h-7 w-7" />
                </div>
                <div>
                   <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">{t("label_personnel_count")}</p>
                   <p className="text-3xl font-bold font-comfortaa text-white tracking-tighter">{department.employee_count}</p>
                </div>
             </div>
             <div className="h-12 w-px bg-white/5" />
             <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                   <Mail className="h-7 w-7" />
                </div>
                <div>
                   <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">{t("departments_col_manager_email")}</p>
                   <p className="text-lg font-bold font-comfortaa text-white/60 tracking-tight">{department.manager_email || "N/A"}</p>
                </div>
             </div>
          </div>

          <p className="text-white/40 font-medium text-lg max-w-3xl leading-relaxed">
            {department.description || "No detailed description provided for this organizational unit."}
          </p>
        </div>
      </motion.div>

      {/* Personnel Section */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
           <div className="space-y-3">
              <h2 className="text-3xl font-bold font-comfortaa tracking-tighter text-zinc-900 uppercase">{t("label_personnel_registry")}</h2>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Active Operatives in this Unit</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                 <Input 
                   placeholder={t("search_by_name_or_code")} 
                   className="ps-12 h-12 bg-white border-zinc-100 rounded-2xl w-64 text-sm font-bold text-zinc-900 focus-visible:ring-zinc-100"
                 />
              </div>
              <Button variant="outline" className="rounded-2xl border-zinc-100 h-12 px-6 hover:bg-zinc-50 transition-all">
                 <Filter className="h-4 w-4 me-3 opacity-40" /> {t("common_filter")}
              </Button>
           </div>
        </div>

        <div className={dataTableShell} data-testid="department-employees-table">
           {loadingEmps ? (
              <div className="p-10 space-y-6">
                 {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full bg-zinc-50 rounded-3xl" />
                 ))}
              </div>
           ) : !employees.length ? (
              <div className="p-32 text-center space-y-6">
                 <div className="h-20 w-20 bg-zinc-50 rounded-4xl flex items-center justify-center mx-auto text-zinc-200">
                    <Users className="h-10 w-10" />
                 </div>
                 <p className="text-lg font-bold font-comfortaa text-zinc-300 uppercase tracking-widest">{t("label_no_records")}</p>
              </div>
           ) : (
              <div className={dataTableScroll}>
                 <table className={dataTableBase}>
                    <thead>
                       <tr className={dataTableHeadRow}>
                          <th className={cn(dataTableThSpacious, "text-start")}>{t("employees_col_name")}</th>
                          <th className={cn(dataTableThSpacious, "text-start")}>{t("employees_col_code")}</th>
                          <th className={cn(dataTableThSpacious, "text-start")}>{t("employees_col_job_title")}</th>
                          <th className={cn(dataTableThSpacious, "text-start")}>{t("employees_col_class")}</th>
                          <th className={cn(dataTableThSpacious, "text-end")}>{t("common_actions")}</th>
                       </tr>
                    </thead>
                    <tbody className={dataTableBody}>
                       {employees.map((emp) => (
                          <tr key={emp.id} className={cn(dataTableRow, "group")}>
                             <td className={cn(dataTableTdSpacious, "whitespace-nowrap")}>
                                <Link href={`/skill-matrix/employees/${emp.id}`} className="block">
                                   <p className="font-bold text-foreground text-lg tracking-tight group-hover:translate-x-1 transition-transform font-comfortaa">{emp.full_name}</p>
                                   <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-widest">{emp.email || "—"}</p>
                                </Link>
                             </td>
                             <td className={cn(dataTableTdSpacious, "font-bold text-[11px] text-muted-foreground tracking-widest whitespace-nowrap")}>{emp.employee_code || "—"}</td>
                             <td className={cn(dataTableTdSpacious, "font-bold text-[10px] text-muted-foreground tracking-widest uppercase whitespace-nowrap")}>{emp.job_title || "OPERATIVE"}</td>
                             <td className={cn(dataTableTdSpacious, "whitespace-nowrap")}>
                                <Badge variant="outline" className={cn(
                                   "rounded-full font-bold text-[9px] tracking-widest px-3 py-1 uppercase border",
                                   emp.current_class === 'A' ? "bg-green-50 text-green-600 border-green-100" :
                                   emp.current_class === 'B' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                   emp.current_class === 'C' ? "bg-red-50 text-red-600 border-red-100" :
                                   "bg-muted/30 text-muted-foreground border-border"
                                )}>
                                   {emp.current_class || "N/A"}
                                </Badge>
                             </td>
                             <td className={cn(dataTableTdSpacious, "text-end whitespace-nowrap")}>
                                <Link href={`/skill-matrix/employees/${emp.id}`}>
                                   <Button variant="ghost" className="rounded-full h-12 px-6 border border-border hover:border-foreground transition-all font-bold text-[10px] tracking-widest uppercase">
                                      {t("label_node_profile")} <ArrowUpRight className="ms-2 h-3 w-3 opacity-40" />
                                   </Button>
                                </Link>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           )}
        </div>
      </div>

      {/* Security Footer */}
      <div className="pt-20 flex flex-col items-center gap-10">
        <div className="flex items-center gap-6 w-full max-w-md">
          <div className="h-px flex-1 bg-zinc-100" />
          <div className="flex items-center gap-4 px-10 py-4 bg-zinc-50 border border-zinc-100 text-[10px] text-zinc-400 font-bold tracking-[0.5em] uppercase rounded-full">
            <Building2 className="h-4 w-4 text-zinc-900" />
            STRUCTURAL UNIT
          </div>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
