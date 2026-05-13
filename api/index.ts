/**
 * Vercel serverless entrypoint.
 *
 * This handler is invoked ONLY for routes that `vercel.json` forwards to it —
 * namely `/api/*` and `/healthz`. Every other URL (the SPA, hashed assets,
 * artifacts, public images) is served by Vercel's static CDN.
 *
 * The underlying Express app self-skips its static-file branch when it
 * detects the Vercel runtime (`process.env.VERCEL === "1"`), so this file
 * stays a thin adapter — no extra config required.
 */

// @ts-ignore — top-level await is awaited dynamically on cold start.
import appPromise from "../server/src/app";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  try {
    const app = await appPromise;
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Function Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err?.message ?? "Unknown error",
      stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    });
  }
}
