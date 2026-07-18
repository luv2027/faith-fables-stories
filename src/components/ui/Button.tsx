import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md",
  secondary:
    "bg-surface text-ink border border-border hover:border-accent hover:text-accent",
  ghost: "text-ink hover:bg-surface-raised",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(base, variants[variant], sizes[size]);
}

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Render classes onto the single child element (e.g. a next/link <Link>). */
  asChild?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  asChild = false,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cn(buttonClasses(variant, size), className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(child.props.className, classes),
    });
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
