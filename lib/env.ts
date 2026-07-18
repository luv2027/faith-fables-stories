import "server-only";
import { z } from "zod";

/**
 * Validates and exposes the environment once, at import time.
 * Consumers (db client, drizzle config, seed) must ensure `.env` is loaded
 * BEFORE importing this module — e.g. `import 'dotenv/config'` as the first
 * line of any standalone script (drizzle.config.ts, db/seed.ts). Next.js loads
 * `.env` automatically for the app runtime.
 */
const envSchema = z.object({
  DATABASE_URL: z.url(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // Comma-separated emails granted the 'admin' role on signup/login.
  ADMIN_EMAILS: z.string().default(""),
  // Google OAuth (optional — the "Continue with Google" button only shows when both are set).
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  // Gemini AI Guide (optional — the guide is interactive only when a key is set).
  GEMINI_API_KEY: z.string().default(""),
  GEMINI_MODEL: z.string().default("gemini-flash-latest"),
});

export const env = envSchema.parse(process.env);

/** True when Google OAuth is configured. */
export const googleEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);

/** True when the Gemini-powered AI Guide is configured. */
export const aiEnabled = Boolean(env.GEMINI_API_KEY);

/** Lower-cased set of admin emails from ADMIN_EMAILS. */
export const adminEmails = new Set(
  env.ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export type Env = z.infer<typeof envSchema>;
