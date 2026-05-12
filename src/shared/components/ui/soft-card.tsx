import React from "react";
import { cn } from "@/lib/utils";

interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  footerText?: string;
}

/**
 * SoftCard component following the 'Warm-Soft' editorial design direction.
 * Replaces the legacy IndustrialCard.
 */
export function SoftCard({
  className,
  title,
  subtitle,
  footerText,
  children,
  ...props
}: SoftCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface border border-muted/10 p-6 md:p-8 rounded-3xl",
        "soft-shadow backdrop-blur-md transition-all duration-500",
        "hover:border-primary/20 hover:bg-surface/80",
        className
      )}
      {...props}
    >
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {title && (
          <div className="mb-2 text-foreground font-headline font-bold text-2xl tracking-tight">
            {title}
          </div>
        )}

        {subtitle && (
          <div className="mb-8 text-[10px] text-muted font-bold uppercase tracking-[0.2em] opacity-60">
            {subtitle}
          </div>
        )}

        <div className="flex-1 w-full h-full relative z-10">
          {children}
        </div>

        {footerText && (
          <div className="mt-8 pt-6 border-t border-muted/5 text-[9px] text-primary/60 font-bold uppercase tracking-[0.15em]">
             {footerText}
          </div>
        )}
      </div>
    </div>
  );
}
