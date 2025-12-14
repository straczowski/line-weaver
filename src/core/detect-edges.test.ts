import assert from "node:assert"
import { describe, it } from "node:test"
import { detectEdges } from "./detect-edges"
import type { GrayscaleData } from "./types"

describe("detectEdges", () => {
  const createUniformImage = (value: number, width = 10, height = 10): GrayscaleData => ({
    width,
    height,
    pixels: new Uint8Array(width * height).fill(value),
  })

  const createVerticalEdge = (): GrayscaleData => {
    const width = 10
    const height = 10
    const pixels = new Uint8Array(width * height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        pixels[y * width + x] = x < 5 ? 0 : 255
      }
    }
    return { width, height, pixels }
  }

  const createHorizontalEdge = (): GrayscaleData => {
    const width = 10
    const height = 10
    const pixels = new Uint8Array(width * height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        pixels[y * width + x] = y < 5 ? 0 : 255
      }
    }
    return { width, height, pixels }
  }

  const createDiagonalEdge = (): GrayscaleData => {
    const width = 10
    const height = 10
    const pixels = new Uint8Array(width * height)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        pixels[y * width + x] = x + y < 10 ? 0 : 255
      }
    }
    return { width, height, pixels }
  }

  it("should detect vertical edges", () => {
    const input = createVerticalEdge()

    const result = detectEdges({ grayscaleData: input })

    const hasEdges = Array.from(result.edges).some((v) => v === 255)
    assert.strictEqual(hasEdges, true, "Should detect vertical edge")
  })

  it("should detect horizontal edges", () => {
    const input = createHorizontalEdge()

    const result = detectEdges({ grayscaleData: input })

    const hasEdges = Array.from(result.edges).some((v) => v === 255)
    assert.strictEqual(hasEdges, true, "Should detect horizontal edge")
  })

  it("should detect diagonal edges", () => {
    const input = createDiagonalEdge()

    const result = detectEdges({ grayscaleData: input })

    const hasEdges = Array.from(result.edges).some((v) => v === 255)
    assert.strictEqual(hasEdges, true, "Should detect diagonal edge")
  })

  it("should return no edges for uniform image", () => {
    const input = createUniformImage(128)

    const result = detectEdges({ grayscaleData: input })

    const hasEdges = Array.from(result.edges).some((v) => v === 255)
    assert.strictEqual(hasEdges, false, "Uniform image should have no edges")
  })

  it("should filter weak edges with higher threshold", () => {
    const input = createVerticalEdge()

    const resultLow = detectEdges({ grayscaleData: input, lowThreshold: 10, highThreshold: 50 })
    const resultHigh = detectEdges({ grayscaleData: input, lowThreshold: 200, highThreshold: 250 })

    const edgeCountLow = Array.from(resultLow.edges).filter((v) => v === 255).length
    const edgeCountHigh = Array.from(resultHigh.edges).filter((v) => v === 255).length

    assert.ok(edgeCountLow >= edgeCountHigh, "Higher threshold should detect fewer edges")
  })

  it("should preserve image dimensions", () => {
    const input = createUniformImage(128, 15, 20)

    const result = detectEdges({ grayscaleData: input })

    assert.strictEqual(result.width, 15)
    assert.strictEqual(result.height, 20)
    assert.strictEqual(result.edges.length, 300)
  })

  it("should only produce 0 or 255 values in edges", () => {
    const input = createVerticalEdge()

    const result = detectEdges({ grayscaleData: input })

    const validValues = Array.from(result.edges).every((v) => v === 0 || v === 255)
    assert.strictEqual(validValues, true, "Edges should only be 0 or 255")
  })

  it("should handle small images", () => {
    const input: GrayscaleData = {
      width: 3,
      height: 3,
      pixels: new Uint8Array([0, 0, 255, 0, 0, 255, 0, 0, 255]),
    }

    const result = detectEdges({ grayscaleData: input })

    assert.strictEqual(result.edges.length, 9)
  })

  it("should use default thresholds when not provided", () => {
    const input = createVerticalEdge()

    const result = detectEdges({ grayscaleData: input })

    assert.ok(result.edges.length > 0)
  })
})

