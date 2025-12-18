import assert from "node:assert"
import { describe, it } from "node:test"
import { validateImageFile } from "./validate-image-file.ts"

const createMockFile = ({ type, size }: { type: string; size: number }): File => {
  return { type, size } as File
}

const MB = 1024 * 1024

describe("validateImageFile", () => {
  it("should accept valid PNG file", () => {
    const file = createMockFile({ type: "image/png", size: 1 * MB })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, true)
    assert.strictEqual(result.error, undefined)
  })

  it("should accept valid JPG file", () => {
    const file = createMockFile({ type: "image/jpeg", size: 1 * MB })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, true)
    assert.strictEqual(result.error, undefined)
  })

  it("should accept valid JPEG file with same mime type", () => {
    const file = createMockFile({ type: "image/jpeg", size: 1 * MB })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, true)
  })

  it("should reject GIF file with appropriate error", () => {
    const file = createMockFile({ type: "image/gif", size: 1 * MB })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, false)
    assert.strictEqual(result.error, "Only PNG and JPG images are allowed")
  })

  it("should reject WebP file with appropriate error", () => {
    const file = createMockFile({ type: "image/webp", size: 1 * MB })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, false)
    assert.strictEqual(result.error, "Only PNG and JPG images are allowed")
  })

  it("should reject file larger than 20MB", () => {
    const file = createMockFile({ type: "image/png", size: 21 * MB })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, false)
    assert.strictEqual(result.error, "Image must be smaller than 20MB")
  })

  it("should accept file exactly at 20MB boundary", () => {
    const file = createMockFile({ type: "image/png", size: 20 * MB })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, true)
  })

  it("should accept file just under 20MB", () => {
    const file = createMockFile({ type: "image/png", size: 20 * MB - 1 })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, true)
  })

  it("should reject file with unsupported mime type", () => {
    const file = createMockFile({ type: "application/pdf", size: 1 * MB })

    const result = validateImageFile(file)

    assert.strictEqual(result.isValid, false)
    assert.strictEqual(result.error, "Only PNG and JPG images are allowed")
  })
})
