import assert from "node:assert"
import { describe, it } from "node:test"
import { generateSvgDocument } from "./generate-svg-document.ts"

describe("generateSvgDocument", () => {
  it("should generate valid SVG with namespace", () => {
    const result = generateSvgDocument({
      pathElements: [],
      dimensions: { width: 100, height: 100 },
    })

    assert.ok(result.includes('xmlns="http://www.w3.org/2000/svg"'))
  })

  it("should set correct viewBox from dimensions", () => {
    const result = generateSvgDocument({
      pathElements: [],
      dimensions: { width: 200, height: 150 },
    })

    assert.ok(result.includes('viewBox="0 0 200 150"'))
  })

  it("should set width attribute", () => {
    const result = generateSvgDocument({
      pathElements: [],
      dimensions: { width: 300, height: 200 },
    })

    assert.ok(result.includes('width="300"'))
  })

  it("should set height attribute", () => {
    const result = generateSvgDocument({
      pathElements: [],
      dimensions: { width: 300, height: 200 },
    })

    assert.ok(result.includes('height="200"'))
  })

  it("should include all path elements", () => {
    const pathElements = ['<path d="M 0,0 L 10,10" />', '<path d="M 20,20 L 30,30" />']

    const result = generateSvgDocument({
      pathElements,
      dimensions: { width: 100, height: 100 },
    })

    assert.ok(result.includes('<path d="M 0,0 L 10,10" />'))
    assert.ok(result.includes('<path d="M 20,20 L 30,30" />'))
  })

  it("should handle empty path elements array", () => {
    const result = generateSvgDocument({
      pathElements: [],
      dimensions: { width: 100, height: 100 },
    })

    assert.ok(result.startsWith("<svg"))
    assert.ok(result.endsWith("</svg>"))
  })

  it("should format output with proper indentation", () => {
    const pathElements = ['<path d="M 0,0 L 10,10" />']

    const result = generateSvgDocument({
      pathElements,
      dimensions: { width: 100, height: 100 },
    })

    assert.ok(result.includes("\n  <path"))
  })

  it("should produce well-formed XML structure", () => {
    const result = generateSvgDocument({
      pathElements: ['<path d="M 0,0 L 10,10" />'],
      dimensions: { width: 100, height: 100 },
    })

    assert.ok(result.startsWith("<svg"))
    assert.ok(result.endsWith("</svg>"))
    assert.ok(result.includes(">"))
  })
})
