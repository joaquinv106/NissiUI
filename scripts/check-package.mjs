import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const temporaryRoot = mkdtempSync(join(tmpdir(), "nissi-ui-consumer-"))
const packageLink = join(temporaryRoot, "node_modules", "nissi-ui")

const publicNames = ["NThemeProvider", "NAmountInput", "NCheckout", "NPanel"]

try {
  mkdirSync(dirname(packageLink), { recursive: true })
  symlinkSync(projectRoot, packageLink, process.platform === "win32" ? "junction" : "dir")

  writeFileSync(join(temporaryRoot, "package.json"), '{"type":"module"}\n')
  writeFileSync(
    join(temporaryRoot, "smoke.ts"),
    `import { ${publicNames.join(", ")}, type NAmountInputProps } from "nissi-ui"\n` +
      "const props: NAmountInputProps = { value: 1250.5, onValueChange: () => undefined }\n" +
      `void [${publicNames.join(", ")}, props]\n`,
  )
  writeFileSync(
    join(temporaryRoot, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        module: "NodeNext",
        moduleResolution: "NodeNext",
        target: "ES2022",
        skipLibCheck: true,
      },
      include: ["smoke.ts"],
    }),
  )
  writeFileSync(
    join(temporaryRoot, "tsconfig.bundler.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        module: "ESNext",
        moduleResolution: "Bundler",
        target: "ES2022",
        skipLibCheck: true,
      },
      include: ["smoke.ts"],
    }),
  )
  writeFileSync(
    join(temporaryRoot, "smoke.mjs"),
    `import { ${publicNames.join(", ")} } from "nissi-ui"\nconsole.log("ESM OK")\n`,
  )
  writeFileSync(
    join(temporaryRoot, "smoke.cjs"),
    `const { ${publicNames.join(", ")} } = require("nissi-ui")\nconsole.log("CommonJS OK")\n`,
  )

  const run = (executable, args) => execFileSync(executable, args, { cwd: temporaryRoot, stdio: "inherit" })
  run(process.execPath, [join(projectRoot, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.json"])
  run(process.execPath, [join(projectRoot, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.bundler.json"])
  run(process.execPath, ["smoke.mjs"])
  run(process.execPath, ["smoke.cjs"])
  console.log("TypeScript NodeNext/Bundler OK")
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
