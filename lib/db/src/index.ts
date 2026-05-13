import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema/index.js";

// Resolve DATABASE_URL: Vercel's Neon integration prefixes vars with the
// project name (e.g. hrmdev_DATABASE_URL). Fall back gracefully so the module
// can be imported without crashing at startup if the env var is missing.
function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.hrmdev_DATABASE_URL ??
    process.env.HRMDEV_DATABASE_URL
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(resolveDatabaseUrl());
}

/**
 * Neon serverless HTTP (`neon()`) only works with Neon-hosted databases.
 * Local Postgres, RDS, Docker `postgres`, etc. need the `pg` TCP pool.
 *
 * Override: `HRM_DB_DRIVER=neon` | `HRM_DB_DRIVER=postgres`
 */
function shouldUseNeonHttpDriver(url: string): boolean {
  const driver = process.env.HRM_DB_DRIVER?.toLowerCase();
  if (driver === "postgres" || driver === "pg") return false;
  if (driver === "neon") return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.includes("neon.tech");
  } catch {
    return false;
  }
}

const databaseUrl = resolveDatabaseUrl();

if (!databaseUrl) {
  console.warn(
    "⚠️ DATABASE_URL is not set. Database features will fail. Add it to your Vercel project environment variables.",
  );
}

const missingDbProxy = new Proxy(
  {},
  {
    get() {
      throw new Error("Database access attempted but DATABASE_URL is missing.");
    },
  },
) as any;

/** Populated only when using the Neon HTTP driver; otherwise `null`. */
export let sql: ReturnType<typeof neon> | null = null;

/** Populated only when using node-postgres; otherwise `null`. */
export let pgPool: Pool | null = null;

export const db = (() => {
  if (!databaseUrl) {
    return missingDbProxy;
  }
  if (shouldUseNeonHttpDriver(databaseUrl)) {
    sql = neon(databaseUrl);
    return drizzleNeon(sql, { schema });
  }
  const max = Number(process.env.HRM_PG_POOL_MAX ?? 10);
  pgPool = new Pool({
    connectionString: databaseUrl,
    max: Number.isFinite(max) && max > 0 ? max : 10,
  });
  return drizzleNodePg(pgPool, { schema });
})();

export * from "./schema/index.js";
