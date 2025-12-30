import { useStore } from "./store"

export const useOriginalImage = useStore.use.originalImage

export const useScaledImageData = useStore.use.scaledImageData

export const useSettings = useStore.use.settings

export const useGcodeSettings = useStore.use.gcodeSettings

export const useProcessingStatus = useStore.use.processingStatus

export const useProcessingError = useStore.use.processingError

export const useSvgOutput = useStore.use.svgOutput

export const usePolylines = useStore.use.polylines
