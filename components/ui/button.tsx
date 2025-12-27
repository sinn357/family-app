import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 rounded-xl",
        destructive:
          "bg-gradient-to-br from-destructive to-destructive/90 text-white shadow-md shadow-destructive/20 hover:shadow-lg hover:shadow-destructive/30 hover:-translate-y-0.5 rounded-xl focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 border-primary/30 bg-background/50 backdrop-blur-sm shadow-sm hover:bg-primary/5 hover:border-primary/50 hover:-translate-y-0.5 rounded-xl text-foreground dark:bg-card/30 dark:border-primary/20 dark:hover:bg-primary/10",
        secondary:
          "bg-gradient-to-br from-accent to-accent/90 text-accent-foreground shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 rounded-xl",
        ghost:
          "hover:bg-accent/10 hover:text-accent-foreground rounded-lg dark:hover:bg-accent/20",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-gradient-to-br from-success to-success/90 text-success-foreground shadow-md shadow-success/20 hover:shadow-lg hover:shadow-success/30 hover:-translate-y-0.5 rounded-xl",
        info:
          "bg-gradient-to-br from-info to-info/90 text-info-foreground shadow-md shadow-info/20 hover:shadow-lg hover:shadow-info/30 hover:-translate-y-0.5 rounded-xl",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-7 has-[>svg]:px-5 text-base",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
