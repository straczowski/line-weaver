import { applyGaussianBlur } from "./image/apply-gaussian-blur.ts"
import { applyNoiseToPolylines } from "./polyline/apply-noise-to-polylines.ts"
import { combinePolylines } from "./polyline/combine-polylines.ts"
import { convertToGrayscale } from "./image/convert-to-grayscale.ts"
import { detectEdges } from "./detection/detect-edges.ts"
import { filterSmallPolylines } from "./polyline/filter-small-polylines.ts"
import { generateAdvancedHatching } from "./hatching/generate-advanced-hatching.ts"
import { generateCrossHatch } from "./hatching/generate-cross-hatch.ts"
import { generateLinePatterns } from "./hatching/generate-line-patterns.ts"
import { sampleBrightness } from "./detection/sample-brightness.ts"
import { simplifyPolyline, mapSimplifyLevelToEpsilon } from "./polyline/simplify-polyline.ts"
import { traceContours } from "./detection/trace-contours.ts"
import { HATCHING_MODE } from "./types.ts"
import type { BrightnessGrid, GrayscaleData, Polyline, ProcessingConfig, VectorizeImageInput, VectorizeImageOutput } from "./types.ts"

export const vectorizeImage = (input: VectorizeImageInput): VectorizeImageOutput => {
  const { imageData, settings } = input
  const grayscaleData = convertToGrayscale(imageData as ImageData)

  const blurredData = applyBlurIfNeeded(grayscaleData, settings.blurRadius)

  const brightnessGrid = sampleBrightness({
    grayscaleData: blurredData,
    cellSize: settings.gridSize,
  })

  const contourPolylines = settings.enableContours ? processContours(blurredData, settings) : []

  const hatchingPolylines = settings.enableHatching
    ? generateHatching(brightnessGrid, settings)
    : []

  const combinedPolylines = combinePolylines({
    contourPolylines,
    hatchingPolylines,
    enableContours: settings.enableContours,
    enableHatching: settings.enableHatching,
  })

  const noisyPolylines = applyNoiseIfNeeded(combinedPolylines, settings.noiseAmount)

  const finalPolylines = filterSmallPolylinesIfNeeded(noisyPolylines, settings.minLineLength)

  return { polylines: finalPolylines }
}

const applyBlurIfNeeded = (grayscaleData: GrayscaleData, blurRadius: number): GrayscaleData => {
  if (blurRadius <= 0) return grayscaleData

  return applyGaussianBlur({ grayscaleData, radius: blurRadius })
}

const processContours = (grayscaleData: GrayscaleData, settings: ProcessingConfig): Polyline[] => {
  const edgeData = detectEdges({
    grayscaleData,
    lowThreshold: settings.edgeLowThreshold,
    highThreshold: settings.edgeHighThreshold,
  })

  const { polylines } = traceContours({ edgeData })

  const epsilon = mapSimplifyLevelToEpsilon(settings.contourSimplify)

  const simplified = polylines.map((polyline) => simplifyPolyline({ polyline, epsilon }))

  return simplified
}

const applyNoiseIfNeeded = (polylines: Polyline[], noiseAmount: number): Polyline[] => {
  if (noiseAmount <= 0) return polylines

  return applyNoiseToPolylines({ polylines, noiseAmount })
}

const filterSmallPolylinesIfNeeded = (polylines: Polyline[], minLength: number): Polyline[] => {
  if (minLength <= 0) return polylines

  return filterSmallPolylines({ polylines, minLength }).polylines
}

const generateHatching = (brightnessGrid: BrightnessGrid, settings: ProcessingConfig): Polyline[] => {
  switch (settings.hatchingMode) {
    case HATCHING_MODE.CROSS:
      return generateCrossHatch({
        brightnessGrid,
        threshold: settings.threshold,
        angle: settings.hatchAngle,
      })
    case HATCHING_MODE.GRID:
      return generateLinePatterns({
        brightnessGrid,
        threshold: settings.threshold,
      })
    case HATCHING_MODE.SKETCH:
      return generateAdvancedHatching({
        brightnessGrid,
        hatchAngle: settings.hatchAngle,
        maxDensity: settings.hatchDensity,
        threshold: settings.threshold,
      })
    default:
      throw new Error(`Unknown hatching mode: ${settings.hatchingMode}`)
  }
}
