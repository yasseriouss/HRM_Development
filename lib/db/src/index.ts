import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema/index.js";
// ... (rest of the file)
export * from "./schema/index.js";

// Resolve DATABASE_URL: Vercel's Neon integration prefixes vars with the
// project name (e.g. hrmdev_DATABASE_URL). Fall back gracefully so the module
// can be imported without crashing at startup if the env var is missing.
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.hrmdev_DATABASE_URL ??
  process.env.HRMDEV_DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "⚠️ DATABASE_URL is not set. Database features will fail. Add it to your Vercel project environment variables.",
  );
}

// Initialize with a fallback or dummy to prevent immediate crash on module load
export const sql = databaseUrl ? neon(databaseUrl) : ((() => {
  throw new Error("Database not initialized. Missing DATABASE_URL.");
}) as any);

export const db = databaseUrl ? drizzle(sql, { schema }) : (new Proxy({}, {
  get: () => {
    throw new Error("Database access attempted but DATABASE_URL is missing.");
  }
}) as any);

export * from "./schema";
