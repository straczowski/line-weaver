import assert from "node:assert"
import { describe, it } from "node:test"
import { combinePolylines } from "./combine-polylines"
import type { Polyline } from "./types"

describe("combinePolylines", () => {
  const createContours = (): Polyline[] => [
    [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ],
    [
      { x: 20, y: 20 },
      { x: 30, y: 30 },
    ],
  ]

  const createHatching = (): Polyline[] => [
    [
      { x: 5, y: 0 },
      { x: 5, y: 10 },
    ],
    [
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ],
    [
      { x: 15, y: 0 },
      { x: 15, y: 10 },
    ],
  ]

  it("should combine both when both enabled", () => {
    const contours = createContours()
    const hatching = createHatching()

    const result = combinePolylines({
      contourPolylines: contours,
      hatchingPolylines: hatching,
      enableContours: true,
      enableHatching: true,
    })

    assert.strictEqual(result.length, 5)
  })

  it("should return only contours when hatching disabled", () => {
    const contours = createContours()
    const hatching = createHatching()

    const result = combinePolylines({
      contourPolylines: contours,
      hatchingPolylines: hatching,
      enableContours: true,
      enableHatching: false,
    })

    assert.strictEqual(result.length, 2)
    assert.deepStrictEqual(result, contours)
  })

  it("should return only hatching when contours disabled", () => {
    const contours = createContours()
    const hatching = createHatching()

    const result = combinePolylines({
      contourPolylines: contours,
      hatchingPolylines: hatching,
      enableContours: false,
      enableHatching: true,
    })

    assert.strictEqual(result.length, 3)
    assert.deepStrictEqual(result, hatching)
  })

  it("should return empty when both disabled", () => {
    const contours = createContours()
    const hatching = createHatching()

    const result = combinePolylines({
      contourPolylines: contours,
      hatchingPolylines: hatching,
      enableContours: false,
      enableHatching: false,
    })

    assert.strictEqual(result.length, 0)
  })

  it("should handle empty contours", () => {
    const hatching = createHatching()

    const result = combinePolylines({
      contourPolylines: [],
      hatchingPolylines: hatching,
      enableContours: true,
      enableHatching: true,
    })

    assert.strictEqual(result.length, 3)
  })

  it("should handle empty hatching", () => {
    const contours = createContours()

    const result = combinePolylines({
      contourPolylines: contours,
      hatchingPolylines: [],
      enableContours: true,
      enableHatching: true,
    })

    assert.strictEqual(result.length, 2)
  })

  it("should handle both empty", () => {
    const result = combinePolylines({
      contourPolylines: [],
      hatchingPolylines: [],
      enableContours: true,
      enableHatching: true,
    })

    assert.strictEqual(result.length, 0)
  })

  it("should place contours before hatching", () => {
    const contours: Polyline[] = [[{ x: 1, y: 1 }, { x: 2, y: 2 }]]
    const hatching: Polyline[] = [[{ x: 3, y: 3 }, { x: 4, y: 4 }]]

    const result = combinePolylines({
      contourPolylines: contours,
      hatchingPolylines: hatching,
      enableContours: true,
      enableHatching: true,
    })

    assert.deepStrictEqual(result[0], contours[0])
    assert.deepStrictEqual(result[1], hatching[0])
  })
})

