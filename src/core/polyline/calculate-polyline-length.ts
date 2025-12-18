import type { Polyline, Point } from "../types.ts"

type CalculatePolylineLengthInput = {
  polyline: Polyline
}

export const calculatePolylineLength = ({ polyline }: CalculatePolylineLengthInput): number => {
  if (polyline.length < 2) return 0

  return polyline.reduce((totalLength, point, index) => {
    if (index === 0) return 0
    const previousPoint = polyline[index - 1]
    return totalLength + calculateDistance(previousPoint, point)
  }, 0)
}

const calculateDistance = (pointA: Point, pointB: Point): number => {
  const deltaX = pointB.x - pointA.x
  const deltaY = pointB.y - pointA.y
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}
