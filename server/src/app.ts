import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

// Vercel sets `process.env.VERCEL` to "1" in its serverless runtime.
// In that environment, the Vercel CDN serves all static assets (the built
// SPA in `dist/`, artifact bundles, public files, etc.) directly — the
// Express app only needs to handle the API surface. Skipping the static
// + Vite handlers there keeps cold-starts fast and avoids redundant work.
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV !== undefined;

// ── Middlewares ──────────────────────────────────────────────────────────────

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", env: process.env.NODE_ENV ?? "unknown" });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Static / Frontend Serving (skipped on Vercel) ────────────────────────────
// On Vercel the CDN serves the built SPA in `dist/` directly via `vercel.json`
// rewrites — Express only handles the `/api/*` surface and the xlsx download.
// In every other host (local dev / self-hosted / Docker) we still serve the
// unified SPA from this Express process so the API and UI share one port.
if (!isVercel) {
  const possibleDistPaths = [
    path.resolve(process.cwd(), "dist"),
    path.resolve(process.cwd(), "server/dist"),
    path.join(__dirname, "../dist"),
    path.join(__dirname, "../../dist"),
  ];

  let rootDist = possibleDistPaths[0];
  for (const p of possibleDistPaths) {
    const indexPath = path.join(p, "index.html");
    if (fs.existsSync(indexPath)) {
      rootDist = p;
      logger.info({ path: p }, "Found root dist directory with index.html");
      break;
    }
  }

  logger.info(
    {
      cwd: process.cwd(),
      __dirname,
      rootDist,
      exists: fs.existsSync(rootDist),
    },
    "Static file serving configuration",
  );

  const serveIndex = (req: express.Request, res: express.Response) => {
    if (fs.existsSync(rootDist)) {
      res.sendFile(path.join(rootDist, "index.html"));
    } else {
      logger.error(
        { rootDist, path: req.path },
        "Root dist directory or index.html not found",
      );
      res
        .status(404)
        .send("Frontend build artifact not found. Please ensure the build completed successfully.");
    }
  };

  // SPA fallback for every client-routed top-level path. The order matters:
  // static files first, then route-based fallbacks for unknown paths.
  if (fs.existsSync(rootDist)) {
    app.use(express.static(rootDist));
  }

  app.get("/", serveIndex);
  app.get(/^\/skill-matrix/, serveIndex);
  app.get(/^\/job-evaluation/, serveIndex);
  app.get(/^\/spreadsheet/, serveIndex);
  app.get(/^\/my-profile/, serveIndex);
  app.get(/^\/login/, serveIndex);
  app.get(/^\/docs/, serveIndex);
  app.get(/^\/interactive-presentation/, serveIndex);
} else {
  logger.info("Running on Vercel — Express only handles /api/* and /healthz. Static assets served by Vercel CDN.");
}

// ── Public file downloads (always available) ─────────────────────────────────
app.get("/hrm-skill-matrix-template.xlsx", (_req, res) => {
  const xlsxPath = path.join(process.cwd(), "public/skill-matrix-template.xlsx");
  res.download(xlsxPath, "hrm-Skill-Matrix-Template.xlsx", (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "Spreadsheet not yet generated" });
    }
  });
});

// ── Generic error handler ────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  logger.error({ err }, "Unhandled application error");
  res.status(status).json({ error: message });
});

export default app;
