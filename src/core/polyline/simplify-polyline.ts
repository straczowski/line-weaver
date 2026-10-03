import type { Point, Polyline } from "../types.ts"

const DEFAULT_EPSILON = 1.0

type SimplifyPolylineInput = {
  polyline: Polyline
  epsilon: number
}

export const simplifyPolyline = (input: SimplifyPolylineInput): Polyline => {
  const { polyline, epsilon } = input

  if (polyline.length <= 2) return polyline
  if (epsilon <= 0) return polyline

  return douglasPeucker(polyline, epsilon)
}

const douglasPeucker = (points: Polyline, epsilon: number): Polyline => {
  if (points.length <= 2) return points

  const { maxDistance, maxIndex } = findFurthestPoint(points)

  if (maxDistance > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), epsilon)
    const right = douglasPeucker(points.slice(maxIndex), epsilon)
    return [...left.slice(0, -1), ...right]
  }

  return [points[0], points[points.length - 1]]
}

const findFurthestPoint = (points: Polyline): { maxDistance: number; maxIndex: number } => {
  const start = points[0]
  const end = points[points.length - 1]

  let maxDistance = 0
  let maxIndex = 0

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], start, end)
    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }

  return { maxDistance, maxIndex }
}

const perpendicularDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y

  const lineLength = Math.sqrt(dx * dx + dy * dy)

  if (lineLength === 0) {
    return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2))
  }

  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (lineLength * lineLength)))

  const projectionX = lineStart.x + t * dx
  const projectionY = lineStart.y + t * dy

  return Math.sqrt(Math.pow(point.x - projectionX, 2) + Math.pow(point.y - projectionY, 2))
}

const SIMPLIFY_LEVEL_EPSILON: Record<number, number> = {
  1: 0.5,
  2: 1.0,
  3: 2.0,
  4: 4.0,
  5: 8.0,
}

export const mapSimplifyLevelToEpsilon = (level: number): number =>
  SIMPLIFY_LEVEL_EPSILON[level] ?? DEFAULT_EPSILON
