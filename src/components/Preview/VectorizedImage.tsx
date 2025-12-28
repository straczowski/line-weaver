import { useProcessingError, useProcessingStatus, useSvgOutput } from "../../store/selectors"
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator"

export const VectorizedImage = () => {
  const svgOutput = useSvgOutput()
  const processingStatus = useProcessingStatus()
  const processingError = useProcessingError()

  if (processingStatus === "processing") {
    return <LoadingIndicator message="Vectorizing..." size="md" direction="column" />
  }

  if (processingStatus === "error" && processingError) {
    return <ErrorDisplay message={processingError} />
  }

  if (!svgOutput) {
    return <Placeholder />
  }

  return <SvgDisplay svg={svgOutput} />
}

const SvgDisplay = ({ svg }: { svg: string }) => {
  return (
    <div
      className="flex h-full w-full items-center justify-center [&>svg]:w-auto [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:object-contain"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
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
  return <p className="text-text-muted"></p>
}

