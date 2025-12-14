import { generatePerlinNoise } from "./generate-perlin-noise"
import type { Point, Polyline } from "./types"

type ApplyNoiseToPolylinesInput = {
  polylines: Polyline[]
  noiseAmount: number
  noiseScale?: number
}

export const applyNoiseToPolylines = (input: ApplyNoiseToPolylinesInput): Polyline[] => {
  const { polylines, noiseAmount, noiseScale = 0.05 } = input

  if (noiseAmount <= 0) return polylines

  return polylines.map((polyline) => applyNoiseToPolyline({ polyline, noiseAmount, noiseScale }))
}

const applyNoiseToPolyline = (params: {
  polyline: Polyline
  noiseAmount: number
  noiseScale: number
}): Polyline => {
  const { polyline, noiseAmount, noiseScale } = params

  if (polyline.length < 2) return polyline

  return polyline.map((point, index) =>
    displacePoint({
      point,
      index,
      polyline,
      noiseAmount,
      noiseScale,
    })
  )
}

const displacePoint = (params: {
  point: Point
  index: number
  polyline: Polyline
  noiseAmount: number
  noiseScale: number
}): Point => {
  const { point, index, polyline, noiseAmount, noiseScale } = params

  const perpendicular = calculatePerpendicular({ point, index, polyline })
  const noise = generatePerlinNoise({ x: point.x, y: point.y, scale: noiseScale })
  const displacement = noise * noiseAmount

  return {
    x: point.x + perpendicular.x * displacement,
    y: point.y + perpendicular.y * displacement,
  }
}

const calculatePerpendicular = (params: {
  point: Point
  index: number
  polyline: Polyline
}): Point => {
  const { index, polyline } = params

  const prevPoint = polyline[Math.max(0, index - 1)]
  const nextPoint = polyline[Math.min(polyline.length - 1, index + 1)]

  const dx = nextPoint.x - prevPoint.x
  const dy = nextPoint.y - prevPoint.y

  const length = Math.sqrt(dx * dx + dy * dy)
  if (length === 0) return { x: 0, y: 0 }

  return {
    x: -dy / length,
    y: dx / length,
  }
}

