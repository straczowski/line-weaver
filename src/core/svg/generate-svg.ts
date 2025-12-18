import { generateSvgDocument } from "./generate-svg-document.ts"
import { generateSvgPaths } from "./generate-svg-paths.ts"
import type { GenerateSvgInput } from "../types.ts"

export const generateSvg = (input: GenerateSvgInput): string => {
  const { polylines, dimensions, strokeConfig } = input

  const pathElements = generateSvgPaths({ polylines, strokeConfig })

  const svgDocument = generateSvgDocument({ pathElements, dimensions })

  return svgDocument
}
