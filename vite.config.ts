import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/lib", replacement: path.resolve(__dirname, "./src/shared/lib") },
      { find: "@/components", replacement: path.resolve(__dirname, "./src/shared/components") },
      { find: "@/hooks", replacement: path.resolve(__dirname, "./src/shared/hooks") },
      { find: "@hrm-development/api-client-react", replacement: path.resolve(__dirname, "./lib/api-client-react/src/index.ts") },
      { find: "@shared", replacement: path.resolve(__dirname, "./src/shared") },
      { find: "@modules", replacement: path.resolve(__dirname, "./src/modules") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  root: ".",
  server: {
    port: 8081,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
