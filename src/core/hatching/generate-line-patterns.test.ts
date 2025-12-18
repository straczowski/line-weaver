import assert from "node:assert"
import { describe, it } from "node:test"
import { generateLinePatterns } from "./generate-line-patterns.ts"
import type { BrightnessGrid } from "../types.ts"

const createBrightnessGrid = (cols: number, rows: number, cellSize: number, values: number[][]): BrightnessGrid => ({
  cols,
  rows,
  cellSize,
  values,
})

describe("generateLinePatterns", () => {
  it("should generate no lines for bright cells above 204", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[255]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 0)
  })

  it("should generate no lines for cells at 204 brightness", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[204]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 0)
  })

  it("should generate single diagonal-right for brightness 153-203", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[180]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 1)
    assert.equal(result[0].length, 2)
  })

  it("should generate single diagonal-left for brightness 102-152", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[130]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 1)
    assert.equal(result[0].length, 2)
  })

  it("should generate cross pattern with 2 lines for brightness 51-101", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[75]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 2)
  })

  it("should generate hatch pattern with 4 lines for brightness 0-50", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[25]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 4)
  })

  it("should position lines correctly based on cell coordinates", () => {
    const grid = createBrightnessGrid(2, 2, 16, [
      [255, 180],
      [180, 255],
    ])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 2)
    const firstLine = result[0]
    assert.equal(firstLine[0].x, 16)
    assert.equal(firstLine[0].y, 16)
  })

  it("should respect cell size for line length", () => {
    const grid = createBrightnessGrid(1, 1, 32, [[180]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    const line = result[0]
    const dx = Math.abs(line[1].x - line[0].x)
    const dy = Math.abs(line[1].y - line[0].y)
    assert.equal(dx, 32)
    assert.equal(dy, 32)
  })

  it("should handle threshold parameter making output darker", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[200]])

    const normalResult = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })
    const darkResult = generateLinePatterns({ brightnessGrid: grid, threshold: 64 })

    assert.ok(darkResult.length >= normalResult.length)
  })

  it("should handle threshold parameter making output lighter", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[100]])

    const normalResult = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })
    const lightResult = generateLinePatterns({ brightnessGrid: grid, threshold: 192 })

    assert.ok(lightResult.length <= normalResult.length)
  })

  it("should generate correct number of points per line", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[180]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result[0].length, 2)
  })

  it("should handle multiple cells generating lines", () => {
    const grid = createBrightnessGrid(3, 1, 16, [[180, 130, 75]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    assert.equal(result.length, 4)
  })

  it("should generate diagonal-right from bottom-left to top-right", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[180]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    const line = result[0]
    assert.equal(line[0].x, 0)
    assert.equal(line[0].y, 16)
    assert.equal(line[1].x, 16)
    assert.equal(line[1].y, 0)
  })

  it("should generate diagonal-left from top-left to bottom-right", () => {
    const grid = createBrightnessGrid(1, 1, 16, [[130]])

    const result = generateLinePatterns({ brightnessGrid: grid, threshold: 128 })

    const line = result[0]
    assert.equal(line[0].x, 0)
    assert.equal(line[0].y, 0)
    assert.equal(line[1].x, 16)
    assert.equal(line[1].y, 16)
  })
})
