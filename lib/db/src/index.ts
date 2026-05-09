import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Resolve DATABASE_URL: Vercel's Neon integration prefixes vars with the
// project name (e.g. hrmdev_DATABASE_URL). Fall back gracefully so the module
// can be imported without crashing at startup if the env var is missing.
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.hrmdev_DATABASE_URL ??
  process.env.HRMDEV_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Add it to your Vercel project environment variables.",
  );
}

export const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

export * from "./schema";
