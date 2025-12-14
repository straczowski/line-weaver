import type { BrightnessGrid, GrayscaleData } from "./types"

export const sampleBrightness = (params: {
  grayscaleData: GrayscaleData
  cellSize: number
}): BrightnessGrid => {
  const { grayscaleData, cellSize } = params
  const { cols, rows } = calculateGridDimensions(grayscaleData.width, grayscaleData.height, cellSize)
  const values = calculateBrightnessValues({ grayscaleData, cellSize, cols, rows })
  return { cols, rows, cellSize, values }
}

const calculateGridDimensions = (width: number, height: number, cellSize: number) => ({
  cols: Math.ceil(width / cellSize),
  rows: Math.ceil(height / cellSize),
})

const calculateBrightnessValues = (params: {
  grayscaleData: GrayscaleData
  cellSize: number
  cols: number
  rows: number
}): number[][] => {
  const { grayscaleData, cellSize, cols, rows } = params
  const values: number[][] = []
  for (let row = 0; row < rows; row++) {
    values[row] = []
    for (let col = 0; col < cols; col++) {
      values[row][col] = calculateCellBrightness({ grayscaleData, cellSize, row, col })
    }
  }
  return values
}

const calculateCellBrightness = (params: {
  grayscaleData: GrayscaleData
  cellSize: number
  row: number
  col: number
}): number => {
  const { grayscaleData, cellSize, row, col } = params
  const { width, height, pixels } = grayscaleData

  const startX = col * cellSize
  const startY = row * cellSize
  const endX = Math.min(startX + cellSize, width)
  const endY = Math.min(startY + cellSize, height)

  let sum = 0
  let count = 0

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = y * width + x
      sum += pixels[index]
      count++
    }
  }

  return count > 0 ? Math.round(sum / count) : 0
}

