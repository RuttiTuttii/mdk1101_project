import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
      "clsx": path.resolve(__dirname, "./node_modules/clsx"),
      "tailwind-merge": path.resolve(__dirname, "./node_modules/tailwind-merge"),
    },
  },
  server: {
    proxy: {
      "/auth": "http://127.0.0.1:8000",
      "/catalog": "http://127.0.0.1:8000",
      "/products": "http://127.0.0.1:8000",
      "/orders": "http://127.0.0.1:8000",
      "/manufacturers": "http://127.0.0.1:8000",
      "/health": "http://127.0.0.1:8000",
    },
  },
});
