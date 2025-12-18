import { calculatePolylineLength } from "./calculate-polyline-length.ts"
import type { Polyline } from "../types.ts"

type FilterSmallPolylinesInput = {
  polylines: Polyline[]
  minLength: number
}

type FilterSmallPolylinesOutput = {
  polylines: Polyline[]
  removedCount: number
  originalCount: number
}

export const filterSmallPolylines = ({ polylines, minLength }: FilterSmallPolylinesInput): FilterSmallPolylinesOutput => {
  if (minLength <= 0) {
    return {
      polylines,
      removedCount: 0,
      originalCount: polylines.length,
    }
  }

  const filteredPolylines = polylines.filter((polyline) => calculatePolylineLength({ polyline }) >= minLength)

  return {
    polylines: filteredPolylines,
    removedCount: polylines.length - filteredPolylines.length,
    originalCount: polylines.length,
  }
}
