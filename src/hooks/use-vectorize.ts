import { useCallback } from "react"
import { createStrokeConfig } from "../core/svg/create-stroke-config"
import { generateSvg } from "../core/svg/generate-svg"
import { vectorizeImage } from "../core/vectorize-image"
import { useStore } from "../store/store"
import { useOutputActions, useProcessingActions } from "../store/actions-hooks"
import { useImageData, useProcessingStatus, useUploadedImage } from "../store/selectors"

export const useVectorize = () => {
  const imageData = useImageData()
  const uploadedImage = useUploadedImage()
  const processingStatus = useProcessingStatus()
  const { setProcessingStatus, setProcessingError } = useProcessingActions()
  const { setPolylines, setSvgOutput } = useOutputActions()

  const vectorize = useCallback(() => {
    if (!imageData || !uploadedImage) return

    const settings = useStore.getState().settings

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
