import { cn } from "@shared/utils/cn";

/** Outer chrome for every data table in the suite (dashboard + skill-matrix + spreadsheet). */
export const dataTableShell =
  "rounded-4xl border border-border bg-background text-foreground shadow-sm overflow-hidden";

export const dataTableScroll = "overflow-x-auto";

/** Base `<table>` — use inside `dataTableScroll` when you need horizontal scroll without double scroll from shadcn `Table`. */
export const dataTableBase = "w-full border-collapse text-sm text-start";

export const dataTableHeadRow =
  "border-b border-border bg-muted/25";

export const dataTableTh = cn(
  "px-4 py-3 text-start align-middle font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap",
);

export const dataTableThSortable = cn(
  dataTableTh,
  "cursor-pointer select-none hover:text-foreground transition-colors group",
);

export const dataTableBody = "divide-y divide-border";

export const dataTableRow = cn(
  "border-b border-border/60 transition-colors hover:bg-muted/40",
);

export const dataTableRowSelected = "bg-muted/50";

export const dataTableTd = "px-4 py-4 align-middle text-foreground";

export const dataTableTdDense = "px-4 py-3 align-middle text-foreground text-sm";

/** Employees / wide tables — more breathing room. */
export const dataTableThSpacious = cn(
  "px-6 md:px-10 py-6 md:py-8 text-start align-middle font-headline font-bold text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap",
);

export const dataTableTdSpacious = "px-6 md:px-10 py-8 md:py-10 align-middle";
