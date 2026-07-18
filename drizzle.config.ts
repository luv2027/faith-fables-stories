import "dotenv/config"; // load .env before reading process.env
import { defineConfig } from "drizzle-kit";

// Read DATABASE_URL directly (not via lib/env) so this node-context config
// stays decoupled from the server-only env module.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (see .env.example)");

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
