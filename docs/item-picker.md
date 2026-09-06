# NItemPicker

`NItemPicker<T>` presenta una colección como opciones visibles, buscables y seleccionables. No conoce productos ni reglas comerciales: los adaptadores del consumidor permiten usarlo con servicios, personas, activos, archivos, habitaciones o cualquier otra entidad.

## Uso básico

```tsx
import { NItemPicker } from "nissi-ui"

<NItemPicker
  items={products}
  getItemId={(product) => product.sku}
  getItemLabel={(product) => product.name}
  getItemDescription={(product) => formatCurrency(product.price)}
  getSearchText={(product) => `${product.sku} ${product.barcode}`}
  onItemSelect={(product) => addProduct(product)}
/>
```

La búsqueda local ignora mayúsculas y acentos. `getSearchText` incorpora códigos, SKU, correo, alias u otros datos que no necesitan mostrarse visualmente.

## Selección

`selectionMode` admite:

- `"single"` (predeterminado): conserva un solo elemento activo.
- `"multiple"`: agrega o retira elementos independientes.
- `"none"`: cada activación ejecuta `onItemSelect` sin mantener selección; es útil para agregar repetidamente elementos a otra estructura.

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([])

<NItemPicker
  items={employees}
  getItemId={(employee) => employee.id}
  getItemLabel={(employee) => employee.name}
  selectionMode="multiple"
  selectedIds={selectedIds}
  onSelectionChange={(_, ids) => setSelectedIds([...ids])}
/>
```

`defaultSelectedIds` habilita el modo no controlado. `onSelectionChange` entrega simultáneamente los objetos resueltos y sus identificadores estables.

## Presentación y composición

```tsx
<NItemPicker
  items={services}
  getItemId={(service) => service.id}
  getItemLabel={(service) => service.name}
  getItemDescription={(service) => service.description}
  groupBy={(service) => service.category}
  layout="grid"
  columns={{ base: 1, md: 2, xl: 4 }}
  renderLeading={(service) => <ServiceIcon type={service.type} />}
  renderTrailing={(service) => <Price value={service.price} />}
/>
```

`renderItem` sustituye por completo el contenido de una opción y recibe `{ id, index, selected, disabled }`. `header`, `footer` y `emptyState` permiten componer la experiencia sin duplicar el selector.

## Búsqueda remota

Para consultar un backend, controla `searchValue`, actualiza `items` desde el resultado remoto y usa `shouldFilter={false}` para evitar un segundo filtrado local:

```tsx
<NItemPicker
  items={remoteResults}
  getItemId={(item) => item.id}
  getItemLabel={(item) => item.name}
  searchValue={query}
  onSearchValueChange={setQuery}
  shouldFilter={false}
  loading={isLoading}
/>
```

## API principal

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `items` | `readonly TItem[]` | — | Colección visible. |
| `getItemId` | `(item, index) => string` | — | Identidad estable obligatoria. |
| `getItemLabel` | `(item) => string` | — | Nombre visible y accesible. |
| `getItemDescription` | `(item) => string \| undefined` | — | Texto secundario. |
| `getSearchText` | `(item) => string` | — | Valores adicionales indexables. |
| `groupBy` | `(item) => string \| undefined` | — | Agrupación preservando el orden de entrada. |
| `selectionMode` | `"none" \| "single" \| "multiple"` | `"single"` | Modelo de interacción. |
| `selectedIds` / `defaultSelectedIds` | `readonly string[]` | `[]` | Estado controlado/no controlado. |
| `onSelectionChange` | `(items, ids) => void` | — | Notificación de la selección resultante. |
| `onItemSelect` | `(item) => void` | — | Activación directa de una opción. |
| `searchable` | `boolean` | `true` | Muestra el buscador. |
| `searchValue` / `defaultSearchValue` | `string` | `""` | Búsqueda controlada/no controlada. |
| `filterItem` | `(item, query) => boolean` | — | Filtro local personalizado. |
| `shouldFilter` | `boolean` | `true` | Se desactiva para resultados remotos. |
| `layout` | `"grid" \| "list"` | `"grid"` | Distribución visual. |
| `columns` | número o mapa responsive | `{ base: 1, sm: 2, lg: 3 }` | Columnas del grid. |
| `loading` | `boolean` | `false` | Estado de carga accesible. |
| `isItemDisabled` | `(item) => boolean` | — | Deshabilita opciones individuales. |
| `renderItem` / `renderLeading` / `renderTrailing` | render callbacks | — | Personalización visual. |
| `labels` | `Partial<NItemPickerLabels>` | Español | i18n y nombres accesibles. |

## Accesibilidad

- Cada opción es un botón nativo; Enter y Espacio funcionan sin emulación.
- `aria-pressed` comunica la selección simple o múltiple. El modo `none` evita anunciar un estado inexistente.
- Flechas, Home y End desplazan el foco entre opciones habilitadas; Tab conserva el recorrido nativo.
- Los contadores de resultados y selección se anuncian con regiones `aria-live`.
- El foco se dibuja con `colorPalette.focusRing` y todos los estados usan tokens semánticos.
- Las etiquetas, estados vacío/carga y acciones del buscador pertenecen a `NItemPickerLabels`.
