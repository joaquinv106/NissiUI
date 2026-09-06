import type { NTableColumn, NTableRow } from "./types"
import { formatTableValue } from "./utils"

/** Construye la matriz de encabezados + valores formateados, base de todas las exportaciones. */
function exportMatrix<T extends NTableRow>(rows: T[], columns: NTableColumn<T>[]) {
  return [
    columns.map((column) => column.header),
    ...rows.map((row) => columns.map((column) => formatTableValue(row[column.key], column))),
  ]
}

/** Copia la tabla al portapapeles como texto separado por tabulaciones (pegable en Excel/Sheets). */
export async function copyTable<T extends NTableRow>(
  rows: T[],
  columns: NTableColumn<T>[],
) {
  const text = exportMatrix(rows, columns)
    .map((row) => row.join("\t"))
    .join("\n")
  await navigator.clipboard.writeText(text)
}

/** Genera y descarga un archivo .xlsx; carga `write-excel-file` de forma diferida. */
export async function exportTableToExcel<T extends NTableRow>(
  rows: T[],
  columns: NTableColumn<T>[],
  fileName: string,
) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser")
  const matrix = exportMatrix(rows, columns).map((row, rowIndex) =>
    row.map((value) => ({ value, fontWeight: rowIndex === 0 ? ("bold" as const) : undefined })),
  )
  const file = writeXlsxFile(matrix)
  await file.toFile(`${fileName}.xlsx`)
}

/** Genera y descarga un PDF; carga `jspdf`/`jspdf-autotable` de forma diferida. */
export async function exportTableToPdf<T extends NTableRow>(
  rows: T[],
  columns: NTableColumn<T>[],
  fileName: string,
) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ])
  const document = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" })
  autoTable(document, {
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => formatTableValue(row[column.key], column))),
  })
  document.save(`${fileName}.pdf`)
}

/** Escapa caracteres especiales de HTML para el documento de impresión. */
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

/** Abre una ventana con una tabla HTML lista para imprimir y cierra tras enviarla a impresión. */
export function printTable<T extends NTableRow>(
  rows: T[],
  columns: NTableColumn<T>[],
  title: string,
) {
  const popup = window.open("", "_blank")
  if (!popup) return
  popup.opener = null
  const header = columns.map((column) => `<th>${escapeHtml(column.header)}</th>`).join("")
  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtml(formatTableValue(row[column.key], column))}</td>`)
          .join("")}</tr>`,
    )
    .join("")
  popup.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>body{font-family:system-ui;padding:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:8px;text-align:left}th{background:#eee}</style></head><body><h1>${escapeHtml(title)}</h1><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table><script>window.onload=()=>{window.print();window.close()}</script></body></html>`)
  popup.document.close()
}
