import type { BrightnessGrid, LinePattern, Point, Polyline } from "../types.ts"

export const generateLinePatterns = (params: { brightnessGrid: BrightnessGrid; threshold: number }): Polyline[] => {
  const { brightnessGrid, threshold } = params
  const polylines: Polyline[] = []

  for (let row = 0; row < brightnessGrid.rows; row++) {
    for (let col = 0; col < brightnessGrid.cols; col++) {
      const brightness = brightnessGrid.values[row][col]
      const pattern = determinePattern(brightness, threshold)
      const cellPolylines = generateCellPolylines({
        pattern,
        row,
        col,
        cellSize: brightnessGrid.cellSize,
      })
      polylines.push(...cellPolylines)
    }
  }

  return polylines
}

const determinePattern = (brightness: number, threshold: number): LinePattern => {
  const adjustedBrightness = applyThreshold(brightness, threshold)

  if (adjustedBrightness >= 204) return "empty"
  if (adjustedBrightness >= 153) return "diagonal-right"
  if (adjustedBrightness >= 102) return "diagonal-left"
  if (adjustedBrightness >= 51) return "cross"
  return "hatch"
}

const applyThreshold = (brightness: number, threshold: number): number => {
  const adjustment = (threshold - 128) / 2
  return Math.max(0, Math.min(255, brightness + adjustment))
}

const generateCellPolylines = (params: { pattern: LinePattern; row: number; col: number; cellSize: number }): Polyline[] => {
  const { pattern, row, col, cellSize } = params
  const x = col * cellSize
  const y = row * cellSize

  if (pattern === "empty") return []
  if (pattern === "diagonal-right") return [generateDiagonalRight(x, y, cellSize)]
  if (pattern === "diagonal-left") return [generateDiagonalLeft(x, y, cellSize)]
  if (pattern === "cross") return generateCross(x, y, cellSize)
  return generateHatch(x, y, cellSize)
}

const generateDiagonalRight = (x: number, y: number, size: number): Polyline => [createPoint(x, y + size), createPoint(x + size, y)]

const generateDiagonalLeft = (x: number, y: number, size: number): Polyline => [createPoint(x, y), createPoint(x + size, y + size)]

const generateCross = (x: number, y: number, size: number): Polyline[] => [generateDiagonalRight(x, y, size), generateDiagonalLeft(x, y, size)]

const generateHatch = (x: number, y: number, size: number): Polyline[] => [generateDiagonalRight(x, y, size), generateDiagonalLeft(x, y, size), [createPoint(x, y + size / 2), createPoint(x + size, y + size / 2)], [createPoint(x + size / 2, y), createPoint(x + size / 2, y + size)]]

const createPoint = (x: number, y: number): Point => ({ x, y })
