import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
// `base: "./"` + viteSingleFile inline everything into one portable index.html
// that runs by simply opening the file in a browser (no server / no install)
// and also works when hosted on GitHub Pages.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  server: {
    port: 5173,
    open: false,
  },
});
