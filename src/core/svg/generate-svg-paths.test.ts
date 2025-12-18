import assert from "node:assert"
import { describe, it } from "node:test"
import { generateSvgPaths } from "./generate-svg-paths.ts"
import type { SvgStrokeConfig } from "../types.ts"

const createStrokeConfig = (): SvgStrokeConfig => ({
  width: 1,
  color: "#000000",
  linecap: "round",
  linejoin: "round",
})

describe("generateSvgPaths", () => {
  it("should return empty array for empty polylines array", () => {
    const result = generateSvgPaths({
      polylines: [],
      strokeConfig: createStrokeConfig(),
    })

    assert.deepEqual(result, [])
  })

  it("should filter out empty polylines", () => {
    const result = generateSvgPaths({
      polylines: [[]],
      strokeConfig: createStrokeConfig(),
    })

    assert.deepEqual(result, [])
  })

  it("should filter out single-point polylines", () => {
    const result = generateSvgPaths({
      polylines: [[{ x: 10, y: 20 }]],
      strokeConfig: createStrokeConfig(),
    })

    assert.deepEqual(result, [])
  })

  it("should generate path element with correct d attribute", () => {
    const result = generateSvgPaths({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      ],
      strokeConfig: createStrokeConfig(),
    })

    assert.ok(result[0].includes('d="M 0,0 L 10,10"'))
  })

  it("should include stroke color in attributes", () => {
    const result = generateSvgPaths({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      ],
      strokeConfig: { ...createStrokeConfig(), color: "#ff0000" },
    })

    assert.ok(result[0].includes('stroke="#ff0000"'))
  })

  it("should include stroke width in attributes", () => {
    const result = generateSvgPaths({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      ],
      strokeConfig: { ...createStrokeConfig(), width: 2 },
    })

    assert.ok(result[0].includes('stroke-width="2"'))
  })

  it("should include stroke-linecap in attributes", () => {
    const result = generateSvgPaths({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      ],
      strokeConfig: { ...createStrokeConfig(), linecap: "square" },
    })

    assert.ok(result[0].includes('stroke-linecap="square"'))
  })

  it("should include stroke-linejoin in attributes", () => {
    const result = generateSvgPaths({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      ],
      strokeConfig: { ...createStrokeConfig(), linejoin: "bevel" },
    })

    assert.ok(result[0].includes('stroke-linejoin="bevel"'))
  })

  it("should set fill to none", () => {
    const result = generateSvgPaths({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      ],
      strokeConfig: createStrokeConfig(),
    })

    assert.ok(result[0].includes('fill="none"'))
  })

  it("should return array with multiple path elements", () => {
    const result = generateSvgPaths({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        [
          { x: 20, y: 20 },
          { x: 30, y: 30 },
        ],
      ],
      strokeConfig: createStrokeConfig(),
    })

    assert.equal(result.length, 2)
  })
})
