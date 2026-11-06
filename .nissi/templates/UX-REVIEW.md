# Revisión UX/UI — [pantalla y ruta]

Estado: INSUFFICIENT hasta completar los criterios y evidencias.
Autor / ejecutor / revisor independiente real (o no disponible):
Fecha / rama / commit y cambios locales:
Persona usuaria / nivel de experiencia / tarea principal:
Alcance autorizado / aprobación de cambios significativos:

## Diagnóstico y problemas

| Hallazgo | Evidencia del estado actual | Impacto en la tarea | Gravedad | Criterio de aceptación |
| --- | --- | --- | --- | --- |
| [Completar] | [Ruta/captura/escenario] | [Completar] | [Crítica/alta/media/baja] | [Verificable] |

## Redistribución propuesta

Jerarquía y agrupación, acción principal/secundarias, navegación, textos, diferencias móvil/tablet/PC, justificación y opciones descartadas.

## Interacciones y accesibilidad

Carga, vacío, deshabilitado, validación, éxito, error, confirmación, red lenta/fallida, teclado, foco, etiquetas, mensajes de estado, contraste, zoom y tamaño táctil. Indicar qué se verificó y qué falta.

## Checklist de operación y navegación

Para cada fila indicar PASS / FAIL / NOT RUN / N/A, evidencia y motivo de no aplicabilidad. No aprobar por apariencia ni por compilación.

| Comprobación | Criterio verificable | Resultado y evidencia |
| --- | --- | --- |
| Borrado y reemplazo | Seleccionar todo, Backspace/Delete, pegar y escribir otro número; el borrador vacío/intermedio no repone mínimo, cero ni default. | NOT RUN |
| Confirmación y límites | Requeridos y rangos existentes se validan al confirmar; el borrador vacío no se envía como válido. Probar cero, decimales, fuera de rango y borrado opcional. | NOT RUN |
| Teclado y tacto | Foco, Tab, Enter/Escape, etiquetas, tipo de teclado y toque sin clic forzado; declarar si teclado virtual/dispositivo físico sigue pendiente. | NOT RUN |
| Sesión en cabecera | Invitado encuentra acceso visible en móvil y PC; icono con nombre accesible, foco y destino correctos; sesión activa conserva su acción de cuenta. | NOT RUN |
| CTA duplicado | Menú abierto/cerrado y cada breakpoint no duplican accidentalmente acceso o acción principal; justificar repeticiones por contexto. | NOT RUN |
| Tema, menú y capas | En claro/oscuro y móvil/tablet/PC, menú y tema no se recortan ni bloquean; hit testing o clic/toque sin force acredita recepción real del evento. | NOT RUN |
| Cierre y recuperación | Escape/clic exterior y retorno de foco funcionan, sin superposición con controles ni pérdida injustificada de borrador. | NOT RUN |
| Puntos de uso compartidos | Inventariar rutas/shells/variantes icon/button. Matriz de rutas × viewports × sesión/roles × vacío/poblado × temas; cubrir público y panel autenticado afectados, sin extrapolar landing a cocina. | NOT RUN |
| Regresar y marca de inicio | Móvil/tablet: Regresar visible, paso interno antes de abandonar el flujo, historial válido o fallback interno seguro al entrar directo. Logo como enlace real a inicio, accesible por teclado/tacto; conservar `next` aceptado entre acceso/registro sin cambiar permisos. Inventariar variantes PC y logos pendientes. | NOT RUN |

Registrar viewport/orientación, puntero/hasTouch, tema, datos sintéticos y escenario exacto. Una captura no sustituye interacción; un criterio necesario sin evidencia impide PASS.

## Componentes NissiUI

Componentes y contratos públicos inspeccionados, composición propuesta, reutilización y huecos demostrados. Identidad, tokens, tipografía, espaciado e iconografía del producto.

## Plan de implementación

Pasos, responsable/capacidad, dependencias, alcance de negocio preservado, riesgos, reversión y autorización pendiente cuando corresponda. Coordinar producto, arquitectura, frontend, desarrollo y QA.

## Evidencia de pruebas

| Escenario o comando | Entorno/datos | Pantalla, viewport y tema | Resultado real | Artefacto y fecha |
| --- | --- | --- | --- | --- |
| [Pendiente] | [Sintéticos] | [Completar] | NOT RUN | [No disponible] |

Distinguir inspección, interacción automatizada, capturas, pruebas de accesibilidad y validación con personas. Registrar fallos y limitaciones; nunca rellenar PASS por expectativa.

## Revisión final

Criterios cumplidos / incumplidos / no comprobados:
Problemas pendientes y gravedad:
Regresiones y reglas/contratos preservados:
Revisor identificado y aprobación humana requerida:
Resultado: PASS / PARTIAL / FAIL / INSUFFICIENT.

Una compilación correcta por sí sola no permite aprobar esta pantalla.
