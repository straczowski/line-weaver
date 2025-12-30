import { useCallback } from "react"
import { createStrokeConfig } from "../core/svg/create-stroke-config"
import { generateSvg } from "../core/svg/generate-svg"
import { vectorizeImage } from "../core/vectorize-image"
import { useStore } from "../store/store"
import { useOutputActions, useProcessingActions } from "../store/actions-hooks"
import { useOriginalImage, useScaledImageData } from "../store/selectors"

export const useVectorize = () => {
  const scaledImageData = useScaledImageData()
  const originalImage = useOriginalImage()
  const { setProcessingStatus, setProcessingError } = useProcessingActions()
  const { setPolylines, setSvgOutput } = useOutputActions()

  const vectorize = useCallback(async () => {
    if (!scaledImageData || !originalImage) return

    const settings = useStore.getState().settings

    setProcessingStatus("processing")
    setProcessingError(null)

    await new Promise((resolve) => setTimeout(resolve, 0))

    try {
      const result = vectorizeImage({ imageData: scaledImageData, settings })
      setPolylines(result.polylines)

      const svg = generateSvg({
        polylines: result.polylines,
        dimensions: { width: scaledImageData.width, height: scaledImageData.height },
        strokeConfig: createStrokeConfig(settings),
      })
      setSvgOutput(svg)

      setProcessingStatus("complete")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Vectorization failed"
      setProcessingError(message)
      setProcessingStatus("error")
    }
  }, [scaledImageData, originalImage, setProcessingStatus, setProcessingError, setPolylines, setSvgOutput])

  return { vectorize }
}
