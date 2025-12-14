import type { UploadedImage } from "../../core/types"
import {
  useProcessingError,
  useProcessingStatus,
  useSvgOutput,
  useUploadedImage,
} from "../../store/selectors"

type PreviewCanvasProps = {
  title: "Original" | "Vectorized"
}

export const PreviewCanvas = ({ title }: PreviewCanvasProps) => {
  const isOriginal = title === "Original"

  return (
    <div className="flex h-80 flex-col rounded-lg bg-surface">
      <h2 className="border-b border-text-muted/20 px-4 py-2 font-mono text-sm uppercase text-text-muted">
        {title}
      </h2>
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        {isOriginal ? <OriginalContent /> : <VectorizedContent />}
      </div>
    </div>
  )
}

const OriginalContent = () => {
  const uploadedImage = useUploadedImage()

  if (!uploadedImage) return <Placeholder />

  return <ImageDisplay image={uploadedImage} />
}

const VectorizedContent = () => {
  const svgOutput = useSvgOutput()
  const processingStatus = useProcessingStatus()
  const processingError = useProcessingError()

  if (processingStatus === "processing") return <LoadingIndicator />

  if (processingStatus === "error" && processingError) return <ErrorDisplay message={processingError} />

  if (svgOutput) return <SvgDisplay svg={svgOutput} />

  return <Placeholder />
}

const ImageDisplay = ({ image }: { image: UploadedImage }) => {
  return <img src={image.dataUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
}

const SvgDisplay = ({ svg }: { svg: string }) => {
  return (
    <div
      className="flex h-full w-full items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <p className="font-mono text-sm text-text-muted">Vectorizing...</p>
    </div>
  )
}

const ErrorDisplay = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
        <span className="text-xl text-secondary">!</span>
      </div>
      <p className="max-w-xs text-sm text-secondary">{message}</p>
    </div>
  )
}

const Placeholder = () => {
  return <p className="text-text-muted">No image uploaded</p>
}
