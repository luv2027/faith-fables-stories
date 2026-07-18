"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  initialCount: number;
  size?: "sm" | "md";
}

/**
 * Optimistic, local-only like toggle for Phase 1 (no persistence yet — that
 * arrives with auth in Phase 3). State resets on reload by design.
 */
export function LikeButton({ initialCount, size = "sm" }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const count = initialCount + (liked ? 1 : 0);

  return (
    <button
      type="button"
      onClick={() => setLiked((v) => !v)}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this story" : "Like this story"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        size === "sm" ? "text-sm" : "px-4 py-2 text-sm",
        liked ? "text-accent" : "text-muted hover:text-accent",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("h-4 w-4 transition-transform", liked && "scale-110")}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M12 20s-7-4.35-9.5-8.5C1 8.5 2.5 5 6 5c2 0 3.2 1.2 4 2.5C10.8 6.2 12 5 14 5c3.5 0 5 3.5 3.5 6.5C19 15.65 12 20 12 20Z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
