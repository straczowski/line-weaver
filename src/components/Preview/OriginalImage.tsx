import { useOriginalImage } from "../../store/selectors"

export const OriginalImage = () => {
  const originalImage = useOriginalImage()

  if (!originalImage) {
    return <Placeholder />
  }

  return <img src={originalImage.dataUrl} alt="Uploaded image preview" className="max-h-full max-w-full object-contain" />
}

const Placeholder = () => {
  return <p className="text-text-muted">No image uploaded</p>
}

