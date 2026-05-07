import { getAuthUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Shield } from "lucide-react";
import { useT } from "@/i18n";

type Role = "super_admin" | "dept_head" | "hr_coordinator" | "employee";

const roleBadgeClass: Record<Role, string> = {
  super_admin: "bg-violet-700 text-white",
  dept_head: "bg-sky-700 text-white",
  hr_coordinator: "bg-emerald-700 text-white",
  employee: "bg-zinc-600 text-zinc-200",
};

export default function SettingsPage() {
  const user = getAuthUser();
  const role = (user?.role as Role) ?? "employee";
  const t = useT();

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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("settings_title")}</h2>
        <p className="text-muted-foreground">{t("settings_subtitle")}</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" /> {t("settings_account")}
          </CardTitle>
          <CardDescription>{t("settings_account_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {user?.full_name?.charAt(0) ?? "?"}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.full_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("settings_role")}</span>
            <Badge className={roleBadgeClass[role]}>{t(roleLabelKey[role])}</Badge>
          </div>
          {user?.department && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("settings_department")}</span>
              <span className="text-sm font-medium">{user.department.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> {t("settings_role_permissions")}
          </CardTitle>
          <CardDescription>{t("settings_role_permissions_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(rolePermissionKeys[role] ?? []).map((key) => (
              <li key={key} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">{t("settings_system_info")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">{t("settings_system")}</span>
            <span className="font-medium">{t("settings_system_value")}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">{t("settings_industry")}</span>
            <span className="font-medium">{t("settings_industry_value")}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">{t("settings_skill_scale")}</span>
            <span className="font-medium">{t("settings_skill_scale_value")}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">{t("settings_classification")}</span>
            <span className="font-medium">{t("settings_classification_value")}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">{t("settings_built_by")}</span>
            <a href="https://yasserious.com" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              yasserious.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
