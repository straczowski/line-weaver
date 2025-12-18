import type { GcodeSheetSettings, Point, Polyline, SvgDimensions } from "../types.ts"

type ScalePolylinesInput = {
  polylines: Polyline[]
  sourceDimensions: SvgDimensions
  sheetSettings: GcodeSheetSettings
}

type Transformation = {
  scale: number
  offsetX: number
  offsetY: number
}

export const scalePolylines = (params: ScalePolylinesInput): Polyline[] => {
  const { polylines, sourceDimensions, sheetSettings } = params

  if (polylines.length === 0) return []

  const transformation = calculateTransformation(sourceDimensions, sheetSettings)

  return polylines.map((polyline) => polyline.map((point) => applyTransformation(point, transformation)))
}

const calculateTransformation = (source: SvgDimensions, sheet: GcodeSheetSettings): Transformation => {
  const drawableWidth = sheet.targetX - 2 * sheet.padding
  const drawableHeight = sheet.targetY - 2 * sheet.padding

  const scaleX = drawableWidth / source.width
  const scaleY = drawableHeight / source.height
  const scale = Math.min(scaleX, scaleY)

  const scaledWidth = source.width * scale
  const scaledHeight = source.height * scale

  const offsetX = sheet.padding + (drawableWidth - scaledWidth) / 2
  const offsetY = sheet.padding + (drawableHeight - scaledHeight) / 2

  return { scale, offsetX, offsetY }
}

const applyTransformation = (point: Point, transform: Transformation): Point => ({
  x: point.x * transform.scale + transform.offsetX,
  y: point.y * transform.scale + transform.offsetY,
})
