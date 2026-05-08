import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

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

app.use("/api", router);

// Redirect root to main skill matrix app
app.get("/", (_req, res) => {
  res.redirect("/hrm-skill-matrix");
});

// ── Static artifacts ─────────────────────────────────────────────────────────

// 1. Main HRM Development app
const frontendDist = path.join(process.cwd(), "artifacts/hrm-skill-matrix/dist/public");
app.use("/hrm-skill-matrix", express.static(frontendDist));
app.use("/hrm-skill-matrix", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// 2. Analytics dashboard
const dashboardDist = path.join(process.cwd(), "artifacts/hrm-dashboard/dist/public");
app.use("/hrm-dashboard", express.static(dashboardDist));
app.use("/hrm-dashboard", (_req, res) => {
  res.sendFile(path.join(dashboardDist, "index.html"));
});

// 3. Pitch deck
const pitchDeckDist = path.join(process.cwd(), "artifacts/hrm-pitch-deck/dist/public");
app.use("/hrm-pitch-deck", express.static(pitchDeckDist));
app.use("/hrm-pitch-deck", (_req, res) => {
  res.sendFile(path.join(pitchDeckDist, "index.html"));
});

// 4. Technical documentation (React app)
const docsDist = path.join(process.cwd(), "artifacts/hrm-docs/dist/public");
app.use("/hrm-docs", express.static(docsDist));
app.use("/hrm-docs", (_req, res) => {
  res.sendFile(path.join(docsDist, "index.html"));
});

// 5. Interactive spreadsheet tool
const spreadsheetDist = path.join(process.cwd(), "artifacts/hrm-spreadsheet/dist/public");
app.use("/hrm-spreadsheet", express.static(spreadsheetDist));
app.use("/hrm-spreadsheet", (_req, res) => {
  res.sendFile(path.join(spreadsheetDist, "index.html"));
});

// 6. Mockup sandbox
const sandboxDist = path.join(process.cwd(), "artifacts/mockup-sandbox/dist/public");
app.use("/mockup-sandbox", express.static(sandboxDist));
app.use("/mockup-sandbox", (_req, res) => {
  res.sendFile(path.join(sandboxDist, "index.html"));
});

// 7. Excel spreadsheet download
app.get("/hrm-skill-matrix-template.xlsx", (_req, res) => {
  const xlsxPath = path.join(process.cwd(), "artifacts/hrm-docs/skill-matrix-template.xlsx");
  res.download(xlsxPath, "hrm-Skill-Matrix-Template.xlsx", (err) => {
    if (err) res.status(404).json({ error: "Spreadsheet not yet generated" });
  });
});

export default app;
