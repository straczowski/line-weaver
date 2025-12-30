import type { OriginalImageMetadata } from "../types.ts"

export const loadImage = (file: File): Promise<OriginalImageMetadata> => {
  return readFileAsDataUrl(file).then((dataUrl) => loadImageElement({ file, dataUrl }))
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (typeof result !== "string") {
        reject(new Error("Failed to read file as data URL"))
        return
      }
      resolve(result)
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

const loadImageElement = ({ file, dataUrl }: { file: File; dataUrl: string }): Promise<OriginalImageMetadata> => {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve({
        file,
        dataUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }

    image.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    image.src = dataUrl
  })
}
