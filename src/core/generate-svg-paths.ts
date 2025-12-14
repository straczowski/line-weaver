import { convertPolylineToPath } from "./convert-polyline-to-path.ts"
import type { Polyline, SvgStrokeConfig } from "./types.ts"

type GenerateSvgPathsInput = {
  polylines: Polyline[]
  strokeConfig: SvgStrokeConfig
}

export const generateSvgPaths = (params: GenerateSvgPathsInput): string[] => {
  const { polylines, strokeConfig } = params

  return polylines
    .filter(isNonEmptyPolyline)
    .map((polyline) => createPathElement(polyline, strokeConfig))
}

const isNonEmptyPolyline = (polyline: Polyline): boolean => polyline.length >= 2

const createPathElement = (polyline: Polyline, strokeConfig: SvgStrokeConfig): string => {
  const pathData = convertPolylineToPath(polyline)
  const strokeAttributes = createStrokeAttributes(strokeConfig)
  return `<path d="${pathData}" ${strokeAttributes} fill="none" />`
}

const createStrokeAttributes = (config: SvgStrokeConfig): string =>
  `stroke="${config.color}" stroke-width="${config.width}" stroke-linecap="${config.linecap}" stroke-linejoin="${config.linejoin}"`

