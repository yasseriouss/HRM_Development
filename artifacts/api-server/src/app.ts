import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import { injectSpeedInsights } from "@vercel/speed-insights";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

// Initialize Vercel Speed Insights
injectSpeedInsights();

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

// ── Static artifacts ─────────────────────────────────────────────────────────

// 1. Main skill matrix app
const frontendDist = path.resolve(
  __dirname,
  "../../../artifacts/ebdaa-skill-matrix/dist/public",
);
app.use("/ebdaa-skill-matrix", express.static(frontendDist));
app.use("/ebdaa-skill-matrix", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// 2. Analytics dashboard
const dashboardDist = path.resolve(
  __dirname,
  "../../../artifacts/ebdaa-dashboard/dist/public",
);
app.use("/ebdaa-dashboard", express.static(dashboardDist));
app.use("/ebdaa-dashboard", (_req, res) => {
  res.sendFile(path.join(dashboardDist, "index.html"));
});

// 3. Pitch deck
const pitchDeckDist = path.resolve(
  __dirname,
  "../../../artifacts/ebdaa-pitch-deck/dist/public",
);
app.use("/ebdaa-pitch-deck", express.static(pitchDeckDist));
app.use("/ebdaa-pitch-deck", (_req, res) => {
  res.sendFile(path.join(pitchDeckDist, "index.html"));
});

// 4. Technical documentation (React app)
const docsDist = path.resolve(__dirname, "../../../artifacts/ebdaa-docs/dist/public");
app.use("/ebdaa-docs", express.static(docsDist));
app.use("/ebdaa-docs", (_req, res) => {
  res.sendFile(path.join(docsDist, "index.html"));
});

// 5. Interactive spreadsheet tool
const spreadsheetDist = path.resolve(
  __dirname,
  "../../../artifacts/ebdaa-spreadsheet/dist/public",
);
app.use("/ebdaa-spreadsheet", express.static(spreadsheetDist));
app.use("/ebdaa-spreadsheet", (_req, res) => {
  res.sendFile(path.join(spreadsheetDist, "index.html"));
});

// 6. Mockup sandbox
const sandboxDist = path.resolve(
  __dirname,
  "../../../artifacts/mockup-sandbox/dist/public",
);
app.use("/mockup-sandbox", express.static(sandboxDist));
app.use("/mockup-sandbox", (_req, res) => {
  res.sendFile(path.join(sandboxDist, "index.html"));
});

// 7. Excel spreadsheet download
app.get("/ebdaa-skill-matrix-template.xlsx", (_req, res) => {
  const xlsxPath = path.resolve(__dirname, "../../../artifacts/ebdaa-docs/skill-matrix-template.xlsx");
  res.download(xlsxPath, "Ebdaa-Skill-Matrix-Template.xlsx", (err) => {
    if (err) res.status(404).json({ error: "Spreadsheet not yet generated" });
  });
});

export default app;
