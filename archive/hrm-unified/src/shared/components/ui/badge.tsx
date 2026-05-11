import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center rounded-none border px-3 py-1 text-[9px] font-headline font-black uppercase tracking-[0.2em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]",
        secondary:
          "border-white/10 bg-white/5 text-secondary-foreground",
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive shadow-[0_0_10px_rgba(255,0,0,0.2)]",
        outline: "text-foreground border-white/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
