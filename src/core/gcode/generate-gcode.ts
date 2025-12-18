import { convertToGcodeCommands } from "./convert-to-gcode-commands.ts"
import { flipPolylinesX } from "./flip-polylines-x.ts"
import { mergeConnectedPolylines } from "./merge-connected-polylines.ts"
import { optimizeLineOrder } from "./optimize-line-order.ts"
import { scalePolylines } from "./scale-polylines.ts"
import type { GenerateGcodeInput } from "../types.ts"

export const generateGcode = (input: GenerateGcodeInput): string => {
  const { polylines, dimensions, gcodeSettings } = input

  const scaledPolylines = scalePolylines({
    polylines,
    sourceDimensions: dimensions,
    sheetSettings: gcodeSettings.sheet,
  })

  const flippedPolylines = flipPolylinesX({
    polylines: scaledPolylines,
    sheetWidth: gcodeSettings.sheet.targetX,
  })

  const mergedPolylines = mergeConnectedPolylines({ polylines: flippedPolylines })

  const optimizedPolylines = optimizeLineOrder(mergedPolylines)

  const gcode = convertToGcodeCommands({
    polylines: optimizedPolylines,
    commands: gcodeSettings.commands,
  })

  return gcode
}
