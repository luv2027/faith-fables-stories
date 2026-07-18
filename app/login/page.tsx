import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { googleEnabled } from "@/lib/env";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Sign in" };

function safeNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

const ERROR_MESSAGES: Record<string, string> = {
  google: "Google sign-in failed. Please try again.",
  google_email: "Your Google account has no verified email.",
  google_disabled: "Google sign-in isn't configured yet.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const dest = safeNext(next);
  const notice = ERROR_MESSAGES[first(error) ?? ""];

  if (await getCurrentUser()) redirect(dest);

  return (
    <Container size="narrow" className="py-20">
      <div className="mx-auto max-w-sm">
        <div className="mb-5 flex justify-center">
          <span className="relative h-16 w-16 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border">
            <Image
              src="/brand/faith-fables-mark.png"
              alt="Faith Fables"
              fill
              sizes="64px"
              className="object-contain p-1"
            />
          </span>
        </div>
        <h1 className="text-center font-serif text-3xl font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Sign in to continue your reading journey.
        </p>
        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <AuthForm
            mode="login"
            next={dest}
            googleEnabled={googleEnabled}
            notice={notice}
          />
        </div>
      </div>
    </Container>
  );
}
