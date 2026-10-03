import { Link } from "react-router-dom"
import { Header } from "./components/Header/Header"

export const Setup = () => {
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
    <section className="space-y-10">
      <div className="space-y-4">
        <h1 className="font-mono text-3xl font-bold text-accent">Controller Setup</h1>
        <p className="text-text">Wire the Arduino Uno and CNC shield, then flash GRBL for this CoreXY pen plotter.</p>
      </div>
      <HardwareSection />
      <SoftwareSection />
    </section>
  )
}

const HardwareSection = () => {
  return (
    <div className="space-y-8">
      <h2 className="font-mono text-2xl font-bold text-accent">Hardware</h2>
      <PartListSection />
      <DriverSection />
      <JumperSection />
      <FullConnectedSection />
      <WireUpSection />
    </div>
  )
}

const PartListSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-lg font-bold text-accent">Part list</h3>
      <ul className="list-disc space-y-2 pl-5 text-text">
        <li>12V 2A DC power supply</li>
        <li>Arduino Uno</li>
        <li>CNC Shield</li>
        <li>Drivers</li>
        <li>Jumpers</li>
      </ul>
      <div className="space-y-2">
        Use an <strong>genuine Arduino Uno</strong>. Cheap boards break, or fail in other ways. <br />
        Also make sure you suply <strong>at least 2A</strong> for the CNC shield.
      </div>
    </div>
  )
}

const DriverSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-lg font-bold text-accent">Driver Types</h3>
      <p className="text-text">Look at the chip and the screw.</p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <DriverPair
          name="A4988"
          lines={["A4988 is green or red.", "The chip sits in the middle.", "The screw is at the bottom."]}
          abstractSrc="/line-weaver/setup/A4988-abstract.jpg"
          abstractAlt="A4988 diagram. Chip in the middle, screw at the bottom."
          photoSrc="/line-weaver/setup/A4988-drivers.jpg"
          photoAlt="Green A4988 drivers on a CNC shield"
        />
        <DriverPair
          name="DRV8825"
          lines={["DRV8825 is purple.", "The screw is at the top.", "The chip is at the bottom."]}
          abstractSrc="/line-weaver/setup/DRV8825-abstract.jpg"
          abstractAlt="DRV8825 diagram. Screw at the top, chip at the bottom."
          photoSrc="/line-weaver/setup/DRV8825-drivers.jpg"
          photoAlt="Purple DRV8825 drivers on a CNC shield"
        />
      </div>
    </div>
  )
}

const DriverPair = ({
  name,
  lines,
  abstractSrc,
  abstractAlt,
  photoSrc,
  photoAlt,
}: {
  name: string
  lines: string[]
  abstractSrc: string
  abstractAlt: string
  photoSrc: string
  photoAlt: string
}) => {
  return (
    <div className="space-y-3">
      <h4 className="font-mono text-base font-bold text-accent">{name}</h4>
      <div className="space-y-1 text-text">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SetupImage src={abstractSrc} alt={abstractAlt} />
        <SetupImage src={photoSrc} alt={photoAlt} />
      </div>
    </div>
  )
}

const JumperSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-lg font-bold text-accent">How to set jumpers</h3>
      <p className="text-text">Set 7 jumpers in total.</p>
      <p className="text-text">Three under X. Three under Y. One under Z.</p>
      <div className="grid grid-cols-2 gap-3">
        <SetupImage
          src="/line-weaver/setup/jumpers.jpg"
          alt="CNC shield with 7 jumpers. Three under X, three under Y, one under Z."
        />
      </div>
    </div>
  )
}

const FullConnectedSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-lg font-bold text-accent">Fully connected</h3>
      <p className="text-text">Motors, servo, fan, and the 12V supply.</p>
      <SetupImage
        src="/line-weaver/setup/CNC-plugs.jpg"
        alt="CNC shield plug map. X motor, Y motor, servo power, servo signal, fan power, and 12V supply."
      />
      <div className="grid grid-cols-2 gap-3">
        <SetupImage
          src="/line-weaver/setup/fully-plugged-1.jpg"
          alt="CNC shield with green A4988 drivers and motors plugged in"
        />
        <SetupImage
          src="/line-weaver/setup/fully-plugged-2.jpg"
          alt="CNC shield with purple DRV8825 drivers and motors plugged in"
        />
      </div>
    </div>
  )
}

const WireUpSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-lg font-bold text-accent">How to wire up</h3>
      <ol className="list-decimal space-y-2 pl-5 text-text">
        <li>Plug the Arduino into USB.</li>
        <li>Plug the 12v 2A power supply</li>
      </ol>
      <p className="text-text">To unplug, do this in reverse. The order matters, my Macbook does not recognize the Arudiono if it is powered first.</p>
    </div>
  )
}

const SoftwareSection = () => {
  return (
    <div className="space-y-8">
      <h2 className="font-mono text-2xl font-bold text-accent">Software</h2>
      <GrblControllerSection />
      <GrblConfigurationSection />
    </div>
  )
}

const GrblControllerSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-lg font-bold text-accent">cprezzi GRBL Controller</h3>
      <p className="text-text">
        Use the <ExternalLink href="https://github.com/cprezzi/grbl-servo/tree/eggbot">cprezzi/grbl-servo</ExternalLink> <Code>eggbot</Code> branch. It is a fork of Grbl that drives a servo instead of a spindle or laser, as on an EggBot or pen plotter.
      </p>
      <p className="text-text">Clone it:</p>
      <CommandBlock command="git clone -b eggbot https://github.com/cprezzi/grbl-servo.git ~/Documents/grbl" />
      <p className="text-text">
        Open <code className="font-mono text-sm">~/Documents/grbl/grbl/config.h</code>. Uncomment these two lines:
      </p>
      <CommandBlock command={"#define COREXY\n#define SPINDLE_IS_SERVO"} />
      <p className="text-text">Copy the library into the Arduino IDE:</p>
      <CommandBlock command={"rm -rf ~/Documents/Arduino/libraries/grbl\ncp -r ~/Documents/grbl/grbl ~/Documents/Arduino/libraries/grbl"} />
      <p className="text-text">Upload with the Arduino IDE:</p>
      <ol className="list-decimal space-y-2 pl-5 text-text">
        <li>Open <code className="font-mono text-sm">File → Examples → grbl → grblUpload</code>.</li>
        <li>Board: Arduino Uno. Port: <code className="font-mono text-sm">/dev/cu.usbmodem*</code></li>
        <li>Click Upload.</li>
      </ol>
      <p className="text-text">
        After reset, GRBL answers at <code className="font-mono text-sm">115200</code>.
      </p>
    </div>
  )
}

const grblSettings = `$0 = 10 (step pulse, usec)
$1 = 25 (step idle delay, msec)
$2 = 0 (step port invert mask:00000000)
$3 = 0 (dir port invert mask:00000000)
$4 = 0 (step enable invert, bool)
$5 = 0 (limit pins invert, bool)
$6 = 0 (probe pin invert, bool)
$10 = 3 (status report mask:00000011)
$11 = 0.010 (junction deviation, mm)
$12 = 0.002 (arc tolerance, mm)
$13 = 0 (report inches, bool)
$20 = 0 (soft limits, bool)
$21 = 0 (hard limits, bool)
$22 = 0 (homing cycle, bool)
$23 = 0 (homing dir invert mask:00000000)
$24 = 25.000 (homing feed, mm/min)
$25 = 500.000 (homing seek, mm/min)
$26 = 250 (homing debounce, msec)
$27 = 1.000 (homing pull-off, mm)
$30 = 255 (spindle max / servo full angle, eggbot 0-255 range)
$31 = 0 (spindle min / servo zero angle)
$32 = 0 (laser mode disable: 0 = spindle/servo)
$100 = 100.000 (x, step/mm)
$101 = 100.000 (y, step/mm)
$102 = 100.000 (z, step/mm)
$110 = 5000.000 (x max rate, mm/min)
$111 = 5000.000 (y max rate, mm/min)
$112 = 500.000 (z max rate, mm/min)
$120 = 5000.000 (x accel, mm/sec^2)
$121 = 5000.000 (y accel, mm/sec^2)
$122 = 10.000 (z accel, mm/sec^2)
$130 = 200.000 (x max travel, mm)
$131 = 200.000 (y max travel, mm)
$132 = 200.000 (z max travel, mm)`

const GrblConfigurationSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-mono text-lg font-bold text-accent">GRBL Configuration</h3>
      <p className="text-text">These are the settings for this machine.</p>
      <CommandBlock command={grblSettings} />
      <p className="text-text">
        Write them with <ExternalLink href="https://github.com/straczowski/macos-gcode-sender">macos-gcode-sender</ExternalLink>.
      </p>
      <p className="text-text">
        The file is <code className="font-mono text-sm">config/default.grbl</code>. Run <code className="font-mono text-sm">python config_stream.py</code>.
      </p>
    </div>
  )
}

const CommandBlock = ({ command }: { command: string }) => {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-surface bg-surface/40 p-4 font-mono text-sm text-text">{command}</pre>
  )
}

const Code = ({ children }: { children: string }) => {
  return <code className="font-mono text-sm">{children}</code>
}

const ExternalLink = ({
  href,
  children,
}: {
  href: string
  children: string
}) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-text underline transition-colors hover:text-text/80">
      {children}
    </a>
  )
}

const SetupImage = ({
  src,
  alt,
}: {
  src: string
  alt: string
}) => {
  return (
    <div className="overflow-hidden rounded border border-surface">
      <img
        src={src}
        alt={alt}
        className="h-auto w-full object-cover"
        onError={(event) => {
          const target = event.target as HTMLImageElement
          target.style.display = "none"
        }}
      />
    </div>
  )
}
