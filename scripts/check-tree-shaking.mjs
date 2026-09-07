import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { build } from "vite"

const projectRoot = resolve(import.meta.dirname, "..")
const temporaryRoot = mkdtempSync(join(tmpdir(), "nissi-ui-tree-shaking-"))
const packageLink = join(temporaryRoot, "node_modules", "nissi-ui")
const forbiddenMarkers = ["Mostrar u ocultar columnas", "Constancia de situación fiscal", "Abrir centro de atajos"]

function readJavaScript(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? readJavaScript(path) : entry.name.endsWith(".js") ? [readFileSync(path, "utf8")] : []
  }).join("\n")
}

async function checkImport(name, specifier, maximumBytes) {
  const fixtureRoot = join(temporaryRoot, name)
  const outputDirectory = join(fixtureRoot, "dist")
  mkdirSync(fixtureRoot, { recursive: true })
  writeFileSync(join(fixtureRoot, "index.js"), `import { NThermalPrint } from ${JSON.stringify(specifier)}\nconsole.log(NThermalPrint)\n`)
  await build({
    root: fixtureRoot,
    logLevel: "silent",
    build: {
      outDir: outputDirectory,
      emptyOutDir: true,
      minify: true,
      rollupOptions: {
        input: join(fixtureRoot, "index.js"),
        external: (id) => id === "react" || id === "react/jsx-runtime" || id === "lucide-react" || id.startsWith("@chakra-ui/"),
      },
    },
  })
  const bundled = readJavaScript(outputDirectory)
  for (const marker of forbiddenMarkers) {
    if (bundled.includes(marker)) throw new Error(`${specifier} retained unrelated module content: ${marker}`)
  }
  if (Buffer.byteLength(bundled) > maximumBytes) {
    throw new Error(`${specifier} bundle exceeded ${maximumBytes} bytes`)
  }
}

try {
  mkdirSync(join(temporaryRoot, "node_modules"), { recursive: true })
  symlinkSync(projectRoot, packageLink, process.platform === "win32" ? "junction" : "dir")
  await checkImport("subpath", "nissi-ui/thermal-print", 18_000)
  await checkImport("root", "nissi-ui", 30_000)
  console.log("Tree shaking root/subpath imports OK")
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
