import assert from "node:assert"
import { describe, it } from "node:test"
import { applyGaussianBlur } from "./apply-gaussian-blur.ts"
import type { GrayscaleData } from "../types.ts"

describe("applyGaussianBlur", () => {
  const createUniformImage = (value: number): GrayscaleData => ({
    width: 5,
    height: 5,
    pixels: new Uint8Array(25).fill(value),
  })

  const createCheckerboard = (): GrayscaleData => {
    const pixels = new Uint8Array(25)
    for (let i = 0; i < 25; i++) {
      pixels[i] = i % 2 === 0 ? 0 : 255
    }
    return { width: 5, height: 5, pixels }
  }

  it("should return identical data when radius is 0", () => {
    const input = createUniformImage(128)

    const result = applyGaussianBlur({ grayscaleData: input, radius: 0 })

    assert.deepStrictEqual(result.pixels, input.pixels)
  })

  it("should return identical data when radius is negative", () => {
    const input = createUniformImage(128)

    const result = applyGaussianBlur({ grayscaleData: input, radius: -1 })

    assert.deepStrictEqual(result.pixels, input.pixels)
  })

  it("should preserve uniform images", () => {
    const input = createUniformImage(128)

    const result = applyGaussianBlur({ grayscaleData: input, radius: 2 })

    const allSame = Array.from(result.pixels).every((v) => v === 128)
    assert.strictEqual(allSame, true)
  })

  it("should smooth out pixel variations", () => {
    const input = createCheckerboard()
    const originalVariance = calculateVariance(input.pixels)

    const result = applyGaussianBlur({ grayscaleData: input, radius: 1 })
    const blurredVariance = calculateVariance(result.pixels)

    assert.ok(blurredVariance < originalVariance, `Variance should decrease: original=${originalVariance}, blurred=${blurredVariance}`)
  })

  it("should preserve image dimensions", () => {
    const input: GrayscaleData = {
      width: 10,
      height: 8,
      pixels: new Uint8Array(80).fill(100),
    }

    const result = applyGaussianBlur({ grayscaleData: input, radius: 2 })

    assert.strictEqual(result.width, 10)
    assert.strictEqual(result.height, 8)
    assert.strictEqual(result.pixels.length, 80)
  })

  it("should handle single pixel image", () => {
    const input: GrayscaleData = {
      width: 1,
      height: 1,
      pixels: new Uint8Array([128]),
    }

    const result = applyGaussianBlur({ grayscaleData: input, radius: 1 })

    assert.strictEqual(result.pixels[0], 128)
  })

  it("should keep values in valid range (0-255)", () => {
    const input = createCheckerboard()

    const result = applyGaussianBlur({ grayscaleData: input, radius: 2 })

    const allInRange = Array.from(result.pixels).every((v) => v >= 0 && v <= 255)
    assert.strictEqual(allInRange, true)
  })

  it("should blur more with larger radius", () => {
    const input = createCheckerboard()

    const result1 = applyGaussianBlur({ grayscaleData: input, radius: 1 })
    const result2 = applyGaussianBlur({ grayscaleData: input, radius: 3 })

    const variance1 = calculateVariance(result1.pixels)
    const variance2 = calculateVariance(result2.pixels)

    assert.ok(variance2 < variance1, `Larger radius should blur more: r1 variance=${variance1}, r3 variance=${variance2}`)
  })

  it("should handle edge pixels correctly", () => {
    const input: GrayscaleData = {
      width: 3,
      height: 3,
      pixels: new Uint8Array([255, 255, 255, 255, 0, 255, 255, 255, 255]),
    }

    const result = applyGaussianBlur({ grayscaleData: input, radius: 1 })

    assert.ok(result.pixels[4] > 0, "Center pixel should be affected by neighbors")
    assert.ok(result.pixels[4] < 255, "Center pixel should be affected by neighbors")
  })
})

const calculateVariance = (pixels: Uint8Array): number => {
  const mean = Array.from(pixels).reduce((sum, v) => sum + v, 0) / pixels.length
  const squaredDiffs = Array.from(pixels).map((v) => Math.pow(v - mean, 2))
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / pixels.length
}
