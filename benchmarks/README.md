# Benchmarks de Nroutes

Los benchmarks miden regresiones internas de Nroutes; no intentan producir comparaciones comerciales con otros routers.

## Línea base

```bash
npm run build
npm run bench:nroutes
```

`nroutes-baseline.mjs` mide compilación y matching de 10, 100 y 1,000 rutas. Ejecuta primero calentamiento, después siete rondas y reporta la mediana. La ruta buscada ocupa la peor posición del conjunto actual.

Registra al compartir resultados:

- commit;
- versión de Node;
- sistema operativo y arquitectura;
- carga externa relevante;
- salida JSON completa.

Los escenarios de navegación sibling, navegación entre ramas, cache hit, lazy cold y lazy prefetched se añadirán cuando sus motores correspondientes existan. Hasta entonces no se publican cifras estimadas.
