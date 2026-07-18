"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import type { NavUser } from "./Navbar";
import { NAV_LINKS } from "./nav-links";

export function MobileNav({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Lock scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <nav className="absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col gap-1 border-l border-border bg-surface p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-serif text-lg font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-surface-raised"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                    active
                      ? "bg-surface-raised text-accent"
                      : "text-ink hover:bg-surface-raised",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-3 border-t border-border pt-3">
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink hover:bg-surface-raised"
                >
                  Admin
                </Link>
              )}
              {user ? (
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2.5 text-left text-base font-medium text-ink hover:bg-surface-raised"
                  >
                    Sign out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-accent hover:bg-surface-raised"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
