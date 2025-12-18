import type { Polyline } from "../types.ts"

type CombinePolylinesInput = {
  contourPolylines: Polyline[]
  hatchingPolylines: Polyline[]
  enableContours: boolean
  enableHatching: boolean
}

export const combinePolylines = (input: CombinePolylinesInput): Polyline[] => {
  const { contourPolylines, hatchingPolylines, enableContours, enableHatching } = input

  const result: Polyline[] = []

  if (enableContours) {
    result.push(...contourPolylines)
  }

  if (enableHatching) {
    result.push(...hatchingPolylines)
  }

  return result
}
