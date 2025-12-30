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
      <IntroductionSection />
      <PenPlotterSection />
      <SendCodeSection />
      <AssetsSection />
    </section>
  )
}

const IntroductionSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-2xl font-bold text-accent">What is it for?</h2>
      <div className="space-y-4 text-text">
        <p>
          Line Weaver is a tool for converting images into vectorized line art and generating <a href="https://reprap.org/wiki/G-code" target="_blank" rel="noopener noreferrer" className="text-accent underline transition-colors hover:text-accent/80">G-Code</a> specialized for pen plotters.
        </p>
        <p>
          This tool runs entirely client-side in your browser. Your images are not uploaded or stored anywhere.
        </p>
        <p>
          Drop an image to get started. The tool will automatically process it and generate a vectorized version that you can preview, adjust, and export.
        </p>
      </div>
    </div>
  )
}

const PenPlotterSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-2xl font-bold text-accent">Pen Plotter Setup</h2>
      <div className="space-y-4 text-text">
        <p>
        I am using an open-source CNC system based on a Raspberry Pi and an Arduino, controlled by {" "}
          <a
            href="https://github.com/grbl/grbl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline transition-colors hover:text-accent/80"
          >
            grbl
          </a>{" "}
          firmware.
        </p>
        <p>
          If you want to override the G-Code commands in Line Weaver you can expand the G-Code Settings section.
        </p>
        <p>
          Sheet dimension is set to DIN A4 (297mm × 211mm) by default. Pen must start at the very corner of the sheet.
        </p>
      </div>
    </div>
  )
}

const SendCodeSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-2xl font-bold text-accent">Send G-Code to Plotter</h2>
      <div className="space-y-4 text-text">
        <p>
          If you are using MacOS or Linux you might want to check my other project <a
            href="https://github.com/straczowski/macos-gcode-sender"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline transition-colors hover:text-accent/80"
          >
            macos-gcode-sender
          </a> which contains scripts for sending G-Code to the plotter.
        </p>
      </div>
    </div>
  )
}

const AssetsSection = () => {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-2xl font-bold text-accent">Example</h2>
      <div className="grid grid-cols-2 gap-4">
        <AssetItem src="/line-weaver/tutorial/input-1.jpg" alt="Input image" type="image" />
        <AssetItem src="/line-weaver/tutorial/output-2.mp4" alt="Output video" type="video" />
        <AssetItem src="/line-weaver/tutorial/output-3.jpg" alt="Output image 3" type="image" />
        <AssetItem src="/line-weaver/tutorial/output-4.jpg" alt="Output image 4" type="image" />
      </div>
    </div>
  )
}

const AssetItem = ({ src, alt, type }: { src: string; alt: string; type: "image" | "video" }) => {
  return (
    <div className="aspect-square overflow-hidden rounded border border-surface">
      {type === "image" ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = "none"
          }}
        />
      ) : (
        <video
          src={src}
          autoPlay
          loop
          muted
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLVideoElement
            target.style.display = "none"
          }}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}

