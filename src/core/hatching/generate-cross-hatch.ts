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
  const x = col * cellSize
  const y = row * cellSize

  if (pattern === "empty") return []
  if (pattern === "diagonal") {
    const diagonal = generateDiagonal(x, y, cellSize)
    return angle === 45 ? [diagonal] : [rotatePolyline(diagonal, x, y, cellSize, angle)]
  }

  const diagonal1 = generateDiagonal(x, y, cellSize)
  const diagonal2 = generateDiagonalLeft(x, y, cellSize)

  if (angle === 45) {
    return [diagonal1, diagonal2]
  }

  return [
    rotatePolyline(diagonal1, x, y, cellSize, angle),
    rotatePolyline(diagonal2, x, y, cellSize, angle),
  ]
}

const generateDiagonal = (x: number, y: number, size: number): Polyline => [
  createPoint(x, y + size),
  createPoint(x + size, y),
]

const generateDiagonalLeft = (x: number, y: number, size: number): Polyline => [
  createPoint(x, y),
  createPoint(x + size, y + size),
]

const rotatePolyline = (polyline: Polyline, cellX: number, cellY: number, cellSize: number, angleDeg: number): Polyline => {
  if (angleDeg === 45) return polyline

  const centerX = cellX + cellSize / 2
  const centerY = cellY + cellSize / 2
  const angleRad = (angleDeg * Math.PI) / 180

  return polyline.map((point) => rotatePoint(point, centerX, centerY, angleRad))
}

const rotatePoint = (point: Point, centerX: number, centerY: number, angleRad: number): Point => {
  const dx = point.x - centerX
  const dy = point.y - centerY
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)

  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  }
}

const createPoint = (x: number, y: number): Point => ({ x, y })
