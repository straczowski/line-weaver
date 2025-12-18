import assert from "node:assert"
import { describe, it } from "node:test"
import { convertToGrayscale } from "./convert-to-grayscale.ts"

const createImageData = (width: number, height: number, rgba: number[]): ImageData => ({
  width,
  height,
  data: new Uint8ClampedArray(rgba),
  colorSpace: "srgb",
})

describe("convertToGrayscale", () => {
  it("should convert pure white to 255", () => {
    const imageData = createImageData(1, 1, [255, 255, 255, 255])

    const result = convertToGrayscale(imageData)

    assert.equal(result.pixels[0], 255)
  })

  it("should convert pure black to 0", () => {
    const imageData = createImageData(1, 1, [0, 0, 0, 255])

    const result = convertToGrayscale(imageData)

    assert.equal(result.pixels[0], 0)
  })

  it("should convert pure red correctly", () => {
    const imageData = createImageData(1, 1, [255, 0, 0, 255])

    const result = convertToGrayscale(imageData)

    assert.equal(result.pixels[0], 76)
  })

  it("should convert pure green correctly", () => {
    const imageData = createImageData(1, 1, [0, 255, 0, 255])

    const result = convertToGrayscale(imageData)

    assert.equal(result.pixels[0], 150)
  })

  it("should convert pure blue correctly", () => {
    const imageData = createImageData(1, 1, [0, 0, 255, 255])

    const result = convertToGrayscale(imageData)

    assert.equal(result.pixels[0], 29)
  })

  it("should handle single pixel image", () => {
    const imageData = createImageData(1, 1, [128, 128, 128, 255])

    const result = convertToGrayscale(imageData)

    assert.equal(result.width, 1)
    assert.equal(result.height, 1)
    assert.equal(result.pixels.length, 1)
  })

  it("should preserve image dimensions in output", () => {
    const imageData = createImageData(3, 2, [255, 255, 255, 255, 0, 0, 0, 255, 128, 128, 128, 255, 64, 64, 64, 255, 192, 192, 192, 255, 100, 100, 100, 255])

    const result = convertToGrayscale(imageData)

    assert.equal(result.width, 3)
    assert.equal(result.height, 2)
  })

  it("should produce correct array length", () => {
    const imageData = createImageData(4, 3, new Array(4 * 3 * 4).fill(128))

    const result = convertToGrayscale(imageData)

    assert.equal(result.pixels.length, 12)
  })

  it("should ignore alpha channel", () => {
    const opaqueImage = createImageData(1, 1, [100, 100, 100, 255])
    const transparentImage = createImageData(1, 1, [100, 100, 100, 0])

    const opaqueResult = convertToGrayscale(opaqueImage)
    const transparentResult = convertToGrayscale(transparentImage)

    assert.equal(opaqueResult.pixels[0], transparentResult.pixels[0])
  })

  it("should handle multiple pixels in correct order", () => {
    const imageData = createImageData(2, 1, [255, 255, 255, 255, 0, 0, 0, 255])

    const result = convertToGrayscale(imageData)

    assert.equal(result.pixels[0], 255)
    assert.equal(result.pixels[1], 0)
  })

  it("should return Uint8Array type", () => {
    const imageData = createImageData(1, 1, [128, 128, 128, 255])

    const result = convertToGrayscale(imageData)

    assert.ok(result.pixels instanceof Uint8Array)
  })
})
