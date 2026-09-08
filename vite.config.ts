import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, extname, relative, resolve } from "node:path"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { defineConfig } from "vitest/config"

const projectRoot = import.meta.dirname
const declarationOutDir = resolve(projectRoot, "dist")

function preserveUseClientDirectives() {
  return {
    name: "preserve-use-client-directives",
    enforce: "post" as const,
    renderChunk(code: string, chunk: { facadeModuleId: string | null }) {
      if (!chunk.facadeModuleId || !existsSync(chunk.facadeModuleId)) return null
      const source = readFileSync(chunk.facadeModuleId, "utf8")
      if (!/^\s*["']use client["']/.test(source) || /^\s*["']use client["']/.test(code)) return null
      return { code: `"use client";\n${code}`, map: null }
    },
  }
}

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
    preserveUseClientDirectives(),
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
      entry: {
        index: resolve(projectRoot, "src/index.ts"),
        "components/theme/index": resolve(projectRoot, "src/components/theme/index.ts"),
        "components/styling/index": resolve(projectRoot, "src/components/styling/index.ts"),
        "components/panel/index": resolve(projectRoot, "src/components/panel/index.ts"),
        "components/document-view/index": resolve(projectRoot, "src/components/document-view/index.ts"),
        "components/receipt/index": resolve(projectRoot, "src/components/receipt/index.ts"),
        "components/thermal-print/index": resolve(projectRoot, "src/components/thermal-print/index.ts"),
      },
      name: "NissiUI",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: resolve(projectRoot, "src"),
      },
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
    testTimeout: 10_000,
  },
})
