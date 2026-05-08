import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Globe, Menu, X, ChevronRight, LayoutGrid, BarChart3, FileText, Presentation, Table, FlaskConical, ExternalLink, Shield, Cpu, Activity } from "lucide-react";
import { clearAuthToken, clearAuthUser, getAuthUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { useT } from "@/i18n";
import { NotificationBell } from "./notification-bell";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAr = lang === "ar";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
    <div className={`min-h-screen flex flex-col bg-[#050505] text-white font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden`}>
      {/* Global Scanline Effect */}
      <div className="scanline" />
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
             {/* App Launcher */}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 border border-white/10 bg-white/5 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all rounded-none"
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-96 p-4 bg-[#0A0A0A] border-2 border-primary/30 rounded-none shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <div className="px-3 py-4 border-b border-white/10 mb-4">
                  <DropdownMenuLabel className="text-[10px] font-headline font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                    <div className="h-2 w-2 bg-primary animate-pulse" />
                    {t("suite_title")}
                  </DropdownMenuLabel>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {SUITE_APPS.map((app) => (
                    <DropdownMenuItem
                      key={app.id}
                      asChild
                      className={`flex items-start gap-4 p-4 rounded-none cursor-pointer transition-all border ${
                        app.active
                          ? "bg-primary/10 border-primary/30"
                          : "hover:bg-white/5 border-transparent"
                      }`}
                    >
                      <a href={app.href} className="flex items-start gap-4 w-full">
                        <div
                          className={`p-3 border ${
                            app.active ? "bg-primary border-primary text-primary-foreground" : "bg-white/5 border-white/10 text-secondary/40"
                          }`}
                        >
                          <app.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-headline font-black text-sm tracking-widest uppercase ${app.active ? "text-primary" : "text-white"}`}>
                              {t(app.labelKey as any)}
                            </span>
                            {!app.active && <ExternalLink className="h-3 w-3 text-secondary/20" />}
                          </div>
                          <p className="text-[10px] text-secondary/40 leading-tight mt-1 font-medium italic">
                            {app.description}
                          </p>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                  <p className="text-[9px] text-secondary/20 font-mono tracking-[0.2em] uppercase">
                    HRM_INDUSTRIAL_NODE_v2.0.4 // SECURED
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="System Logo" className="h-8 w-auto object-contain" />
              <div className="flex flex-col">
                <h1 className={`text-xl font-headline font-black text-white tracking-tighter uppercase leading-none ${isAr ? 'font-tajawal' : ''}`}>HRM_DEV</h1>
                <span className="text-[8px] font-mono text-primary font-black tracking-[0.5em] mt-1 leading-none">WORKSTATION</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-2 overflow-x-auto max-w-[50vw]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 font-headline font-black text-[10px] tracking-widest uppercase transition-all whitespace-nowrap border-b-2 ${
                  isActive(item.href)
                    ? "text-primary border-primary bg-primary/5"
                    : "text-secondary/40 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* User Profile Info */}
          <div className="hidden lg:flex flex-col items-end me-4">
            <span className="text-[11px] font-headline font-black text-white uppercase tracking-wider leading-none">
              {user?.full_name}
            </span>
            <span className="text-[9px] font-mono text-primary/60 font-black tracking-widest mt-1 uppercase leading-none">
              {t(roleNavKeys[role] as any)}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

          <div className="flex items-center gap-3">
            <NotificationBell />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="h-10 w-10 border border-white/5 bg-white/5 hover:bg-white/10 text-secondary/40 hover:text-primary rounded-none transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="h-10 px-3 border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-headline font-black tracking-widest text-secondary/40 hover:text-white rounded-none transition-colors uppercase"
            >
              <Globe className="h-3 w-3 me-2" />
              {lang === "en" ? "AR" : "EN"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-10 px-4 border border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-none font-headline font-black text-[10px] tracking-widest uppercase transition-all"
            >
              <LogOut className="h-3 w-3 me-2" />
              {t("nav_logout")}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden h-10 w-10 border border-white/10 rounded-none text-white hover:bg-white/5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-[#0A0A0A] border-b border-white/10 overflow-hidden"
          >
            <nav className="p-6 grid grid-cols-2 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-4 font-headline font-black text-[9px] tracking-widest uppercase border ${
                    isActive(item.href)
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-white/5 border-white/10 text-secondary/40"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[#050505] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#111111_0%,#050505_100%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(#primary 1px, transparent 1px), linear-gradient(90deg, #primary 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 p-6 md:p-10 lg:p-16 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* Footer - Terminal Style */}
      <footer className="border-t border-white/5 bg-[#050505] py-10 px-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <p className="text-[10px] font-headline font-black text-white tracking-[0.3em] uppercase">HRM_SYSTEM_OPERATIONAL</p>
              <p className="text-[8px] font-mono text-secondary/30 mt-1">NODE: CLUSTER_01 // STATUS: ONLINE // UPTIME: 99.98%</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <a
              href="https://yasserious.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-end"
            >
              <span className="text-[9px] font-headline font-black text-secondary/40 group-hover:text-primary transition-colors tracking-widest uppercase">
                {t("created_by")}
              </span>
              <span className="text-[11px] font-headline font-black text-white group-hover:text-primary transition-all mt-1">
                YASSERIOUS_ENGINEERING
              </span>
            </a>
            
            <div className="h-10 w-10 border border-white/10 bg-white/5 flex items-center justify-center">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
