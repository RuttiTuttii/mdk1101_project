import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
      "framer-motion": path.resolve(__dirname, "./node_modules/framer-motion"),
      "clsx": path.resolve(__dirname, "./node_modules/clsx"),
      "tailwind-merge": path.resolve(__dirname, "./node_modules/tailwind-merge"),
    },
  },
  clearScreen: false,
  server: {
    host: "127.0.0.1",
    port: 1420,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "127.0.0.1",
      port: 1421,
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    proxy: {
      "/auth": "http://127.0.0.1:8000",
      "/catalog": "http://127.0.0.1:8000",
      "/products": "http://127.0.0.1:8000",
      "/orders": "http://127.0.0.1:8000",
      "/manufacturers": "http://127.0.0.1:8000",
      "/health": "http://127.0.0.1:8000",
      "/admin": "http://127.0.0.1:8000",
    },
  },
}));
