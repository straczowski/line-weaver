import assert from "node:assert"
import { describe, it } from "node:test"
import { convertPolylineToPath } from "./convert-polyline-to-path.ts"

describe("convertPolylineToPath", () => {
  it("should return empty string for empty polyline", () => {
    const result = convertPolylineToPath([])

    assert.equal(result, "")
  })

  it("should return M command for single point", () => {
    const result = convertPolylineToPath([{ x: 10, y: 20 }])

    assert.equal(result, "M 10,20")
  })

  it("should return M and L commands for two points", () => {
    const result = convertPolylineToPath([
      { x: 0, y: 10 },
      { x: 20, y: 30 },
    ])

    assert.equal(result, "M 0,10 L 20,30")
  })

  it("should chain multiple L commands for longer polylines", () => {
    const result = convertPolylineToPath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 },
    ])

    assert.equal(result, "M 0,0 L 10,10 L 20,20 L 30,30")
  })

  it("should round coordinates to 2 decimal places", () => {
    const result = convertPolylineToPath([{ x: 10.12345, y: 20.98765 }])

    assert.equal(result, "M 10.12,20.99")
  })

  it("should omit unnecessary decimal places for integers", () => {
    const result = convertPolylineToPath([{ x: 10.0, y: 20.0 }])

    assert.equal(result, "M 10,20")
  })

  it("should handle negative coordinates", () => {
    const result = convertPolylineToPath([
      { x: -10, y: -20 },
      { x: -30, y: -40 },
    ])

    assert.equal(result, "M -10,-20 L -30,-40")
  })

  it("should handle zero coordinates", () => {
    const result = convertPolylineToPath([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ])

    assert.equal(result, "M 0,0 L 0,0")
  })

  it("should handle mixed integer and decimal coordinates", () => {
    const result = convertPolylineToPath([
      { x: 10, y: 20.5 },
      { x: 30.25, y: 40 },
    ])

    assert.equal(result, "M 10,20.50 L 30.25,40")
  })
})

