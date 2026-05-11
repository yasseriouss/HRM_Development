import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[10px] tracking-[0.1em] font-headline font-bold uppercase transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
           "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90",
        outline:
          "border border-muted/20 bg-transparent hover:bg-muted/5 hover:text-foreground hover:border-muted/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted/10 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* 
        LEGACY: Industrial Metallic (Commented Out)
        "industrial-metallic": "btn-industrial min-h-12 border-none rounded-none tracking-[0.2em]",
        */
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 text-[9px]",
        lg: "h-13 px-10 text-xs",
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
