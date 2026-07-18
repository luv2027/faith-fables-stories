import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { Container } from "@/components/layout/Container";
import { AdminTabs } from "@/components/admin/AdminTabs";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <Container className="py-10">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Admin
          </p>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Content studio
          </h1>
        </div>
        <div className="text-right text-sm text-muted">
          <p className="font-medium text-ink">{admin.name}</p>
          <Link href="/" className="hover:text-accent">
            ← Back to site
          </Link>
        </div>
      </div>
      <AdminTabs />
      {children}
    </Container>
  );
}
