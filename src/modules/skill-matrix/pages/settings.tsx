import { useState } from "react";
import { getAuthUser, getAuthHeaders } from "@modules/skill-matrix/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Building2, User, Shield, Database, Trash2, AlertTriangle, Cpu, Terminal as TerminalIcon } from "lucide-react";
import { useT } from "@modules/skill-matrix/i18n";
import { useToast } from "@shared/hooks/use-toast";

type Role = "super_admin" | "dept_head" | "hr_coordinator" | "employee";

const roleBadgeClass: Record<Role, string>= {
  super_admin: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  dept_head: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  hr_coordinator: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  employee: "bg-muted/10 text-muted border-muted/20",
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
      <div className="relative p-8 border border-muted/10 bg-surface/50 overflow-hidden rounded-3xl shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-headline font-bold tracking-tight uppercase text-foreground flex items-center gap-3">
              <Cpu className="h-8 w-8 text-primary" />{t("settings_title")}
            </h2>
            <p className="text-muted font-headline font-bold text-sm mt-2 uppercase tracking-widest">SYSTEM CONFIG // WORKSTATION PARAMETERS
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Section */}
        <Card className="relative overflow-hidden group border-muted/10 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="h-12 w-12 text-foreground" />
          </div>
          <CardHeader className="border-b border-muted/5 pb-4 bg-background/30">
            <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <TerminalIcon className="h-4 w-4 text-primary" />{t("settings_account")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted/5 border border-muted/10 rounded-2xl flex items-center justify-center text-3xl font-headline font-bold text-foreground shadow-sm">{user?.full_name?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="font-headline font-bold text-xl text-foreground tracking-tight">{user?.full_name}</p>
                <p className="text-xs font-headline text-muted uppercase tracking-widest">{user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-muted/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-headline font-bold text-muted uppercase tracking-widest">{t("settings_role")}</span>
                <Badge variant="outline" className={cn("rounded-full font-headline font-bold tracking-widest uppercase", roleBadgeClass[role])}>{t(roleLabelKey[role])}</Badge>
              </div>
              {user?.department && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-headline font-bold text-muted uppercase tracking-widest">{t("settings_department")}</span>
                  <span className="text-sm font-headline font-bold text-foreground uppercase tracking-tight">{user.department.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Section */}
        <Card className="relative overflow-hidden border-muted/10 shadow-sm">
          <CardHeader className="border-b border-muted/5 pb-4 bg-background/30">
            <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />{t("settings_role_permissions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {(rolePermissionKeys[role] ?? []).map((key) => (
                <li key={key} className="flex items-start gap-3 text-xs font-headline font-bold text-muted group tracking-wide uppercase">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>{/* Demo Mode Section (Super Admin Only) */}
      {role === "super_admin" && (
        <Card className="relative overflow-hidden border border-destructive/20 shadow-sm bg-destructive/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rotate-45 translate-x-16 -translate-y-16 rounded-3xl" />
          <CardHeader className="border-b border-destructive/10 pb-4 bg-transparent">
            <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
              <Database className="h-4 w-4" />{t("settings_demo_mode")}
            </CardTitle>
            <CardDescription className="text-destructive/70 text-xs uppercase font-headline font-bold tracking-widest mt-1">{t("settings_demo_mode_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="p-4 bg-background rounded-2xl border border-destructive/20 flex gap-4 items-start shadow-sm">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs font-headline font-bold text-destructive/80 leading-relaxed uppercase tracking-wide">{t("settings_demo_warning")}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSeed}
                disabled={isSeeding || isResetting}
                className="flex-1 bg-foreground hover:bg-foreground/90 text-background rounded-full font-headline font-bold uppercase text-[10px] tracking-widest h-12 shadow-sm"
              >{isSeeding ? t("settings_demo_seeding") : t("settings_seed_demo")}
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReset}
                disabled={isSeeding || isResetting}
                className="flex-1 rounded-full font-headline font-bold uppercase text-[10px] tracking-widest h-12 shadow-sm"
              >
                <Trash2 className="me-2 h-4 w-4" />{isResetting ? t("settings_demo_resetting") : t("settings_reset_system")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information Section */}
      <Card className="border-muted/10 shadow-sm">
        <CardHeader className="border-b border-muted/5 pb-4 bg-background/30">
          <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest text-muted flex items-center gap-2">
            <TerminalIcon className="h-4 w-4 text-muted" />{t("settings_system_info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">{[
            { label: t("settings_system"), value: t("settings_system_value") },
            { label: t("settings_industry"), value: t("settings_industry_value") },
            { label: t("settings_skill_scale"), value: t("settings_skill_scale_value") },
            { label: t("settings_classification"), value: t("settings_classification_value") },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-muted/5 last:border-0 sm:last:border-b">
              <span className="text-[10px] font-headline font-bold text-muted uppercase tracking-widest">{item.label}</span>
              <span className="text-xs font-headline font-bold text-foreground uppercase tracking-tight">{item.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2 sm:col-span-2">
            <span className="text-[10px] font-headline font-bold text-muted uppercase tracking-widest">{t("settings_built_by")}</span>
            <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer" className="text-xs font-headline font-bold text-primary hover:text-primary/80 transition-colors uppercase underline decoration-primary/30 underline-offset-4 tracking-widest">
              yasserious.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
