import assert from "node:assert"
import { beforeEach, describe, it } from "node:test"
import { loadImage } from "./load-image.ts"

const createMockFile = ({ name, type }: { name: string; type: string }): File => {
  return { name, type } as File
}

const createMockFileReader = (result: string | null, shouldError = false) => {
  return class MockFileReader {
    result: string | ArrayBuffer | null = null
    onload: (() => void) | null = null
    onerror: (() => void) | null = null

    readAsDataURL() {
      setTimeout(() => {
        if (shouldError) {
          this.onerror?.()
        } else {
          this.result = result
          this.onload?.()
        }
      }, 0)
    }
  }
}

const createMockImage = (width: number, height: number, shouldError = false) => {
  return class MockImage {
    src = ""
    naturalWidth = width
    naturalHeight = height
    onload: (() => void) | null = null
    onerror: (() => void) | null = null

    constructor() {
      setTimeout(() => {
        if (shouldError) {
          this.onerror?.()
        } else {
          this.onload?.()
        }
      }, 0)
    }
  }
}

describe("loadImage", () => {
  const originalFileReader = globalThis.FileReader
  const originalImage = globalThis.Image

  beforeEach(() => {
    globalThis.FileReader = originalFileReader
    globalThis.Image = originalImage
  })

  it("should load PNG image and return OriginalImageMetadata", async () => {
    const mockDataUrl = "data:image/png;base64,abc123"
    globalThis.FileReader = createMockFileReader(mockDataUrl) as unknown as typeof FileReader
    globalThis.Image = createMockImage(100, 200) as unknown as typeof Image

    const file = createMockFile({ name: "test.png", type: "image/png" })

    const result = await loadImage(file)

    assert.strictEqual(result.file, file)
    assert.strictEqual(result.dataUrl, mockDataUrl)
    assert.strictEqual(result.width, 100)
    assert.strictEqual(result.height, 200)
  })

  it("should load JPG image and return OriginalImageMetadata", async () => {
    const mockDataUrl = "data:image/jpeg;base64,xyz789"
    globalThis.FileReader = createMockFileReader(mockDataUrl) as unknown as typeof FileReader
    globalThis.Image = createMockImage(800, 600) as unknown as typeof Image

    const file = createMockFile({ name: "photo.jpg", type: "image/jpeg" })

    const result = await loadImage(file)

    assert.strictEqual(result.file, file)
    assert.strictEqual(result.dataUrl, mockDataUrl)
  })

  it("should extract correct dimensions from image", async () => {
    const mockDataUrl = "data:image/png;base64,test"
    globalThis.FileReader = createMockFileReader(mockDataUrl) as unknown as typeof FileReader
    globalThis.Image = createMockImage(1920, 1080) as unknown as typeof Image

    const file = createMockFile({ name: "hd.png", type: "image/png" })

    const result = await loadImage(file)

    assert.strictEqual(result.width, 1920)
    assert.strictEqual(result.height, 1080)
  })

  it("should generate valid data URL", async () => {
    const mockDataUrl = "data:image/png;base64,validBase64Content"
    globalThis.FileReader = createMockFileReader(mockDataUrl) as unknown as typeof FileReader
    globalThis.Image = createMockImage(50, 50) as unknown as typeof Image

    const file = createMockFile({ name: "small.png", type: "image/png" })

    const result = await loadImage(file)

    assert.ok(result.dataUrl.startsWith("data:"))
  })

  it("should reject with error when FileReader fails", async () => {
    globalThis.FileReader = createMockFileReader(null, true) as unknown as typeof FileReader

    const file = createMockFile({ name: "bad.png", type: "image/png" })

    await assert.rejects(async () => await loadImage(file), {
      message: "Failed to read file",
    })
  })

  it("should reject with error for corrupted image file", async () => {
    const mockDataUrl = "data:image/png;base64,corrupted"
    globalThis.FileReader = createMockFileReader(mockDataUrl) as unknown as typeof FileReader
    globalThis.Image = createMockImage(0, 0, true) as unknown as typeof Image

    const file = createMockFile({ name: "corrupted.png", type: "image/png" })

    await assert.rejects(async () => await loadImage(file), {
      message: "Failed to load image",
    })
  })
})
