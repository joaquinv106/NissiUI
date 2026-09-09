import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"

import { NActivityTimeline, NAdjustmentEditor, NAmountAllocator, NAmountInput, NAppShell, NApprovalFlow, NAsyncState, NAuditLog, NBalanceSession, NBreadcrumbs, NCart, NChartFrame, NCheckout, NCodeCapture, NConfirmDialog, NCtrl, NCtrlProvider, NDashboardGrid, NDataTable, NDateRangePicker, NDescriptionList, NDetailPanel, NDocumentView, NEmptyState, NFacture, NFileUpload, NFilterBar, NImpersonationBanner, NItemPicker, NKanban, NLineItemEditor, NLink, NMapView, NModuleRegistry, NNotificationCenter, NOfflineBoundary, NOutlet, NPageHeader, NPanel, NPermissionsProvider, NPlanComparison, NReceipt, NRouteOutlet, NScheduler, NStatCard, NStepFlow, NSubscriptionGate, NSyncStatus, NTable, NTheme, NThemeProvider, NThermalPrint, NWorkspaceSwitcher, NauthLayout, NauthLogin, Nlayout, NloginPage, NissiInvoicingProvider, Nroutes, createNFactureHeaderNavigation, createNFactureNavigation, defineNlayoutConfig, defineNroutes, formatTableValue, nissiSystem, redirect, useNLocation, useNNavigate, useNTheme, useNroutes } from "./index"

describe("API pública de tablas", () => {
  it("exporta NTable y NDataTable", () => {
    expect(NTable).toBeTypeOf("function")
    expect(NDataTable).toBeTypeOf("function")
  })

  it("exporta la capa pública de plataforma", () => {
    expect(NAppShell).toBeTypeOf("function")
    expect(NModuleRegistry).toBeTypeOf("function")
    expect(NWorkspaceSwitcher).toBeTypeOf("function")
  })

  it("exporta el selector genérico de elementos", () => {
    expect(NItemPicker).toBeTypeOf("function")
  })

  it("exporta el editor genérico de partidas", () => {
    expect(NLineItemEditor).toBeTypeOf("function")
  })

  it("exporta las primitivas de valores y distribución", () => {
    expect(NAmountInput).toBeTypeOf("function")
    expect(NAmountAllocator).toBeTypeOf("function")
  })

  it("exporta los patrones de pasos y aprobaciones", () => {
    expect(NStepFlow).toBeTypeOf("function")
    expect(NApprovalFlow).toBeTypeOf("function")
  })

  it("exporta los patrones de operación y documentos", () => {
    expect(NBalanceSession).toBeTypeOf("function")
    expect(NAdjustmentEditor).toBeTypeOf("function")
    expect(NDocumentView).toBeTypeOf("function")
  })

  it("exporta las primitivas de captura y resiliencia", () => {
    expect(NCodeCapture).toBeTypeOf("function")
    expect(NSyncStatus).toBeTypeOf("function")
    expect(NOfflineBoundary).toBeTypeOf("function")
  })

  it("exporta los presets POS de composición", () => {
    expect(NCart).toBeTypeOf("function")
    expect(NCheckout).toBeTypeOf("function")
    expect(NReceipt).toBeTypeOf("function")
    expect(NThermalPrint).toBeTypeOf("object")
  })

  it("exporta el panel lateral reactivo", () => {
    expect(NPanel).toBeTypeOf("function")
    expect(NCtrl).toBeTypeOf("function")
    expect(NCtrlProvider).toBeTypeOf("function")
  })

  it("exporta la fase final consolidada", () => {
    ;[NPageHeader, NBreadcrumbs, NAsyncState, NEmptyState, NConfirmDialog, NFilterBar, NDateRangePicker, NDetailPanel, NDescriptionList, NFileUpload, NActivityTimeline, NNotificationCenter, NStatCard, NDashboardGrid, NChartFrame, NSubscriptionGate, NPlanComparison, NAuditLog, NImpersonationBanner, NKanban, NScheduler, NMapView].forEach((component) => expect(component).toBeTypeOf("function"))
  })

  it("exporta la capa pública de temas", () => {
    expect(NTheme).toBeTypeOf("function")
    expect(NThemeProvider).toBeTypeOf("function")
    expect(useNTheme).toBeTypeOf("function")
    expect(nissiSystem).toBeTruthy()
  })

  it("exporta el layout integrado y el administrador SPA", () => {
    expect(Nlayout).toBeTypeOf("function")
    expect(Nroutes).toBeTypeOf("function")
    expect(NRouteOutlet).toBeTypeOf("function")
    expect(NOutlet).toBeTypeOf("function")
    expect(NLink).toBeTypeOf("object")
    expect(useNroutes).toBeTypeOf("function")
    expect(useNNavigate).toBeTypeOf("function")
    expect(useNLocation).toBeTypeOf("function")
    expect(redirect).toBeTypeOf("function")
    expect(defineNroutes).toBeTypeOf("function")
    expect(defineNlayoutConfig).toBeTypeOf("function")
  })

  it("exporta la pantalla de acceso y el namespace Nauth", () => {
    expect(NloginPage).toBeTypeOf("function")
    expect(NauthLayout).toBeTypeOf("function")
    expect(NauthLogin).toBeTypeOf("function")
  })

  it("exporta el proyecto de facturación y su integración standalone", () => {
    expect(NFacture).toBeTypeOf("function")
    expect(NissiInvoicingProvider).toBeTypeOf("function")
    expect(createNFactureNavigation).toBeTypeOf("function")
    expect(createNFactureHeaderNavigation).toBeTypeOf("function")
  })

  it("genera una tabla desde la configuración JSON", () => {
    const view = render(
      <ChakraProvider value={defaultSystem}>
        <NTable
          borderWidth="2px"
          config={{
            headers: [
              { key: "name", header: "Nombre" },
              { key: "total", header: "Total", type: "currency" },
            ],
            data: [{ name: "Registro de prueba", total: 1250 }],
          }}
        />
      </ChakraProvider>,
    )

    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(screen.getByRole("table").parentElement).toHaveStyle({ borderWidth: "2px" })
    expect(view.container.querySelector(".chakra-card__root")).toBeInTheDocument()
    expect(screen.getByText("Registro de prueba")).toBeInTheDocument()
    expect(screen.getByText("$1,250.00")).toBeInTheDocument()
    expect(screen.queryByLabelText("Copiar tabla")).not.toBeInTheDocument()
  })

  it("permite renderizar NTable sin Card", () => {
    const view = render(
      <ChakraProvider value={defaultSystem}>
        <NTable
          card={false}
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ name: "Ana" }] }}
        />
      </ChakraProvider>,
    )

    expect(view.container.querySelector(".chakra-card__root")).not.toBeInTheDocument()
    expect(screen.getByRole("table")).toBeInTheDocument()
  })

  it("activa la barra de acciones al seleccionar una fila", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{
            headers: [{ key: "name", header: "Nombre" }],
            data: [{ id: "ana", name: "Ana" }, { id: "bruno", name: "Bruno" }],
          }}
          exportOptions={false}
        />
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByLabelText("Seleccionar fila 1"))
    expect(await screen.findByRole("toolbar", { name: "Acciones para filas seleccionadas" })).toBeInTheDocument()
    const editAction = screen.getByRole("button", { name: /Editar/ })
    expect(editAction).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Eliminar/ })).toBeInTheDocument()
    fireEvent.pointerMove(editAction, { pointerType: "mouse" })
    expect(await screen.findByRole("tooltip", { name: "Editar" })).toBeInTheDocument()
  })

  it("oculta Editar cuando hay más de una fila seleccionada", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{
            headers: [{ key: "name", header: "Nombre" }],
            data: [{ id: "ana", name: "Ana" }, { id: "bruno", name: "Bruno" }],
          }}
          exportOptions={false}
        />
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByLabelText("Seleccionar filas visibles"))
    const actionBar = await screen.findByRole("toolbar", { name: "Acciones para filas seleccionadas" })
    expect(actionBar).toHaveTextContent("2 seleccionados")
    expect(screen.queryByRole("button", { name: /Editar/ })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Eliminar/ })).toBeInTheDocument()
  })

  it("oculta acciones de tabla sin la capacidad requerida", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NPermissionsProvider permissions={["core:*"]}>
          <NTable
            selectable
            config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
            actions={[
              { id: "export", label: "Exportar", requiredPermission: "reportes:exportar", onClick: vi.fn() },
              { id: "view", label: "Ver detalle", onClick: vi.fn() },
            ]}
          />
        </NPermissionsProvider>
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByLabelText("Seleccionar fila 1"))
    expect(await screen.findByRole("button", { name: "Ver detalle" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Exportar" })).not.toBeInTheDocument()
  })

  it("reordena columnas arrastrando desde el control activado por defecto", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{
            headers: [{ key: "name", header: "Nombre" }, { key: "email", header: "Correo" }],
            data: [{ id: "1", name: "Ana", email: "ana@example.com" }],
          }}
          exportOptions={false}
        />
      </ChakraProvider>,
    )

    let transferredColumn = ""
    const dataTransfer = {
      effectAllowed: "none",
      dropEffect: "none",
      setData: vi.fn((_type: string, value: string) => { transferredColumn = value }),
      getData: vi.fn(() => transferredColumn),
    }
    const moveName = screen.getByRole("button", { name: /Mover columna Nombre/ })
    const emailHeader = screen.getByRole("button", { name: "Ordenar Correo de forma ascendente." }).closest("th")
    expect(emailHeader).not.toBeNull()

    fireEvent.dragStart(moveName, { dataTransfer })
    fireEvent.dragOver(emailHeader!, { dataTransfer })
    fireEvent.drop(emailHeader!, { dataTransfer })

    await waitFor(() => {
      const headers = screen.getAllByRole("columnheader").map((header) => header.textContent)
      expect(headers.slice(-2)).toEqual(["Correo", "Nombre"])
    })

    fireEvent.keyDown(screen.getByRole("button", { name: /Mover columna Nombre/ }), {
      altKey: true,
      key: "ArrowLeft",
    })
    await waitFor(() => {
      const headers = screen.getAllByRole("columnheader").map((header) => header.textContent)
      expect(headers.slice(-2)).toEqual(["Nombre", "Correo"])
    })
  })

  it("permite desactivar el reordenamiento de columnas", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          reorderableColumns={false}
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
          exportOptions={false}
        />
      </ChakraProvider>,
    )

    expect(screen.queryByRole("button", { name: /Mover columna Nombre/ })).not.toBeInTheDocument()
  })

  it("reordena filas arrastrando y notifica el nuevo orden", async () => {
    const onDataChange = vi.fn()
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{
            headers: [{ key: "name", header: "Nombre" }],
            data: [
              { id: "ana", name: "Ana" },
              { id: "bruno", name: "Bruno" },
              { id: "carla", name: "Carla" },
            ],
          }}
          exportOptions={false}
          onDataChange={onDataChange}
        />
      </ChakraProvider>,
    )

    let transferredRow = ""
    const dataTransfer = {
      effectAllowed: "none",
      dropEffect: "none",
      setData: vi.fn((_type: string, value: string) => { transferredRow = value }),
      getData: vi.fn(() => transferredRow),
    }
    const anaRow = screen.getByText("Ana").closest("tr")
    const brunoRow = screen.getByText("Bruno").closest("tr")
    expect(anaRow).not.toBeNull()
    expect(brunoRow).not.toBeNull()

    fireEvent.dragStart(within(anaRow!).getByRole("button", { name: /Mover fila 1/ }), { dataTransfer })
    fireEvent.dragOver(brunoRow!, { dataTransfer })
    fireEvent.drop(brunoRow!, { dataTransfer })

    await waitFor(() => {
      const dataRows = screen.getAllByRole("row").slice(1).map((row) => row.textContent)
      expect(dataRows).toEqual(["Bruno", "Ana", "Carla"])
    })
    expect(onDataChange).toHaveBeenLastCalledWith([
      { id: "bruno", name: "Bruno" },
      { id: "ana", name: "Ana" },
      { id: "carla", name: "Carla" },
    ])

    const movedAnaRow = screen.getByText("Ana").closest("tr")
    fireEvent.keyDown(within(movedAnaRow!).getByRole("button", { name: /Mover fila 2/ }), {
      altKey: true,
      key: "ArrowUp",
    })
    await waitFor(() => {
      const dataRows = screen.getAllByRole("row").slice(1).map((row) => row.textContent)
      expect(dataRows).toEqual(["Ana", "Bruno", "Carla"])
    })
  })

  it("permite desactivar el reordenamiento de filas", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          reorderableRows={false}
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
          exportOptions={false}
        />
      </ChakraProvider>,
    )

    expect(screen.queryByRole("button", { name: /Mover fila/ })).not.toBeInTheDocument()
  })

  it("mantiene identidad estable al editar aunque el padre regenere los objetos", async () => {
    function RegeneratedDataExample() {
      const [rows, setRows] = useState([{ id: "user-1", name: "Ana" }])
      return (
        <NDataTable
          config={{
            headers: [{ key: "name", header: "Nombre" }],
            data: rows.map((row) => ({ ...row })),
          }}
          getRowId={(row) => String(row.id)}
          exportOptions={false}
          onDataChange={setRows}
        />
      )
    }

    render(<ChakraProvider value={defaultSystem}><RegeneratedDataExample /></ChakraProvider>)
    fireEvent.click(screen.getByLabelText("Seleccionar fila 1"))
    fireEvent.click(await screen.findByRole("button", { name: /Editar/ }))
    const input = await screen.findByDisplayValue("Ana")
    await waitFor(() => expect(input).toHaveFocus())
    fireEvent.change(input, { target: { value: "Ana actualizada" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }))
    expect(await screen.findByText("Ana actualizada")).toBeInTheDocument()
  })

  it("permite interceptar y cancelar el borrado sin window.confirm", async () => {
    const onBeforeDelete = vi.fn(async () => false)
    const nativeConfirm = vi.spyOn(window, "confirm")
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
          exportOptions={false}
          onBeforeDelete={onBeforeDelete}
        />
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByLabelText("Seleccionar fila 1"))
    fireEvent.click(await screen.findByRole("button", { name: /Eliminar/ }))
    await waitFor(() => expect(onBeforeDelete).toHaveBeenCalled())
    expect(nativeConfirm).not.toHaveBeenCalled()
    expect(screen.getByText("Ana")).toBeInTheDocument()
    nativeConfirm.mockRestore()
  })

  it("expone el orden en el th y personaliza etiquetas", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NTable
          useTanStack
          searchable
          labels={{ searchPlaceholder: "Search records" }}
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
        />
      </ChakraProvider>,
    )

    expect(screen.getByPlaceholderText("Search records")).toBeInTheDocument()
    const sortButton = screen.getByRole("button", { name: "Ordenar Nombre de forma ascendente." })
    const columnHeader = sortButton.closest("th")
    expect(columnHeader?.tagName).toBe("TH")
    expect(columnHeader).toHaveAttribute("aria-sort", "none")
    fireEvent.click(sortButton)
    expect(columnHeader).toHaveAttribute("aria-sort", "ascending")
  })

  it("representa el modo stack como lista de registros", () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NTable
          responsive="stack"
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
        />
      </ChakraProvider>,
    )

    expect(screen.getByRole("list", { name: "Registros de la tabla" })).toBeInTheDocument()
    expect(screen.getByRole("listitem")).toBeInTheDocument()
  })

  it("liga los tooltips de iconos a las etiquetas configurables", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
          exportOptions={{ copy: false, pdf: false, print: false }}
          labels={{ downloadExcel: "Export spreadsheet" }}
        />
      </ChakraProvider>,
    )

    const exportButton = screen.getByRole("button", { name: "Export spreadsheet" })
    fireEvent.pointerMove(exportButton, { pointerType: "mouse" })
    expect(await screen.findByRole("tooltip", { name: "Export spreadsheet" })).toBeInTheDocument()
  })

  it("abre el selector de columnas y permite ocultarlas", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
          exportOptions={false}
        />
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Mostrar u ocultar columnas" }))
    const columnOption = await screen.findByRole("menuitemcheckbox", { name: "Nombre" })
    expect(columnOption).toHaveAttribute("aria-checked", "true")
    fireEvent.click(columnOption)
    await waitFor(() => expect(screen.queryByText("Ana")).not.toBeInTheDocument())
  })

  it("filtra por columna desde la barra de herramientas", async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{
            headers: [{ key: "name", header: "Nombre" }],
            data: [{ id: "1", name: "Ana" }, { id: "2", name: "Bruno" }],
          }}
          exportOptions={false}
        />
      </ChakraProvider>,
    )

    fireEvent.change(screen.getByLabelText("Columna para filtrar"), { target: { value: "name" } })
    fireEvent.change(screen.getByLabelText("Valor del filtro"), { target: { value: "Bruno" } })
    await waitFor(() => expect(screen.queryByText("Ana")).not.toBeInTheDocument())
    expect(screen.getByText("Bruno")).toBeInTheDocument()
  })

  it("confirma el copiado con un mensaje traducible", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
    render(
      <ChakraProvider value={defaultSystem}>
        <NDataTable
          config={{ headers: [{ key: "name", header: "Nombre" }], data: [{ id: "1", name: "Ana" }] }}
          exportOptions={{ excel: false, pdf: false, print: false }}
          labels={{ copiedToClipboard: "Copied to clipboard" }}
        />
      </ChakraProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Copiar tabla" }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Nombre\nAna"))
    expect(await screen.findByText("Copied to clipboard")).toBeInTheDocument()
  })

  it("formatea tipos de datos", () => {
    expect(formatTableValue(true, { key: "active", header: "Activo", type: "boolean" })).toBe("Sí")
    expect(formatTableValue(null, { key: "empty", header: "Vacío" })).toBe("—")
  })
})
