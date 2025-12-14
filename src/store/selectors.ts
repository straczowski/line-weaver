import { useAppStore } from "./app-store"

export const useUploadedImage = useAppStore.use.uploadedImage

export const useImageData = useAppStore.use.imageData

export const useSettings = useAppStore.use.settings

export const useGcodeSettings = useAppStore.use.gcodeSettings

export const useProcessingStatus = useAppStore.use.processingStatus

export const useProcessingProgress = useAppStore.use.processingProgress

export const useProcessingError = useAppStore.use.processingError

export const useSvgOutput = useAppStore.use.svgOutput

export const usePolylines = useAppStore.use.polylines

export const useGridSize = () => useAppStore((state) => state.settings.gridSize)

export const useStrokeWidth = () => useAppStore((state) => state.settings.strokeWidth)

export const useContourSimplify = () => useAppStore((state) => state.settings.contourSimplify)

export const useEnableContours = () => useAppStore((state) => state.settings.enableContours)

export const useEnableHatching = () => useAppStore((state) => state.settings.enableHatching)

export const useNoiseAmount = () => useAppStore((state) => state.settings.noiseAmount)

export const useThreshold = () => useAppStore((state) => state.settings.threshold)

export const useGcodeCommands = () => useAppStore((state) => state.gcodeSettings.commands)

export const useGcodeSheet = () => useAppStore((state) => state.gcodeSettings.sheet)
