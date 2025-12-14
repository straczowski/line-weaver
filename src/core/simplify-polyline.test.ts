import assert from "node:assert"
import { describe, it } from "node:test"
import { mapSimplifyLevelToEpsilon, simplifyPolyline } from "./simplify-polyline"
import type { Polyline } from "./types"

describe("simplifyPolyline", () => {
  it("should keep only endpoints for straight line", () => {
    const polyline: Polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ]

    const result = simplifyPolyline({ polyline, epsilon: 0.1 })

    assert.strictEqual(result.length, 2)
    assert.deepStrictEqual(result[0], { x: 0, y: 0 })
    assert.deepStrictEqual(result[1], { x: 4, y: 0 })
  })

  it("should retain key points on complex curve", () => {
    const polyline: Polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 5 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
    ]

    const result = simplifyPolyline({ polyline, epsilon: 1 })

    assert.ok(result.length >= 3, `Expected at least 3 points, got ${result.length}`)
    const hasMiddlePoint = result.some((p) => p.x === 2 && p.y === 5)
    assert.strictEqual(hasMiddlePoint, true, "Should retain significant point")
  })

  it("should return original when epsilon is 0", () => {
    const polyline: Polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0.1 },
      { x: 2, y: 0 },
    ]

    const result = simplifyPolyline({ polyline, epsilon: 0 })

    assert.deepStrictEqual(result, polyline)
  })

  it("should return only endpoints with high epsilon", () => {
    const polyline: Polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0.5 },
      { x: 3, y: 2 },
      { x: 4, y: 0 },
    ]

    const result = simplifyPolyline({ polyline, epsilon: 100 })

    assert.strictEqual(result.length, 2)
    assert.deepStrictEqual(result[0], { x: 0, y: 0 })
    assert.deepStrictEqual(result[1], { x: 4, y: 0 })
  })

  it("should return original for polyline with 2 points", () => {
    const polyline: Polyline = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ]

    const result = simplifyPolyline({ polyline, epsilon: 1 })

    assert.deepStrictEqual(result, polyline)
  })

  it("should return original for polyline with 1 point", () => {
    const polyline: Polyline = [{ x: 5, y: 5 }]

    const result = simplifyPolyline({ polyline, epsilon: 1 })

    assert.deepStrictEqual(result, polyline)
  })

  it("should return empty for empty polyline", () => {
    const result = simplifyPolyline({ polyline: [], epsilon: 1 })

    assert.deepStrictEqual(result, [])
  })

  it("should preserve first and last points", () => {
    const polyline: Polyline = [
      { x: 0, y: 0 },
      { x: 1, y: 0.1 },
      { x: 2, y: 0 },
      { x: 3, y: -0.1 },
      { x: 4, y: 0 },
    ]

    const result = simplifyPolyline({ polyline, epsilon: 1 })

    assert.deepStrictEqual(result[0], polyline[0])
    assert.deepStrictEqual(result[result.length - 1], polyline[polyline.length - 1])
  })

  it("should handle L-shaped polyline", () => {
    const polyline: Polyline = [
      { x: 0, y: 0 },
      { x: 0, y: 5 },
      { x: 5, y: 5 },
    ]

    const result = simplifyPolyline({ polyline, epsilon: 0.5 })

    assert.strictEqual(result.length, 3)
  })
})

describe("mapSimplifyLevelToEpsilon", () => {
  it("should map level 1 to 0.5", () => {
    assert.strictEqual(mapSimplifyLevelToEpsilon(1), 0.5)
  })

  it("should map level 2 to 1.0", () => {
    assert.strictEqual(mapSimplifyLevelToEpsilon(2), 1.0)
  })

  it("should map level 3 to 2.0", () => {
    assert.strictEqual(mapSimplifyLevelToEpsilon(3), 2.0)
  })

  it("should map level 4 to 4.0", () => {
    assert.strictEqual(mapSimplifyLevelToEpsilon(4), 4.0)
  })

  it("should map level 5 to 8.0", () => {
    assert.strictEqual(mapSimplifyLevelToEpsilon(5), 8.0)
  })

  it("should return default for unknown level", () => {
    assert.strictEqual(mapSimplifyLevelToEpsilon(99), 1.0)
  })
})

