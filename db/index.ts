import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Single shared pg Pool + drizzle client.
 * In dev, Next.js hot-reload re-evaluates modules; without a global singleton
 * each reload opens a new pool and exhausts Postgres connections.
 */
const globalForDb = globalThis as unknown as {
  __ffPool?: Pool;
};

const pool =
  globalForDb.__ffPool ?? new Pool({ connectionString: env.DATABASE_URL });

if (env.NODE_ENV !== "production") {
  globalForDb.__ffPool = pool;
}

export const db = drizzle(pool, { schema });
