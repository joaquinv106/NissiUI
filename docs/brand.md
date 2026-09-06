# Identidad visual de Nissi UI

## Posicionamiento

- Descriptor oficial: **The React UI foundation for modular products.**
- Mensaje principal en español: **Construye productos modulares. Avanza más rápido.**
- Nombre escrito: **Nissi UI**.
- Nombre de paquete: `nissi-ui`.

El slogan anterior, “The React Component Banner-library”, se retiró porque `banner-library` no describe correctamente una biblioteca de componentes y su construcción no resulta natural en inglés.

## Recursos

| Recurso | Uso |
| --- | --- |
| `/brand/nissi-mark.png` | Isotipo maestro transparente para navbar, documentación y piezas de marca. |
| `/brand/nissi-hero.png` | Arte horizontal de portada; el texto debe renderizarse siempre como HTML. |
| `/brand/favicon-32.png` | Favicon del catálogo. |
| `/brand/apple-touch-icon.png` | Acceso directo en dispositivos Apple. |
| `/brand/icon-192.png` y `/brand/icon-512.png` | Manifest y aplicaciones instalables. |

Los recursos completos pertenecen a la web de presentación y no se incluyen en el bundle npm. `docs/assets/nissi-mark.png` es la variante ligera incluida con la documentación publicada.

## Reglas de uso

- Mantener espacio libre alrededor del isotipo equivalente al 20% de su ancho.
- No incrustar slogans en el bitmap: deben permanecer accesibles, traducibles y responsive.
- Usar el hero con texto blanco sobre el área oscura izquierda.
- No alterar la relación azul/violeta ni aplicar fondos que reduzcan el contraste de la silueta.
- Para tamaños menores a 32 px usar las variantes derivadas de favicon, no el hero.

## Lenguaje visual de la landing

La portada del catálogo puede usar retícula técnica, halos azul/violeta, fragmentos cristalinos tipo hielo y movimiento ambiental suave. En tema claro estos efectos reducen opacidad; en oscuro aumentan profundidad y brillo.

La atmósfera comienza inmediatamente debajo de `NHeader`; `OverviewView` administra su propio espaciado y usa `NAppShell contentPadding="none"`. Las vistas técnicas conservan `contentPadding="comfortable"`.

Este tratamiento pertenece exclusivamente a `OverviewView`. No debe modificar recetas, tokens, superficies ni comportamiento de los componentes públicos. Toda animación decorativa debe respetar `prefers-reduced-motion`.

## Nissi Dark

`Nissi Dark` traslada la relación azul/violeta del isotipo al sistema semántico sin copiar el tratamiento cristalino de la landing. Usa fondos índigo-tinta, azul para acciones, cian para foco y violeta/lavanda como acentos medidos. Su contrato y ratios de contraste están documentados en [NTheme](./theme.md).
