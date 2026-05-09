/**
 * Branding Audit Tests
 * 
 * Scans all critical source files for legacy "Ebdaa" references
 * that should have been replaced during the HRM rebrand.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const ARTIFACTS = path.join(ROOT, "artifacts");

// Patterns that should NOT exist in any source file
const BANNED_PATTERNS = [
  /ebdaa_user_token/i,
  /ebdaa_user(?!")/i,
  /@ebdaa\.(com|sa)/i,
  /EBDAA INDUSTRIAL/i,
  /Ebdaa Matrix/i,
  /Ebdaa Suite/i,
  /ebdaa-skill-matrix/,
  /ebdaa-dashboard/,
  /ebdaa-docs/,
  /ebdaa-spreadsheet/,
  /ebdaa-pitch-deck/,
];

// Allowlist — demo credential strings in login page are OK
const ALLOWLIST_FILES = [
  "login.tsx", // demo credentials like "super_admin@hrm.com / admin123"
];

function scanDirectory(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "dist" && entry.name !== ".git") {
      results.push(...scanDirectory(full, extensions));
    } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

describe("Branding Audit — No Legacy References", () => {
  const sourceFiles = scanDirectory(ARTIFACTS, [".ts", ".tsx", ".json"]);

  it("should have found source files to scan", () => {
    expect(sourceFiles.length).toBeGreaterThan(10);
  });

  it("should not contain legacy Ebdaa branding in source files", () => {
    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      const fileName = path.basename(filePath);
      if (ALLOWLIST_FILES.includes(fileName)) continue;

      const content = fs.readFileSync(filePath, "utf-8");
      for (const pattern of BANNED_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
          const rel = path.relative(ROOT, filePath);
          violations.push(`${rel}: found "${match[0]}"`);
        }
      }
    }

    if (violations.length > 0) {
      console.log("Branding violations found:\n" + violations.join("\n"));
    }
    expect(violations).toEqual([]);
  });
});

describe("Branding Audit — Config Files", () => {
  it("vercel.json should not contain ebdaa routes", () => {
    const vercelConfig = fs.readFileSync(path.join(ROOT, "vercel.json"), "utf-8");
    expect(vercelConfig).not.toMatch(/ebdaa/i);
  });

  it("root package.json name should be hrm-development", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"));
    expect(pkg.name).toBe("hrm-development");
  });
});
