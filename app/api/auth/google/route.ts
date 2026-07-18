import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { googleEnabled } from "@/lib/env";
import { googleAuthUrl } from "@/lib/auth/google";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 600, // 10 minutes
};

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

export async function GET(req: NextRequest) {
  if (!googleEnabled) {
    return NextResponse.redirect(
      new URL("/login?error=google_disabled", req.nextUrl.origin),
    );
  }

  const state = randomBytes(16).toString("hex");
  const next = safeNext(req.nextUrl.searchParams.get("next"));
  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;

  const cookieStore = await cookies();
  cookieStore.set("g_state", state, COOKIE_OPTS);
  cookieStore.set("g_next", next, COOKIE_OPTS);

  return NextResponse.redirect(googleAuthUrl(redirectUri, state));
}
