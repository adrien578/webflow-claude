import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Prévisualisation locale uniquement : la page dev/ assemble les composants
// comme ils le seront dans le Designer. Le bundle Webflow est produit par
// la CLI Webflow (`npm run webflow:bundle` / `npm run webflow:share`).
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  build: { outDir: "dist-preview" },
});
