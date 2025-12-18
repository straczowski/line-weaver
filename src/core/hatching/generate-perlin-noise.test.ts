import assert from "node:assert"
import { describe, it } from "node:test"
import { generatePerlinNoise } from "./generate-perlin-noise.ts"

describe("generatePerlinNoise", () => {
  it("should return same output for same input (deterministic)", () => {
    const result1 = generatePerlinNoise({ x: 10, y: 20 })
    const result2 = generatePerlinNoise({ x: 10, y: 20 })

    assert.strictEqual(result1, result2)
  })

  it("should return value in range -1 to 1", () => {
    const samples = []
    for (let x = 0; x < 100; x++) {
      for (let y = 0; y < 100; y++) {
        samples.push(generatePerlinNoise({ x, y, scale: 0.1 }))
      }
    }

    const allInRange = samples.every((v) => v >= -1 && v <= 1)
    assert.strictEqual(allInRange, true)
  })

  it("should produce coherent values (adjacent values are similar)", () => {
    const scale = 0.05
    const v1 = generatePerlinNoise({ x: 50, y: 50, scale })
    const v2 = generatePerlinNoise({ x: 51, y: 50, scale })
    const v3 = generatePerlinNoise({ x: 50, y: 51, scale })

    const diff1 = Math.abs(v1 - v2)
    const diff2 = Math.abs(v1 - v3)

    assert.ok(diff1 < 0.5, `Adjacent x values should be similar, got diff: ${diff1}`)
    assert.ok(diff2 < 0.5, `Adjacent y values should be similar, got diff: ${diff2}`)
  })

  it("should produce different values at distant positions", () => {
    const v1 = generatePerlinNoise({ x: 0.5, y: 0.5 })
    const v2 = generatePerlinNoise({ x: 100.5, y: 100.5 })

    assert.notStrictEqual(v1, v2)
  })

  it("should use default scale of 0.1 when not provided", () => {
    const withDefault = generatePerlinNoise({ x: 10, y: 20 })
    const withExplicit = generatePerlinNoise({ x: 10, y: 20, scale: 0.1 })

    assert.strictEqual(withDefault, withExplicit)
  })

  it("should add detail with multiple octaves", () => {
    const singleOctave = generatePerlinNoise({ x: 50.3, y: 50.7, octaves: 1 })
    const multiOctave = generatePerlinNoise({ x: 50.3, y: 50.7, octaves: 3 })

    assert.notStrictEqual(singleOctave, multiOctave)
  })

  it("should handle negative coordinates", () => {
    const result = generatePerlinNoise({ x: -10, y: -20 })

    assert.ok(typeof result === "number")
    assert.ok(result >= -1 && result <= 1)
  })

  it("should handle zero coordinates", () => {
    const result = generatePerlinNoise({ x: 0, y: 0 })

    assert.ok(typeof result === "number")
    assert.ok(result >= -1 && result <= 1)
  })

  it("should handle large coordinates", () => {
    const result = generatePerlinNoise({ x: 10000, y: 10000 })

    assert.ok(typeof result === "number")
    assert.ok(result >= -1 && result <= 1)
  })

  it("should vary with different scales", () => {
    const lowFreq = generatePerlinNoise({ x: 50.3, y: 50.7, scale: 0.01 })
    const highFreq = generatePerlinNoise({ x: 50.3, y: 50.7, scale: 0.5 })

    assert.notStrictEqual(lowFreq, highFreq)
  })
})
