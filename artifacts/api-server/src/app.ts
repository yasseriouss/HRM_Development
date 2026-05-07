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

// ── Static artifacts ─────────────────────────────────────────────────────────

// 1. Main skill matrix app
const frontendDist = path.resolve(
  process.cwd(),
  "artifacts/ebdaa-skill-matrix/dist/public",
);
app.use("/ebdaa-skill-matrix", express.static(frontendDist));
app.get("/ebdaa-skill-matrix/{*path}", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// 2. Analytics dashboard
const dashboardDist = path.resolve(
  process.cwd(),
  "artifacts/ebdaa-dashboard/dist/public",
);
app.use("/ebdaa-dashboard", express.static(dashboardDist));
app.get("/ebdaa-dashboard/{*path}", (_req, res) => {
  res.sendFile(path.join(dashboardDist, "index.html"));
});

// 3. Pitch deck
const pitchDeckDist = path.resolve(
  process.cwd(),
  "artifacts/ebdaa-pitch-deck/dist/public",
);
app.use("/ebdaa-pitch-deck", express.static(pitchDeckDist));
app.get("/ebdaa-pitch-deck/{*path}", (_req, res) => {
  res.sendFile(path.join(pitchDeckDist, "index.html"));
});

// 4. Technical documentation (React app)
const docsDist = path.resolve(process.cwd(), "artifacts/ebdaa-docs/dist/public");
app.use("/ebdaa-docs", express.static(docsDist));
app.get("/ebdaa-docs/{*path}", (_req, res) => {
  res.sendFile(path.join(docsDist, "index.html"));
});

// 5. Interactive spreadsheet tool
const spreadsheetDist = path.resolve(
  process.cwd(),
  "artifacts/ebdaa-spreadsheet/dist/public",
);
app.use("/ebdaa-spreadsheet", express.static(spreadsheetDist));
app.get("/ebdaa-spreadsheet/{*path}", (_req, res) => {
  res.sendFile(path.join(spreadsheetDist, "index.html"));
});

// 6. Excel spreadsheet download
app.get("/ebdaa-skill-matrix-template.xlsx", (_req, res) => {
  const xlsxPath = path.resolve(process.cwd(), "artifacts/ebdaa-docs/skill-matrix-template.xlsx");
  res.download(xlsxPath, "Ebdaa-Skill-Matrix-Template.xlsx", (err) => {
    if (err) res.status(404).json({ error: "Spreadsheet not yet generated" });
  });
});

export default app;
