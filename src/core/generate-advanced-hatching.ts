import type { BrightnessGrid, Point, Polyline } from "./types"

type GenerateAdvancedHatchingInput = {
  brightnessGrid: BrightnessGrid
  hatchAngle?: number
  maxDensity?: number
  crossHatch?: boolean
  threshold?: number
}

export const generateAdvancedHatching = (input: GenerateAdvancedHatchingInput): Polyline[] => {
  const { brightnessGrid, hatchAngle = 45, maxDensity = 4, crossHatch = true, threshold = 128 } = input

  const darknessThreshold = 1 - threshold / 255

  const primaryLines = generateHatchLines({
    brightnessGrid,
    angle: hatchAngle,
    maxDensity,
    crossHatchThreshold: darknessThreshold,
  })

  if (!crossHatch) return primaryLines

  const secondaryLines = generateHatchLines({
    brightnessGrid,
    angle: hatchAngle + 90,
    maxDensity: Math.ceil(maxDensity / 2),
    crossHatchThreshold: Math.min(1, darknessThreshold + 0.2),
  })

  return [...primaryLines, ...secondaryLines]
}

const generateHatchLines = (params: {
  brightnessGrid: BrightnessGrid
  angle: number
  maxDensity: number
  crossHatchThreshold: number
}): Polyline[] => {
  const { brightnessGrid, angle, maxDensity, crossHatchThreshold } = params
  const polylines: Polyline[] = []

  for (let row = 0; row < brightnessGrid.rows; row++) {
    for (let col = 0; col < brightnessGrid.cols; col++) {
      const brightness = brightnessGrid.values[row][col]
      const darkness = 1 - brightness / 255

      if (darkness < crossHatchThreshold) continue

      const lineCount = calculateLineCount(darkness, maxDensity)
      const cellLines = generateCellHatchLines({
        row,
        col,
        cellSize: brightnessGrid.cellSize,
        angle,
        lineCount,
      })
      polylines.push(...cellLines)
    }
  }

  return polylines
}

const calculateLineCount = (darkness: number, maxDensity: number): number => {
  const normalizedDarkness = Math.max(0, Math.min(1, darkness))
  return Math.ceil(normalizedDarkness * maxDensity)
}

const generateCellHatchLines = (params: {
  row: number
  col: number
  cellSize: number
  angle: number
  lineCount: number
}): Polyline[] => {
  const { row, col, cellSize, angle, lineCount } = params

  if (lineCount <= 0) return []

  const centerX = col * cellSize + cellSize / 2
  const centerY = row * cellSize + cellSize / 2
  const radians = (angle * Math.PI) / 180

  const dx = Math.cos(radians)
  const dy = Math.sin(radians)
  const perpDx = -dy
  const perpDy = dx

  const halfDiagonal = (cellSize * Math.SQRT2) / 2
  const spacing = cellSize / (lineCount + 1)

  const lines: Polyline[] = []

  for (let i = 1; i <= lineCount; i++) {
    const offset = (i - (lineCount + 1) / 2) * spacing
    const lineCenterX = centerX + perpDx * offset
    const lineCenterY = centerY + perpDy * offset

    const startX = lineCenterX - dx * halfDiagonal
    const startY = lineCenterY - dy * halfDiagonal
    const endX = lineCenterX + dx * halfDiagonal
    const endY = lineCenterY + dy * halfDiagonal

    const clippedLine = clipLineToCell({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      cellX: col * cellSize,
      cellY: row * cellSize,
      cellSize,
    })

    if (clippedLine) {
      lines.push(clippedLine)
    }
  }

  return lines
}

const clipLineToCell = (params: {
  start: Point
  end: Point
  cellX: number
  cellY: number
  cellSize: number
}): Polyline | null => {
  const { start, end, cellX, cellY, cellSize } = params

  const minX = cellX
  const maxX = cellX + cellSize
  const minY = cellY
  const maxY = cellY + cellSize

  const clipped = cohenSutherlandClip({
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
    minX,
    maxX,
    minY,
    maxY,
  })

  if (!clipped) return null

  return [
    { x: clipped.x1, y: clipped.y1 },
    { x: clipped.x2, y: clipped.y2 },
  ]
}

const INSIDE = 0
const LEFT = 1
const RIGHT = 2
const BOTTOM = 4
const TOP = 8

const computeOutCode = (x: number, y: number, minX: number, maxX: number, minY: number, maxY: number): number => {
  let code = INSIDE
  if (x < minX) code |= LEFT
  else if (x > maxX) code |= RIGHT
  if (y < minY) code |= BOTTOM
  else if (y > maxY) code |= TOP
  return code
}

const cohenSutherlandClip = (params: {
  x1: number
  y1: number
  x2: number
  y2: number
  minX: number
  maxX: number
  minY: number
  maxY: number
}): { x1: number; y1: number; x2: number; y2: number } | null => {
  let { x1, y1, x2, y2, minX, maxX, minY, maxY } = params

  let outcode1 = computeOutCode(x1, y1, minX, maxX, minY, maxY)
  let outcode2 = computeOutCode(x2, y2, minX, maxX, minY, maxY)

  while (true) {
    if (!(outcode1 | outcode2)) {
      return { x1, y1, x2, y2 }
    }

    if (outcode1 & outcode2) {
      return null
    }

    const outcodeOut = outcode1 ? outcode1 : outcode2
    let x = 0
    let y = 0

    if (outcodeOut & TOP) {
      x = x1 + ((x2 - x1) * (maxY - y1)) / (y2 - y1)
      y = maxY
    } else if (outcodeOut & BOTTOM) {
      x = x1 + ((x2 - x1) * (minY - y1)) / (y2 - y1)
      y = minY
    } else if (outcodeOut & RIGHT) {
      y = y1 + ((y2 - y1) * (maxX - x1)) / (x2 - x1)
      x = maxX
    } else if (outcodeOut & LEFT) {
      y = y1 + ((y2 - y1) * (minX - x1)) / (x2 - x1)
      x = minX
    }

    if (outcodeOut === outcode1) {
      x1 = x
      y1 = y
      outcode1 = computeOutCode(x1, y1, minX, maxX, minY, maxY)
    } else {
      x2 = x
      y2 = y
      outcode2 = computeOutCode(x2, y2, minX, maxX, minY, maxY)
    }
  }
}

