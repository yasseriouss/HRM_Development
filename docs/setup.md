# Project Setup Guide

This guide ensures you can get the HRM Unified platform running from zero in under 15 minutes.

## Prerequisites

- **Node.js:** v22.x or later
- **pnpm:** v10.x or later
- **Database:** Access to a PostgreSQL instance (Neon is used for development)

## Step-by-Step Installation

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd HRM_Development
   ```

2. **Install Dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**

   The API server loads **`server/.env`** (see `server/package.json` `dev` / `start` scripts). Copy the example file there and set a Postgres URL.

   ```bash
   cp server/.env.example server/.env
   # Set DATABASE_URL and PORT=8080 in server/.env
   ```

   Use a **Neon** connection string for hosted preview/production, or **any Postgres** URL for local Docker — the app picks the `pg` TCP driver automatically when the host is not `*.neon.tech`.

3b. **Apply the database schema (first run or after schema changes):**

   `drizzle-kit` reads `DATABASE_URL` from the environment (it does not load `server/.env` by itself). From the repo root, after `server/.env` exists:

   ```bash
   # Unix / macOS (bash): export from .env then push
   set -a && source server/.env && set +a && pnpm --filter @hrm-development/db run push
   ```

   On **Windows PowerShell**:

   ```powershell
   $env:DATABASE_URL = (Get-Content server\.env | Where-Object { $_ -match '^DATABASE_URL=' }) -replace '^DATABASE_URL=',''
   pnpm --filter @hrm-development/db run push
   ```

4. **Database Seeding (Optional):**

   To populate the system with demo users and data:

   ```bash
   pnpm --filter @hrm-development/api-server run seed
   ```

4b. **Copy a remote database into local Docker (full data):**

   When you want a **clone** of your hosted DB (e.g. Neon) on the machine that runs Docker:

   1. Start local Postgres: `docker compose up -d postgres` (see `docker-compose.yml`: user `hrm`, password `password123`, DB `hrm_skill_matrix`).
   2. Set **`REMOTE_DATABASE_URL`** to your Neon (hosted) URI, **or** put that URI in **`server/.env`** as `DATABASE_URL` for this one command, **or** pass **`-RemoteUrl`** to the script.

   **Windows (PowerShell), from repo root:**

   ```powershell
   pnpm db:pull
   # or: .\scripts\db-pull-remote-to-local.ps1 -RemoteUrl "postgresql://USER:PASS@HOST/DB?sslmode=require"
   ```

   **macOS / Linux:**

   ```bash
   chmod +x scripts/db-pull-remote-to-local.sh
   export REMOTE_DATABASE_URL="postgresql://USER:PASS@HOST/DB?sslmode=require"   # optional if server/.env has DATABASE_URL
   ./scripts/db-pull-remote-to-local.sh
   ```

   Then point **`server/.env`** at local:

   `DATABASE_URL=postgresql://hrm:password123@127.0.0.1:5432/hrm_skill_matrix?sslmode=disable`

5. **Start Development Servers:**

   From the repo root (recommended — starts Vite + API together):

   ```bash
   pnpm dev
   ```

   Or run them in separate terminals:

   ```bash
   pnpm dev:server   # API on :8080 (loads server/.env)
   pnpm dev:client   # Vite on :8081
   ```

## Key Endpoints

- **Frontend:** [http://localhost:8081](http://localhost:8081)
- **Backend API:** [http://localhost:8080/api](http://localhost:8080/api)
- **Public presentation (no login):** [http://localhost:8081/presentation](http://localhost:8081/presentation) — same interactive deck as `/interactive-presentation`, without authentication.

## Troubleshooting

- **Port Conflict:** If port 8080 or 8081 is in use, check `server/.env` or `vite.config.ts`.
- **Login HTTP 500 / 503:** Usually missing `DATABASE_URL` or DB unreachable. Check API logs; ensure `server/.env` exists when running `pnpm dev` (which starts the API from the `server` package). With Neon, local dev uses the **`pg` TCP driver** by default (Neon **HTTP** is used on Vercel when **`VERCEL=1`** or **`VERCEL_ENV`** is set, same as `server/src/app.ts`). On Vercel, non-pooled `ep-…` hosts are rewritten to **pooled** `ep-…-pooler…` for HTTP (disable with `HRM_NEON_USE_POOLER=0` if your URL is already correct). If you must force the HTTP driver locally, set `HRM_DB_DRIVER=neon`. Ensure your IP is allowlisted if your Neon project requires it. **On Vercel,** production responses omit the error `message` in JSON by default — set **`HRM_EXPOSE_AUTH_ERRORS=1`** in project env (briefly) to see the real failure in the browser Network tab, and check **Function logs** for the same error.
- **Database Connection:** Ensure your IP is whitelisted in the Neon console when using Neon.
