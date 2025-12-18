import type { ProcessingConfig, SvgStrokeConfig } from "../types.ts"

export const createStrokeConfig = (settings: ProcessingConfig): SvgStrokeConfig => ({
  width: settings.strokeWidth,
  color: "#000000",
  linecap: "round",
  linejoin: "round",
})
