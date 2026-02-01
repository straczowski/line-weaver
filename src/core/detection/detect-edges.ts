import type { GrayscaleData } from "../types.ts"

const ANGLE_HORIZONTAL = 22.5
const ANGLE_DIAGONAL_1 = 67.5
const ANGLE_VERTICAL = 112.5
const ANGLE_DIAGONAL_2 = 157.5
const WEAK_EDGE = 128

type DetectEdgesInput = {
  grayscaleData: GrayscaleData
  lowThreshold?: number
  highThreshold?: number
}

export type EdgeData = {
  width: number
  height: number
  edges: Uint8Array
}

export const detectEdges = (input: DetectEdgesInput): EdgeData => {
  const { grayscaleData, lowThreshold = 50, highThreshold = 150 } = input

  const gradients = computeGradients(grayscaleData)
  const suppressed = applyNonMaxSuppression(gradients)
  const edges = applyHysteresisThreshold({
    suppressed,
    lowThreshold,
    highThreshold,
    width: grayscaleData.width,
    height: grayscaleData.height,
  })

  return {
    width: grayscaleData.width,
    height: grayscaleData.height,
    edges,
  }
}

type GradientData = {
  magnitude: Float32Array
  direction: Float32Array
  width: number
  height: number
}

const computeGradients = (grayscaleData: GrayscaleData): GradientData => {
  const { width, height, pixels } = grayscaleData
  const magnitude = new Float32Array(width * height)
  const direction = new Float32Array(width * height)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx = computeSobelX(pixels, x, y, width)
      const gy = computeSobelY(pixels, x, y, width)
      const index = y * width + x

      magnitude[index] = Math.sqrt(gx * gx + gy * gy)
      direction[index] = Math.atan2(gy, gx)
    }
  }

  return { magnitude, direction, width, height }
}

const computeSobelX = (pixels: Uint8Array, x: number, y: number, width: number): number => {
  const tl = pixels[(y - 1) * width + (x - 1)]
  const ml = pixels[y * width + (x - 1)]
  const bl = pixels[(y + 1) * width + (x - 1)]
  const tr = pixels[(y - 1) * width + (x + 1)]
  const mr = pixels[y * width + (x + 1)]
  const br = pixels[(y + 1) * width + (x + 1)]

  return -tl - 2 * ml - bl + tr + 2 * mr + br
}

const computeSobelY = (pixels: Uint8Array, x: number, y: number, width: number): number => {
  const tl = pixels[(y - 1) * width + (x - 1)]
  const tm = pixels[(y - 1) * width + x]
  const tr = pixels[(y - 1) * width + (x + 1)]
  const bl = pixels[(y + 1) * width + (x - 1)]
  const bm = pixels[(y + 1) * width + x]
  const br = pixels[(y + 1) * width + (x + 1)]

  return -tl - 2 * tm - tr + bl + 2 * bm + br
}

const applyNonMaxSuppression = (gradients: GradientData): Float32Array => {
  const { magnitude, direction, width, height } = gradients
  const result = new Float32Array(width * height)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x
      const mag = magnitude[index]
      const angle = normalizeAngle(direction[index])

      const { neighbor1, neighbor2 } = getNeighborIndices(x, y, width, angle)

      if (mag >= magnitude[neighbor1] && mag >= magnitude[neighbor2]) {
        result[index] = mag
      }
    }
  }

  return result
}

const normalizeAngle = (angle: number): number => {
  let normalized = (angle * 180) / Math.PI
  if (normalized < 0) normalized += 180
  return normalized
}

const getNeighborIndices = (x: number, y: number, width: number, angle: number): { neighbor1: number; neighbor2: number } => {
  if (angle < ANGLE_HORIZONTAL || angle >= ANGLE_DIAGONAL_2) {
    return {
      neighbor1: y * width + (x - 1),
      neighbor2: y * width + (x + 1),
    }
  }
  if (angle < ANGLE_DIAGONAL_1) {
    return {
      neighbor1: (y - 1) * width + (x + 1),
      neighbor2: (y + 1) * width + (x - 1),
    }
  }
  if (angle < ANGLE_VERTICAL) {
    return {
      neighbor1: (y - 1) * width + x,
      neighbor2: (y + 1) * width + x,
    }
  }
  return {
    neighbor1: (y - 1) * width + (x - 1),
    neighbor2: (y + 1) * width + (x + 1),
  }
}

const applyHysteresisThreshold = (params: {
  suppressed: Float32Array
  lowThreshold: number
  highThreshold: number
  width: number
  height: number
}): Uint8Array => {
  const { suppressed, lowThreshold, highThreshold, width, height } = params
  const edges = new Uint8Array(width * height)

  for (let i = 0; i < edges.length; i++) {
    if (suppressed[i] >= highThreshold) {
      edges[i] = 255
    } else if (suppressed[i] >= lowThreshold) {
      edges[i] = WEAK_EDGE
    }
  }

  return connectWeakEdges(edges, width)
}

const connectWeakEdges = (edges: Uint8Array, width: number): Uint8Array => {
  const height = Math.floor(edges.length / width)
  const result = new Uint8Array(edges)
  let changed = true

  while (changed) {
    changed = false
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = y * width + x
        if (result[index] === WEAK_EDGE && hasStrongNeighbor(result, x, y, width)) {
          result[index] = 255
          changed = true
        }
      }
    }
  }

  for (let i = 0; i < result.length; i++) {
    if (result[i] === WEAK_EDGE) result[i] = 0
  }

  return result
}

const hasStrongNeighbor = (edges: Uint8Array, x: number, y: number, width: number): boolean => {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      if (edges[(y + dy) * width + (x + dx)] === 255) return true
    }
  }
  return false
}
