import { generateGcode } from "../../core/gcode/generate-gcode"
import { useGcodeSettings, usePolylines, useProcessingStatus, useUploadedImage } from "../../store/selectors"
import { downloadFile, extractFilenameWithoutExtension } from "./utils"

export const ExportButtonGCode = () => {
  const polylines = usePolylines()
  const uploadedImage = useUploadedImage()
  const processingStatus = useProcessingStatus()
  const gcodeSettings = useGcodeSettings()

  const isDisabled = !polylines || polylines.length === 0 || processingStatus === "processing"

  const handleExport = () => {
    if (!polylines || !uploadedImage) return

    const gcode = generateGcode({
      polylines,
      dimensions: { width: uploadedImage.width, height: uploadedImage.height },
      gcodeSettings,
    })

    const filename = extractFilenameWithoutExtension(uploadedImage.file.name)
    downloadFile({ content: gcode, filename: `${filename}.gcode`, mimeType: "text/plain" })
  }

  return (
    <button onClick={handleExport} disabled={isDisabled} className="rounded-lg bg-accent px-6 py-3 font-mono text-sm font-bold uppercase text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
      Download GCODE
    </button>
  )
}
