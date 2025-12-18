import type { Point, Polyline } from "../types.ts"

export const optimizeLineOrder = (polylines: Polyline[]): Polyline[] => {
  const validPolylines = polylines.filter((p) => p.length >= 2)
  if (validPolylines.length === 0) return []

  return buildOptimizedOrder(validPolylines)
}

const buildOptimizedOrder = (polylines: Polyline[]): Polyline[] => {
  const remaining = new Set(polylines.map((_, i) => i))
  const result: Polyline[] = []
  let currentPosition: Point = { x: 0, y: 0 }

  while (remaining.size > 0) {
    const { index, reversed } = findNearestPolyline(polylines, remaining, currentPosition)
    remaining.delete(index)

    const polyline = reversed ? [...polylines[index]].reverse() : polylines[index]

    result.push(polyline)
    currentPosition = polyline[polyline.length - 1]
  }

  return result
}

const findNearestPolyline = (polylines: Polyline[], remaining: Set<number>, from: Point): { index: number; reversed: boolean } => {
  let nearestIndex = -1
  let nearestDistance = Infinity
  let shouldReverse = false

  for (const index of remaining) {
    const polyline = polylines[index]
    const startPoint = polyline[0]
    const endPoint = polyline[polyline.length - 1]

    const distanceToStart = calculateDistance(from, startPoint)
    const distanceToEnd = calculateDistance(from, endPoint)

    const minDistance = Math.min(distanceToStart, distanceToEnd)
    if (minDistance < nearestDistance) {
      nearestDistance = minDistance
      nearestIndex = index
      shouldReverse = distanceToEnd < distanceToStart
    }
  }

  return { index: nearestIndex, reversed: shouldReverse }
}

const calculateDistance = (a: Point, b: Point): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}
