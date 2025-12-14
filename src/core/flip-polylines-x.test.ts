import assert from "node:assert"
import { describe, it } from "node:test"
import { flipPolylinesX } from "./flip-polylines-x.ts"

describe("flipPolylinesX", () => {
  it("should flip X coordinates over the middle axis", () => {
    const polylines = [
      [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ],
    ]

    const result = flipPolylinesX({ polylines, sheetWidth: 100 })

    assert.deepStrictEqual(result, [
      [
        { x: 90, y: 20 },
        { x: 70, y: 40 },
      ],
    ])
  })

  it("should keep Y coordinates unchanged", () => {
    const polylines = [
      [
        { x: 25, y: 50 },
        { x: 75, y: 100 },
      ],
    ]

    const result = flipPolylinesX({ polylines, sheetWidth: 200 })

    assert.strictEqual(result[0][0].y, 50)
    assert.strictEqual(result[0][1].y, 100)
  })

  it("should keep center point at center", () => {
    const polylines = [[{ x: 100, y: 50 }]]

    const result = flipPolylinesX({ polylines, sheetWidth: 200 })

    assert.strictEqual(result[0][0].x, 100)
  })

  it("should handle multiple polylines", () => {
    const polylines = [
      [{ x: 10, y: 10 }],
      [{ x: 90, y: 90 }],
    ]

    const result = flipPolylinesX({ polylines, sheetWidth: 100 })

    assert.strictEqual(result[0][0].x, 90)
    assert.strictEqual(result[1][0].x, 10)
  })

  it("should return empty array for empty input", () => {
    const result = flipPolylinesX({ polylines: [], sheetWidth: 100 })

    assert.deepStrictEqual(result, [])
  })

  it("should handle points at edges", () => {
    const polylines = [
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ],
    ]

    const result = flipPolylinesX({ polylines, sheetWidth: 100 })

    assert.strictEqual(result[0][0].x, 100)
    assert.strictEqual(result[0][1].x, 0)
  })
})

