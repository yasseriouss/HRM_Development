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

   Copy the example environment file and fill in your secrets.

   ```bash
   cp .env.example .env
   # Ensure DATABASE_URL and PORT=8080 are set.
   ```

4. **Database Seeding (Optional):**

   To populate the system with demo users and data:

   ```bash
   pnpm --filter @hrm-development/api-server run seed
   ```

5. **Start Development Servers:**

   Launch both frontend and backend in parallel:

   ```bash
   # Terminal 1: Backend
   pnpm --filter @hrm-development/api-server run dev

   # Terminal 2: Frontend
   pnpm run dev
   ```

## Key Endpoints

- **Frontend:** [http://localhost:8081](http://localhost:8081)
- **Backend API:** [http://localhost:8080/api](http://localhost:8080/api)

## Troubleshooting

- **Port Conflict:** If port 8080 or 8081 is in use, check your `.env` or `vite.config.ts`.
- **Database Connection:** Ensure your IP is whitelisted in the Neon console.
