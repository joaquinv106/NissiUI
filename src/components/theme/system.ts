import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Sistema Chakra oficial de Nissi UI.
 *
 * `navy` y `nissi` también satisfacen la condición oscura para heredar recetas
 * accesibles de Chakra; sus superficies se afinan después con condiciones propias.
 */
const nissiThemeConfig = defineConfig({
  conditions: {
    dark: ".dark &, .dark .chakra-theme:not(.light) &, .navy &, .navy .chakra-theme:not(.light) &, .nissi &, .nissi .chakra-theme:not(.light) &",
    navy: ".navy &, .navy .chakra-theme:not(.light):not(.dark) &",
    nissi: ".nissi &, .nissi .chakra-theme:not(.light):not(.dark):not(.navy) &",
  },
  theme: {
    tokens: {
      colors: {
        navy: {
          50: { value: "#f2f7fc" },
          100: { value: "#e3edf7" },
          200: { value: "#c6d9ec" },
          300: { value: "#9ebbd9" },
          400: { value: "#7198c1" },
          500: { value: "#4e78a5" },
          600: { value: "#3a5f86" },
          700: { value: "#2e4c6b" },
          800: { value: "#233b55" },
          900: { value: "#162a42" },
          950: { value: "#081525" },
        },
        nissi: {
          50: { value: "#f5f7ff" },
          100: { value: "#e8ecff" },
          200: { value: "#ccd5ff" },
          300: { value: "#a8b7ff" },
          400: { value: "#7c8cff" },
          500: { value: "#5868f2" },
          600: { value: "#3b52df" },
          700: { value: "#283dbb" },
          800: { value: "#1c2b8d" },
          900: { value: "#111b5b" },
          950: { value: "#080c25" },
          cyan: { value: "#5acffd" },
          blue: { value: "#1461de" },
          indigo: { value: "#1d2eaf" },
          violet: { value: "#6947db" },
          lavender: { value: "#cd97fc" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: "{colors.white}", _dark: "{colors.black}", _navy: "{colors.navy.950}", _nissi: "{colors.nissi.950}" },
          },
          subtle: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}", _navy: "#0b1b30", _nissi: "#0b1026" },
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}", _navy: "#10243d", _nissi: "#111833" },
          },
          emphasized: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}", _navy: "#193451", _nissi: "#1a2347" },
          },
          panel: {
            value: { _light: "{colors.white}", _dark: "{colors.gray.950}", _navy: "#0d2036", _nissi: "#0d122b" },
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: "{colors.black}", _dark: "{colors.gray.50}", _navy: "#f1f6fc", _nissi: "#f6f7ff" },
          },
          muted: {
            value: { _light: "{colors.gray.600}", _dark: "{colors.gray.400}", _navy: "#a9bdd3", _nissi: "#bac2dd" },
          },
          subtle: {
            value: { _light: "{colors.gray.400}", _dark: "{colors.gray.500}", _navy: "#7892ad", _nissi: "#8791b4" },
          },
          inverted: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.black}", _navy: "{colors.navy.950}", _nissi: "{colors.nissi.950}" },
          },
        },
        border: {
          DEFAULT: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}", _navy: "#24415f", _nissi: "#293664" },
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}", _navy: "#19344f", _nissi: "#1d294f" },
          },
          subtle: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}", _navy: "#142b43", _nissi: "#151e3c" },
          },
          emphasized: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}", _navy: "#315476", _nissi: "#6258b4" },
          },
          inverted: {
            value: { _light: "{colors.gray.800}", _dark: "{colors.gray.200}", _navy: "#c6d9ec", _nissi: "#d8deff" },
          },
        },
        blue: {
          contrast: {
            value: { _light: "white", _dark: "white", _nissi: "white" },
          },
          fg: {
            value: { _light: "{colors.blue.700}", _dark: "{colors.blue.300}", _nissi: "{colors.nissi.200}" },
          },
          subtle: {
            value: { _light: "{colors.blue.100}", _dark: "{colors.blue.900}", _nissi: "{colors.nissi.900}" },
          },
          muted: {
            value: { _light: "{colors.blue.200}", _dark: "{colors.blue.800}", _nissi: "{colors.nissi.800}" },
          },
          emphasized: {
            value: { _light: "{colors.blue.300}", _dark: "{colors.blue.700}", _nissi: "{colors.nissi.700}" },
          },
          solid: {
            value: { _light: "{colors.blue.600}", _dark: "{colors.blue.600}", _nissi: "{colors.nissi.600}" },
          },
          focusRing: {
            value: { _light: "{colors.blue.500}", _dark: "{colors.blue.500}", _nissi: "{colors.nissi.cyan}" },
          },
          border: {
            value: { _light: "{colors.blue.500}", _dark: "{colors.blue.400}", _nissi: "{colors.nissi.400}" },
          },
        },
      },
    },
  },
})

/** Sistema que deben entregar los consumidores a Chakra para habilitar todos los temas Nissi. */
export const nissiSystem = createSystem(defaultConfig, nissiThemeConfig)
