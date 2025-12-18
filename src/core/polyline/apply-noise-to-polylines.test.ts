import assert from "node:assert"
import { describe, it } from "node:test"
import { applyNoiseToPolylines } from "./apply-noise-to-polylines.ts"
import type { Polyline } from "../types.ts"

describe("applyNoiseToPolylines", () => {
  const createHorizontalLine = (): Polyline => [
    { x: 0, y: 50 },
    { x: 25, y: 50 },
    { x: 50, y: 50 },
    { x: 75, y: 50 },
    { x: 100, y: 50 },
  ]

  it("should return original polylines when noiseAmount is 0", () => {
    const input: Polyline[] = [createHorizontalLine()]

    const result = applyNoiseToPolylines({ polylines: input, noiseAmount: 0 })

    assert.deepStrictEqual(result, input)
  })

  it("should return original polylines when noiseAmount is negative", () => {
    const input: Polyline[] = [createHorizontalLine()]

    const result = applyNoiseToPolylines({ polylines: input, noiseAmount: -1 })

    assert.deepStrictEqual(result, input)
  })

  it("should displace points when noiseAmount is positive", () => {
    const input: Polyline[] = [createHorizontalLine()]

    const result = applyNoiseToPolylines({ polylines: input, noiseAmount: 5 })

    const hasDisplacement = result[0].some((point, i) => point.x !== input[0][i].x || point.y !== input[0][i].y)
    assert.strictEqual(hasDisplacement, true)
  })

  it("should preserve polyline structure", () => {
    const input: Polyline[] = [createHorizontalLine()]

    const result = applyNoiseToPolylines({ polylines: input, noiseAmount: 5 })

    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, input[0].length)
  })

  it("should handle multiple polylines", () => {
    const input: Polyline[] = [createHorizontalLine(), createHorizontalLine()]

    const result = applyNoiseToPolylines({ polylines: input, noiseAmount: 5 })

    assert.strictEqual(result.length, 2)
  })

  it("should handle empty polylines array", () => {
    const result = applyNoiseToPolylines({ polylines: [], noiseAmount: 5 })

    assert.deepStrictEqual(result, [])
  })

  it("should handle polyline with single point", () => {
    const input: Polyline[] = [[{ x: 50, y: 50 }]]

    const result = applyNoiseToPolylines({ polylines: input, noiseAmount: 5 })

    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 1)
  })

  it("should produce coherent displacement (adjacent points move similarly)", () => {
    const input: Polyline[] = [createHorizontalLine()]

    const result = applyNoiseToPolylines({ polylines: input, noiseAmount: 10, noiseScale: 0.01 })

    const displacements = result[0].map((point, i) => point.y - input[0][i].y)
    const maxDiff = displacements.reduce((max, d, i) => {
      if (i === 0) return max
      return Math.max(max, Math.abs(d - displacements[i - 1]))
    }, 0)

    assert.ok(maxDiff < 5, `Adjacent displacements should be similar, got max diff: ${maxDiff}`)
  })

  it("should increase displacement with higher noiseAmount", () => {
    const input: Polyline[] = [createHorizontalLine()]

    const resultLow = applyNoiseToPolylines({ polylines: input, noiseAmount: 1 })
    const resultHigh = applyNoiseToPolylines({ polylines: input, noiseAmount: 10 })

    const avgDisplacementLow = calculateAverageDisplacement(input[0], resultLow[0])
    const avgDisplacementHigh = calculateAverageDisplacement(input[0], resultHigh[0])

    assert.ok(avgDisplacementHigh > avgDisplacementLow)
  })

  it("should be deterministic (same input produces same output)", () => {
    const input: Polyline[] = [createHorizontalLine()]

    const result1 = applyNoiseToPolylines({ polylines: input, noiseAmount: 5 })
    const result2 = applyNoiseToPolylines({ polylines: input, noiseAmount: 5 })

    assert.deepStrictEqual(result1, result2)
  })
})

const calculateAverageDisplacement = (original: Polyline, displaced: Polyline): number => {
  const totalDisplacement = original.reduce((sum, point, i) => {
    const dx = displaced[i].x - point.x
    const dy = displaced[i].y - point.y
    return sum + Math.sqrt(dx * dx + dy * dy)
  }, 0)
  return totalDisplacement / original.length
}
