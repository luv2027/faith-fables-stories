import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkLabel?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  linkHref,
  linkLabel,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-base leading-relaxed text-muted">{subtitle}</p>
        )}
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
