import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { NAV_LINKS } from "./nav-links";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5 text-lg font-semibold">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border">
              <Image
                src="/brand/faith-fables-mark.png"
                alt="Faith Fables"
                fill
                sizes="36px"
                className="object-contain p-0.5"
              />
            </span>
            <span className="font-serif">
              <span className="text-ink">Faith</span>
              <span className="text-accent">Fables</span>
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Stories, books, and ideas that help you learn, reflect, and become a
            truer version of yourself.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
      <Container className="border-t border-border py-6">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Faith Fables Stories. Made for the curious,
          the reflective, and the growing.
        </p>
      </Container>
    </footer>
  );
}
