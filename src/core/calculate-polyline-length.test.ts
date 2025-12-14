import assert from "node:assert"
import { describe, it } from "node:test"
import { calculatePolylineLength } from "./calculate-polyline-length"

describe("calculatePolylineLength", () => {
  it("should return 0 for empty polyline", () => {
    const result = calculatePolylineLength({ polyline: [] })

    assert.strictEqual(result, 0)
  })

  it("should return 0 for single point polyline", () => {
    const result = calculatePolylineLength({
      polyline: [{ x: 5, y: 5 }],
    })

    assert.strictEqual(result, 0)
  })

  it("should return correct distance for horizontal line", () => {
    const result = calculatePolylineLength({
      polyline: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    })

    assert.strictEqual(result, 10)
  })

  it("should return correct distance for vertical line", () => {
    const result = calculatePolylineLength({
      polyline: [
        { x: 0, y: 0 },
        { x: 0, y: 7 },
      ],
    })

    assert.strictEqual(result, 7)
  })

  it("should return correct distance for diagonal line (3-4-5 triangle)", () => {
    const result = calculatePolylineLength({
      polyline: [
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ],
    })

    assert.strictEqual(result, 5)
  })

  it("should return sum of all segments for multi-segment polyline", () => {
    const result = calculatePolylineLength({
      polyline: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    })

    assert.strictEqual(result, 20)
  })

  it("should handle negative coordinates", () => {
    const result = calculatePolylineLength({
      polyline: [
        { x: -5, y: -5 },
        { x: -5, y: 5 },
      ],
    })

    assert.strictEqual(result, 10)
  })

  it("should handle floating point coordinates", () => {
    const result = calculatePolylineLength({
      polyline: [
        { x: 0, y: 0 },
        { x: 1.5, y: 0 },
      ],
    })

    assert.strictEqual(result, 1.5)
  })
})

