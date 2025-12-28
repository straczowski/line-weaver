import { useUploadedImage } from "../../store/selectors"

export const OriginalImage = () => {
  const uploadedImage = useUploadedImage()

  if (!uploadedImage) {
    return <Placeholder />
  }

  return <img src={uploadedImage.dataUrl} alt="Uploaded image preview" className="max-h-full max-w-full object-contain" />
}

const Placeholder = () => {
  return <p className="text-text-muted">No image uploaded</p>
}

