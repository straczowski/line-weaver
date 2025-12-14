import assert from "node:assert"
import { describe, it } from "node:test"
import { filterSmallPolylines } from "./filter-small-polylines"

describe("filterSmallPolylines", () => {
  it("should return all polylines when minLength is 0", () => {
    const polylines = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      [{ x: 0, y: 0 }, { x: 10, y: 0 }],
    ]

    const result = filterSmallPolylines({ polylines, minLength: 0 })

    assert.strictEqual(result.polylines.length, 2)
    assert.strictEqual(result.removedCount, 0)
    assert.strictEqual(result.originalCount, 2)
  })

  it("should return all polylines when minLength is negative", () => {
    const polylines = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }],
    ]

    const result = filterSmallPolylines({ polylines, minLength: -5 })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.removedCount, 0)
  })

  it("should filter out single-point polylines when minLength > 0", () => {
    const polylines = [
      [{ x: 0, y: 0 }],
      [{ x: 0, y: 0 }, { x: 10, y: 0 }],
    ]

    const result = filterSmallPolylines({ polylines, minLength: 1 })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.removedCount, 1)
    assert.deepStrictEqual(result.polylines[0], [{ x: 0, y: 0 }, { x: 10, y: 0 }])
  })

  it("should filter out short two-point lines", () => {
    const polylines = [
      [{ x: 0, y: 0 }, { x: 2, y: 0 }],
      [{ x: 0, y: 0 }, { x: 10, y: 0 }],
    ]

    const result = filterSmallPolylines({ polylines, minLength: 5 })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.removedCount, 1)
  })

  it("should keep polylines at exactly minLength", () => {
    const polylines = [
      [{ x: 0, y: 0 }, { x: 5, y: 0 }],
    ]

    const result = filterSmallPolylines({ polylines, minLength: 5 })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.removedCount, 0)
  })

  it("should keep polylines above minLength", () => {
    const polylines = [
      [{ x: 0, y: 0 }, { x: 10, y: 0 }],
    ]

    const result = filterSmallPolylines({ polylines, minLength: 5 })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.removedCount, 0)
  })

  it("should return correct statistics", () => {
    const polylines = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      [{ x: 0, y: 0 }, { x: 2, y: 0 }],
      [{ x: 0, y: 0 }, { x: 10, y: 0 }],
      [{ x: 0, y: 0 }, { x: 15, y: 0 }],
    ]

    const result = filterSmallPolylines({ polylines, minLength: 5 })

    assert.strictEqual(result.originalCount, 4)
    assert.strictEqual(result.removedCount, 2)
    assert.strictEqual(result.polylines.length, 2)
  })

  it("should return empty output for empty input", () => {
    const result = filterSmallPolylines({ polylines: [], minLength: 5 })

    assert.strictEqual(result.polylines.length, 0)
    assert.strictEqual(result.removedCount, 0)
    assert.strictEqual(result.originalCount, 0)
  })

  it("should filter all polylines if all are too short", () => {
    const polylines = [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      [{ x: 0, y: 0 }, { x: 2, y: 0 }],
    ]

    const result = filterSmallPolylines({ polylines, minLength: 10 })

    assert.strictEqual(result.polylines.length, 0)
    assert.strictEqual(result.removedCount, 2)
    assert.strictEqual(result.originalCount, 2)
  })
})

