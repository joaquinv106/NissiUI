# Ejemplo POS integrado

El catálogo incluye una venta funcional que demuestra cómo componer las siete fases sin crear un componente monolítico:

1. `NCodeCapture` agrega artículos por código.
2. `NCart` selecciona, fusiona y edita partidas mientras un cálculo externo aporta IVA y total.
3. `NCheckout` distribuye el total y confirma la operación.
4. `NReceipt` presenta el comprobante resultante.
5. `NOfflineBoundary` y `NSyncStatus` comunican conectividad y una cola demostrativa.

La pantalla vive en `src/dev/Phase7Views.tsx` y no forma parte del paquete publicado. Sirve como referencia verificable de interoperabilidad, no como arquitectura de datos lista para producción.

## Integración real necesaria

Una aplicación POS debe conectar estos componentes a almacenamiento local transaccional, una cola durable, claves de idempotencia, resolución de conflictos y una API que revalide precios, impuestos, inventario, permisos y estado de caja. La demo mantiene los datos sólo en memoria y lo comunica explícitamente para no prometer persistencia offline inexistente.
