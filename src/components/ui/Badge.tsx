import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  tone?: "soft" | "outline";
}

/** Static category/label badge. */
export function Badge({ children, className, tone = "soft" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        tone === "soft"
          ? "bg-accent-soft/25 text-accent-hover"
          : "border border-border text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

interface CategoryPillProps {
  label: string;
  href: string;
  active?: boolean;
}

/** Interactive category filter pill (renders a Link). */
export function CategoryPill({ label, href, active = false }: CategoryPillProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-surface text-muted hover:border-accent hover:text-accent",
      )}
    >
      {label}
    </Link>
  );
}
