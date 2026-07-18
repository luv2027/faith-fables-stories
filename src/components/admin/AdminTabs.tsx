"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Stories" },
  { href: "/admin/books", label: "Books" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin" || pathname.startsWith("/admin/stories")
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
