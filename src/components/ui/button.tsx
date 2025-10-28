import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn-shiny inline-flex items-center justify-center whitespace-nowrap rounded-[7px] text-sm font-semibold uppercase tracking-[2px] ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_30px_5px_hsla(var(--primary)/0.8)]",
        destructive:
          "border border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_30px_5px_hsla(var(--destructive)/0.8)]",
        outline:
          "border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_30px_5px_hsla(var(--accent)/0.8)]",
        secondary:
          "border border-secondary-foreground bg-transparent text-secondary-foreground hover:bg-secondary hover:shadow-[0_0_30px_5px_hsla(var(--secondary)/0.8)]",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_30px_5px_hsla(var(--accent)/0.8)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-auto px-5 py-2.5",
        sm: "h-auto rounded-[7px] px-3 py-1.5",
        lg: "h-auto rounded-[7px] px-8 py-3",
        icon: "h-10 w-10 rounded-md",
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