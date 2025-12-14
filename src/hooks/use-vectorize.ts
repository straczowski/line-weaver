import { useCallback } from "react"
import { createStrokeConfig } from "../core/create-stroke-config.ts"
import { generateSvg } from "../core/generate-svg.ts"
import { vectorizeImage } from "../core/vectorize-image.ts"
import { useAppStore } from "../store/app-store.ts"
import { useOutputActions, useProcessingActions } from "../store/actions.ts"
import { useImageData, useProcessingStatus, useUploadedImage } from "../store/selectors.ts"

export const useVectorize = () => {
  const imageData = useImageData()
  const uploadedImage = useUploadedImage()
  const processingStatus = useProcessingStatus()
  const { setProcessingStatus, setProcessingError } = useProcessingActions()
  const { setPolylines, setSvgOutput } = useOutputActions()

  const vectorize = useCallback(() => {
    if (!imageData || !uploadedImage) return

    const settings = useAppStore.getState().settings

    setProcessingStatus("processing")
    setProcessingError(null)

    try {
      const result = vectorizeImage({ imageData, settings })
      setPolylines(result.polylines)

      const svg = generateSvg({
        polylines: result.polylines,
        dimensions: { width: uploadedImage.width, height: uploadedImage.height },
        strokeConfig: createStrokeConfig(settings),
      })
      setSvgOutput(svg)

      setProcessingStatus("complete")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Vectorization failed"
      setProcessingError(message)
      setProcessingStatus("error")
    }
  }, [imageData, uploadedImage, setProcessingStatus, setProcessingError, setPolylines, setSvgOutput])

  const isProcessing = processingStatus === "processing"

  return { vectorize, isProcessing }
}
