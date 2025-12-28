import { useProcessingStatus, useSvgOutput, useUploadedImage } from "../../store/selectors"
import { downloadFile, extractFilenameWithoutExtension } from "./utils"

export const ExportButtonSVG = () => {
  const svgOutput = useSvgOutput()
  const uploadedImage = useUploadedImage()
  const processingStatus = useProcessingStatus()

  const isDisabled = svgOutput === null || processingStatus === "processing"

  const handleDownload = () => {
    if (!svgOutput || !uploadedImage) return

    const filename = extractFilenameWithoutExtension(uploadedImage.file.name)
    downloadFile({ content: svgOutput, filename: `${filename}.svg`, mimeType: "image/svg+xml" })
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDisabled}
      className="rounded-lg bg-accent px-6 py-3 font-mono text-sm font-bold uppercase text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Download SVG
    </button>
  )
}
