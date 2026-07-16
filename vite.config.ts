import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 本地开发用 `/`；GitHub Pages 子路径用 `/cat/`（由 Actions 注入 VITE_BASE）
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react-router")) {
            return "react-vendor";
          }
        },
      },
    },
  },
});
