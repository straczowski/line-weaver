export const downloadFile = ({
  content,
  filename,
  mimeType,
}: {
  content: string
  filename: string
  mimeType: string
}) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const extractFilenameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".")
  return lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename
}

