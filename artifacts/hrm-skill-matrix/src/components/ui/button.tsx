import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-[10px] tracking-[0.2em] font-headline font-black uppercase transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
           "bg-primary text-primary-foreground border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive/50 shadow-[0_0_15px_rgba(255,0,0,0.2)] hover:bg-destructive/90",
        outline:
          "border border-white/20 bg-transparent hover:bg-white/5 hover:text-white hover:border-white/40",
        secondary:
          "border border-white/10 bg-white/5 text-secondary-foreground hover:bg-white/10 hover:border-white/20",
        ghost: "border border-transparent hover:bg-white/5 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        "industrial-metallic": "btn-industrial min-h-12 border-none rounded-none tracking-[0.2em]",
      },
      size: {
        default: "min-h-10 px-6 py-3",
        sm: "min-h-8 px-4 text-[9px]",
        lg: "min-h-12 px-10 text-xs",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
