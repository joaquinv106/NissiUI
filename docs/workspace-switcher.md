# NWorkspaceSwitcher

`NWorkspaceSwitcher` cambia el contexto activo de organización, tenant, sucursal, proyecto o entorno.

```tsx
<NWorkspaceSwitcher
  workspaces={workspaces}
  value={workspaceId}
  onValueChange={(workspace) => setWorkspaceId(workspace.id)}
/>
```

Funciona controlado (`value`) o no controlado (`defaultValue`), comunica el objeto completo seleccionado y omite workspaces deshabilitados como selección inicial. `compact` reduce el disparador para headers y viewports estrechos. El menú se monta en portal, limita su ancho al viewport y conserva navegación de teclado de Chakra UI.

El cambio de workspace debe invalidar o segmentar consultas en la aplicación consumidora. El backend debe comprobar que el usuario pertenece al tenant solicitado; el valor visual nunca es una autorización.
