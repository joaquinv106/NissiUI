import type {
  NThermalPrintConfiguration,
  NThermalPrintJob,
} from "./types"

const DEFAULT_FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"

function positiveNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback
}

function nonNegativeNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback
}

export function resolveNThermalPrintConfiguration(options: {
  paperWidthMm?: number
  contentWidthMm?: number
  marginMm?: number
  fontSizePt?: number
  fontFamily?: string
  printBackground?: boolean
  job?: NThermalPrintJob
}): NThermalPrintConfiguration {
  const paperWidthMm = positiveNumber(options.paperWidthMm, 80)
  const marginMm = Math.min(nonNegativeNumber(options.marginMm, 3), paperWidthMm / 2)
  const availableWidth = Math.max(1, paperWidthMm - marginMm * 2)
  const contentWidthMm = Math.min(positiveNumber(options.contentWidthMm, availableWidth), availableWidth)

  return {
    paperWidthMm,
    contentWidthMm,
    marginMm,
    fontSizePt: positiveNumber(options.fontSizePt, 9),
    fontFamily: options.fontFamily?.trim() || DEFAULT_FONT_FAMILY,
    printBackground: options.printBackground ?? false,
    job: {
      copies: Math.max(1, Math.floor(positiveNumber(options.job?.copies, 1))),
      cut: options.job?.cut ?? "none",
      openCashDrawer: options.job?.openCashDrawer ?? false,
    },
  }
}

function synchronizeFormValues(source: HTMLElement, clone: HTMLElement) {
  const sourceControls = source.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select")
  const cloneControls = clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select")

  sourceControls.forEach((control, index) => {
    const cloneControl = cloneControls[index]
    if (!cloneControl) return
    if (control instanceof HTMLInputElement) {
      const inputClone = cloneControl as HTMLInputElement
      inputClone.value = control.value
      inputClone.checked = control.checked
      return
    }
    cloneControl.value = control.value
  })
}

function synchronizeCanvases(source: HTMLElement, clone: HTMLElement) {
  const sourceCanvases = source.querySelectorAll("canvas")
  const cloneCanvases = clone.querySelectorAll("canvas")

  sourceCanvases.forEach((canvas, index) => {
    const cloneCanvas = cloneCanvases[index]
    if (!cloneCanvas) return
    try {
      const image = document.createElement("img")
      image.src = canvas.toDataURL()
      image.alt = canvas.getAttribute("aria-label") ?? ""
      image.width = canvas.width
      image.height = canvas.height
      cloneCanvas.replaceWith(image)
    } catch {
      // A canvas with cross-origin content cannot be serialized; keep its clone.
    }
  })
}

export function cloneThermalPrintContent(source: HTMLElement) {
  const clone = source.cloneNode(true) as HTMLElement
  synchronizeFormValues(source, clone)
  synchronizeCanvases(source, clone)
  return clone
}

export function createThermalPrintStyles(configuration: NThermalPrintConfiguration) {
  const { paperWidthMm, contentWidthMm, marginMm, printBackground } = configuration
  return `
@media screen {
  [data-nissi-thermal-print-host] { display: none !important; }
}
@media print {
  @page { size: ${paperWidthMm}mm auto; margin: ${marginMm}mm; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body[data-nissi-thermal-printing] > *:not([data-nissi-thermal-print-host]) { display: none !important; }
  body[data-nissi-thermal-printing] > [data-nissi-thermal-print-host] {
    display: block !important;
    box-sizing: border-box !important;
    width: ${contentWidthMm}mm !important;
    max-width: ${contentWidthMm}mm !important;
    margin: 0 auto !important;
    color: #000 !important;
    background: #fff !important;
    ${printBackground ? "print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important;" : ""}
  }
  [data-nissi-print-hidden] { display: none !important; }
}
`
}
