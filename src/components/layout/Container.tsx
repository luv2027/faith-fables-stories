import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  size?: "default" | "narrow";
}

export function Container({
  children,
  className,
  as: Tag = "div",
  size = "default",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-6 lg:px-8",
        size === "narrow" ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
