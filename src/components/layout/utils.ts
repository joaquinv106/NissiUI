import type { NlayoutProps } from "./types"

/** Conserva ids literales al compartir una configuración tipada de Nlayout. */
export function defineNlayoutConfig<const TConfig extends NlayoutProps>(config: TConfig): TConfig {
  return config
}
