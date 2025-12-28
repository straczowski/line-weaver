import { useEffect } from "react"
import { ControlPanel } from "./components/ControlPanel/ControlPanel"
import { ExportButtonGCode } from "./components/Export/ExportButtonGCode"
import { ExportButtonSVG } from "./components/Export/ExportButtonSVG"
import { GcodeSettings } from "./components/GcodeSettings/GcodeSettings"
import { Header } from "./components/Header/Header"
import { ImageUploader } from "./components/ImageUploader/ImageUploader"
import { OriginalImage } from "./components/Preview/OriginalImage"
import { PreviewPanel } from "./components/Preview/PreviewPanel"
import { VectorizedImage } from "./components/Preview/VectorizedImage"
import { useDebouncedSettings } from "./hooks/use-debounced-settings"
import { useVectorize } from "./hooks/use-vectorize"
import { useImageData } from "./store/selectors"

export const App = () => {
  const imageData = useImageData()
  const debouncedSettings = useDebouncedSettings(250)
  const { vectorize } = useVectorize()

  useEffect(() => {
    if (imageData) {
      vectorize()
    }
  }, [imageData, debouncedSettings, vectorize])

  return (
    <div className="min-h-screen bg-background font-sans text-text">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <UploadSection />
        <CanvasSection />
        <ControlSection />
        <ActionsSection />
      </main>
    </div>
  )
}

const UploadSection = () => {
  return (
    <section className="mb-8">
      <ImageUploader />
    </section>
  )
}

const CanvasSection = () => {
  return (
    <section className="mb-8">
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <PreviewPanel title="Original">
          <OriginalImage />
        </PreviewPanel>
        <PreviewPanel title="Vectorized">
          <VectorizedImage />
        </PreviewPanel>
      </div>
    </section>
  )
}

const ControlSection = () => {
  return (
    <section className="mb-8 space-y-4">
      <ControlPanel />
      <GcodeSettings />
    </section>
  )
}

const ActionsSection = () => {
  return (
    <section className="flex justify-center gap-4">
      <ExportButtonSVG />
      <ExportButtonGCode />
    </section>
  )
}
