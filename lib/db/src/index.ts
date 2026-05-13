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

/**
 * Neon recommends the **pooled** host (`ep-…-pooler.…`) for serverless / many
 * short-lived clients. Direct `ep-…` URLs often work locally but can fail or
 * hang from Vercel or cold starts. Opt out: `HRM_NEON_USE_POOLER=0`.
 */
function normalizeNeonHttpConnectionString(urlStr: string): string {
  if (process.env.HRM_NEON_USE_POOLER === "0") return urlStr;
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    if (!host.includes("neon.tech")) return urlStr;
    const labels = u.hostname.split(".");
    const first = labels[0] ?? "";
    if (!first.startsWith("ep-") || first.includes("-pooler")) return urlStr;
    labels[0] = `${first}-pooler`;
    u.hostname = labels.join(".");
    return u.toString();
  } catch {
    return urlStr;
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
    const neonUrl = normalizeNeonHttpConnectionString(databaseUrl);
    sql = neon(neonUrl);
    return drizzleNeon(sql, { schema });
  }
  const max = Number(process.env.HRM_PG_POOL_MAX ?? 10);
  const connectTimeout = Number(process.env.HRM_PG_CONNECT_TIMEOUT_MS ?? 15_000);
  pgPool = new Pool({
    connectionString: databaseUrl,
    max: Number.isFinite(max) && max > 0 ? max : 10,
    connectionTimeoutMillis:
      Number.isFinite(connectTimeout) && connectTimeout > 0 ? connectTimeout : 15_000,
  });
  return drizzleNodePg(pgPool, { schema });
})();

export * from "./schema/index.js";
