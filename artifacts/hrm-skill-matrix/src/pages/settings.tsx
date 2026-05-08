import { useState } from "react";
import { getAuthUser, getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, User, Shield, Database, Trash2, AlertTriangle, Cpu, Terminal as TerminalIcon } from "lucide-react";
import { useT } from "@/i18n";
import { useToast } from "@/hooks/use-toast";

type Role = "super_admin" | "dept_head" | "hr_coordinator" | "employee";

const roleBadgeClass: Record<Role, string> = {
  super_admin: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  dept_head: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  hr_coordinator: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  employee: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function SettingsPage() {
  const user = getAuthUser();
  const role = (user?.role as Role) ?? "employee";
  const t = useT();
  const { toast } = useToast();
  
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const roleLabelKey: Record<Role, Parameters<typeof t>[0]> = {
    super_admin: "role_super_admin",
    dept_head: "role_dept_head_full",
    hr_coordinator: "role_hr_coordinator",
    employee: "role_employee",
  };

  const rolePermissionKeys: Record<Role, Parameters<typeof t>[0][]> = {
    super_admin: ["perm_super_admin_1", "perm_super_admin_2", "perm_super_admin_3", "perm_super_admin_4", "perm_super_admin_5", "perm_super_admin_6"],
    hr_coordinator: ["perm_hr_1", "perm_hr_2", "perm_hr_3", "perm_hr_4", "perm_hr_5"],
    dept_head: ["perm_dept_1", "perm_dept_2", "perm_dept_3", "perm_dept_4"],
    employee: ["perm_emp_1", "perm_emp_2", "perm_emp_3"],
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/demo/seed", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: t("common_saved"), description: t("campaign_scores_saved") });
      window.location.reload();
    } catch (err) {
      toast({ title: t("common_failed"), description: String(err), variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t("settings_demo_warning"))) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/demo/reset", {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "System Reset", description: "Database has been cleared." });
      window.location.reload();
    } catch (err) {
      toast({ title: t("common_failed"), description: String(err), variant: "destructive" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-700">
      {/* Header */}
      <div className="relative p-6 border border-zinc-800 bg-[#0A0A0A] overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-s-2 border-zinc-600" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-e-2 border-zinc-600" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-s-2 border-zinc-600" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-e-2 border-zinc-600" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-3">
              <Cpu className="h-8 w-8 text-amber-500" />
              {t("settings_title")}
            </h2>
            <p className="text-zinc-500 font-mono text-sm mt-1 uppercase tracking-widest">
              SYSTEM_CONFIG // WORKSTATION_PARAMETERS
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Section */}
        <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <User className="h-12 w-12 text-white" />
          </div>
          <CardHeader className="border-b border-zinc-900 pb-4">
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <TerminalIcon className="h-4 w-4 text-amber-500" />
              {t("settings_account")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                {user?.full_name?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="font-bold text-xl text-white tracking-tight">{user?.full_name}</p>
                <p className="text-xs font-mono text-zinc-500 uppercase">{user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase">{t("settings_role")}</span>
                <Badge variant="outline" className={roleBadgeClass[role]}>{t(roleLabelKey[role])}</Badge>
              </div>
              {user?.department && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500 uppercase">{t("settings_department")}</span>
                  <span className="text-sm font-bold text-zinc-300">{user.department.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Section */}
        <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none relative overflow-hidden">
          <CardHeader className="border-b border-zinc-900 pb-4">
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              {t("settings_role_permissions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {(rolePermissionKeys[role] ?? []).map((key) => (
                <li key={key} className="flex items-start gap-3 text-xs font-mono text-zinc-400 group">
                  <div className="mt-1 h-1.5 w-1.5 bg-amber-500/40 group-hover:bg-amber-500 transition-colors" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Demo Mode Section (Super Admin Only) */}
      {role === "super_admin" && (
        <Card className="bg-[#0D0D0D] border-red-900/30 rounded-none relative overflow-hidden border-2 shadow-[0_0_30px_rgba(220,38,38,0.05)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rotate-45 translate-x-16 -translate-y-16" />
          <CardHeader className="border-b border-red-900/20 pb-4">
            <CardTitle className="text-sm font-mono uppercase tracking-widest text-red-500 flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t("settings_demo_mode")}
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs uppercase font-mono mt-1">
              {t("settings_demo_mode_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="p-4 bg-red-950/20 border border-red-900/30 flex gap-4 items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-red-400 leading-relaxed uppercase">
                {t("settings_demo_warning")}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSeed}
                disabled={isSeeding || isResetting}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-none font-mono uppercase text-xs tracking-widest h-12"
              >
                {isSeeding ? t("settings_demo_seeding") : t("settings_seed_demo")}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReset}
                disabled={isSeeding || isResetting}
                className="flex-1 rounded-none font-mono uppercase text-xs tracking-widest h-12 border border-red-600/50"
              >
                <Trash2 className="me-2 h-4 w-4" />
                {isResetting ? t("settings_demo_resetting") : t("settings_reset_system")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information Section */}
      <Card className="bg-[#0D0D0D] border-zinc-800 rounded-none">
        <CardHeader className="border-b border-zinc-900 pb-4">
          <CardTitle className="text-sm font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <TerminalIcon className="h-4 w-4 text-zinc-600" />
            {t("settings_system_info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
          {[
            { label: t("settings_system"), value: t("settings_system_value") },
            { label: t("settings_industry"), value: t("settings_industry_value") },
            { label: t("settings_skill_scale"), value: t("settings_skill_scale_value") },
            { label: t("settings_classification"), value: t("settings_classification_value") },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-900 last:border-0 sm:last:border-b">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{item.label}</span>
              <span className="text-xs font-mono text-zinc-300 uppercase">{item.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2 sm:col-span-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{t("settings_built_by")}</span>
            <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-amber-500 hover:text-amber-400 transition-colors uppercase underline decoration-amber-500/30 underline-offset-4">
              yasserious.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
