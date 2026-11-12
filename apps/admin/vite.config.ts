import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiTarget = process.env.VITE_API_TARGET || "http://127.0.0.1:3001";

const sharedProxy = {
  "/api": {
    target: apiTarget,
    changeOrigin: true,
  },
  "/uploads": {
    target: apiTarget,
    changeOrigin: true,
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3002,
    strictPort: true,
    proxy: sharedProxy,
  },
  preview: {
    host: "0.0.0.0",
    port: 3002,
    strictPort: true,
    proxy: sharedProxy,
  },
});

