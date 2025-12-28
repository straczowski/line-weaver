import clsx from "clsx"
import type { UploadedImage } from "../../core/types"
import { useDropZone } from "../../hooks/use-drop-zone"
import { useFileUpload } from "../../hooks/use-file-upload"
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator"

export const ImageUploader = () => {
  const { isLoading, error, uploadedImage, fileInputRef, processFile, openFilePicker, handleFileSelect } = useFileUpload()

  const { isDragging, dropZoneProps } = useDropZone({
    onDrop: processFile,
    disabled: isLoading,
  })

  const handleChangeImage = (event: React.MouseEvent) => {
    event.stopPropagation()
    openFilePicker()
  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator message="Loading image..." size="sm" className="h-24 justify-center" />
    }
    if (uploadedImage) {
      return <ImagePreview image={uploadedImage} onChangeImage={handleChangeImage} />
    }
    return <DropZone isDragging={isDragging} onClick={openFilePicker} />
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        {...dropZoneProps}
        className={clsx(
          "rounded-lg border-2 border-dashed transition-colors",
          isLoading && "pointer-events-none border-text-muted bg-surface opacity-70",
          !isLoading && isDragging && "border-accent bg-accent/10",
          !isLoading && !isDragging && "border-text-muted bg-surface hover:border-accent/50"
        )}
      >
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleFileSelect} disabled={isLoading} className="hidden" />
        {renderContent()}
      </div>
      {error && <p className="text-sm text-warning">{error}</p>}
    </div>
  )
}

const DropZone = ({ isDragging, onClick }: { isDragging: boolean; onClick: () => void }) => {
  return (
    <div onClick={onClick} className="flex h-24 cursor-pointer items-center justify-center">
      <p className="text-text-muted">
        {isDragging ? "Drop to upload" : "Drop image here or click to upload"}
      </p>
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
