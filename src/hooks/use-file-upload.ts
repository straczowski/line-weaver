import { useEffect, useRef, useState, useCallback } from "react"
import { extractImageData } from "../core/image/extract-image-data"
import { loadImage } from "../core/image/load-image"
import { validateImageFile } from "../core/image/validate-image-file"
import type { UploadedImage } from "../core/types"
import { useImageActions } from "../store/actions"

export const useFileUpload = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setUploadedImage: setStoreImage, setImageData } = useImageActions()

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
        setStoreImage(image)
        const imageData = await extractImageData(image)
        setImageData(imageData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load image")
      } finally {
        setIsLoading(false)
      }
    },
    [setStoreImage, setImageData]
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

