import { useStore } from "./store"

export const useUploadedImage = useStore.use.uploadedImage

export const useImageData = useStore.use.imageData

export const useSettings = useStore.use.settings

export const useGcodeSettings = useStore.use.gcodeSettings

export const useProcessingStatus = useStore.use.processingStatus

export const useProcessingProgress = useStore.use.processingProgress

export const useProcessingError = useStore.use.processingError

export const useSvgOutput = useStore.use.svgOutput

export const usePolylines = useStore.use.polylines

export const useGridSize = () => useStore((state) => state.settings.gridSize)

export const useStrokeWidth = () => useStore((state) => state.settings.strokeWidth)

export const useContourSimplify = () => useStore((state) => state.settings.contourSimplify)

export const useEnableContours = () => useStore((state) => state.settings.enableContours)

export const useEnableHatching = () => useStore((state) => state.settings.enableHatching)

export const useNoiseAmount = () => useStore((state) => state.settings.noiseAmount)

export const useThreshold = () => useStore((state) => state.settings.threshold)

export const useGcodeCommands = () => useStore((state) => state.gcodeSettings.commands)

export const useGcodeSheet = () => useStore((state) => state.gcodeSettings.sheet)
