import { generateGcode } from "../../core/generate-gcode.ts"
import {
  useGcodeSettings,
  usePolylines,
  useProcessingStatus,
  useUploadedImage,
} from "../../store/selectors"

export const ExportGcodeButton = () => {
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
    downloadGcode(gcode, `${filename}.gcode`)
  }

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className="rounded-lg bg-accent px-6 py-3 font-mono text-sm font-bold uppercase text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Download GCODE
    </button>
  )
}

const extractFilenameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".")
  return lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename
}

const downloadGcode = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
