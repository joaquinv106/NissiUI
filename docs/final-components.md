# Fase final consolidada

Las seis fases finales se completaron como una sola entrega. Los componentes son neutrales respecto del sector, router, backend, proveedor cartográfico y motor de gráficas. Todos se exportan desde `nissi-ui`.

## Estados y navegación

- `NPageHeader`: título, subtítulo, ruta, regreso, metadatos y acciones responsive.
- `NBreadcrumbs`: navegación semántica con colapso de niveles intermedios.
- `NAsyncState`: estados `idle`, `loading`, `error`, `empty` y `success` con reintento.
- `NEmptyState`: vacío accionable con slots de icono y acciones.
- `NConfirmDialog`: confirmación controlada/no controlada, síncrona o asíncrona, con bloqueo de duplicados.

```tsx
<NConfirmDialog destructive trigger={<Button>Eliminar</Button>} onConfirm={remove}>
  Esta acción no se puede deshacer.
</NConfirmDialog>
```

## Datos server-side

`NDataTable` admite `server={{ rowCount, query, onQueryChange, loading }}`. `query` incluye `pageIndex`, `pageSize`, `sorting`, `search`, `filterColumn` y `filterValue`; la aplicación conserva la responsabilidad de consultar, cancelar respuestas obsoletas y entregar la página actual en `config.data`.

```tsx
<NDataTable
  server={{ rowCount: result.total, query, onQueryChange: setQuery, loading }}
  config={{ headers, data: result.rows }}
/>
```

- `NFilterBar`: composición de campos, acciones y chips removibles.
- `NDateRangePicker`: rango controlado/no controlado con límites y validación cruzada.
- `NDescriptionList`: lista semántica `dl/dt/dd`, columnas y divisores.
- `NDetailPanel`: detalle sobre `NPanel`, con resumen, atributos y contenido libre.

## Actividad y archivos

- `NFileUpload`: selector y drop zone, tamaño/cantidad máximos, rechazo y remoción. La aplicación realiza la transferencia real y el análisis de seguridad.
- `NActivityTimeline`: secuencia cronológica genérica y semántica.
- `NNotificationCenter`: contador, listado y callbacks controlados para lectura/selección.

## Dashboards

- `NStatCard`: KPI, tendencia, ayuda, acción y skeleton.
- `NDashboardGrid`/`NDashboardGridItem`: rejilla mobile-first con spans de escritorio.
- `NChartFrame`: gráfica de barras base, tabla accesible invisible y `renderer` para Recharts, ECharts, Chart.js u otro motor. Ninguno se convierte en dependencia obligatoria.

```tsx
<NChartFrame title="Ingresos" data={data} renderer={({ data, series }) => <MyChart data={data} series={series} />} />
```

## Administración SaaS

- `NSubscriptionGate`: presentación de entitlement y upgrade; nunca sustituye validación en servidor.
- `NPlanComparison`: matriz de características y valores componibles.
- `NAuditLog`: eventos, actor, destino, fecha, metadatos y severidad.
- `NImpersonationBanner`: contexto visible y salida asíncrona sin duplicados.

Las APIs deben revalidar identidad, tenant, permiso y suscripción en cada operación. La suplantación debe auditar inicio, fin, actor y alcance en el backend.

## Patrones verticales

- `NKanban`: columnas/tarjetas, DnD y controles accesibles alternativos.
- `NScheduler`: agenda por días con eventos seleccionables.
- `NMapView`: superficie con listado accesible y adaptador `renderer` para cualquier proveedor.

```tsx
<NMapView markers={locations} renderer={({ markers, selectedId, onSelect }) => <ProviderMap markers={markers} selectedId={selectedId} onSelect={onSelect} />} />
```

## Accesibilidad y responsive

Los overlays conservan foco y cierre por teclado mediante Chakra UI; inputs y acciones tienen nombres accesibles; timeline, listas, auditoría y tabla mantienen semántica HTML. Kanban no depende exclusivamente de arrastrar. En móvil, rejillas y agenda se apilan; comparación, tablero y datos anchos conservan desplazamiento controlado.

Los ejemplos interactivos de todos los componentes viven en las seis vistas “Final” del catálogo local.
