import assert from "node:assert"
import { describe, it } from "node:test"
import { vectorizeImage } from "./vectorize-image"
import type { ProcessingConfig } from "./types"

const createImageData = (width: number, height: number, rgba: number[]): ImageData => ({
  width,
  height,
  data: new Uint8ClampedArray(rgba),
  colorSpace: "srgb",
})

const createSettings = (overrides: Partial<ProcessingConfig> = {}): ProcessingConfig => ({
  gridSize: 16,
  strokeWidth: 1,
  enableContours: true,
  enableHatching: true,
  noiseAmount: 0,
  contourSimplify: 2,
  threshold: 128,
  blurRadius: 1,
  edgeLowThreshold: 50,
  edgeHighThreshold: 150,
  hatchAngle: 45,
  hatchDensity: 4,
  enableCrossHatch: true,
  minLineLength: 0,
  ...overrides,
})

describe("vectorizeImage", () => {
  it("should return polylines array for valid input", () => {
    const imageData = createImageData(16, 16, new Array(16 * 16 * 4).fill(128))
    const settings = createSettings()

    const result = vectorizeImage({ imageData, settings })

    assert.ok(Array.isArray(result.polylines))
  })

  it("should return empty array for all-white image", () => {
    const rgba = []
    for (let i = 0; i < 16 * 16; i++) {
      rgba.push(255, 255, 255, 255)
    }
    const imageData = createImageData(16, 16, rgba)
    const settings = createSettings()

    const result = vectorizeImage({ imageData, settings })

    assert.equal(result.polylines.length, 0)
  })

  it("should generate lines for dark image", () => {
    const rgba = []
    for (let i = 0; i < 16 * 16; i++) {
      rgba.push(0, 0, 0, 255)
    }
    const imageData = createImageData(16, 16, rgba)
    const settings = createSettings()

    const result = vectorizeImage({ imageData, settings })

    assert.ok(result.polylines.length > 0)
  })

  it("should respect gridSize setting", () => {
    const rgba = []
    for (let i = 0; i < 32 * 32; i++) {
      rgba.push(100, 100, 100, 255)
    }
    const imageData = createImageData(32, 32, rgba)

    const smallGrid = vectorizeImage({ imageData, settings: createSettings({ gridSize: 8 }) })
    const largeGrid = vectorizeImage({ imageData, settings: createSettings({ gridSize: 32 }) })

    assert.ok(smallGrid.polylines.length > largeGrid.polylines.length)
  })

  it("should respect threshold setting", () => {
    const rgba = []
    for (let i = 0; i < 16 * 16; i++) {
      rgba.push(180, 180, 180, 255)
    }
    const imageData = createImageData(16, 16, rgba)

    const lowThreshold = vectorizeImage({ imageData, settings: createSettings({ threshold: 64 }) })
    const highThreshold = vectorizeImage({
      imageData,
      settings: createSettings({ threshold: 192 }),
    })

    assert.ok(lowThreshold.polylines.length >= highThreshold.polylines.length)
  })

  it("should include grid metadata in output", () => {
    const imageData = createImageData(32, 32, new Array(32 * 32 * 4).fill(128))
    const settings = createSettings({ gridSize: 16 })

    const result = vectorizeImage({ imageData, settings })

    assert.equal(result.grid.cols, 2)
    assert.equal(result.grid.rows, 2)
    assert.equal(result.grid.cellSize, 16)
  })

  it("should produce polylines with valid point structure", () => {
    const rgba = []
    for (let i = 0; i < 16 * 16; i++) {
      rgba.push(50, 50, 50, 255)
    }
    const imageData = createImageData(16, 16, rgba)
    const settings = createSettings()

    const result = vectorizeImage({ imageData, settings })

    assert.ok(result.polylines.length > 0)
    const firstLine = result.polylines[0]
    assert.ok("x" in firstLine[0])
    assert.ok("y" in firstLine[0])
  })

  it("should handle non-square images", () => {
    const rgba = []
    for (let i = 0; i < 32 * 16; i++) {
      rgba.push(100, 100, 100, 255)
    }
    const imageData = createImageData(32, 16, rgba)
    const settings = createSettings({ gridSize: 16 })

    const result = vectorizeImage({ imageData, settings })

    assert.equal(result.grid.cols, 2)
    assert.equal(result.grid.rows, 1)
  })

  it("should handle grayscale conversion correctly in pipeline", () => {
    const rgba = []
    for (let i = 0; i < 16 * 16; i++) {
      rgba.push(255, 0, 0, 255)
    }
    const imageData = createImageData(16, 16, rgba)
    const settings = createSettings()

    const result = vectorizeImage({ imageData, settings })

    assert.ok(result.grid.values[0][0] < 100)
  })
})

