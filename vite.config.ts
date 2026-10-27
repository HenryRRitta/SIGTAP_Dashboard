import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sigtapUpdatePlugin } from "./scripts/sigtapUpdate";

export default defineConfig({
  plugins: [react(), tailwindcss(), sigtapUpdatePlugin()],
  server: {
    port: 5173,
    watch: {
      ignored: ["**/data/raw/**", "**/data/raw", "**/data/zips/**", "**/data/zips", "**/data/competencias/**", "**/data/competencias"],
    },
  },
});
