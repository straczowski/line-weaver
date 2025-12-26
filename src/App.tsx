import { useEffect } from "react"
import { ControlPanel } from "./components/ControlPanel/ControlPanel"
import { ExportButton } from "./components/ExportButton/ExportButton"
import { ExportGcodeButton } from "./components/ExportGcodeButton/ExportGcodeButton"
import { GcodeSettingsPanel } from "./components/GcodeSettingsPanel/GcodeSettingsPanel"
import { ImageUploader } from "./components/ImageUploader/ImageUploader"
import { PreviewCanvas } from "./components/PreviewCanvas/PreviewCanvas"
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

const Header = () => {
  return (
    <header className="border-b border-surface px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="font-mono text-xl font-bold tracking-wider text-accent">LINE WEAVER</h1>
        <nav className="flex gap-4">
          <a href="https://github.com/straczowski/line-weaver" className="text-text-muted transition-colors hover:text-text">
            GitHub
          </a>
          <a href="#" className="text-text-muted transition-colors hover:text-text">
            Tutorial
          </a>
        </nav>
      </div>
    </header>
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
        <PreviewCanvas title="Original" />
        <PreviewCanvas title="Vectorized" />
      </div>
    </section>
  )
}

const ControlSection = () => {
  return (
    <section className="mb-8 space-y-4">
      <ControlPanel />
      <GcodeSettingsPanel />
    </section>
  )
}

const ActionsSection = () => {
  return (
    <section className="flex justify-center gap-4">
      <ExportButton />
      <ExportGcodeButton />
    </section>
  )
}
