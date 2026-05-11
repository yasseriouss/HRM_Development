import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface IndustrialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  glitchText?: string;
  footerText?: string;
}

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
        "industrial-card relative overflow-hidden bg-[#121212] border-2 border-primary/50 p-6 md:p-8",
        "shadow-[0_0_20px_rgba(var(--primary),0.1)] transition-all hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]",
        className
      )}
      {...props}
    >
      {/* Background static / flicker layer */}
      <div className="industrial-card-static pointer-events-none absolute inset-0 opacity-20 z-0"></div>
      <div className="industrial-card-flicker pointer-events-none absolute inset-0 opacity-40 z-0"></div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {title && (
          <div className="mb-6 relative inline-block text-white uppercase tracking-widest text-2xl font-headline font-black">
             <span className="industrial-card-title-glitch" data-text={title}>
               {title}
             </span>
          </div>
        )}

        <div className="flex-1 w-full h-full relative z-10">
          {children}
        </div>

        {glitchText && (
          <div className="mt-8 relative inline-block text-white text-lg tracking-widest uppercase font-mono">
            <span className="industrial-card-text-glitch" data-text={glitchText}>
              {glitchText}
            </span>
          </div>
        )}

        {footerText && (
          <div className="mt-6 text-xs text-primary uppercase tracking-[0.3em] font-mono border-t border-primary/20 pt-4 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-primary"></div>
             {footerText}
          </div>
        )}
      </div>

      {/* Scanline overlay */}
      <div className="industrial-card-scanline pointer-events-none absolute left-0 right-0 h-2 bg-primary/20 z-20"></div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
    </div>
  );
}
