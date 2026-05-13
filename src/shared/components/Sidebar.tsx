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
  Cpu,
  X
} from "lucide-react";
import { useLang } from "@shared/contexts/LangContext";
import { getAuthUser, clearAuthToken, clearAuthUser } from "@shared/lib/auth";
import { Button } from "./ui/button";
import { FactorySwitcher } from "./FactorySwitcher";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function Sidebar({ setCollapsed }: { setCollapsed?: (v: boolean) => void }) {
  const [location] = useLocation();
  const { t, lang } = useLang();
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

  const isActive = (href: string) => 
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <aside 
      className={`relative h-full bg-background border-e border-muted/10 flex flex-col z-40 w-72`}
    >
      <div className="absolute inset-y-0 inset-inline-end-0 w-px bg-linear-to-b from-transparent via-primary/20 to-transparent opacity-50" />
      
      <div className="h-24 flex items-center px-8 border-b border-muted/5 bg-surface/50 justify-between">
        <div className="flex items-center gap-5 overflow-hidden">
          <div className="shrink-0 w-11 h-11 bg-primary/5 border border-primary/10 flex items-center justify-center relative group rounded-2xl">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-base font-headline font-black tracking-tight uppercase leading-none text-foreground">HRM Platform</span>
            <span className="text-[9px] font-body-default text-muted font-bold tracking-[0.2em] mt-2 uppercase opacity-40">Enterprise Edition</span>
          </div>
        </div>
        {setCollapsed && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="mt-8">
        <FactorySwitcher collapsed={false} />
      </div>

      <div className="flex-1 overflow-y-auto py-10 px-5 custom-scrollbar">
        <div className="space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} href={item.href}>
              <div
                className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-all duration-300 group relative rounded-3xl ${
                  isActive(item.href)
                    ? 'bg-primary/5 text-primary'
                    : 'text-muted hover:text-foreground hover:bg-muted/5'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-[10px] font-headline font-bold tracking-[0.15em] uppercase whitespace-nowrap">
                  {t(item.labelKey as any)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
