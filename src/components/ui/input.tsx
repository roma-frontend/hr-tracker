import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input)] px-3 py-1 text-sm text-[var(--text-primary)] shadow-sm transition-colors",
          "placeholder:text-[var(--text-muted)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--text-primary)]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
