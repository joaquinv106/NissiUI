import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"

const projectRoot = resolve(import.meta.dirname, "..")
const clientModules = [
  "components/panel/NPanel",
  "components/document-view/NDocumentView",
  "components/receipt/NReceipt",
  "components/thermal-print/NThermalPrint",
  "components/theme/NThemeProvider",
]

for (const modulePath of clientModules) {
  for (const extension of ["js", "cjs"]) {
    const output = readFileSync(resolve(projectRoot, "dist", `${modulePath}.${extension}`), "utf8")
    if (!/^\s*["']use client["'];?/.test(output)) {
      throw new Error(`Missing use client directive in dist/${modulePath}.${extension}`)
    }
  }
}

const { NDocumentView, NThermalPrint } = await import(pathToFileURL(resolve(projectRoot, "dist/index.js")).href)
const document = { id: "ssr-1", title: "Documento SSR" }
const markup = renderToString(createElement(
  ChakraProvider,
  { value: defaultSystem },
  createElement(
    NThermalPrint,
    { showTrigger: false },
    createElement(NDocumentView, {
      document,
      getDocumentId: (value) => value.id,
      getDocumentTitle: (value) => value.title,
    }),
  ),
))

if (!markup.includes("Documento SSR")) throw new Error("SSR markup did not include the document content")
console.log("SSR import/render and client directives OK")
