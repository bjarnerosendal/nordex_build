import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { resolve } from "node:path";

const PUBLIC_PATH = "/frontend/";
const PATH_TO_PROJECT = "../NordexFood/wwwroot/frontend";
const isProd = process.env.NODE_ENV === "production";

// https://vitejs.dev/config/
export default defineConfig({
  base: isProd ? PUBLIC_PATH : "/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".ts", ".js", ".vue", ".json"],
  },
  appType: "custom", // Important for Umbraco integration
  build: {
    outDir: resolve(__dirname, PATH_TO_PROJECT),
    assetsDir: `assets`,
    emptyOutDir: true,
    manifest: "assets/manifest.json",
    rollupOptions: {
      input: "./src/main.ts",
    },
  },
  server: {
    proxy: {
      "/umbraco/api": {
        target: "http://localhost:10739",
        changeOrigin: true,
      },
    },
  },
});
