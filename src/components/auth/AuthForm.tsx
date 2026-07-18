"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginAction,
  signupAction,
  type AuthState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

interface AuthFormProps {
  mode: "login" | "signup";
  next?: string;
  googleEnabled?: boolean;
  notice?: string;
}

export function AuthForm({
  mode,
  next = "/",
  googleEnabled = false,
  notice,
}: AuthFormProps) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );

  return (
    <div className="space-y-4">
      {notice && (
        <p role="alert" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-hover">
          {notice}
        </p>
      )}

      {googleEnabled && (
        <>
          <a
            href={`/api/auth/google?next=${encodeURIComponent(next)}`}
            className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
            </svg>
            Continue with Google
          </a>
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <input id="name" name="name" type="text" autoComplete="name" required className={inputClass} />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          className={inputClass}
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-hover">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>

      <p className="pt-2 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
              Sign in
            </Link>
          </>
        )}
      </p>
      </form>
    </div>
  );
}
