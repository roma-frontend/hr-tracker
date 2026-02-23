import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--primary)] text-white",
        secondary:
          "border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        destructive:
          "border-[var(--destructive)]/30 bg-[var(--destructive)]/15 text-[var(--destructive)]",
        outline:
          "border-[var(--border)] text-[var(--text-secondary)]",
        success:
          "border-[var(--success)]/30 bg-[var(--success)]/15 text-[var(--success)]",
        warning:
          "border-[var(--warning)]/30 bg-[var(--warning)]/15 text-[var(--warning)]",
        info:
          "border-[var(--info)]/30 bg-[var(--info)]/15 text-[var(--info)]",
        purple:
          "border-[var(--purple)]/30 bg-[var(--purple)]/15 text-[var(--purple)]",
        pink:
          "border-[var(--pink)]/30 bg-[var(--pink)]/15 text-[var(--pink)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
