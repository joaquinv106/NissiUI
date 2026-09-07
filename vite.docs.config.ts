import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

/** Build estático independiente del bundle publicable de la librería. */
export default defineConfig({
  plugins: [react()],
  base: process.env.NISSI_DOCS_BASE || "/",
  build: {
    outDir: "site-dist",
    emptyOutDir: true,
    sourcemap: true,
  },
})
