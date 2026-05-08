import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { clearAuthToken, clearAuthUser, getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { useT } from "@/i18n";
import { NotificationBell } from "./notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  LayoutGrid,
  BarChart3,
  FileText,
  Presentation,
  Table,
  FlaskConical,
  ExternalLink,
} from "lucide-react";

interface SuiteApp {
  id: string;
  labelKey: string;
  href: string;
  icon: React.ElementType;
  description: string;
  active?: boolean;
}

type Role = "super_admin" | "dept_head" | "hr_coordinator" | "employee";

const SUITE_APPS: SuiteApp[] = [
  {
    id: "matrix",
    labelKey: "login_title",
    href: "/",
    icon: LayoutGrid,
    description: "Core skill management system",
    active: true,
  },
  {
    id: "dashboard",
    labelKey: "suite_dashboard",
    href: "/hrm-dashboard",
    icon: BarChart3,
    description: "Enterprise analytics & reporting",
  },
  {
    id: "docs",
    labelKey: "suite_docs",
    href: "/hrm-docs",
    icon: FileText,
    description: "System documentation & help",
  },
  {
    id: "pitch",
    labelKey: "suite_pitch_deck",
    href: "/hrm-pitch-deck",
    icon: Presentation,
    description: "Project overview & vision",
  },
  {
    id: "spreadsheet",
    labelKey: "suite_spreadsheet",
    href: "/hrm-spreadsheet",
    icon: Table,
    description: "Interactive data analysis",
  },
  {
    id: "sandbox",
    labelKey: "suite_sandbox",
    href: "/mockup-sandbox",
    icon: FlaskConical,
    description: "UI experimentation environment",
  },
] as const;

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
    { href: "/manual", labelKey: "nav_manual" as const, roles: ["super_admin", "hr_coordinator", "dept_head", "employee"] },
    { href: "/job-evaluation/guide", labelKey: "nav_job_evaluation_guide" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/job-evaluation/dashboard", labelKey: "nav_job_evaluation_dashboard" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/job-evaluation/profiles", labelKey: "nav_job_evaluation_profiles" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
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
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-primary/10 transition-all active:scale-95"
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-80 p-2 bg-card border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-2 py-2 mb-2">
                  <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    {t("suite_title")}
                  </DropdownMenuLabel>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {SUITE_APPS.map((app) => (
                    <DropdownMenuItem
                      key={app.id}
                      asChild
                      className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-all ${
                        app.active
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      <a href={app.href} className="flex items-start gap-3 w-full">
                        <div
                          className={`p-2 rounded-lg ${
                            app.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <app.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-semibold ${app.active ? "text-primary" : "text-foreground"}`}>
                              {t(app.labelKey as any)}
                            </span>
                            {!app.active && <ExternalLink className="h-3 w-3 text-muted-foreground/40" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                            {app.description}
                          </p>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator className="my-2 bg-border/50" />
                <div className="px-2 py-1">
                  <p className="text-[9px] text-center text-muted-foreground/60 font-mono tracking-tighter">
                    HRM INDUSTRIAL ECOSYSTEM V2.0.4
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <h1 className="text-lg font-bold text-primary tracking-wider uppercase shrink-0">HRM Development</h1>
          </div>
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
