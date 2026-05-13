# HRM Skill Matrix System

Full-stack workforce competency management platform for a wood manufacturing factory (146+ employees, 9 departments). Unified React SPA + Express API, served as a single deployment on Vercel.

## Stack

- **Frontend:** React 19 + Vite 7 + TypeScript 5 + Tailwind CSS 4
- **Routing:** `wouter` (client-side) with SPA fallback rewrites on Vercel
- **State / Data:** TanStack Query, React Hook Form, Zod
- **UI:** Radix UI primitives, `next-themes`, `framer-motion`, Recharts
- **Charts / Export:** Recharts, ExcelJS, jsPDF
- **Backend:** Express 5 (Node 22) - runs as a Vercel serverless function in production
- **Database:** PostgreSQL via Drizzle ORM (`@neondatabase/serverless` driver compatible)
- **Validation / API codegen:** Zod, Orval (OpenAPI spec)
- **Package manager:** pnpm 10 (workspaces)

## Project Structure

```
.
├─ src/                        Main SPA (entry: src/main.tsx)
│  ├─ modules/                  Feature modules (dashboard, skill-matrix, docs, interactive-presentation, spreadsheet, …)
│  └─ shared/                   i18n, theme, layout, utils
├─ server/                     Express API (mounted under /api/* on Vercel)
├─ api/index.ts                Vercel serverless function entrypoint
├─ artifacts/                  Optional standalone sub-apps (not deployed by default)
├─ lib/                        Shared workspace libraries (api-client, schemas, …)
├─ scripts/                    Build / data scripts (e.g. generate-excel.mjs)
├─ public/                     Static assets served as-is by Vite/Vercel
├─ vite.config.ts              Main SPA Vite config
├─ vercel.json                 Vercel deployment configuration
└─ pnpm-workspace.yaml         pnpm workspace manifest
```

## Application Routes

| Route | Description |
|---|---|
| `/` | Dashboard analytics (main landing) |
| `/skill-matrix/*` | Skill matrix module (employees, evaluations, campaigns, training) |
| `/interactive-presentation/*` | 16-slide pitch deck (dark editorial theme) |
| `/docs/*` | In-app technical documentation |
| `/spreadsheet/*` | Excel / spreadsheet tool |
| `/job-evaluation/*` | Job evaluation module |
| `/my-profile/*` | Profile page |
| `/login` | Authentication |
| `/api/*` | Express API (serverless on Vercel) |
| `/healthz` | Health check |
| `/hrm-skill-matrix-template.xlsx` | 146-employee skill matrix workbook download |

**Demo credentials:** `super_admin@hrm.com / admin123` · `hr@hrm.com / hr123`

## Key Commands

| Command | What it does |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Run client + server in parallel (Vite on :5173, API on :8080) |
| `pnpm dev:client` | Run only the Vite dev server |
| `pnpm dev:server` | Run only the Express API |
| `pnpm build` | Production build of the main SPA |
| `pnpm build:all` | Build SPA **and** every artifact in `artifacts/*` |
| `pnpm vercel-build` | Vercel-compatible production build |
| `pnpm preview` | Serve the production build locally |
| `pnpm typecheck` | TypeScript check (no emit) |
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm clean` | Remove `dist`, Vite cache, tsbuildinfo |

## Deployment (Vercel)

The repository is configured for **static-first** Vercel deployment:

- Static assets (HTML, JS, CSS, images, fonts) are served directly from Vercel's CDN with long-lived `immutable` caching for hashed assets.
- Only `/api/*`, `/healthz`, and the `.xlsx` download route are forwarded to the `api/index.ts` serverless function (which boots the Express app).
- SPA fallback rewrites send all unknown application paths to `/index.html`, enabling client-side routing.

See `vercel.json` for full configuration.

## Environment

Required env vars (set locally in `.env.local` or in your Vercel project settings):

```
DATABASE_URL=postgres://…
NODE_ENV=production            # set automatically on Vercel
```

## Domain Concepts

- **Departments (9):** Assembly, Upholstery, Painting, Wood Prep, Finishing, Packing, Maintenance, Quality Control, Cutting
- **Scoring System:**
  - **Class A** (≥85%) - High performer, fully competent
  - **Class B** (60–84%) - Developing, targeted training
  - **Class C** (<60%) - Needs improvement, urgent training
- **Currency:** EGP (Egyptian Pound)
- **Languages:** English + Arabic (with RTL via `Tajawal`)

## License

Private / internal. Created by [yasserious.com](https://yasserious.com).
