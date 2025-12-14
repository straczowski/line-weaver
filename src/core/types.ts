export type Point = {
  x: number
  y: number
}

export type Polyline = Point[]

export type ProcessingConfig = {
  gridSize: number
  strokeWidth: number
  enableContours: boolean
  enableHatching: boolean
  noiseAmount: number
  contourSimplify: number
  threshold: number
  blurRadius: number
  edgeLowThreshold: number
  edgeHighThreshold: number
  hatchAngle: number
  hatchDensity: number
  enableCrossHatch: boolean
  minLineLength: number
}

export type ProcessingState = {
  status: "idle" | "loading" | "processing" | "complete" | "error"
  progress: number
  errorMessage?: string
}

export type ImageData = {
  width: number
  height: number
  data: Uint8ClampedArray
  colorSpace: PredefinedColorSpace
}

export type UploadedImage = {
  file: File
  dataUrl: string
  width: number
  height: number
}

export type GrayscaleData = {
  width: number
  height: number
  pixels: Uint8Array
}

export type BrightnessGrid = {
  cols: number
  rows: number
  cellSize: number
  values: number[][]
}

export type LinePattern = "empty" | "diagonal-right" | "diagonal-left" | "cross" | "hatch"

export type VectorizeImageInput = {
  imageData: ImageData
  settings: ProcessingConfig
}

export type VectorizeImageOutput = {
  polylines: Polyline[]
  grid: BrightnessGrid
}

export type SvgDimensions = {
  width: number
  height: number
}

export type SvgStrokeConfig = {
  width: number
  color: string
  linecap: "butt" | "round" | "square"
  linejoin: "miter" | "round" | "bevel"
}

export type GenerateSvgInput = {
  polylines: Polyline[]
  dimensions: SvgDimensions
  strokeConfig: SvgStrokeConfig
}

export type GcodeCommandSettings = {
  penUp: string
  penDown: string
  feedRate: string
  pause: string
}

export type GcodeSheetSettings = {
  targetX: number
  targetY: number
  padding: number
}

export type GcodeSettings = {
  commands: GcodeCommandSettings
  sheet: GcodeSheetSettings
}

export type GenerateGcodeInput = {
  polylines: Polyline[]
  dimensions: SvgDimensions
  gcodeSettings: GcodeSettings
}
