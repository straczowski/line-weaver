import type { UploadedImage } from "./types"

const MAX_DIMENSION = 2000

export const extractImageData = async (uploadedImage: UploadedImage): Promise<ImageData> => {
  const { scaledWidth, scaledHeight } = calculateScaledDimensions({
    width: uploadedImage.width,
    height: uploadedImage.height,
  })

  const canvas = createOffscreenCanvas(scaledWidth, scaledHeight)
  const context = getCanvasContext(canvas)

  await drawImageToCanvas({ context, dataUrl: uploadedImage.dataUrl, scaledWidth, scaledHeight })

  return context.getImageData(0, 0, scaledWidth, scaledHeight)
}

const calculateScaledDimensions = ({
  width,
  height,
}: {
  width: number
  height: number
}): { scaledWidth: number; scaledHeight: number } => {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { scaledWidth: width, scaledHeight: height }
  }

  const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)

  return {
    scaledWidth: Math.round(width * scale),
    scaledHeight: Math.round(height * scale),
  }
}

const createOffscreenCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

const getCanvasContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("Failed to get canvas 2D context")
  }
  return context
}

const drawImageToCanvas = ({
  context,
  dataUrl,
  scaledWidth,
  scaledHeight,
}: {
  context: CanvasRenderingContext2D
  dataUrl: string
  scaledWidth: number
  scaledHeight: number
}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      context.drawImage(image, 0, 0, scaledWidth, scaledHeight)
      resolve()
    }

    image.onerror = () => {
      reject(new Error("Failed to load image for extraction"))
    }

    image.src = dataUrl
  })
}
