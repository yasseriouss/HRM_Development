import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import { registerFrontend } from "./lib/vite";

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

// ── Frontend Artifacts (Vite/Static) ─────────────────────────────────────────
// This handles /hrm-skill-matrix, /hrm-dashboard, etc.
await registerFrontend(app);

// ── Legacy / Manual Routes ───────────────────────────────────────────────────

// Excel spreadsheet download
app.get("/hrm-skill-matrix-template.xlsx", (_req, res) => {
  const xlsxPath = path.join(process.cwd(), "artifacts/hrm-docs/skill-matrix-template.xlsx");
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
