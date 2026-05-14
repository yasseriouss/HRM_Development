import { Link, useLocation } from "wouter";
import { LogOut, Globe, Menu, X, ChevronRight, LayoutGrid, BarChart3, FileText, Presentation, Table, FlaskConical, ExternalLink, Shield } from "lucide-react";
import { clearAuthToken, clearAuthUser, getAuthUser } from "@modules/skill-matrix/lib/auth";
import { Button } from "@shared/components/ui/button";
import { useLang } from "@shared/contexts/LangContext";
import { useT } from "@modules/skill-matrix/i18n";
import { NotificationBell } from "./notification-bell";
import { getBrandLogoUrl } from "@shared/lib/brand";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@shared/components/ui/dropdown-menu";

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
    href: "/skill-matrix",
    icon: LayoutGrid,
    description: "Core skill management system",
    active: true,
  },
  {
    id: "dashboard",
    labelKey: "suite_dashboard",
    href: "/",
    icon: BarChart3,
    description: "Enterprise analytics & reporting",
  },
  {
    id: "docs",
    labelKey: "suite_docs",
    href: "/docs",
    icon: FileText,
    description: "System documentation & help",
  },
  {
    id: "pitch",
    labelKey: "suite_pitch_deck",
    href: "/interactive-presentation",
    icon: Presentation,
    description: "Project overview & vision",
  },
  {
    id: "spreadsheet",
    labelKey: "suite_spreadsheet",
    href: "/spreadsheet",
    icon: Table,
    description: "Interactive data analysis",
  },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const user = getAuthUser();
  const role: Role = (user?.role as Role) ?? "employee";
  const { lang, setLang } = useLang();
  const t = useT();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAr = lang === "ar";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const roleNavKeys: Record<Role, string>= {
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

  return (
    <div className={`min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden`}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-surface/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between gap-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
             {/* App Launcher */}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 border border-primary/10 bg-primary/5 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all rounded-full"
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-96 p-6 bg-surface border-2 border-primary/20 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-30" />
                <div className="relative z-10 px-4 py-5 border-b border-primary/10 mb-6 flex items-center justify-between">
                  <DropdownMenuLabel className="text-[10px] font-headline font-black uppercase tracking-[0.5em] text-primary flex items-center gap-4">
                    <div className="h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <span className="">{t("suite_title")}</span>
                  </DropdownMenuLabel>
                  <span className="text-[8px] font-mono text-foreground/30 uppercase tracking-widest">SYS::SECURE</span>
                </div>
                <div className="relative z-10 grid grid-cols-1 gap-3">{SUITE_APPS.map((app) => (
                    <DropdownMenuItem
                      key={app.id}
                      asChild
                      className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                        app.active
                          ? "bg-primary/5 border-primary/20"
                          : "hover:bg-muted/50 border-transparent"
                      }`}
                    >
                      <a href={app.href} className="flex items-start gap-4 w-full">
                        <div
                          className={`p-3 border rounded-lg ${
                            app.active ? "bg-primary border-primary text-primary-foreground" : "bg-muted/50 border-primary/10 text-primary/40"
                          }`}
                        >
                          <app.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`font-headline font-black text-sm tracking-widest uppercase ${app.active ? "text-primary" : "text-foreground"}`}>
                              {t(app.labelKey as any)}
                            </span>
                            {!app.active && <ExternalLink className="h-3 w-3 text-foreground/20" />}
                          </div>
                          <p className="text-[10px] text-foreground/40 leading-tight mt-1 font-medium italic">
                            {app.description}
                          </p>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                  <p className="text-[9px] text-secondary/20 font-mono tracking-[0.2em] uppercase">{t("label_industrial_node_secured")}
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-4">
              <img src={getBrandLogoUrl()} alt="HRM Unified" className="h-8 w-auto object-contain" />
              <div className="flex flex-col">
                <h1 className={`text-2xl font-headline font-black text-foreground tracking-tighter uppercase leading-none ${isAr ? 'font-tajawal' : ''}`}>HRM DEV</h1>
                <span className="text-[8px] font-mono text-primary/60 font-black tracking-[0.5em] mt-1.5 leading-none uppercase">{t("label_command_center")}</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-4 overflow-x-auto max-w-[50vw] px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-3 font-headline font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap border-b-2 relative group/nav ${
                  isActive(item.href)
                    ? "text-primary border-primary bg-primary/5"
                    : "text-foreground/40 border-transparent hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t(item.labelKey)}
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-500 ${isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-50'}`} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* User Profile Info */}
          <div className="hidden lg:flex flex-col items-end me-4">
            <span className="text-[11px] font-headline font-black text-foreground uppercase tracking-wider leading-none">{user?.full_name}
            </span>
            <span className="text-[9px] font-mono text-primary/60 font-black tracking-widest mt-1 uppercase leading-none">
              {t(roleNavKeys[role] as any)}
            </span>
          </div>

          <div className="h-8 w-px bg-zinc-800 mx-4 hidden md:block" />

          <div className="flex items-center gap-3">
            <NotificationBell />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="h-10 px-3 border border-primary/10 bg-primary/5 hover:bg-primary/10 text-[10px] font-headline font-black tracking-widest text-foreground/40 hover:text-foreground rounded-full transition-colors uppercase"
            >
              <Globe className="h-3 w-3 me-2" />
              {lang === "en" ? "AR" : "EN"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-10 px-4 border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-600 hover:text-white rounded-full font-headline font-black text-[10px] tracking-widest uppercase transition-all shadow-sm shadow-rose-500/5"
            >
              <LogOut className="h-3 w-3 me-2" />{t("nav_logout")}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden h-10 w-10 border border-primary/10 rounded-full text-foreground hover:bg-muted"
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
            className="xl:hidden bg-surface border-b border-primary/10 overflow-hidden"
          >
            <nav className="p-6 grid grid-cols-2 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-4 font-headline font-black text-[9px] tracking-widest uppercase border rounded-xl transition-all ${
                    isActive(item.href)
                      ? "bg-primary/5 border-primary/20 text-primary"
                      : "bg-muted/30 border-primary/5 text-foreground/40"
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
        <div className="absolute inset-0 bg-background pointer-events-none">
          <div className="absolute inset-0 bg-primary/5 opacity-30" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 p-6 md:p-10 lg:p-16 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* Footer - Editorial Style */}
      <footer className="border-t border-primary/10 bg-surface py-12 px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-30 pointer-events-none" />
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex items-center gap-8">
            <img
              src={getBrandLogoUrl()}
              alt="HRM Unified"
              className="h-12 w-auto max-w-[160px] object-contain opacity-90"
              width={160}
              height={48}
            />
            <div className="flex flex-col">
              <p className="text-[11px] font-headline font-black text-foreground tracking-[0.4em] uppercase">{t("label_system_operational")}</p>
              <div className="flex items-center gap-4 mt-2">
                 <span className="text-[8px] font-mono text-emerald-600/60 flex items-center gap-2 uppercase tracking-widest"><div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" /> {t("label_status_optimal")}</span>
                 <span className="text-[8px] font-mono text-foreground/30 uppercase tracking-widest">{t("label_node_uptime")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-12">
            <a
              href="https://yasserious.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-end"
            >
              <span className="text-[9px] font-headline font-black text-foreground/30 group-hover:text-primary transition-colors tracking-[0.3em] uppercase">{t('common_created_by')}
              </span>
              <span className="text-sm font-headline font-black text-foreground group-hover:text-primary transition-all mt-1 tracking-tighter uppercase">{t("label_yasserious_eng")}
              </span>
            </a>
            
            <div className="h-12 w-12 border border-primary/10 bg-background/50 flex items-center justify-center hover:border-primary/50 transition-colors duration-500 rounded-xl shadow-sm overflow-hidden p-1">
              <img src={getBrandLogoUrl()} alt="" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
