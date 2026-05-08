import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-none border border-white/10 bg-[#0A0A0A] px-4 py-2 text-sm font-mono tracking-widest text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-secondary/30 placeholder:uppercase focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
