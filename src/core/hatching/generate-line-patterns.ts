import { applyBrightnessThreshold } from "./apply-brightness-threshold.ts"
import type { BrightnessGrid, LinePattern, Point, Polyline } from "../types.ts"

const BRIGHTNESS_EMPTY = 204
const BRIGHTNESS_HORIZONTAL = 153
const BRIGHTNESS_GRID = 102
const BRIGHTNESS_GRID_DIAGONAL = 51

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
  const adjustedBrightness = applyBrightnessThreshold(brightness, threshold)

  if (adjustedBrightness >= BRIGHTNESS_EMPTY) return "empty"
  if (adjustedBrightness >= BRIGHTNESS_HORIZONTAL) return "horizontal"
  if (adjustedBrightness >= BRIGHTNESS_GRID) return "grid"
  if (adjustedBrightness >= BRIGHTNESS_GRID_DIAGONAL) return "grid-diagonal"
  return "grid-cross"
}

const generateCellPolylines = (params: { pattern: LinePattern; row: number; col: number; cellSize: number }): Polyline[] => {
  const { pattern, row, col, cellSize } = params
  const x = col * cellSize
  const y = row * cellSize

  if (pattern === "empty") return []
  if (pattern === "horizontal") return [generateHorizontal(x, y, cellSize)]
  if (pattern === "grid") return generateGrid(x, y, cellSize)
  if (pattern === "grid-diagonal") return generateGridDiagonal(x, y, cellSize)
  return generateGridCross(x, y, cellSize)
}

const generateHorizontal = (x: number, y: number, size: number): Polyline => [
  createPoint(x, y + size / 2),
  createPoint(x + size, y + size / 2),
]

const generateVertical = (x: number, y: number, size: number): Polyline => [
  createPoint(x + size / 2, y),
  createPoint(x + size / 2, y + size),
]

const generateDiagonalRight = (x: number, y: number, size: number): Polyline => [
  createPoint(x, y + size),
  createPoint(x + size, y),
]

const generateDiagonalLeft = (x: number, y: number, size: number): Polyline => [
  createPoint(x, y),
  createPoint(x + size, y + size),
]

const generateGrid = (x: number, y: number, size: number): Polyline[] => [
  generateHorizontal(x, y, size),
  generateVertical(x, y, size),
]

const generateGridDiagonal = (x: number, y: number, size: number): Polyline[] => [
  ...generateGrid(x, y, size),
  generateDiagonalRight(x, y, size),
]

const generateGridCross = (x: number, y: number, size: number): Polyline[] => [
  ...generateGrid(x, y, size),
  generateDiagonalRight(x, y, size),
  generateDiagonalLeft(x, y, size),
]

const createPoint = (x: number, y: number): Point => ({ x, y })
