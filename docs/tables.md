# NTable y NDataTable

Los dos componentes reciben un objeto `config` con `headers` y `data`. El tipo de cada campo es opcional y, si no se indica, se interpreta como texto.

```tsx
import { NDataTable, type NTableConfig } from "nissi-ui"

type User = {
  id: number
  name: string
  email: string
  salary: number
  active: boolean
}

const config: NTableConfig<User> = {
  headers: [
    { key: "id", header: "ID", type: "number", editable: false },
    { key: "name", header: "Nombre", required: true },
    { key: "email", header: "Correo", type: "email" },
    { key: "salary", header: "Salario", type: "currency", currency: "MXN" },
    { key: "active", header: "Activo", type: "boolean" },
  ],
  data: [
    { id: 1, name: "Ana Torres", email: "ana@example.com", salary: 42000, active: true },
  ],
}

export function UsersTable() {
  return (
    <NDataTable
      config={config}
      title="Usuarios"
      getRowId={(row) => String(row.id)}
      onDataChange={(rows) => console.log(rows)}
      actions={[
        {
          id: "approve",
          label: "Aprobar",
          onClick: ({ headers, data, row, selectedRows }) => {
            console.log(headers, data, row, selectedRows)
          },
        },
      ]}
    />
  )
}
```

## Identidad de filas

Para tablas seleccionables se recomienda proporcionar siempre `getRowId`:

```tsx
<NDataTable config={config} getRowId={(row) => String(row.id)} />
```

Si no se proporciona, Nissi UI usa automáticamente un campo primitivo `id` o `key`. Sólo como último recurso usa el índice y muestra una advertencia en desarrollo, porque los índices no conservan la selección al filtrar u ordenar. La edición y el borrado usan estos identificadores estables y no dependen de igualdad referencial entre objetos.

## Tipos y presentaciones

`type` acepta `text`, `number`, `currency`, `boolean`, `date`, `datetime`, `email`, `url` y `select`. Para `select`, proporciona `options` con pares `{ label, value }`.

`presentation` acepta:

- `avatar`: el valor es la URL; `avatarNameKey` indica el campo usado como nombre y fallback.
- `badge`: muestra el valor como insignia; acepta `badgeColorPalette`.
- `icon`: busca el valor en el objeto `iconMap` pasado a la tabla.
- `text`: presentación normal.

También se puede proporcionar `format(value, row)` para renderizado completamente personalizado.

## NTable

Admite `size`, `variant`, `striped`, `subtitle`, `caption`, `captionSide`, `showColumnBorder`, `borderWidth`, `overflow`, `maxHeight`, `stickyHeader`, `stickyColumn`, `native`, `interactive`, `columnGroups`, `pagination`, `selectable`, `actions` y `useTanStack`.

`borderWidth` controla el contorno exterior de la tabla independientemente del Card. Acepta valores de Chakra/CSS como `"1px"`, `"2px"`, `0` o `"0"`; el color utiliza el token semántico `border` para responder al tema claro y oscuro.

Tanto `NTable` como `NDataTable` se muestran dentro de un `Card` de Chakra UI por defecto. Usa `card={false}` cuando necesites que la tabla se integre directamente en un contenedor existente.

Para móviles, `responsive="scroll"` conserva la tabla con desplazamiento horizontal y `responsive="stack"` transforma cada fila en una tarjeta debajo del breakpoint `md`.

## NDataTable

En pantallas angostas, los controles de la barra de herramientas se envuelven sin salir del Card. El ActionBar se monta en un portal sobre la capa máxima de la página y mantiene una fila compacta: en móvil muestra sólo los iconos de las acciones con nombre accesible y tooltip; desde `sm` también muestra sus etiquetas. Si una acción personalizada no proporciona `icon`, se usa un icono neutro de respaldo.

Activa por defecto TanStack Table, paginación, selección, barra de acciones, búsqueda, filtro por columna, selector de columnas visibles, reordenamiento y exportaciones a PDF, Excel, portapapeles e impresión. La barra de acciones usa `ActionBar` de Chakra UI: aparece flotante en la parte inferior cuando existe al menos una fila seleccionada y desaparece al limpiar la selección.

El botón para mostrar u ocultar columnas abre un menú de selección sin interferir con su tooltip. Al copiar la tabla se muestra una notificación de éxito o error. Ambos mensajes pueden traducirse mediante `labels.copiedToClipboard` y `labels.copyToClipboardError`.

Las acciones `Editar` y `Eliminar` también están activas por defecto. `Editar` sólo aparece cuando hay exactamente una fila seleccionada; al seleccionar varias filas se conserva `Eliminar`. El formulario de edición se genera de acuerdo con `type`; se pueden desactivar mediante `defaultActions={false}`. Usa `onEdit`, `onDelete` y `onDataChange` para sincronizar los cambios con una API o estado externo.

Las acciones personalizadas pueden usar `selectionRequirement: "single" | "multiple" | "any"` para controlar su visibilidad en el ActionBar. Si se omite, la acción aparece con cualquier cantidad positiva de filas seleccionadas.

## Reordenamiento de columnas y filas

`NDataTable` permite cambiar el orden de columnas por defecto. El usuario puede arrastrar el asa de cada cabecera o enfocarla y usar `Alt + Flecha izquierda/derecha`. El nuevo orden se refleja en la tabla, la vista móvil y las exportaciones.

```tsx
<NDataTable config={config} reorderableColumns={false} />
```

Usa `reorderableColumns={false}` para ocultar las asas y conservar el orden declarado en `config.headers`. El texto accesible del control puede traducirse con `labels.moveColumn`.

Las filas también pueden reordenarse de forma predeterminada. El usuario puede arrastrar el asa de una fila o usar `Alt + Flecha arriba/abajo`. El nuevo orden se entrega tanto a `onDataChange` como a `onRowOrderChange`, si se proporcionan. Al mover manualmente una fila se limpia el orden ascendente o descendente activo para conservar el orden elegido.

```tsx
<NDataTable
  config={config}
  reorderableRows={false}
  onRowOrderChange={(rows) => saveOrder(rows)}
/>
```

Usa `reorderableRows={false}` para conservar el orden original sin mostrar las asas. Para reordenar de forma segura, cada fila debe tener un `id`/`key` estable o la tabla debe recibir `getRowId`.

La confirmación de borrado puede interceptarse de forma asíncrona. Si existe `onBeforeDelete`, reemplaza la confirmación nativa; devolver `false` cancela la operación:

```tsx
<NDataTable
  config={config}
  onBeforeDelete={async (rows) => openCustomConfirmation(rows)}
/>
```

También puedes usar `confirmDelete={false}` para omitir la confirmación de respaldo del navegador.

Cada acción parametrizada recibe:

- `headers`: definición simplificada de las columnas serializada como JSON.
- `data`: primera fila seleccionada serializada como JSON.
- `row`: primera fila como objeto tipado.
- `rowId`: identificador estable de la primera fila.
- `selectedRowIds`: identificadores de todas las filas seleccionadas.
- `selectedRows`: todas las filas seleccionadas como objetos tipados.

## Textos e internacionalización

La propiedad `labels?: Partial<NTableLabels>` permite reemplazar cualquier texto. Los valores predeterminados están en español y se exportan como `defaultNTableLabels`:

```tsx
<NDataTable
  config={config}
  labels={{
    searchPlaceholder: "Search…",
    edit: "Edit",
    delete: "Delete",
    selectedCount: (count) => `${count} selected`,
  }}
/>
```

## Accesibilidad

- Los encabezados de columnas se renderizan como elementos `<th>` reales y exponen `aria-sort`. El botón de orden anuncia el estado actual y la siguiente acción.
- El diálogo enfoca inicialmente el primer campo editable. El botón de cierre está al final del orden DOM, aunque visualmente aparezca en la esquina superior.
- El modo `responsive="stack"` es una representación alternativa, no una tabla semántica. En móvil se anuncia como una lista de registros (`role="list"` y `role="listitem"`) y cada tarjeta usa pares `dt`/`dd`.
- Los botones que sólo contienen iconos tienen nombres accesibles configurables mediante `labels`.
- Los controles de exportación, visibilidad de columnas, selección, ordenamiento, paginación y cierre muestran tooltips mediante teclado o puntero. El contenido del tooltip reutiliza la misma entrada de `labels` que el nombre accesible del control, por lo que ambos cambian juntos al traducir la tabla.

## Arquitectura interna

`NTable` coordina estado y TanStack Table. La presentación se divide en componentes internos no exportados:

- `TableToolbar`: búsqueda, filtro, columnas y exportaciones.
- `TableDesktopView`: tabla HTML, grupos, orden y columnas pegajosas.
- `TableStackView`: representación móvil como lista de tarjetas.
- `TablePagination`: tamaño de página y navegación.
- `TableSelectionBar`: ActionBar flotante y acciones parametrizadas.
- `TableCellValue` y `TableCheckbox`: presentación de valores y selección.
- `NTooltip`: tooltip interno reutilizable para controles sin texto visible.

Las utilidades de Excel, PDF, copia e impresión permanecen en `exporters.ts`. `jspdf`, `jspdf-autotable` y `write-excel-file` sólo se importan dinámicamente cuando se ejecuta la exportación correspondiente; desactivar `exportOptions` no ejecuta ni carga esos módulos.

## Modo claro y oscuro

Todos los fondos, textos, bordes, estados seleccionados y celdas pegajosas utilizan tokens semánticos de Chakra UI, por lo que responden automáticamente a la clase de color configurada por la aplicación consumidora. El demo incluye `next-themes` y un botón para alternar entre modo claro y oscuro.
