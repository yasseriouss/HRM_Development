# Ebdaa Skill Matrix System

## Overview

Full-stack workforce competency management platform for a wood manufacturing factory (146+ employees, 9 departments). pnpm monorepo with TypeScript throughout.

## All Deliverables

All five deliverables are live, served statically from the API server (port 8080):

| Deliverable | URL | Description |
|---|---|---|
| Web App | `/ebdaa-skill-matrix/` | Full-stack skill matrix system |
| Analytics Dashboard | `/ebdaa-dashboard/` | Dark-themed 6-section analytics dashboard (Recharts, static demo data, no login) |
| Pitch Deck | `/ebdaa-pitch-deck/` | 8-slide presentation with factory hero image |
| Technical Docs | `/ebdaa-docs/` | Complete API + schema documentation |
| Excel Spreadsheet | `/ebdaa-skill-matrix-template.xlsx` | 146-employee skill matrix workbook (6 sheets) |

**Demo credentials:** super_admin@ebdaa.com / admin123 · hr@ebdaa.com / hr123

**Branding:** All deliverables include "Created by yasserious.com"

## Port Routing Architecture

All artifacts route through the API server (port 8080). Artifact `localPort` values set to 8080 so the Replit proxy routes correctly:
- `/api/...` → API routes
- `/ebdaa-skill-matrix/` → skill matrix static build
- `/ebdaa-dashboard/` → dashboard static build
- `/ebdaa-pitch-deck/` → pitch deck static build
- `/ebdaa-docs/` → static HTML documentation
- `/ebdaa-skill-matrix-template.xlsx` → Excel download

To rebuild any frontend after code changes:
```bash
PORT=5000 BASE_PATH=/ebdaa-skill-matrix/  pnpm --filter @workspace/ebdaa-skill-matrix run build
PORT=5001 BASE_PATH=/ebdaa-dashboard/     pnpm --filter @workspace/ebdaa-dashboard run build
PORT=5002 BASE_PATH=/ebdaa-pitch-deck/    pnpm --filter @workspace/ebdaa-pitch-deck run build
node scripts/generate-excel.mjs
```

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React 18 + Vite + Tailwind CSS 4
- **Charts**: Recharts
- **Excel**: SheetJS (xlsx npm package)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `node scripts/generate-excel.mjs` — regenerate Excel spreadsheet

## Departments

Assembly, Upholstery, Painting, Wood Prep, Finishing, Packing, Maintenance, Quality Control, Cutting

## Scoring System

- **Class A** (≥85%): High performer — fully competent
- **Class B** (60–84%): Developing — targeted training
- **Class C** (<60%): Needs improvement — urgent training

## API Routes

All endpoints at `/api/...`, protected by `x-user-token` header:
- Auth: `/api/auth/login`, `/api/auth/me`
- Dashboard: `/api/dashboard/metrics`, `/api/dashboard/department-performance`, `/api/dashboard/recent-activity`, `/api/dashboard/class-trends`
- Resources: `/api/employees`, `/api/skills`, `/api/campaigns`, `/api/evaluations`, `/api/departments`, `/api/training/recommendations`
