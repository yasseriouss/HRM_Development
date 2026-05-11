import React from "react";
import { cn } from "@/lib/utils";

interface IndustrialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  glitchText?: string;
  footerText?: string;
}

/**
 * LEGACY COMPONENT: IndustrialCard
 * Refactored to match the Warm Soft theme. 
 * Original industrial effects (glitch, scanlines, etc.) have been commented out.
 */
export function IndustrialCard({
  className,
  title,
  glitchText,
  footerText,
  children,
  ...props
}: IndustrialCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface/50 border border-muted/20 p-6 md:p-8 rounded-2xl",
        "shadow-xl shadow-black/5 backdrop-blur-sm transition-all hover:border-primary/30",
        className
      )}
      {...props}
    >
      {/* 
      LEGACY INDUSTRIAL EFFECTS (Commented Out)
      <div className="industrial-card-static pointer-events-none absolute inset-0 opacity-20 z-0"></div>
      <div className="industrial-card-flicker pointer-events-none absolute inset-0 opacity-40 z-0"></div>
      <div className="industrial-card-scanline pointer-events-none absolute left-0 right-0 h-2 bg-primary/20 z-20"></div>
      */}

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {title && (
          <div className="mb-6 text-foreground uppercase tracking-widest text-xl font-headline font-bold">
            {title}
          </div>
        )}

        <div className="flex-1 w-full h-full relative z-10">
          {children}
        </div>

        {glitchText && (
          <div className="mt-8 text-muted text-sm tracking-widest uppercase font-medium">
            {glitchText}
          </div>
        )}

        {footerText && (
          <div className="mt-6 text-[10px] text-primary uppercase tracking-[0.2em] font-bold border-t border-muted/10 pt-4">
             {footerText}
          </div>
        )}
      </div>
      
      {/* 
      LEGACY CORNER ACCENTS (Commented Out)
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
      */}
    </div>
  );
}
