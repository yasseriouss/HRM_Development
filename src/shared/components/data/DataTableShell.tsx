import type { ReactNode } from "react";
import { cn } from "@shared/utils/cn";
import { dataTableShell } from "./data-table-styles";

type DataTableShellProps = {
  title?: string;
  description?: string;
  /** Extra classes on the outer shell (e.g. motion props from framer-motion). */
  className?: string;
  children: ReactNode;
};

/**
 * Unified visual frame for tabular content across modules.
 * Keeps dashboard, skill-matrix, and spreadsheet tables visually aligned with the global theme.
 */
export function DataTableShell({ title, description, className, children }: DataTableShellProps) {
  return (
    <div className={cn(dataTableShell, className)}>
      {(title || description) && (
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-border/60">
          {title && (
            <h3 className="font-headline font-bold text-lg text-foreground tracking-tight">{title}</h3>
          )}
          {description && (
            <p className="text-[10px] font-headline font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
