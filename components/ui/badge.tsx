import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground [a&]:hover:shadow-md [a&]:hover:shadow-primary/20",
        secondary:
          "border-accent/20 bg-gradient-to-r from-accent/90 to-accent text-accent-foreground [a&]:hover:shadow-md [a&]:hover:shadow-accent/20",
        destructive:
          "border-destructive/20 bg-gradient-to-r from-destructive/90 to-destructive text-white [a&]:hover:shadow-md [a&]:hover:shadow-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border/50 backdrop-blur-sm text-foreground [a&]:hover:bg-primary/5 [a&]:hover:border-primary/30",
        success:
          "border-success/20 bg-gradient-to-r from-success/90 to-success text-success-foreground [a&]:hover:shadow-md [a&]:hover:shadow-success/20",
        info:
          "border-info/20 bg-gradient-to-r from-info/90 to-info text-info-foreground [a&]:hover:shadow-md [a&]:hover:shadow-info/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
