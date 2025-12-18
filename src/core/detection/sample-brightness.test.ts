import assert from "node:assert"
import { describe, it } from "node:test"
import { sampleBrightness } from "./sample-brightness.ts"
import type { GrayscaleData } from "../types.ts"

const createGrayscaleData = (width: number, height: number, pixels: number[]): GrayscaleData => ({
  width,
  height,
  pixels: new Uint8Array(pixels),
})

describe("sampleBrightness", () => {
  it("should calculate correct grid dimensions for exact fit", () => {
    const grayscaleData = createGrayscaleData(32, 32, new Array(32 * 32).fill(128))

    const result = sampleBrightness({ grayscaleData, cellSize: 16 })

    assert.equal(result.cols, 2)
    assert.equal(result.rows, 2)
  })

  it("should calculate correct grid dimensions with remainder", () => {
    const grayscaleData = createGrayscaleData(30, 30, new Array(30 * 30).fill(128))

    const result = sampleBrightness({ grayscaleData, cellSize: 16 })

    assert.equal(result.cols, 2)
    assert.equal(result.rows, 2)
  })

  it("should calculate average brightness for uniform cell", () => {
    const grayscaleData = createGrayscaleData(16, 16, new Array(16 * 16).fill(200))

    const result = sampleBrightness({ grayscaleData, cellSize: 16 })

    assert.equal(result.values[0][0], 200)
  })

  it("should handle edge cells correctly", () => {
    const grayscaleData = createGrayscaleData(20, 20, new Array(20 * 20).fill(100))

    const result = sampleBrightness({ grayscaleData, cellSize: 16 })

    assert.equal(result.cols, 2)
    assert.equal(result.rows, 2)
    assert.equal(result.values[1][1], 100)
  })

  it("should return values in 0-255 range", () => {
    const pixels = new Array(16 * 16).fill(0).map((_, i) => i % 256)
    const grayscaleData = createGrayscaleData(16, 16, pixels)

    const result = sampleBrightness({ grayscaleData, cellSize: 16 })

    assert.ok(result.values[0][0] >= 0)
    assert.ok(result.values[0][0] <= 255)
  })

  it("should handle single cell image", () => {
    const grayscaleData = createGrayscaleData(8, 8, new Array(8 * 8).fill(150))

    const result = sampleBrightness({ grayscaleData, cellSize: 16 })

    assert.equal(result.cols, 1)
    assert.equal(result.rows, 1)
    assert.equal(result.values[0][0], 150)
  })

  it("should handle large cell size larger than image", () => {
    const grayscaleData = createGrayscaleData(10, 10, new Array(10 * 10).fill(75))

    const result = sampleBrightness({ grayscaleData, cellSize: 32 })

    assert.equal(result.cols, 1)
    assert.equal(result.rows, 1)
    assert.equal(result.values[0][0], 75)
  })

  it("should preserve cell size in output", () => {
    const grayscaleData = createGrayscaleData(32, 32, new Array(32 * 32).fill(128))

    const result = sampleBrightness({ grayscaleData, cellSize: 8 })

    assert.equal(result.cellSize, 8)
  })

  it("should calculate correct average for mixed brightness", () => {
    const pixels = [0, 100, 200, 255]
    const grayscaleData = createGrayscaleData(2, 2, pixels)

    const result = sampleBrightness({ grayscaleData, cellSize: 2 })

    assert.equal(result.values[0][0], 139)
  })

  it("should create 2D array with correct structure", () => {
    const grayscaleData = createGrayscaleData(32, 16, new Array(32 * 16).fill(128))

    const result = sampleBrightness({ grayscaleData, cellSize: 16 })

    assert.equal(result.values.length, 1)
    assert.equal(result.values[0].length, 2)
  })

  it("should handle different brightness in different cells", () => {
    const pixels: number[] = []
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        pixels.push(50)
      }
      for (let x = 0; x < 8; x++) {
        pixels.push(200)
      }
    }
    const grayscaleData = createGrayscaleData(16, 8, pixels)

    const result = sampleBrightness({ grayscaleData, cellSize: 8 })

    assert.equal(result.values[0][0], 50)
    assert.equal(result.values[0][1], 200)
  })
})
