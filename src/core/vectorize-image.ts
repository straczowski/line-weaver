import { applyGaussianBlur } from "./apply-gaussian-blur"
import { applyNoiseToPolylines } from "./apply-noise-to-polylines"
import { combinePolylines } from "./combine-polylines"
import { convertToGrayscale } from "./convert-to-grayscale"
import { detectEdges } from "./detect-edges"
import { filterSmallPolylines } from "./filter-small-polylines"
import { generateAdvancedHatching } from "./generate-advanced-hatching"
import { sampleBrightness } from "./sample-brightness"
import { simplifyPolyline, mapSimplifyLevelToEpsilon } from "./simplify-polyline"
import { traceContours } from "./trace-contours"
import type { GrayscaleData, Polyline, ProcessingConfig, VectorizeImageInput, VectorizeImageOutput } from "./types"

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
    ? generateAdvancedHatching({
        brightnessGrid,
        hatchAngle: settings.hatchAngle,
        maxDensity: settings.hatchDensity,
        crossHatch: settings.enableCrossHatch,
        threshold: settings.threshold,
      })
    : []

  const combinedPolylines = combinePolylines({
    contourPolylines,
    hatchingPolylines,
    enableContours: settings.enableContours,
    enableHatching: settings.enableHatching,
  })

  const noisyPolylines = applyNoiseIfNeeded(combinedPolylines, settings.noiseAmount)

  const finalPolylines = filterSmallPolylinesIfNeeded(noisyPolylines, settings.minLineLength)

  return { polylines: finalPolylines, grid: brightnessGrid }
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
