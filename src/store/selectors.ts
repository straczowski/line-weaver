import { useStore } from "./store"

export const useUploadedImage = useStore.use.uploadedImage

export const useImageData = useStore.use.imageData

export const useSettings = useStore.use.settings

export const useGcodeSettings = useStore.use.gcodeSettings

export const useProcessingStatus = useStore.use.processingStatus

export const useProcessingError = useStore.use.processingError

export const useSvgOutput = useStore.use.svgOutput

export const usePolylines = useStore.use.polylines
