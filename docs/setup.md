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

## Troubleshooting

- **Port Conflict:** If port 8080 or 8081 is in use, check `server/.env` or `vite.config.ts`.
- **Login HTTP 500 / 503:** Usually missing `DATABASE_URL` or DB unreachable. Check API logs; ensure `server/.env` exists when running `pnpm dev` (which starts the API from the `server` package). For Neon from Vercel, the app rewrites non-pooled `ep-…` hosts to the **pooled** `ep-…-pooler…` host for the HTTP driver (disable with `HRM_NEON_USE_POOLER=0` if your URL is already correct). Ensure your IP is allowlisted if your Neon project requires it.
- **Database Connection:** Ensure your IP is whitelisted in the Neon console when using Neon.
