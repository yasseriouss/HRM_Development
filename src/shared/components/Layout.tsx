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
    href: "/pitch-deck",
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
    { href: "/pitch-deck", labelKey: "s1_title" as const, roles: ["super_admin", "hr_coordinator", "dept_head", "employee"] },
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
      <div className="scanline" />
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-[#0A0A0A]/90 backdrop-blur-xl px-8 py-5 flex items-center justify-between gap-10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
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
                className="w-96 p-6 bg-[#0A0A0A] border-2 border-primary/30 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                <div className="relative z-10 px-4 py-5 border-b border-zinc-800 mb-6 flex items-center justify-between">
                  <DropdownMenuLabel className="text-[10px] font-headline font-black uppercase tracking-[0.5em] text-primary flex items-center gap-4">
                    <div className="h-2 w-2 bg-primary animate-pulse" />
                    <span>SYSTEM SUITE</span>
                  </DropdownMenuLabel>
                </div>
                <div className="relative z-10 grid grid-cols-1 gap-3">
                  {SUITE_APPS.map((app) => (
                    <DropdownMenuItem
                      key={app.id}
                      asChild
                      className={`flex items-start gap-4 p-4 rounded-none cursor-pointer transition-all border ${
                        isActive(app.href)
                          ? "bg-primary/10 border-primary/30"
                          : "hover:bg-white/5 border-transparent"
                      }`}
                    >
                      <Link href={app.href} className="flex items-start gap-4 w-full">
                        <div
                          className={`p-3 border ${
                            isActive(app.href) ? "bg-primary border-primary text-primary-foreground" : "bg-white/5 border-white/10 text-secondary/40"
                          }`}
                        >
                          <app.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`font-headline font-black text-sm tracking-widest uppercase ${isActive(app.href) ? "text-primary" : "text-white"}`}>
                            {t(app.labelKey as any)}
                          </span>
                          <p className="text-[10px] text-secondary/40 leading-tight mt-1 font-medium italic">
                            {app.description}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <h1 className={`text-2xl font-headline font-black text-white tracking-tighter uppercase leading-none text-shimmer ${isAr ? 'font-tajawal' : ''}`}>HRM UNIFIED</h1>
                <span className="text-[8px] font-mono text-primary/60 font-black tracking-[0.5em] mt-1.5 leading-none">INTEGRATED INDUSTRIAL OS</span>
              </div>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-4 overflow-x-auto max-w-[50vw] px-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-3 font-headline font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap border-b-2 relative group/nav ${
                  isActive(item.href)
                    ? "text-primary border-primary bg-primary/5"
                    : "text-zinc-600 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                {t(item.labelKey)}
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-500 ${isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-50'}`} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
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
              <LogOut className="h-3 w-3 me-2" />{t("common_cancel")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-[#050505] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#111111_0%,#050505_100%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
        </div>

        <div className={`relative z-10 ${
          location.startsWith("/docs") || location.startsWith("/pitch-deck") || location.startsWith("/spreadsheet")
            ? "w-full"
            : "p-6 md:p-10 lg:p-16 max-w-[1600px] mx-auto"
        }`}>
          {children}
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-[#080808] py-8 px-10">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <p className="text-[10px] font-mono text-zinc-700 tracking-widest">HRM UNIFIED // {new Date().getFullYear()}</p>
          <p className="text-[10px] font-mono text-primary/40 tracking-widest uppercase">{t("common_created_by")}</p>
        </div>
      </footer>
    </div>
  );
}
