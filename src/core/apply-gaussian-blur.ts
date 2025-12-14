import type { GrayscaleData } from "./types"

type ApplyGaussianBlurInput = {
  grayscaleData: GrayscaleData
  radius: number
}

export const applyGaussianBlur = (input: ApplyGaussianBlurInput): GrayscaleData => {
  const { grayscaleData, radius } = input

  if (radius <= 0) return grayscaleData

  const kernel = generateGaussianKernel(radius)
  const blurredPixels = applyConvolution({ grayscaleData, kernel })

  return {
    width: grayscaleData.width,
    height: grayscaleData.height,
    pixels: blurredPixels,
  }
}

const generateGaussianKernel = (radius: number): number[][] => {
  const size = radius * 2 + 1
  const sigma = radius / 2
  const kernel: number[][] = []
  let sum = 0

  for (let y = 0; y < size; y++) {
    kernel[y] = []
    for (let x = 0; x < size; x++) {
      const dx = x - radius
      const dy = y - radius
      const value = calculateGaussianValue(dx, dy, sigma)
      kernel[y][x] = value
      sum += value
    }
  }

  return normalizeKernel(kernel, sum)
}

const calculateGaussianValue = (dx: number, dy: number, sigma: number): number => {
  const exponent = -(dx * dx + dy * dy) / (2 * sigma * sigma)
  return Math.exp(exponent)
}

const normalizeKernel = (kernel: number[][], sum: number): number[][] =>
  kernel.map((row) => row.map((value) => value / sum))

const applyConvolution = (params: {
  grayscaleData: GrayscaleData
  kernel: number[][]
}): Uint8Array => {
  const { grayscaleData, kernel } = params
  const { width, height, pixels } = grayscaleData
  const radius = Math.floor(kernel.length / 2)
  const result = new Uint8Array(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = computeConvolvedValue({ x, y, width, height, pixels, kernel, radius })
      result[y * width + x] = Math.round(value)
    }
  }

  return result
}

const computeConvolvedValue = (params: {
  x: number
  y: number
  width: number
  height: number
  pixels: Uint8Array
  kernel: number[][]
  radius: number
}): number => {
  const { x, y, width, height, pixels, kernel, radius } = params
  let sum = 0

  for (let ky = -radius; ky <= radius; ky++) {
    for (let kx = -radius; kx <= radius; kx++) {
      const sampleX = clamp(x + kx, 0, width - 1)
      const sampleY = clamp(y + ky, 0, height - 1)
      const pixelValue = pixels[sampleY * width + sampleX]
      const kernelValue = kernel[ky + radius][kx + radius]
      sum += pixelValue * kernelValue
    }
  }

  return sum
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

