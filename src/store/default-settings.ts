import type { GcodeSettings, ProcessingConfig } from "../core/types"

export const DEFAULT_SETTINGS: ProcessingConfig = {
  gridSize: 16,
  strokeWidth: 1,
  contourSimplify: 2,
  enableContours: true,
  enableHatching: true,
  noiseAmount: 0,
  threshold: 128,
  blurRadius: 1,
  edgeLowThreshold: 50,
  edgeHighThreshold: 150,
  hatchAngle: 45,
  hatchDensity: 4,
  enableCrossHatch: true,
  minLineLength: 0,
}

export const DEFAULT_GCODE_SETTINGS: GcodeSettings = {
  commands: {
    penUp: "M5",
    penDown: "M3 S1000",
    feedRate: "G1 F3000",
    pause: "G4 P0.5",
  },
  sheet: {
    targetX: 297,
    targetY: 211,
    padding: 40,
  },
}
