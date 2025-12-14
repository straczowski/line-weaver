import type { EdgeData } from "./detect-edges"
import type { Point, Polyline } from "./types"

type TraceContoursInput = {
  edgeData: EdgeData
}

type TraceContoursOutput = {
  polylines: Polyline[]
}

export const traceContours = (input: TraceContoursInput): TraceContoursOutput => {
  const { edgeData } = input
  const { width, height, edges } = edgeData

  const visited = new Uint8Array(width * height)
  const polylines: Polyline[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x
      if (edges[index] === 255 && !visited[index]) {
        const polyline = tracePolyline({ x, y, width, height, edges, visited })
        if (polyline.length >= 2) {
          polylines.push(polyline)
        }
      }
    }
  }

  return { polylines }
}

const tracePolyline = (params: {
  x: number
  y: number
  width: number
  height: number
  edges: Uint8Array
  visited: Uint8Array
}): Polyline => {
  const { x, y, width, height, edges, visited } = params

  const polyline: Point[] = [{ x, y }]
  visited[y * width + x] = 1

  let currentX = x
  let currentY = y
  let foundNext = true

  while (foundNext) {
    foundNext = false
    const next = findNextEdgePixel({ x: currentX, y: currentY, width, height, edges, visited })

    if (next) {
      polyline.push(next)
      visited[next.y * width + next.x] = 1
      currentX = next.x
      currentY = next.y
      foundNext = true
    }
  }

  const extendedBackward = extendPolylineBackward({
    polyline,
    width,
    height,
    edges,
    visited,
  })

  return extendedBackward
}

const findNextEdgePixel = (params: {
  x: number
  y: number
  width: number
  height: number
  edges: Uint8Array
  visited: Uint8Array
}): Point | null => {
  const { x, y, width, height, edges, visited } = params
  const neighbors = getNeighborOffsets()

  for (const [dx, dy] of neighbors) {
    const nx = x + dx
    const ny = y + dy

    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue

    const index = ny * width + nx
    if (edges[index] === 255 && !visited[index]) {
      return { x: nx, y: ny }
    }
  }

  return null
}

const extendPolylineBackward = (params: {
  polyline: Polyline
  width: number
  height: number
  edges: Uint8Array
  visited: Uint8Array
}): Polyline => {
  const { polyline, width, height, edges, visited } = params

  if (polyline.length === 0) return polyline

  const prepended: Point[] = []
  let currentX = polyline[0].x
  let currentY = polyline[0].y
  let foundNext = true

  while (foundNext) {
    foundNext = false
    const next = findNextEdgePixel({ x: currentX, y: currentY, width, height, edges, visited })

    if (next) {
      prepended.unshift(next)
      visited[next.y * width + next.x] = 1
      currentX = next.x
      currentY = next.y
      foundNext = true
    }
  }

  return [...prepended, ...polyline]
}

const getNeighborOffsets = (): [number, number][] => [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
]

