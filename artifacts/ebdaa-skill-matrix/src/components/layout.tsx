import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { clearAuthToken, clearAuthUser, getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { useT } from "@/i18n";
import { NotificationBell } from "./notification-bell";

type Role = "super_admin" | "dept_head" | "hr_coordinator" | "employee";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const user = getAuthUser();
  const role: Role = (user?.role as Role) ?? "employee";
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const t = useT();

  const roleNavKeys: Record<Role, string> = {
    super_admin: "role_super_admin",
    dept_head: "role_dept_head",
    hr_coordinator: "role_hr_coordinator",
    employee: "role_employee",
  } as const;

  const ALL_NAV = [
    { href: "/", labelKey: "nav_dashboard" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/my-profile", labelKey: "nav_my_profile" as const, roles: ["employee"] },
    { href: "/departments", labelKey: "nav_departments" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/employees", labelKey: "nav_employees" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/skills", labelKey: "nav_skills" as const, roles: ["super_admin", "hr_coordinator"] },
    { href: "/campaigns", labelKey: "nav_campaigns" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/evaluations", labelKey: "nav_evaluations" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/workflows", labelKey: "nav_workflows" as const, roles: ["super_admin", "hr_coordinator", "dept_head", "employee"] },
    { href: "/my-tasks", labelKey: "nav_my_tasks" as const, roles: ["super_admin", "hr_coordinator", "dept_head", "employee"] },
    { href: "/training", labelKey: "nav_training" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/settings", labelKey: "nav_settings" as const, roles: ["super_admin", "hr_coordinator", "dept_head", "employee"] },
  ];

  const navItems = ALL_NAV.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    clearAuthToken();
    clearAuthUser();
    setLocation("/login");
  };

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const isDark = theme === "dark";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-6 min-w-0">
          <h1 className="text-lg font-bold text-primary tracking-wider uppercase shrink-0">Ebdaa Matrix</h1>
          <nav className="hidden md:flex items-center gap-1 flex-wrap">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  isActive(item.href)
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-muted-foreground hidden lg:inline-block">
            {user?.full_name}{" "}
            <span className="text-xs opacity-60">({t(roleNavKeys[role] as Parameters<typeof t>[0])})</span>
          </span>

          <NotificationBell />

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={t("toggle_theme")}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            title={t("toggle_language")}
            className="px-2 py-1 rounded text-xs font-bold text-muted-foreground hover:text-primary hover:bg-muted transition-colors border border-border"
          >
            {lang === "en" ? "عر" : "EN"}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            {t("nav_logout")}
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{children}</main>

      <footer className="border-t border-border py-4 text-center">
        <p className="text-sm text-muted-foreground">
          <a
            href="https://yasserious.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            {t("created_by")}
          </a>
        </p>
      </footer>
    </div>
  );
}
