import "server-only";
import { randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

export const SESSION_COOKIE = "ff_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export type SafeUser = Omit<User, "passwordHash">;

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    googleId: user.googleId,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

/** Create a session row + set the httpOnly cookie. Call from a Server Action. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({ id: token, userId, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Delete the current session row and clear the cookie. Call from a Server Action. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
    cookieStore.delete(SESSION_COOKIE);
  }
}

/**
 * Resolve the current user from the session cookie. Memoized per request.
 * Read-only (safe to call from Server Components).
 */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())),
  });
  if (!row) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, row.userId),
  });
  return user ? toSafeUser(user) : null;
});

/** Require any authenticated user, else redirect to /login. */
export async function requireUser(nextPath = "/"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Require an admin, else redirect (to /login if signed out, home if not admin). */
export async function requireAdmin(nextPath = "/admin"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (user.role !== "admin") redirect("/");
  return user;
}
