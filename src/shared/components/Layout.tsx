import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Globe, Menu, X, ChevronRight, LayoutGrid, BarChart3, FileText, Presentation, Table, FlaskConical, ExternalLink, Shield, Cpu, Activity } from "lucide-react";
import { clearAuthToken, clearAuthUser, getAuthUser } from "@shared/lib/auth";
import { Button } from "@shared/components/ui/button";
import { useLang } from "@shared/contexts/LangContext";
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
import { Sidebar } from "./Sidebar";
import { ArrowLeft } from "lucide-react";

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
    id: "dashboard",
    labelKey: "dash_login_title",
    href: "/",
    icon: BarChart3,
    description: "Enterprise analytics & reporting",
  },
  {
    id: "matrix",
    labelKey: "nav_dashboard",
    href: "/skill-matrix",
    icon: LayoutGrid,
    description: "Core skill management system",
  },
  {
    id: "docs",
    labelKey: "docs_app_title",
    href: "/docs",
    icon: FileText,
    description: "System documentation & help",
  },
  {
    id: "pitch",
    labelKey: "s1_title",
    href: "/interactive-presentation",
    icon: Presentation,
    description: "Project overview & vision",
  },
  {
    id: "spreadsheet",
    labelKey: "sheet_app_title",
    href: "/spreadsheet",
    icon: Table,
    description: "Interactive data analysis",
  },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const user = getAuthUser();
  const role: Role = (user?.role as Role) ?? "employee";
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    { href: "/", labelKey: "dash_login_title" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/skill-matrix", labelKey: "nav_dashboard" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/spreadsheet", labelKey: "sheet_app_title" as const, roles: ["super_admin", "hr_coordinator", "dept_head"] },
    { href: "/docs", labelKey: "docs_app_title" as const, roles: ["super_admin", "hr_coordinator", "dept_head", "employee"] },
    { href: "/interactive-presentation", labelKey: "s1_title" as const, roles: ["super_admin", "hr_coordinator", "dept_head", "employee"] },
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
    <div className={`min-h-screen flex bg-[#050505] text-white font-sans selection:bg-primary selection:text-primary-foreground relative overflow-hidden h-screen`}>
      <div className="scanline" />
      
      <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            {location !== "/" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="h-10 gap-2 border border-white/10 bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all rounded-none px-4 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black tracking-widest uppercase">Return</span>
              </Button>
            )}
            
            <div className="flex flex-col">
              <h1 className={`text-xl font-headline font-black text-white tracking-tighter uppercase leading-none text-shimmer ${isAr ? 'font-tajawal' : ''}`}>
                {SUITE_APPS.find(app => isActive(app.href))?.labelKey ? t(SUITE_APPS.find(app => isActive(app.href))!.labelKey as any) : "HRM UNIFIED"}
              </h1>
              <span className="text-[8px] font-mono text-zinc-600 font-black tracking-[0.5em] mt-1.5 leading-none uppercase">
                {location === "/" ? "Integrated Industrial OS" : location.split('/')[1].replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto relative custom-scrollbar">
          <div className="absolute inset-0 bg-[#050505] pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#111111_0%,#050505_100%)]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay" />
          </div>

          <div className={`relative z-10 h-full ${
            location.startsWith("/docs") || location.startsWith("/interactive-presentation") || location.startsWith("/spreadsheet")
              ? "w-full"
              : "p-8 md:p-12"
          }`}>
            {children}
          </div>
        </main>

        <footer className="border-t border-white/5 bg-black/40 py-4 px-10">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-mono text-zinc-700 tracking-widest">HRM UNIFIED // DEPLOYED: v2.4.0</p>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-zinc-700 tracking-widest uppercase">System Optimal</span>
               </div>
               <p className="text-[8px] font-mono text-primary/40 tracking-widest uppercase">{t("common_created_by")}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
