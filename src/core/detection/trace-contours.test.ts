import assert from "node:assert"
import { describe, it } from "node:test"
import type { EdgeData } from "./detect-edges.ts"
import { traceContours } from "./trace-contours.ts"

describe("traceContours", () => {
  const createEdgeData = (width: number, height: number, edgePixels: [number, number][]): EdgeData => {
    const edges = new Uint8Array(width * height)
    for (const [x, y] of edgePixels) {
      edges[y * width + x] = 255
    }
    return { width, height, edges }
  }

  it("should trace horizontal line", () => {
    const edgeData = createEdgeData(10, 5, [
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
      [6, 2],
    ])

    const result = traceContours({ edgeData })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.polylines[0].length, 5)
  })

  it("should trace vertical line", () => {
    const edgeData = createEdgeData(5, 10, [
      [2, 2],
      [2, 3],
      [2, 4],
      [2, 5],
      [2, 6],
    ])

    const result = traceContours({ edgeData })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.polylines[0].length, 5)
  })

  it("should trace diagonal line", () => {
    const edgeData = createEdgeData(10, 10, [
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
    ])

    const result = traceContours({ edgeData })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.polylines[0].length, 4)
  })

  it("should return empty for no edges", () => {
    const edgeData = createEdgeData(10, 10, [])

    const result = traceContours({ edgeData })

    assert.strictEqual(result.polylines.length, 0)
  })

  it("should trace multiple separate contours", () => {
    const edgeData = createEdgeData(10, 10, [
      [1, 1],
      [2, 1],
      [3, 1],
      [7, 7],
      [8, 7],
      [9, 7],
    ])

    const result = traceContours({ edgeData })

    assert.strictEqual(result.polylines.length, 2)
  })

  it("should handle single edge pixel (returns empty)", () => {
    const edgeData = createEdgeData(5, 5, [[2, 2]])

    const result = traceContours({ edgeData })

    assert.strictEqual(result.polylines.length, 0)
  })

  it("should trace L-shaped contour", () => {
    const edgeData = createEdgeData(10, 10, [
      [2, 2],
      [3, 2],
      [4, 2],
      [4, 3],
      [4, 4],
    ])

    const result = traceContours({ edgeData })

    assert.strictEqual(result.polylines.length, 1)
    assert.strictEqual(result.polylines[0].length, 5)
  })

  it("should preserve point coordinates correctly", () => {
    const edgeData = createEdgeData(10, 10, [
      [5, 3],
      [6, 3],
    ])

    const result = traceContours({ edgeData })

    assert.strictEqual(result.polylines.length, 1)
    const points = result.polylines[0]
    const hasCorrectCoords = points.some((p) => p.x === 5 && p.y === 3)
    assert.strictEqual(hasCorrectCoords, true)
  })

  it("should not revisit pixels", () => {
    const edgeData = createEdgeData(5, 5, [
      [1, 1],
      [2, 1],
      [2, 2],
      [1, 2],
    ])

    const result = traceContours({ edgeData })

    const totalPoints = result.polylines.reduce((sum, p) => sum + p.length, 0)
    assert.strictEqual(totalPoints, 4)
  })
})
