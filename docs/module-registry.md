# NModuleRegistry

`NModuleRegistry` representa el catálogo de microsistemas contratados por un cliente. Soporta estado activo controlado/no controlado, permisos, módulos no contratados y presentación responsive.

```tsx
<NPermissionsProvider permissions={session.capabilities}>
  <NModuleRegistry
    modules={modules}
    activeModuleId={activeModuleId}
    onModuleSelect={(module) => navigate(module.data.route)}
    showUnavailable
  />
</NPermissionsProvider>
```

Cada `NModuleDefinition` admite `id`, `label`, `description`, `icon`, `badge`, `purchased`, `disabled`, `requiredPermission`, `permissionMode` y `data`. Los layouts son `grid`, `list` y `compact`; este último conserva nombre accesible y tooltip para cada icono.

Los módulos sin permiso se ocultan siempre para no revelar capacidades sensibles. `showUnavailable` sólo muestra los no contratados como deshabilitados. Sin `NPermissionsProvider`, la librería conserva su comportamiento compatible y permite todos los módulos.

> Esta protección es exclusivamente de presentación. Cada API debe revalidar usuario, tenant, permiso y suscripción en el backend.
