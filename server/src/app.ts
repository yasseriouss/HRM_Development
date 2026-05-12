import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { registerFrontend } from "./lib/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/healthz", (_req, res) => {
  res.status(200).send("OK");
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api", router);

// Redirect root to main app
app.get("/", (_req, res) => {
  res.redirect("/skill-matrix");
});

// Serve main app from root dist
const possibleDistPaths = [
  path.resolve(process.cwd(), "dist"),
  path.resolve(process.cwd(), "server/dist"),
  path.join(__dirname, "../dist"),
  path.join(__dirname, "../../dist"),
];

let rootDist = possibleDistPaths[0];
for (const p of possibleDistPaths) {
  if (fs.existsSync(p)) {
    rootDist = p;
    logger.info({ path: p }, "Found root dist directory");
    break;
  }
}

logger.info({ 
  cwd: process.cwd(), 
  __dirname, 
  rootDist, 
  exists: fs.existsSync(rootDist) 
}, "Static file serving configuration");

// Register SPA routes
const serveIndex = (req: any, res: any) => {
  if (fs.existsSync(rootDist)) {
    res.sendFile(path.join(rootDist, "index.html"));
  } else {
    logger.error({ rootDist, path: req.path }, "Root dist directory or index.html not found");
    res.status(404).send(`Frontend build artifact not found. Please ensure the build completed successfully.`);
  }
};

app.get(/^\/skill-matrix/, serveIndex);
app.get(/^\/job-evaluation/, serveIndex);
app.get(/^\/spreadsheet/, serveIndex);
app.get(/^\/my-profile/, serveIndex);
app.get(/^\/login/, serveIndex);

if (fs.existsSync(rootDist)) {
  app.use(express.static(rootDist));
}

// ── Frontend Artifacts (Vite/Static) ─────────────────────────────────────────
// This handles /hrm-skill-matrix, /hrm-dashboard, etc.
try {
  await registerFrontend(app);
} catch (err) {
  logger.error({ err }, "Failed to register frontend artifacts");
}

// ── Legacy / Manual Routes ───────────────────────────────────────────────────

// Excel spreadsheet download
app.get("/hrm-skill-matrix-template.xlsx", (_req, res) => {
  const xlsxPath = path.join(process.cwd(), "public/skill-matrix-template.xlsx");
  res.download(xlsxPath, "hrm-Skill-Matrix-Template.xlsx", (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(404).json({ error: "Spreadsheet not yet generated" });
      }
    }
  });
});

// Generic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  logger.error({ err }, "Unhandled application error");
  res.status(status).json({ error: message });
});

export default app;
