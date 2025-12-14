import { useProcessingStatus, useSvgOutput } from "../../store/selectors"

export const ExportButton = () => {
  const svgOutput = useSvgOutput()
  const processingStatus = useProcessingStatus()

  const isDisabled = svgOutput === null || processingStatus === "processing"

  const handleDownload = () => {
    if (!svgOutput) return

    const blob = new Blob([svgOutput], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "line-weaver-output.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
