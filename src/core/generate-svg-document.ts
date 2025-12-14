import type { SvgDimensions } from "./types.ts"

type GenerateSvgDocumentInput = {
  pathElements: string[]
  dimensions: SvgDimensions
}

export const generateSvgDocument = (params: GenerateSvgDocumentInput): string => {
  const { pathElements, dimensions } = params

  const svgOpen = createSvgOpenTag(dimensions)
  const svgClose = "</svg>"
  const content = pathElements.join("\n  ")

  return assembleDocument(svgOpen, content, svgClose)
}

const createSvgOpenTag = (dimensions: SvgDimensions): string => {
  const { width, height } = dimensions
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background: white">`
}

const assembleDocument = (open: string, content: string, close: string): string => {
  if (content.length === 0) return `${open}${close}`
  return `${open}\n  ${content}\n${close}`
}
