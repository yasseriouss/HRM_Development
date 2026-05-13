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
  publicDir: "public",
  server: {
    port: 8081,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/healthz": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 8081,
    strictPort: false,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split big vendor chunks for better CDN caching on Vercel.
        // Keep React in the main vendor bundle so we don't hit circular
        // chunk warnings (every other vendor chunk imports it).
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("/d3-")) return "vendor-charts";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("exceljs") || id.includes("jspdf") || id.includes("html2canvas")) return "vendor-export";
          // Everything else (React, Radix UI, lucide, query, etc.) stays
          // together to avoid forward-import cycles.
          return "vendor";
        },
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
});
