import react from "@vitejs/plugin-react"
import { resolve } from "node:path"
import { defineConfig } from "vite"

const projectRoot = import.meta.dirname

/** Build estático independiente del bundle publicable de la librería. */
export default defineConfig({
  plugins: [react()],
  base: process.env.NISSI_DOCS_BASE || "/",
  build: {
    outDir: "site-dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(projectRoot, "index.html"),
        nfacture: resolve(projectRoot, "nfacture.html"),
      },
    },
  },
})
