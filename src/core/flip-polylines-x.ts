import type { Polyline } from "./types.ts"

type FlipPolylinesXInput = {
  polylines: Polyline[]
  sheetWidth: number
}

export const flipPolylinesX = (input: FlipPolylinesXInput): Polyline[] => {
  const { polylines, sheetWidth } = input

  return polylines.map((polyline) =>
    polyline.map((point) => ({
      x: sheetWidth - point.x,
      y: point.y,
    }))
  )
}

