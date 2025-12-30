import type {
  GcodeCommandSettings,
  GcodeSettings,
  GcodeSheetSettings,
  OriginalImageMetadata,
  Polyline,
  ProcessingConfig,
} from "../core/types"

export type ProcessingStatus = "idle" | "processing" | "complete" | "error"

export type AppState = {
  originalImage: OriginalImageMetadata | null
  scaledImageData: ImageData | null
  settings: ProcessingConfig
  gcodeSettings: GcodeSettings
  processingStatus: ProcessingStatus
  processingError: string | null
  svgOutput: string | null
  polylines: Polyline[] | null
}

export type AppActions = {
  setOriginalImage: (image: OriginalImageMetadata | null) => void
  setScaledImageData: (data: ImageData | null) => void
  updateSettings: (partial: Partial<ProcessingConfig>) => void
  updateGcodeCommands: (partial: Partial<GcodeCommandSettings>) => void
  updateGcodeSheet: (partial: Partial<GcodeSheetSettings>) => void
  setProcessingStatus: (status: ProcessingStatus) => void
  setProcessingError: (error: string | null) => void
  setSvgOutput: (svg: string | null) => void
  setPolylines: (polylines: Polyline[] | null) => void
}

export type AppStore = AppState & AppActions
