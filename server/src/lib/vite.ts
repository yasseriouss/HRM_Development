import express, { Express } from "express";
import fs from "fs";
import path from "path";
// Removed top-level vite import to avoid bundling issues and runtime errors in production.
import { fileURLToPath } from "url";
import { logger } from "./logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Registers Vite middleware for development or serves static files for production.
 * This unifies the frontend artifact serving logic.
 */
export async function registerFrontend(app: Express) {
  const isDev = process.env.NODE_ENV === "development";

  const artifacts = [
    { name: "hrm-skill-matrix", path: "/hrm-skill-matrix" },
    { name: "hrm-dashboard", path: "/hrm-dashboard" },
    { name: "hrm-pitch-deck", path: "/hrm-pitch-deck" },
    { name: "hrm-docs", path: "/hrm-docs" },
    { name: "hrm-spreadsheet", path: "/hrm-spreadsheet" },
    { name: "mockup-sandbox", path: "/mockup-sandbox" },
  ];

  if (isDev) {
    logger.info("Initializing Vite middleware for development...");
    
    for (const artifact of artifacts) {
      const artifactPath = path.resolve(process.cwd(), `artifacts/${artifact.name}`);
      
      // Check if artifact directory exists
      if (!fs.existsSync(artifactPath)) {
        logger.warn({ artifact: artifact.name }, "Artifact directory not found, skipping Vite registration");
        continue;
      }

      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        root: artifactPath,
        base: `${artifact.path}/`,
        server: {
          middlewareMode: true,
          hmr: {
            // Use a unique port range for HMR to avoid collisions
            port: 30000 + artifacts.indexOf(artifact),
          },
        },
        appType: "custom",
      });

      // Register Vite's middleware
      app.use(artifact.path, vite.middlewares);

      // Handle SPA routing
      app.get(`${artifact.path}*`, async (req, res, next) => {
        const url = req.originalUrl;
        
        // Skip API routes
        if (url.startsWith("/api")) return next();

        try {
          const indexHtmlPath = path.join(artifactPath, "index.html");
          if (!fs.existsSync(indexHtmlPath)) {
             return res.status(404).send(`index.html not found for ${artifact.name}`);
          }

          let template = fs.readFileSync(indexHtmlPath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
    }
  } else {
    logger.info("Configuring static file serving for production...");
    
    for (const artifact of artifacts) {
      const distDir = path.resolve(process.cwd(), `artifacts/${artifact.name}/dist/public`);
      
      if (fs.existsSync(distDir)) {
        app.use(artifact.path, express.static(distDir));
        app.get(`${artifact.path}*`, (_req, res) => {
          res.sendFile(path.join(distDir, "index.html"));
        });
      } else {
        logger.warn({ artifact: artifact.name }, "Production build not found, skipping static serving");
      }
    }
  }

  // Redirect root to main app - DISABLED to allow SPA to handle root.
  /*
  app.get("/", (_req, res) => {
    res.redirect("/skill-matrix");
  });
  */
}
