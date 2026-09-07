import { existsSync, statSync } from "node:fs"
import { dirname, extname, relative, resolve } from "node:path"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { defineConfig } from "vitest/config"

const projectRoot = import.meta.dirname
const declarationOutDir = resolve(projectRoot, "dist")

function nodeDeclarationSpecifier(importerPath: string, specifier: string) {
  if (extname(specifier)) return specifier

  const outputRelativeDir = relative(declarationOutDir, dirname(importerPath))
  const possibleSourceDirs = [
    resolve(projectRoot, outputRelativeDir),
    resolve(projectRoot, "src", outputRelativeDir),
  ]
  const targetsDirectory = possibleSourceDirs.some((sourceDir) => {
    const target = resolve(sourceDir, specifier)
    return existsSync(target) && statSync(target).isDirectory()
  })

  return targetsDirectory ? `${specifier.replace(/\/$/, "")}/index.js` : `${specifier}.js`
}

function useNodeDeclarationSpecifiers(filePath: string, content: string) {
  const rewrite = (_match: string, prefix: string, quote: string, specifier: string) =>
    `${prefix}${quote}${nodeDeclarationSpecifier(filePath, specifier)}${quote}`

  return content
    .replace(/(\bfrom\s*)(["'])(\.{1,2}\/[^"']+)\2/g, rewrite)
    .replace(/(\bimport\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\2/g, rewrite)
    .replace(/(\bimport\s*)(["'])(\.{1,2}\/[^"']+)\2/g, rewrite)
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/index.ts", "src/components/**/*.ts", "src/components/**/*.tsx"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      entryRoot: "src",
      beforeWriteFile: (filePath, content) => ({
        content: useNodeDeclarationSpecifiers(filePath, content),
      }),
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
