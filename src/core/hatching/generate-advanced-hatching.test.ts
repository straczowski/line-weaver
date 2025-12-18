import assert from "node:assert"
import { describe, it } from "node:test"
import { generateAdvancedHatching } from "./generate-advanced-hatching.ts"
import type { BrightnessGrid } from "../types.ts"

describe("generateAdvancedHatching", () => {
  const createBrightnessGrid = (values: number[][]): BrightnessGrid => ({
    cols: values[0].length,
    rows: values.length,
    cellSize: 16,
    values,
  })

  it("should generate no lines for light cells", () => {
    const grid = createBrightnessGrid([
      [255, 255],
      [255, 255],
    ])

    const result = generateAdvancedHatching({ brightnessGrid: grid })

    assert.strictEqual(result.length, 0)
  })

  it("should generate lines for dark cells", () => {
    const grid = createBrightnessGrid([
      [0, 0],
      [0, 0],
    ])

    const result = generateAdvancedHatching({ brightnessGrid: grid })

    assert.ok(result.length > 0, "Should generate lines for dark cells")
  })

  it("should generate more lines for darker cells", () => {
    const lightGrid = createBrightnessGrid([[150]])
    const darkGrid = createBrightnessGrid([[50]])

    const lightResult = generateAdvancedHatching({ brightnessGrid: lightGrid })
    const darkResult = generateAdvancedHatching({ brightnessGrid: darkGrid })

    assert.ok(darkResult.length >= lightResult.length, `Dark cells should have more lines: light=${lightResult.length}, dark=${darkResult.length}`)
  })

  it("should respect maxDensity setting", () => {
    const grid = createBrightnessGrid([[0]])

    const lowDensity = generateAdvancedHatching({ brightnessGrid: grid, maxDensity: 2 })
    const highDensity = generateAdvancedHatching({ brightnessGrid: grid, maxDensity: 6 })

    assert.ok(highDensity.length > lowDensity.length, `Higher density should produce more lines: low=${lowDensity.length}, high=${highDensity.length}`)
  })

  it("should add cross-hatch lines when enabled", () => {
    const grid = createBrightnessGrid([[0]])

    const withCrossHatch = generateAdvancedHatching({ brightnessGrid: grid, crossHatch: true })
    const withoutCrossHatch = generateAdvancedHatching({ brightnessGrid: grid, crossHatch: false })

    assert.ok(withCrossHatch.length > withoutCrossHatch.length, `Cross-hatch should add more lines: with=${withCrossHatch.length}, without=${withoutCrossHatch.length}`)
  })

  it("should generate lines at specified angle", () => {
    const grid = createBrightnessGrid([[0]])

    const result = generateAdvancedHatching({ brightnessGrid: grid, hatchAngle: 0 })

    assert.ok(result.length > 0)
    const line = result[0]
    const isHorizontal = Math.abs(line[0].y - line[1].y) < 0.01
    assert.ok(isHorizontal, "Angle 0 should produce horizontal lines")
  })

  it("should generate vertical lines at 90 degrees", () => {
    const grid = createBrightnessGrid([[0]])

    const result = generateAdvancedHatching({ brightnessGrid: grid, hatchAngle: 90, crossHatch: false })

    assert.ok(result.length > 0)
    const line = result[0]
    const isVertical = Math.abs(line[0].x - line[1].x) < 0.01
    assert.ok(isVertical, "Angle 90 should produce vertical lines")
  })

  it("should generate lines within cell boundaries", () => {
    const grid = createBrightnessGrid([[0]])

    const result = generateAdvancedHatching({ brightnessGrid: grid })

    for (const polyline of result) {
      for (const point of polyline) {
        assert.ok(point.x >= 0 && point.x <= 16, `X should be within cell: ${point.x}`)
        assert.ok(point.y >= 0 && point.y <= 16, `Y should be within cell: ${point.y}`)
      }
    }
  })

  it("should handle empty grid", () => {
    const grid: BrightnessGrid = {
      cols: 0,
      rows: 0,
      cellSize: 16,
      values: [],
    }

    const result = generateAdvancedHatching({ brightnessGrid: grid })

    assert.deepStrictEqual(result, [])
  })

  it("should use default values when not specified", () => {
    const grid = createBrightnessGrid([[0]])

    const result = generateAdvancedHatching({ brightnessGrid: grid })

    assert.ok(result.length > 0, "Should work with defaults")
  })
})
