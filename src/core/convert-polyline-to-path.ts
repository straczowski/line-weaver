import type { Point, Polyline } from "./types.ts"

export const convertPolylineToPath = (polyline: Polyline): string => {
  if (polyline.length === 0) return ""

  const moveCommand = createMoveCommand(polyline[0])
  const lineCommands = createLineCommands(polyline.slice(1))

  return joinPathCommands(moveCommand, lineCommands)
}

const createMoveCommand = (point: Point): string =>
  `M ${formatCoordinate(point.x)},${formatCoordinate(point.y)}`

const createLineCommands = (points: Point[]): string[] =>
  points.map((point) => `L ${formatCoordinate(point.x)},${formatCoordinate(point.y)}`)

const formatCoordinate = (value: number): string => {
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2)
}

const joinPathCommands = (moveCommand: string, lineCommands: string[]): string =>
  [moveCommand, ...lineCommands].join(" ")

