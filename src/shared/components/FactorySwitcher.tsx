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
        <div className="w-8 h-8 bg-white/5 border border-white/10" />
        {!collapsed && (
          <div className="flex flex-col gap-1">
            <div className="h-2 w-24 bg-white/5" />
            <div className="h-2 w-16 bg-white/5" />
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
            "w-full flex items-center gap-3 p-2 transition-all duration-300 group relative",
            "bg-black/40 border border-white/5 hover:border-primary/30 hover:bg-primary/5",
            collapsed ? "justify-center" : "text-left"
          )}>
            {/* Active Indicator Line */}
            <div className="absolute inset-y-0 left-0 w-px bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
            
            <div className={cn(
              "shrink-0 w-8 h-8 flex items-center justify-center relative",
              "bg-primary/10 border border-primary/20 text-primary transition-colors group-hover:bg-primary/20"
            )}>
              <FactoryIcon className="w-4 h-4" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary animate-pulse" />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1 animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="text-[8px] font-mono text-primary/60 font-black tracking-[0.2em] uppercase leading-none mb-1">
                  {t('label_active_factory' as any)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white truncate uppercase tracking-widest">
                    {activeFactory?.name || "SELECT NODE"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-600 group-hover:text-primary transition-colors" />
                </div>
              </div>
            )}

            {collapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-black border border-white/10 text-[10px] font-black tracking-widest uppercase text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {activeFactory?.name || "SWITCH FACTORY"}
              </div>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-64 bg-[#0A0A0A] border-white/10 rounded-none p-0 overflow-hidden" 
          align={collapsed ? "start" : "center"}
          side={collapsed ? "right" : "bottom"}
        >
          <div className="bg-primary/5 p-3 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black text-primary tracking-[0.2em] uppercase">
                {t('action_factory_switch' as any)}
              </span>
            </div>
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
              AUTHORIZED ACCESS ONLY // NODE REGISTRY
            </p>
          </div>

          <div className="p-1">
            {factories.map((factory) => (
              <DropdownMenuItem
                key={factory.id}
                onClick={() => setActiveFactoryId(factory.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-none transition-all duration-200",
                  "focus:bg-primary/10 focus:text-primary group",
                  activeFactoryId === factory.id ? "bg-primary/5 text-primary" : "text-zinc-500"
                )}
              >
                <div className={cn(
                  "w-6 h-6 flex items-center justify-center border transition-colors",
                  activeFactoryId === factory.id 
                    ? "border-primary/50 bg-primary/20" 
                    : "border-white/5 bg-white/5 group-hover:border-primary/30"
                )}>
                  <Building2 className="w-3 h-3" />
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-black tracking-widest uppercase truncate">
                    {factory.name}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase truncate">
                    {factory.location || "OPERATIONAL NODE"}
                  </span>
                </div>

                {activeFactoryId === factory.id && (
                  <Check className="w-3 h-3 text-primary animate-in zoom-in duration-300" />
                )}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="bg-white/5" />
          
          <div className="p-2 bg-black/40">
            <div className="flex items-center justify-between px-2">
              <span className="text-[7px] font-mono text-zinc-600 uppercase">Registry v2.4.0</span>
              <span className="text-[7px] font-mono text-primary/40 uppercase">Secure Link Active</span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
