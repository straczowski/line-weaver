import { useEffect, useRef, useState } from "react"
import { extractImageData } from "../../core/image/extract-image-data"
import { loadImage } from "../../core/image/load-image"
import type { UploadedImage } from "../../core/types"
import { validateImageFile } from "../../core/image/validate-image-file"
import { useImageActions } from "../../store/actions"

export const ImageUploader = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setUploadedImage: setStoreImage, setImageData } = useImageActions()

  useEffect(() => {
    if (!error) return

    const timeout = setTimeout(() => {
      setError(null)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [error])

  const handleClick = () => {
    if (isLoading) return
    fileInputRef.current?.click()
  }

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (isLoading) return
    setIsDragging(true)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    if (isLoading) return

    const file = event.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = async (file: File) => {
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
  }

  const handleChangeImage = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (isLoading) return
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-2">
      <div onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`rounded-lg border-2 border-dashed transition-colors ${isLoading ? "pointer-events-none border-text-muted bg-surface opacity-70" : isDragging ? "border-accent bg-accent/10" : "border-text-muted bg-surface hover:border-accent/50"}`}>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileSelect} disabled={isLoading} className="hidden" />
        {isLoading ? <LoadingIndicator /> : uploadedImage ? <ImagePreview image={uploadedImage} onChangeImage={handleChangeImage} /> : <DropZone isDragging={isDragging} onClick={handleClick} />}
      </div>
      {error && <p className="text-sm text-warning">{error}</p>}
    </div>
  )
}

const LoadingIndicator = () => {
  return (
    <div className="flex h-64 items-center justify-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <p className="text-text-muted">Loading image...</p>
    </div>
  )
}

const DropZone = ({ isDragging, onClick }: { isDragging: boolean; onClick: () => void }) => {
  return (
    <div onClick={onClick} className="flex h-64 cursor-pointer items-center justify-center">
      <p className="text-text-muted">{isDragging ? "Drop to upload" : "Drop image here or click to upload"}</p>
    </div>
  )
}

const ImagePreview = ({ image, onChangeImage }: { image: UploadedImage; onChangeImage: (event: React.MouseEvent) => void }) => {
  return (
    <div className="flex items-center gap-4 p-4">
      <img src={image.dataUrl} alt="Uploaded preview" className="h-24 w-24 rounded-lg object-cover" />
      <div className="flex flex-1 flex-col gap-1">
        <p className="truncate font-mono text-sm text-text">{image.file.name}</p>
        <p className="text-sm text-text-muted">
          {image.width} × {image.height} • {formatFileSize(image.file.size)}
        </p>
      </div>
      <button onClick={onChangeImage} className="rounded-lg border border-accent bg-transparent px-4 py-2 font-mono text-xs font-bold uppercase text-accent transition-colors hover:bg-accent/10">
        Change Image
      </button>
    </div>
  )
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
