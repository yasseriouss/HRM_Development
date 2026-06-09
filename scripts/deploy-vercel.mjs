#!/usr/bin/env node

// Deploy to Vercel
// Usage: node scripts/deploy-vercel.mjs [--dry-run]
//
// Prerequisites:
//   1. pnpm add -g vercel  (or: npm i -g vercel)
//   2. vercel login
//   3. vercel link  (link to existing project, or first deploy)

import { execSync } from "child_process";

const isDryRun = process.argv.includes("--dry-run");

try {
  execSync("vercel --version", { stdio: "ignore" });
} catch {
  console.error("Vercel CLI not found. Install: pnpm add -g vercel");
  process.exit(1);
}

console.log("\n> Building frontend...");
execSync("pnpm run build", { stdio: "inherit" });

const cmd = isDryRun ? "vercel" : "vercel --prod";
console.log(`\n> Deploying to Vercel${isDryRun ? " (preview)" : " (production)"}...`);
execSync(cmd, { stdio: "inherit" });

console.log("\n> Done!");
