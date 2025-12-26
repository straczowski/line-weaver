import type {
  GcodeCommandSettings,
  GcodeSettings,
  GcodeSheetSettings,
  Polyline,
  ProcessingConfig,
  UploadedImage,
} from "../core/types"

export type ProcessingStatus = "idle" | "loading" | "processing" | "complete" | "error"

export type AppState = {
  uploadedImage: UploadedImage | null
  imageData: ImageData | null
  settings: ProcessingConfig
  gcodeSettings: GcodeSettings
  processingStatus: ProcessingStatus
  processingError: string | null
  svgOutput: string | null
  polylines: Polyline[] | null
}

export type AppActions = {
  setUploadedImage: (image: UploadedImage | null) => void
  setImageData: (data: ImageData | null) => void
  updateSettings: (partial: Partial<ProcessingConfig>) => void
  resetSettings: () => void
  updateGcodeCommands: (partial: Partial<GcodeCommandSettings>) => void
  updateGcodeSheet: (partial: Partial<GcodeSheetSettings>) => void
  resetGcodeSettings: () => void
  setProcessingStatus: (status: ProcessingStatus) => void
  setProcessingError: (error: string | null) => void
  setSvgOutput: (svg: string | null) => void
  setPolylines: (polylines: Polyline[] | null) => void
  reset: () => void
}

export type AppStore = AppState & AppActions
