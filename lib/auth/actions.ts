"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { adminEmails } from "@/lib/env";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";

export interface AuthState {
  error?: string;
}

const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(160),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Enter your password"),
});

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "/";
  // only allow internal paths
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function roleFor(email: string): "user" | "admin" {
  return adminEmails.has(email) ? "admin" : "user";
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }
  const { name, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: roleFor(email),
    })
    .returning();

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user || !user.passwordHash) {
    // no local password (e.g. Google-only account) or no such user
    return { error: "Incorrect email or password." };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  // Keep role in sync with the ADMIN_EMAILS allow-list.
  const desiredRole = roleFor(email);
  if (user.role !== desiredRole) {
    await db.update(users).set({ role: desiredRole }).where(eq(users.id, user.id));
  }

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
