import assert from "node:assert"
import { describe, it } from "node:test"
import { applyBrightnessThreshold } from "./apply-brightness-threshold.ts"

describe("applyBrightnessThreshold", () => {
  it("should clamp result to 0 when adjustment pushes below zero", () => {
    const result = applyBrightnessThreshold(10, 50)

    assert.strictEqual(result, 0)
  })

  it("should clamp result to 255 when adjustment pushes above 255", () => {
    const result = applyBrightnessThreshold(250, 200)

    assert.strictEqual(result, 255)
  })

  it("should apply adjustment for threshold 128", () => {
    const result = applyBrightnessThreshold(128, 128)

    assert.strictEqual(result, 128)
  })

  it("should increase brightness when threshold is above 128", () => {
    const result = applyBrightnessThreshold(100, 200)

    assert.ok(result > 100)
    assert.strictEqual(result, 136)
  })

  it("should decrease brightness when threshold is below 128", () => {
    const result = applyBrightnessThreshold(100, 50)

    assert.ok(result < 100)
    assert.strictEqual(result, 61)
  })

  it("should return value within 0-255 for typical inputs", () => {
    const result = applyBrightnessThreshold(128, 128)

    assert.ok(result >= 0)
    assert.ok(result <= 255)
  })
})
