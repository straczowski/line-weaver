import { useEffect, useRef, useState, useCallback } from "react"
import { extractImageData } from "../core/image/extract-image-data"
import { loadImage } from "../core/image/load-image"
import { validateImageFile } from "../core/image/validate-image-file"
import { useImageActions } from "../store/actions"
import { useUploadedImage } from "../store/selectors"

export const useFileUpload = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const uploadedImage = useUploadedImage()
  const { setUploadedImage, setImageData } = useImageActions()

  useEffect(() => {
    if (!error) return
    const timeout = setTimeout(() => setError(null), 3000)
    return () => clearTimeout(timeout)
  }, [error])

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      const validationResult = validateImageFile(file)
      if (!validationResult.isValid) {
        setError(validationResult.error ?? "Invalid file")
        return
      }

      setIsLoading(true)
      try {
        const image = await loadImage(file)
        setUploadedImage(image)
        setIsLoading(false)
        const imageData = await extractImageData(image)
        setImageData(imageData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load image")
      } finally {
        setIsLoading(false)
      }
    },
    [setUploadedImage, setImageData]
  )

  const openFilePicker = useCallback(() => {
    if (!isLoading) fileInputRef.current?.click()
  }, [isLoading])

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  return {
    isLoading,
    error,
    uploadedImage,
    fileInputRef,
    processFile,
    openFilePicker,
    handleFileSelect,
  }
}

