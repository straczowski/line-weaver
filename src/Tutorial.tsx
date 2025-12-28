import { Link } from "react-router-dom"
import { Header } from "./components/Header/Header"

export const Tutorial = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-text">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <BackButton />
        <ContentSection />
      </main>
    </div>
  )
}

const BackButton = () => {
  return (
    <Link to="/" className="mb-8 inline-block text-text-muted transition-colors hover:text-text">
      ← Back
    </Link>
  )
}

const ContentSection = () => {
  return (
    <section className="space-y-8">
      <TextSection />
      <ImageSection />
      <VideoSection />
    </section>
  )
}

const TextSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-2xl font-bold text-accent">How to Use Line Weaver</h2>
      <div className="space-y-4 text-text">
        <p>
          Line Weaver is a tool for converting images into vectorized line art and generating G-code for plotting or engraving.
        </p>
        <p>
          Upload an image to get started. The tool will automatically process it and generate a vectorized version that you can preview, adjust, and export.
        </p>
      </div>
    </div>
  )
}

const ImageSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-2xl font-bold text-accent">Examples</h2>
      <div className="space-y-4">
        <p className="text-text-muted">
          Place tutorial images in the <code className="text-text">public/tutorial/</code> directory and reference them here.
        </p>
        <div className="rounded border border-surface p-4">
          <img
            src="/tutorial/example-1.png"
            alt="Tutorial example"
            className="w-full rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
            }}
          />
        </div>
      </div>
    </div>
  )
}

const VideoSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-2xl font-bold text-accent">Video Tutorial</h2>
      <div className="space-y-4">
        <p className="text-text-muted">
          Place tutorial videos in the <code className="text-text">public/tutorial/</code> directory and reference them here.
        </p>
        <div className="rounded border border-surface p-4">
          <video
            src="/tutorial/tutorial-video.mp4"
            controls
            className="w-full rounded"
            onError={(e) => {
              const target = e.target as HTMLVideoElement
              target.style.display = "none"
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  )
}

