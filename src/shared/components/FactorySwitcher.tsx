import React from "react";
import { 
  Building2, 
  ChevronDown, 
  Factory as FactoryIcon,
  Check,
  Shield
} from "lucide-react";
import { useFactory } from "../contexts/FactoryContext";
import { useT, useLang } from "../contexts/LangContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

interface FactorySwitcherProps {
  collapsed?: boolean;
}

export function FactorySwitcher({ collapsed = false }: FactorySwitcherProps) {
  const { factories, activeFactoryId, setActiveFactoryId, activeFactory, isLoading } = useFactory();
  const t = useT();
  const { lang } = useLang();
  const isAr = lang === 'ar';

  if (isLoading && !activeFactory) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-3 py-2 animate-pulse",
        collapsed ? "justify-center" : "mx-3"
      )}>
        <div className="w-8 h-8 bg-muted/5 border border-muted/10 rounded-md" />
        {!collapsed && (
          <div className="flex flex-col gap-1">
            <div className="h-2 w-24 bg-muted/5 rounded-full" />
            <div className="h-2 w-16 bg-muted/5 rounded-full" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("px-3 mb-4", collapsed && "px-0")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "w-full flex items-center gap-3 p-2 transition-all duration-300 group relative rounded-2xl",
            "bg-surface/50 border border-muted/20 hover:border-primary/30 hover:bg-primary/5",
            collapsed ? "justify-center" : "text-left"
          )}>
            {/* Active Indicator Line */}
            <div className="absolute inset-y-2 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 rounded-full" />
            
            <div className={cn(
              "shrink-0 w-8 h-8 flex items-center justify-center relative rounded-xl",
              "bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-primary/20"
            )}>
              <FactoryIcon className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1 animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="text-[8px] font-body-default text-muted font-bold tracking-[0.1em] uppercase leading-none mb-1">
                  {t('label_active_factory' as any)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-foreground truncate uppercase tracking-widest">
                    {activeFactory?.name || "SELECT FACTORY"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
            )}

            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-background border border-muted/20 text-[10px] font-bold tracking-widest uppercase text-foreground opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 rounded-2xl shadow-xl">
                {activeFactory?.name || "SWITCH FACILITY"}
              </div>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-64 bg-background border border-muted/20 rounded-2xl p-0 overflow-hidden shadow-2xl" 
          align={collapsed ? "start" : "center"}
          side={collapsed ? "right" : "bottom"}
        >
          <div className="bg-primary/5 p-5 border-b border-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-headline font-black text-primary tracking-[0.15em] uppercase">
                {t('action_factory_switch' as any)}
              </span>
            </div>
            <p className="text-[9px] font-headline text-muted uppercase tracking-widest opacity-60">
              Platform Directory // Facility Selector
            </p>
          </div>

          <div className="p-2">
            {factories.map((factory) => (
              <DropdownMenuItem
                key={factory.id}
                onClick={() => setActiveFactoryId(factory.id)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl transition-all duration-200 m-1",
                  "focus:bg-primary/10 focus:text-primary group",
                  activeFactoryId === factory.id ? "bg-primary/5 text-primary" : "text-muted"
                )}
              >
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center border transition-colors rounded-2xl",
                  activeFactoryId === factory.id 
                    ? "border-primary/50 bg-primary/20" 
                    : "border-muted/20 bg-muted/5 group-hover:border-primary/30"
                )}>
                  <Building2 className="w-4 h-4" />
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[11px] font-headline font-black tracking-wider uppercase truncate text-foreground">
                    {factory.name}
                  </span>
                  <span className="text-[9px] font-body-default text-muted uppercase truncate opacity-50 mt-0.5">
                    {factory.location || "Active Facility"}
                  </span>
                </div>

                {activeFactoryId === factory.id && (
                  <Check className="w-3.5 h-3.5 text-primary animate-in zoom-in duration-300" />
                )}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="bg-muted/10" />
          
          <div className="p-4 bg-muted/5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[8px] font-body-default text-muted uppercase tracking-widest opacity-40">System Core v2.4.0</span>
              <span className="text-[8px] font-body-default text-primary/60 uppercase font-black tracking-widest">Verified</span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
