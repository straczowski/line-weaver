import assert from "node:assert"
import { describe, it } from "node:test"
import { optimizeLineOrder } from "./optimize-line-order.ts"

describe("optimizeLineOrder", () => {
  it("should return empty array for empty input", () => {
    const result = optimizeLineOrder([])

    assert.deepEqual(result, [])
  })

  it("should handle single polyline and reverse if needed", () => {
    const polylines = [
      [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
    ]
    const result = optimizeLineOrder(polylines)

    assert.strictEqual(result.length, 1)
    assert.deepEqual(result[0][0], { x: 10, y: 20 })
  })

  it("should order polylines by nearest neighbor from origin", () => {
    const polylines = [
      [
        { x: 100, y: 100 },
        { x: 150, y: 150 },
      ],
      [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
    ]
    const result = optimizeLineOrder(polylines)

    assert.deepEqual(result[0][0], { x: 10, y: 10 })
  })

  it("should reverse polyline when end is closer than start", () => {
    const polylines = [
      [
        { x: 100, y: 100 },
        { x: 5, y: 5 },
      ],
    ]
    const result = optimizeLineOrder(polylines)

    assert.deepEqual(result[0][0], { x: 5, y: 5 })
    assert.deepEqual(result[0][1], { x: 100, y: 100 })
  })

  it("should start from origin (0, 0)", () => {
    const polylines = [
      [
        { x: 50, y: 50 },
        { x: 60, y: 60 },
      ],
      [
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ],
    ]
    const result = optimizeLineOrder(polylines)

    const firstPolylineStart = result[0][0]
    const distanceToOrigin = Math.sqrt(firstPolylineStart.x ** 2 + firstPolylineStart.y ** 2)

    assert.ok(distanceToOrigin < 15)
  })

  it("should preserve all polylines (no loss)", () => {
    const polylines = [
      [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
      [
        { x: 30, y: 30 },
        { x: 40, y: 40 },
      ],
      [
        { x: 50, y: 50 },
        { x: 60, y: 60 },
      ],
    ]
    const result = optimizeLineOrder(polylines)

    assert.strictEqual(result.length, 3)
  })

  it("should filter out invalid polylines with less than 2 points", () => {
    const polylines = [
      [{ x: 10, y: 10 }],
      [
        { x: 20, y: 20 },
        { x: 30, y: 30 },
      ],
      [],
    ]
    const result = optimizeLineOrder(polylines)

    assert.strictEqual(result.length, 1)
    assert.deepEqual(result[0][0], { x: 20, y: 20 })
  })

  it("should chain polylines efficiently", () => {
    const polylines = [
      [
        { x: 80, y: 80 },
        { x: 90, y: 90 },
      ],
      [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
      [
        { x: 20, y: 20 },
        { x: 30, y: 30 },
      ],
    ]
    const result = optimizeLineOrder(polylines)

    assert.deepEqual(result[0][0], { x: 10, y: 10 })
    assert.deepEqual(result[1][0], { x: 20, y: 20 })
  })

  it("should handle polylines with same start and end", () => {
    const polylines = [
      [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 10, y: 10 },
      ],
    ]
    const result = optimizeLineOrder(polylines)

    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 3)
  })
})
