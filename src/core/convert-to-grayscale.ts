import type { GrayscaleData } from "./types"

export const convertToGrayscale = (imageData: ImageData): GrayscaleData => {
  const pixelCount = imageData.width * imageData.height
  const pixels = calculateGrayscalePixels(imageData.data, pixelCount)
  return createGrayscaleData(imageData.width, imageData.height, pixels)
}

const calculateGrayscalePixels = (rgba: Uint8ClampedArray, pixelCount: number): Uint8Array => {
  const grayscale = new Uint8Array(pixelCount)
  for (let i = 0; i < pixelCount; i++) {
    grayscale[i] = calculateLuminosity(rgba, i * 4)
  }
  return grayscale
}

const calculateLuminosity = (rgba: Uint8ClampedArray, offset: number): number => {
  const r = rgba[offset]
  const g = rgba[offset + 1]
  const b = rgba[offset + 2]
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b)
}

const createGrayscaleData = (width: number, height: number, pixels: Uint8Array): GrayscaleData => ({
  width,
  height,
  pixels,
})
