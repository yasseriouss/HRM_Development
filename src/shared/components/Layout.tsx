import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, Globe, Menu, X, ChevronRight, LayoutGrid, BarChart3, FileText, Presentation, Table, FlaskConical, ExternalLink, Shield, Cpu, Activity, User } from "lucide-react";
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
    <div className={`min-h-screen flex bg-background text-foreground font-body-default relative overflow-hidden h-screen ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Desktop Sidebar - Removed in favor of Burger Menu */}


      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            />
            <motion.div 
              initial={{ x: isAr ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? '100%' : '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 z-50 h-full"
              style={{ [isAr ? 'right' : 'left']: 0, width: '280px' }}
            >
              <Sidebar setCollapsed={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative h-full">
        <header className="sticky top-0 z-40 border-b border-muted/10 bg-background/90 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-10 w-10 border border-muted/20 bg-background/50 hover:bg-primary/10 text-muted hover:text-primary rounded-2xl"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {location !== "/" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="h-10 gap-2 border border-muted/10 bg-background/50 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all rounded-2xl px-4 group hidden sm:flex"
              >
                <ArrowLeft className={`h-4 w-4 transition-transform ${isAr ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                <span className="text-[10px] font-headline font-bold tracking-widest uppercase">Go Back</span>
              </Button>
            )}
            
            <div className="flex flex-col">
              <h1 className={`text-xl font-headline font-bold text-foreground tracking-tight uppercase leading-none ${isAr ? 'font-tajawal' : ''}`}>
                {SUITE_APPS.find(app => isActive(app.href))?.labelKey ? t(SUITE_APPS.find(app => isActive(app.href))!.labelKey as any) : "HRM UNIFIED"}
              </h1>
              <span className="text-[8px] font-headline text-muted font-bold tracking-[0.3em] mt-1.5 leading-none uppercase">
                {location === "/" ? "Enterprise Management Platform" : location.split('/')[1].replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="h-10 w-10 border border-muted/10 bg-background/50 hover:bg-background/80 text-muted hover:text-primary rounded-2xl transition-colors"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="h-10 px-3 border border-muted/10 bg-muted/5 hover:bg-muted/10 text-[10px] font-headline font-bold tracking-widest text-foreground hover:text-primary rounded-2xl transition-colors uppercase"
              >
                <Globe className="h-3 w-3 me-2" />
                {lang === "en" ? "AR" : "EN"}
              </Button>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 px-4 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-[10px] font-headline font-bold tracking-widest text-primary rounded-2xl transition-all uppercase"
                    >
                      <User className="h-3 w-3 me-2" />
                      {t("common_profile" as any) || "PROFILE"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border-muted/10 rounded-2xl shadow-2xl p-2">
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-headline font-bold text-foreground uppercase tracking-wider">{user.full_name}</span>
                        <span className="text-[10px] text-muted uppercase font-bold opacity-60">{user.role}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-muted/5 my-1" />
                    <DropdownMenuItem className="p-0">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-3 py-2 h-10 rounded-xl text-muted hover:text-destructive hover:bg-destructive/5 transition-all group"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-headline font-bold tracking-widest uppercase">{t("nav_logout") || "SIGN OUT"}</span>
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 min-w-0 relative flex flex-col">
          {/* Scroll container.
              - For full-viewport routes (slides / docs / spreadsheet) we
                lock the content box to the viewport and hide overflow so
                those experiences fit exactly in the available space.
              - For every other page we let the inner wrapper grow with
                its content (min-h-full instead of h-full) and provide
                overflow-y-auto so the page can scroll naturally. */}
          {(() => {
            const fullViewport =
              location.startsWith("/docs") ||
              location.startsWith("/interactive-presentation") ||
              location.startsWith("/spreadsheet");
            return (
              <div
                className={`min-h-0 flex-1 w-full ${
                  fullViewport
                    ? "h-full overflow-hidden"
                    : "overflow-y-auto custom-scrollbar"
                }`}
              >
                <div
                  className={`relative z-10 ${
                    fullViewport
                      ? "h-full w-full"
                      : "min-h-full p-4 md:p-8 lg:p-12"
                  }`}
                >
                  {children}
                </div>
              </div>
            );
          })()}
        </main>

        <footer className="border-t border-muted/10 bg-background/90 py-4 px-6 md:px-10 hidden sm:block">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-mono text-muted tracking-widest uppercase">HRM UNIFIED // DEPLOYED: v2.4.0</p>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-mono text-muted tracking-widest uppercase">System Optimal</span>
               </div>
               <p className="text-[8px] font-mono text-primary/60 tracking-widest uppercase font-bold">{t("common_created_by")}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
