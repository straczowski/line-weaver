import type { BrightnessGrid, Point, Polyline } from "../types.ts"

type GenerateCrossHatchInput = {
  brightnessGrid: BrightnessGrid
  threshold: number
  angle?: number
}

export const generateCrossHatch = (params: GenerateCrossHatchInput): Polyline[] => {
  const { brightnessGrid, threshold, angle = 45 } = params
  const polylines: Polyline[] = []

  for (let row = 0; row < brightnessGrid.rows; row++) {
    for (let col = 0; col < brightnessGrid.cols; col++) {
      const brightness = brightnessGrid.values[row][col]
      const pattern = determineCrossPattern(brightness, threshold)
      const cellPolylines = generateCrossCellPolylines({
        pattern,
        row,
        col,
        cellSize: brightnessGrid.cellSize,
        angle,
      })
      polylines.push(...cellPolylines)
    }
  }

  return polylines
}

type CrossPattern = "empty" | "diagonal" | "cross"

const determineCrossPattern = (brightness: number, threshold: number): CrossPattern => {
  const offset = 85
  const adjustedBrightness = applyThreshold(brightness, threshold)

  if (adjustedBrightness >= threshold + offset) return "empty"
  if (adjustedBrightness >= threshold - offset) return "diagonal"
  return "cross"
}

const applyThreshold = (brightness: number, threshold: number): number => {
  const adjustment = (threshold - 128) / 2
  return Math.max(0, Math.min(255, brightness + adjustment))
}

type GenerateCrossCellPolylinesInput = {
  pattern: CrossPattern
  row: number
  col: number
  cellSize: number
  angle: number
}

const generateCrossCellPolylines = (params: GenerateCrossCellPolylinesInput): Polyline[] => {
  const { pattern, row, col, cellSize, angle } = params
  const cellX = col * cellSize
  const cellY = row * cellSize

  if (pattern === "empty") return []
  if (pattern === "diagonal") {
    const segment = clipLineThroughCenterToCell(cellX, cellY, cellSize, angle - 90)
    return segment ? [segment] : []
  }

  const primary = clipLineThroughCenterToCell(cellX, cellY, cellSize, angle - 90)
  const secondary = clipLineThroughCenterToCell(cellX, cellY, cellSize, angle)

  const result: Polyline[] = []
  if (primary) result.push(primary)
  if (secondary) result.push(secondary)
  return result
}

const clipLineThroughCenterToCell = (
  cellX: number,
  cellY: number,
  cellSize: number,
  angleDeg: number,
): Polyline | null => {
  const centerX = cellX + cellSize / 2
  const centerY = cellY + cellSize / 2
  const angleRad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)

  const ts: number[] = []

  if (Math.abs(cos) > 1e-10) {
    const tLeft = (cellX - centerX) / cos
    const yLeft = centerY + tLeft * sin
    if (cellY <= yLeft && yLeft <= cellY + cellSize) ts.push(tLeft)
    const tRight = (cellX + cellSize - centerX) / cos
    const yRight = centerY + tRight * sin
    if (cellY <= yRight && yRight <= cellY + cellSize) ts.push(tRight)
  }

  if (Math.abs(sin) > 1e-10) {
    const tBottom = (cellY - centerY) / sin
    const xBottom = centerX + tBottom * cos
    if (cellX <= xBottom && xBottom <= cellX + cellSize) ts.push(tBottom)
    const tTop = (cellY + cellSize - centerY) / sin
    const xTop = centerX + tTop * cos
    if (cellX <= xTop && xTop <= cellX + cellSize) ts.push(tTop)
  }

  if (ts.length < 2) return null

  const tMin = Math.min(...ts)
  const tMax = Math.max(...ts)

  return [
    createPoint(roundToDigits(centerX + tMin * cos, 10), roundToDigits(centerY + tMin * sin, 10)),
    createPoint(roundToDigits(centerX + tMax * cos, 10), roundToDigits(centerY + tMax * sin, 10)),
  ]
}

const roundToDigits = (value: number, digits: number): number => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

const createPoint = (x: number, y: number): Point => ({ x, y })
