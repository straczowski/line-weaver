import { useState, useCallback } from "react"

interface UseDropZoneOptions {
  onDrop: (file: File) => void
  disabled?: boolean
}

export const useDropZone = ({ onDrop, disabled }: UseDropZoneOptions) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragging(false)
      if (disabled) return
      const file = event.dataTransfer.files[0]
      if (file) onDrop(file)
    },
    [disabled, onDrop]
  )

  return {
    isDragging,
    dropZoneProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}

