import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  // List table modules explicitly: drizzle-kit resolves CJS `require()` and
  // cannot follow `./foo.js` re-exports from `index.ts` while sources are `.ts`.
  schema: [
    "./src/schema/factories.ts",
    "./src/schema/users.ts",
    "./src/schema/departments.ts",
    "./src/schema/employees.ts",
    "./src/schema/skills.ts",
    "./src/schema/campaigns.ts",
    "./src/schema/evaluations.ts",
    "./src/schema/evaluation_summaries.ts",
    "./src/schema/training.ts",
    "./src/schema/workflows.ts",
    "./src/schema/sessions.ts",
    "./src/schema/job_evaluation.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
