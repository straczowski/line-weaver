import assert from "node:assert"
import { describe, it } from "node:test"
import { mergeConnectedPolylines } from "./merge-connected-polylines.ts"
import type { Point } from "../types.ts"

describe("mergeConnectedPolylines", () => {
  it("should return empty array for empty input", () => {
    const result = mergeConnectedPolylines({ polylines: [] })
    assert.deepEqual(result, [])
  })

  it("should return single polyline unchanged", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })
    assert.deepEqual(result, polylines)
  })

  it("should merge two polylines connected end-to-start", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ])
  })

  it("should merge two polylines connected end-to-end by reversing second", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        { x: 2, y: 2 },
        { x: 1, y: 1 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ])
  })

  it("should merge two polylines connected start-to-start by reversing one", () => {
    const polylines = [
      [
        { x: 1, y: 1 },
        { x: 0, y: 0 },
      ],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })

    assert.equal(result.length, 1)
    assert.equal(result[0].length, 3)

    const hasAllPoints = result[0].some((p: Point) => p.x === 0 && p.y === 0) && result[0].some((p: Point) => p.x === 1 && p.y === 1) && result[0].some((p: Point) => p.x === 2 && p.y === 2)
    assert.equal(hasAllPoints, true)
  })

  it("should merge chain of three connected polylines", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
      [
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ])
  })

  it("should handle multiple separate chains", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
      [
        { x: 10, y: 10 },
        { x: 11, y: 11 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })

    assert.equal(result.length, 2)
  })

  it("should not duplicate shared endpoint in merged result", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })

    const pointCount = result[0].filter((p: Point) => p.x === 1 && p.y === 1).length
    assert.equal(pointCount, 1)
  })

  it("should use tolerance for point comparison", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        { x: 1.0001, y: 1.0001 },
        { x: 2, y: 2 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines, tolerance: 0.01 })

    assert.equal(result.length, 1)
  })

  it("should not merge polylines outside tolerance", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
      [
        { x: 1.1, y: 1.1 },
        { x: 2, y: 2 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines, tolerance: 0.001 })

    assert.equal(result.length, 2)
  })

  it("should filter out invalid polylines with less than 2 points", () => {
    const polylines = [
      [{ x: 0, y: 0 }],
      [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ])
  })

  it("should handle polylines with many points", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
      [
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 },
      ],
    ]
    const result = mergeConnectedPolylines({ polylines })

    assert.equal(result.length, 1)
    assert.deepEqual(result[0], [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ])
  })
})
