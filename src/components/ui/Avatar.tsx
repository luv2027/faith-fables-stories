import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, src, size = 36, className }: AvatarProps) {
  const dimension = { width: size, height: size };

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        {...dimension}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      style={dimension}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-accent-soft/30 text-xs font-semibold text-accent-hover",
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
