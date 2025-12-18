import assert from "node:assert"
import { describe, it } from "node:test"
import { scalePolylines } from "./scale-polylines.ts"

describe("scalePolylines", () => {
  const defaultSheetSettings = {
    targetX: 211,
    targetY: 297,
    padding: 20,
  }

  it("should return empty array for empty polylines", () => {
    const result = scalePolylines({
      polylines: [],
      sourceDimensions: { width: 100, height: 100 },
      sheetSettings: defaultSheetSettings,
    })

    assert.deepEqual(result, [])
  })

  it("should scale polylines to fit within drawable area", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
    ]
    const result = scalePolylines({
      polylines,
      sourceDimensions: { width: 100, height: 100 },
      sheetSettings: defaultSheetSettings,
    })

    const firstPoint = result[0][0]
    const lastPoint = result[0][1]

    assert.ok(firstPoint.x >= defaultSheetSettings.padding)
    assert.ok(firstPoint.y >= defaultSheetSettings.padding)
    assert.ok(lastPoint.x <= defaultSheetSettings.targetX - defaultSheetSettings.padding)
    assert.ok(lastPoint.y <= defaultSheetSettings.targetY - defaultSheetSettings.padding)
  })

  it("should maintain 1:1 aspect ratio", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 100, y: 50 },
      ],
    ]
    const result = scalePolylines({
      polylines,
      sourceDimensions: { width: 100, height: 50 },
      sheetSettings: defaultSheetSettings,
    })

    const scaledWidth = result[0][1].x - result[0][0].x
    const scaledHeight = result[0][1].y - result[0][0].y

    const scaledRatioX = scaledWidth / 100
    const scaledRatioY = scaledHeight / 50

    assert.strictEqual(scaledRatioX.toFixed(4), scaledRatioY.toFixed(4))
  })

  it("should center content when aspect ratios differ", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
    ]
    const result = scalePolylines({
      polylines,
      sourceDimensions: { width: 100, height: 100 },
      sheetSettings: defaultSheetSettings,
    })

    const drawableWidth = defaultSheetSettings.targetX - 2 * defaultSheetSettings.padding
    const drawableHeight = defaultSheetSettings.targetY - 2 * defaultSheetSettings.padding
    const scale = Math.min(drawableWidth / 100, drawableHeight / 100)
    const scaledSize = 100 * scale

    const expectedOffsetX = defaultSheetSettings.padding + (drawableWidth - scaledSize) / 2
    const expectedOffsetY = defaultSheetSettings.padding + (drawableHeight - scaledSize) / 2

    assert.strictEqual(result[0][0].x.toFixed(2), expectedOffsetX.toFixed(2))
    assert.strictEqual(result[0][0].y.toFixed(2), expectedOffsetY.toFixed(2))
  })

  it("should apply padding correctly", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
    ]
    const result = scalePolylines({
      polylines,
      sourceDimensions: { width: 100, height: 100 },
      sheetSettings: { targetX: 100, targetY: 100, padding: 10 },
    })

    assert.ok(result[0][0].x >= 10)
    assert.ok(result[0][0].y >= 10)
    assert.ok(result[0][1].x <= 90)
    assert.ok(result[0][1].y <= 90)
  })

  it("should handle single point polylines", () => {
    const polylines = [[{ x: 50, y: 50 }]]
    const result = scalePolylines({
      polylines,
      sourceDimensions: { width: 100, height: 100 },
      sheetSettings: defaultSheetSettings,
    })

    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 1)
  })

  it("should handle multiple polylines", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 50, y: 50 },
      ],
      [
        { x: 50, y: 50 },
        { x: 100, y: 100 },
      ],
    ]
    const result = scalePolylines({
      polylines,
      sourceDimensions: { width: 100, height: 100 },
      sheetSettings: defaultSheetSettings,
    })

    assert.strictEqual(result.length, 2)
  })
})
