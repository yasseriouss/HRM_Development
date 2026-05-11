import React from 'react';
import { Link, useLocation } from "wouter";
import { 
  LayoutGrid, 
  BarChart3, 
  FileText, 
  Presentation, 
  Table, 
  ChevronLeft,
  Settings,
  User,
  LogOut,
  Layers,
  Database,
  Search,
  Box,
  Target,
  Trophy,
  Users,
  Building2,
  Workflow,
  BookOpen,
  Cpu
} from "lucide-react";
import { useLang } from "@shared/contexts/LangContext";
import { getAuthUser, clearAuthToken, clearAuthUser } from "@shared/lib/auth";
import { Button } from "./ui/button";
import { FactorySwitcher } from "./FactorySwitcher";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { t, lang } = useLang();
  const user = getAuthUser();
  const isAr = lang === 'ar';

  const NAV_ITEMS = [
    { id: 'dashboard', href: '/', icon: BarChart3, labelKey: 'dash_login_title' },
    { id: 'skill-matrix', href: '/skill-matrix', icon: LayoutGrid, labelKey: 'nav_dashboard' },
    { id: 'employees', href: '/skill-matrix/employees', icon: Users, labelKey: 'nav_employees' },
    { id: 'departments', href: '/skill-matrix/departments', icon: Building2, labelKey: 'nav_departments' },
    { id: 'campaigns', href: '/skill-matrix/campaigns', icon: Target, labelKey: 'nav_campaigns' },
    { id: 'skills', href: '/skill-matrix/skills', icon: Trophy, labelKey: 'nav_skills' },
    { id: 'training', href: '/skill-matrix/training', icon: BookOpen, labelKey: 'nav_training' },
    { id: 'workflows', href: '/skill-matrix/workflows', icon: Workflow, labelKey: 'nav_workflows' },
    { id: 'spreadsheet', href: '/spreadsheet', icon: Table, labelKey: 'sheet_app_title' },
    { id: 'job-evaluation', href: '/job-evaluation/dashboard', icon: Layers, labelKey: 'nav_job_evaluation' },
    { id: 'docs', href: '/docs', icon: FileText, labelKey: 'docs_app_title' },
    { id: 'presentation', href: '/interactive-presentation', icon: Presentation, labelKey: 's1_title' },
  ];

  const handleLogout = () => {
    clearAuthToken();
    clearAuthUser();
    setLocation("/login");
  };

  const isActive = (href: string) => 
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <aside 
      className={`relative h-full bg-background border-e border-muted/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-40 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Sidebar Accent Effect */}
      <div className="absolute inset-y-0 inset-inline-end-0 w-px bg-linear-to-b from-transparent via-primary/20 to-transparent opacity-50" />
      
      {/* Header / Logo */}
      <div className="h-20 flex items-center px-6 border-b border-muted/5 bg-muted/5">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="shrink-0 w-10 h-10 bg-primary/5 border border-primary/10 flex items-center justify-center relative group rounded-xl">
            <Cpu className="w-5 h-5 text-primary" />
            <div className="absolute inset-0 bg-primary/10 scale-0 group-hover:scale-100 transition-transform rounded-xl" />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap animate-in fade-in slide-in-from-inline-start-4 duration-500">
              <span className="text-sm font-bold tracking-tight uppercase leading-none">HRM UNIFIED</span>
              <span className="text-[8px] font-body-default text-muted font-bold tracking-[0.25em] mt-1.5 uppercase opacity-60">Management Suite</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Factory Switcher */}
      <div className="mt-6">
        <FactorySwitcher collapsed={collapsed} />
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} href={item.href}>
              <div
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-300 group relative rounded-xl ${
                  isActive(item.href)
                    ? 'bg-primary/5 text-primary'
                    : 'text-muted hover:text-foreground hover:bg-muted/5'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!collapsed && (
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap animate-in fade-in slide-in-from-inline-start-2 duration-300">
                    {t(item.labelKey as any)}
                  </span>
                )}
                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className={`absolute ${isAr ? 'right-full mr-4' : 'left-full ml-4'} px-3 py-2 bg-background border border-muted/10 text-[10px] font-bold tracking-widest uppercase text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 rounded-lg shadow-xl`}>
                    {t(item.labelKey as any)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-muted/5 bg-muted/5">
        <div className="flex flex-col gap-2">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-10 h-10 rounded-xl border border-muted/10 bg-background flex items-center justify-center soft-shadow">
                <User className="w-5 h-5 text-muted" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-foreground truncate uppercase tracking-[0.15em]">{user.full_name}</span>
                <span className="text-[8px] font-body-default text-muted truncate uppercase font-bold opacity-60 mt-0.5">{user.role}</span>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-muted hover:text-destructive hover:bg-destructive/5 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-[10px] font-bold tracking-[0.15em] uppercase">LOGOUT</span>}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-center py-2 rounded-xl text-muted hover:text-primary transition-all"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-500 ${collapsed ? (isAr ? '' : 'rotate-180') : (isAr ? 'rotate-180' : '')}`} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
