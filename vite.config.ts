import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/index.ts", "src/components/**/*.ts", "src/components/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      entryRoot: "src",
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "NissiUI",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    sourcemap: true,
    rollupOptions: {
      external: (id) =>
        id === "react" ||
        id === "react-dom" ||
        id === "react/jsx-runtime" ||
        id.startsWith("@chakra-ui/") ||
        id.startsWith("@emotion/") ||
        id.startsWith("@tanstack/") ||
        id === "next-themes" ||
        id === "lucide-react" ||
        id === "jspdf" ||
        id === "jspdf-autotable" ||
        id.startsWith("write-excel-file/"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
  },
})
