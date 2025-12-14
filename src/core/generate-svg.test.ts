import assert from "node:assert"
import { describe, it } from "node:test"
import { generateSvg } from "./generate-svg.ts"
import type { GenerateSvgInput, SvgStrokeConfig } from "./types.ts"

const createDefaultStrokeConfig = (): SvgStrokeConfig => ({
  width: 1,
  color: "#000000",
  linecap: "round",
  linejoin: "round",
})

const createInput = (overrides: Partial<GenerateSvgInput> = {}): GenerateSvgInput => ({
  polylines: [],
  dimensions: { width: 100, height: 100 },
  strokeConfig: createDefaultStrokeConfig(),
  ...overrides,
})

describe("generateSvg", () => {
  it("should return valid SVG for simple polylines", () => {
    const input = createInput({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 50, y: 50 },
        ],
      ],
    })

    const result = generateSvg(input)

    assert.ok(result.includes("<svg"))
    assert.ok(result.includes("</svg>"))
    assert.ok(result.includes("<path"))
    assert.ok(result.includes('d="M 0,0 L 50,50"'))
  })

  it("should return empty SVG for empty polylines", () => {
    const input = createInput({ polylines: [] })

    const result = generateSvg(input)

    assert.ok(result.includes("<svg"))
    assert.ok(result.includes("</svg>"))
    assert.ok(!result.includes("<path"))
  })

  it("should respect stroke configuration", () => {
    const input = createInput({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      ],
      strokeConfig: {
        width: 3,
        color: "#ff0000",
        linecap: "square",
        linejoin: "bevel",
      },
    })

    const result = generateSvg(input)

    assert.ok(result.includes('stroke-width="3"'))
    assert.ok(result.includes('stroke="#ff0000"'))
    assert.ok(result.includes('stroke-linecap="square"'))
    assert.ok(result.includes('stroke-linejoin="bevel"'))
  })

  it("should set correct dimensions", () => {
    const input = createInput({
      dimensions: { width: 800, height: 600 },
    })

    const result = generateSvg(input)

    assert.ok(result.includes('width="800"'))
    assert.ok(result.includes('height="600"'))
    assert.ok(result.includes('viewBox="0 0 800 600"'))
  })

  it("should produce SVG with valid XML structure", () => {
    const input = createInput({
      polylines: [
        [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
        [
          { x: 50, y: 60 },
          { x: 70, y: 80 },
        ],
      ],
    })

    const result = generateSvg(input)

    assert.ok(result.startsWith("<svg"))
    assert.ok(result.endsWith("</svg>"))
    assert.ok(result.includes('xmlns="http://www.w3.org/2000/svg"'))
  })

  it("should handle multiple polylines", () => {
    const input = createInput({
      polylines: [
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        [
          { x: 20, y: 20 },
          { x: 30, y: 30 },
        ],
        [
          { x: 40, y: 40 },
          { x: 50, y: 50 },
        ],
      ],
    })

    const result = generateSvg(input)

    const pathCount = (result.match(/<path/g) || []).length
    assert.equal(pathCount, 3)
  })

  it("should filter out invalid polylines", () => {
    const input = createInput({
      polylines: [
        [],
        [{ x: 0, y: 0 }],
        [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
        ],
      ],
    })

    const result = generateSvg(input)

    const pathCount = (result.match(/<path/g) || []).length
    assert.equal(pathCount, 1)
  })
})

