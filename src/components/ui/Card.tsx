import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a calm hover lift (use for clickable cards). */
  interactive?: boolean;
}

export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-accent-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}
