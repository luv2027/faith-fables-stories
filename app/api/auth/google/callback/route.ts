import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { adminEmails, googleEnabled } from "@/lib/env";
import { exchangeGoogleCode, getGoogleProfile } from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";

function safeNext(value: string | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

function fail(origin: string, reason: string) {
  return NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  if (!googleEnabled) return fail(origin, "google_disabled");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("g_state")?.value;
  const next = safeNext(cookieStore.get("g_next")?.value);
  cookieStore.delete("g_state");
  cookieStore.delete("g_next");

  if (!code || !state || !savedState || state !== savedState) {
    return fail(origin, "google");
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const { access_token } = await exchangeGoogleCode(code, redirectUri);
    const profile = await getGoogleProfile(access_token);

    if (!profile.email || profile.email_verified === false) {
      return fail(origin, "google_email");
    }

    const email = profile.email.toLowerCase();
    const role = adminEmails.has(email) ? "admin" : "user";

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    let userId: string;
    if (!existing) {
      const [created] = await db
        .insert(users)
        .values({
          email,
          name: profile.name ?? email,
          googleId: profile.sub,
          avatarUrl: profile.picture ?? null,
          role,
        })
        .returning();
      userId = created.id;
    } else {
      await db
        .update(users)
        .set({
          googleId: profile.sub,
          role,
          avatarUrl: existing.avatarUrl ?? profile.picture ?? null,
        })
        .where(eq(users.id, existing.id));
      userId = existing.id;
    }

    await createSession(userId);
    return NextResponse.redirect(new URL(next, origin));
  } catch {
    return fail(origin, "google");
  }
}
