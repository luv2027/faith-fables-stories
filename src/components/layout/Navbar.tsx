"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { MobileNav } from "./MobileNav";
import { NAV_LINKS } from "./nav-links";
import { ThemeToggle } from "./ThemeToggle";

export interface NavUser {
  name: string;
  role: string;
}

export function Navbar({ user }: { user: NavUser | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
        >
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border">
            <Image
              src="/brand/faith-fables-mark.png"
              alt="Faith Fables"
              fill
              sizes="36px"
              className="object-contain p-0.5"
              priority
            />
          </span>
          <span className="font-serif">
            <span className="text-ink">Faith</span>
            <span className="text-accent">Fables</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-accent" : "text-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {/* Account controls (desktop) */}
          <div className="hidden items-center gap-1 md:flex">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                Admin
              </Link>
            )}
            {user ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Sign out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-full px-3.5 py-2 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Sign in
              </Link>
            )}
          </div>

          <ThemeToggle />
          <MobileNav user={user} />
        </div>
      </Container>
    </header>
  );
}
