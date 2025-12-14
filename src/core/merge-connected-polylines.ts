import type { Point, Polyline } from "./types"

const DEFAULT_TOLERANCE = 0.001

export const mergeConnectedPolylines = (params: {
  polylines: Polyline[]
  tolerance?: number
}): Polyline[] => {
  const { polylines, tolerance = DEFAULT_TOLERANCE } = params

  if (polylines.length <= 1) return polylines

  const validPolylines = polylines.filter((p) => p.length >= 2)
  if (validPolylines.length === 0) return []

  return buildMergedChains(validPolylines, tolerance)
}

const buildMergedChains = (polylines: Polyline[], tolerance: number): Polyline[] => {
  const used = new Set<number>()
  const result: Polyline[] = []

  const { startIndex, endIndex } = buildEndpointIndices(polylines, tolerance)

  for (let i = 0; i < polylines.length; i++) {
    if (used.has(i)) continue

    const chain = buildChain({
      seedIndex: i,
      polylines,
      startIndex,
      endIndex,
      used,
      tolerance,
    })
    result.push(chain)
  }

  return result
}

type EndpointIndices = {
  startIndex: Map<string, number[]>
  endIndex: Map<string, number[]>
}

const buildEndpointIndices = (polylines: Polyline[], tolerance: number): EndpointIndices => {
  const startIndex = new Map<string, number[]>()
  const endIndex = new Map<string, number[]>()

  for (let i = 0; i < polylines.length; i++) {
    const polyline = polylines[i]
    const startKey = pointToKey(polyline[0], tolerance)
    const endKey = pointToKey(polyline[polyline.length - 1], tolerance)

    addToIndex(startIndex, startKey, i)
    addToIndex(endIndex, endKey, i)
  }

  return { startIndex, endIndex }
}

const addToIndex = (index: Map<string, number[]>, key: string, value: number) => {
  const existing = index.get(key) ?? []
  existing.push(value)
  index.set(key, existing)
}

const pointToKey = (point: Point, tolerance: number): string => {
  const precision = Math.round(1 / tolerance)
  const x = Math.round(point.x * precision) / precision
  const y = Math.round(point.y * precision) / precision
  return `${x},${y}`
}

type BuildChainParams = {
  seedIndex: number
  polylines: Polyline[]
  startIndex: Map<string, number[]>
  endIndex: Map<string, number[]>
  used: Set<number>
  tolerance: number
}

const buildChain = (params: BuildChainParams): Polyline => {
  const { seedIndex, polylines, startIndex, endIndex, used, tolerance } = params

  used.add(seedIndex)
  let chain = [...polylines[seedIndex]]

  chain = extendChainBackward({ chain, polylines, startIndex, endIndex, used, tolerance })
  chain = extendChainForward({ chain, polylines, startIndex, endIndex, used, tolerance })

  return chain
}

type ExtendChainParams = {
  chain: Polyline
  polylines: Polyline[]
  startIndex: Map<string, number[]>
  endIndex: Map<string, number[]>
  used: Set<number>
  tolerance: number
}

const extendChainBackward = (params: ExtendChainParams): Polyline => {
  const { polylines, startIndex, endIndex, used, tolerance } = params
  let { chain } = params
  let extended = true

  while (extended) {
    extended = false
    const chainStart = chain[0]
    const startKey = pointToKey(chainStart, tolerance)

    const endCandidates = endIndex.get(startKey) ?? []
    for (const candidateIndex of endCandidates) {
      if (used.has(candidateIndex)) continue

      const candidate = polylines[candidateIndex]
      const candidateEnd = candidate[candidate.length - 1]

      if (arePointsClose(candidateEnd, chainStart, tolerance)) {
        used.add(candidateIndex)
        chain = [...candidate.slice(0, -1), ...chain]
        extended = true
        break
      }
    }

    if (!extended) {
      const startCandidates = startIndex.get(startKey) ?? []
      for (const candidateIndex of startCandidates) {
        if (used.has(candidateIndex)) continue

        const candidate = polylines[candidateIndex]
        const candidateStart = candidate[0]

        if (arePointsClose(candidateStart, chainStart, tolerance)) {
          used.add(candidateIndex)
          chain = [...[...candidate].reverse().slice(0, -1), ...chain]
          extended = true
          break
        }
      }
    }
  }

  return chain
}

const extendChainForward = (params: ExtendChainParams): Polyline => {
  const { polylines, startIndex, endIndex, used, tolerance } = params
  let { chain } = params
  let extended = true

  while (extended) {
    extended = false
    const chainEnd = chain[chain.length - 1]
    const endKey = pointToKey(chainEnd, tolerance)

    const startCandidates = startIndex.get(endKey) ?? []
    for (const candidateIndex of startCandidates) {
      if (used.has(candidateIndex)) continue

      const candidate = polylines[candidateIndex]
      const candidateStart = candidate[0]

      if (arePointsClose(candidateStart, chainEnd, tolerance)) {
        used.add(candidateIndex)
        chain = [...chain, ...candidate.slice(1)]
        extended = true
        break
      }
    }

    if (!extended) {
      const endCandidates = endIndex.get(endKey) ?? []
      for (const candidateIndex of endCandidates) {
        if (used.has(candidateIndex)) continue

        const candidate = polylines[candidateIndex]
        const candidateEnd = candidate[candidate.length - 1]

        if (arePointsClose(candidateEnd, chainEnd, tolerance)) {
          used.add(candidateIndex)
          chain = [...chain, ...[...candidate].reverse().slice(1)]
          extended = true
          break
        }
      }
    }
  }

  return chain
}

const arePointsClose = (a: Point, b: Point, tolerance: number): boolean =>
  Math.abs(a.x - b.x) < tolerance && Math.abs(a.y - b.y) < tolerance
