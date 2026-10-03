const NEUTRAL_BRIGHTNESS = 128

export const applyBrightnessThreshold = (brightness: number, threshold: number): number => {
  const adjustment = (threshold - NEUTRAL_BRIGHTNESS) / 2
  return Math.max(0, Math.min(255, brightness + adjustment))
}
