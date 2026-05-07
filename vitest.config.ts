import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    css: false,
  },
  resolve: {
    alias: {
      "@hrm-development/db": path.resolve(__dirname, "lib/db/src"),
    },
  },
});
