import assert from "node:assert"
import { describe, it } from "node:test"
import { generateCrossHatch } from "./generate-cross-hatch.ts"
import type { BrightnessGrid } from "../types.ts"

const createBrightnessGrid = (cols: number, rows: number, cellSize: number, values: number[][]): BrightnessGrid => ({
  cols,
  rows,
  cellSize,
  values,
})

describe("generateCrossHatch", () => {
  it("should generate no lines for bright cells above threshold", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[255]])

    const result = generateCrossHatch({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 0)
  })

  it("should generate single diagonal line for medium brightness", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[128]])

    const result = generateCrossHatch({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 1)
    assert.equal(result[0].length, 2)
  })

  it("should generate cross pattern with 2 lines for dark cells", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[0]])

    const result = generateCrossHatch({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 2)
    assert.equal(result[0].length, 2)
    assert.equal(result[1].length, 2)
  })

  it("should position diagonal line correctly within cell", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[128]])

    const result = generateCrossHatch({ brightnessGrid: grid, threshold: 128 })

    const line = result[0]
    assert.equal(line[0].x, 0)
    assert.equal(line[0].y, 16)
    assert.equal(line[1].x, 16)
    assert.equal(line[1].y, 0)
  })

  it("should handle threshold boundaries correctly", () => {
    const grid = createBrightnessGrid(3, 1, 16, [[213], [43], [42]])

    const result = generateCrossHatch({ brightnessGrid: grid, threshold: 128 })

    assert.ok(result.length >= 2, "Should generate lines for cells at or below threshold boundaries")
    assert.ok(result.length <= 4, "Should not exceed expected line count")
  })

  it("should rotate lines when angle is not 45 degrees", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[128]])

    const result45 = generateCrossHatch({ brightnessGrid: grid, threshold: 128, angle: 45 })
    const result90 = generateCrossHatch({ brightnessGrid: grid, threshold: 128, angle: 90 })

    assert.equal(result45.length, 1)
    assert.equal(result90.length, 1)
    const line45 = result45[0]
    const line90 = result90[0]
    const samePoint = line45[0].x === line90[0].x && line45[0].y === line90[0].y
    assert.ok(!samePoint, "Rotated line should have different coordinates")
  })

  it("should process multiple cells correctly", () => {
    const grid = createBrightnessGrid(3, 1, 16, [[255], [128], [0]])

    const result = generateCrossHatch({ brightnessGrid: grid, threshold: 128 })

    assert.ok(result.length >= 2, "Should generate lines for medium and dark cells")
    assert.ok(result.length <= 4, "Should not exceed expected line count")
  })
})
