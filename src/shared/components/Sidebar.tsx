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
      className={`relative h-full bg-[#0A0A0A] border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-40 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Sidebar Glow Effect */}
      <div className="absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-primary/20 to-transparent" />
      
      {/* Header / Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="shrink-0 w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center relative group">
            <Cpu className="w-4 h-4 text-primary" />
            <div className="absolute inset-0 bg-primary/20 scale-0 group-hover:scale-100 transition-transform" />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="text-sm font-black tracking-tighter uppercase leading-none">HRM UNIFIED</span>
              <span className="text-[8px] font-mono text-primary/60 font-black tracking-[0.3em] mt-1 uppercase">Industrial OS</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} href={item.href}>
              <div
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-300 group relative ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!collapsed && (
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {t(item.labelKey as any)}
                  </span>
                )}
                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-black border border-white/10 text-[10px] font-black tracking-widest uppercase text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {t(item.labelKey as any)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex flex-col gap-2">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-8 h-8 rounded-none border border-white/10 bg-white/5 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-black text-white truncate uppercase tracking-widest">{user.name}</span>
                <span className="text-[8px] font-mono text-zinc-600 truncate uppercase">{user.role}</span>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 px-4 py-3 rounded-none text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-[10px] font-black tracking-[0.2em] uppercase">LOGOUT</span>}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-center py-2 rounded-none text-zinc-600 hover:text-primary transition-all"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
