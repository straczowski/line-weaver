import { useState } from "react"
import { useSettingsActions } from "../../store/actions-hooks"
import { useSettings } from "../../store/selectors"

export const ControlPanel = () => {
  const settings = useSettings()
  const { updateSettings } = useSettingsActions()

  return (
    <div className="space-y-6">
      <ControlSection title="Preprocessing">
        <SliderControl
          label="Blur Radius"
          tooltip="Applies Gaussian blur to reduce noise before edge detection. Higher values smooth out details."
          value={settings.blurRadius}
          min={0}
          max={5}
          step={1}
          unit="px"
          onChange={(value) => updateSettings({ blurRadius: value })}
        />
        <SliderControl
          label="Grid Size"
          tooltip="Size of each cell for brightness sampling. Smaller values capture more detail but increase processing time."
          value={settings.gridSize}
          min={8}
          max={64}
          step={8}
          unit="px"
          onChange={(value) => updateSettings({ gridSize: value })}
        />
      </ControlSection>

      <ControlSection title="Edge Detection">
        <ToggleControl
          label="Enable Contours"
          tooltip="Detect and trace edges in the image to create outline strokes."
          checked={settings.enableContours}
          onChange={(checked) => updateSettings({ enableContours: checked })}
        />
        <SliderControl
          label="Low Threshold"
          tooltip="Minimum gradient strength to consider as a potential edge. Lower values detect more edges."
          value={settings.edgeLowThreshold}
          min={0}
          max={255}
          step={5}
          onChange={(value) => updateSettings({ edgeLowThreshold: value })}
          disabled={!settings.enableContours}
        />
        <SliderControl
          label="High Threshold"
          tooltip="Gradient strength required for a definite edge. Edges between low and high are kept if connected to strong edges."
          value={settings.edgeHighThreshold}
          min={0}
          max={255}
          step={5}
          onChange={(value) => updateSettings({ edgeHighThreshold: value })}
          disabled={!settings.enableContours}
        />
        <SliderControl
          label="Simplification"
          tooltip="Reduces points in contour lines. Higher values create smoother, simpler lines with fewer vertices."
          value={settings.contourSimplify}
          min={1}
          max={5}
          step={1}
          onChange={(value) => updateSettings({ contourSimplify: value })}
          disabled={!settings.enableContours}
        />
      </ControlSection>

      <ControlSection title="Hatching">
        <ToggleControl
          label="Enable Hatching"
          tooltip="Fill darker areas with parallel lines to create shading effects."
          checked={settings.enableHatching}
          onChange={(checked) => updateSettings({ enableHatching: checked })}
        />
        <SliderControl
          label="Brightness Threshold"
          tooltip="Brightness cutoff for hatching. Areas darker than this value will receive hatch lines."
          value={settings.threshold}
          min={0}
          max={255}
          step={1}
          onChange={(value) => updateSettings({ threshold: value })}
          disabled={!settings.enableHatching}
        />
        <SliderControl
          label="Angle"
          tooltip="Direction of hatch lines in degrees. 0° is horizontal, 90° is vertical."
          value={settings.hatchAngle}
          min={0}
          max={180}
          step={15}
          unit="°"
          onChange={(value) => updateSettings({ hatchAngle: value })}
          disabled={!settings.enableHatching}
        />
        <SliderControl
          label="Density"
          tooltip="Maximum number of hatch lines per cell in the darkest areas. Higher values create denser shading."
          value={settings.hatchDensity}
          min={1}
          max={8}
          step={1}
          onChange={(value) => updateSettings({ hatchDensity: value })}
          disabled={!settings.enableHatching}
        />
        <ToggleControl
          label="Cross-Hatch"
          tooltip="Add perpendicular lines in darker areas for richer shading."
          checked={settings.enableCrossHatch}
          onChange={(checked) => updateSettings({ enableCrossHatch: checked })}
          disabled={!settings.enableHatching}
        />
      </ControlSection>

      <ControlSection title="Output">
        <SliderControl
          label="Noise Amount"
          tooltip="Adds Perlin noise displacement to lines for a hand-drawn, sketchy appearance."
          value={settings.noiseAmount}
          min={0}
          max={10}
          step={0.5}
          unit="px"
          onChange={(value) => updateSettings({ noiseAmount: value })}
        />
        <SliderControl
          label="Min Line Length"
          tooltip="Removes polylines shorter than this value. Helps clean up small artifacts and noise."
          value={settings.minLineLength}
          min={0}
          max={20}
          step={1}
          unit="px"
          onChange={(value) => updateSettings({ minLineLength: value })}
        />
        <SliderControl
          label="Stroke Width"
          tooltip="Thickness of lines in the SVG output. Affects visual weight of the drawing."
          value={settings.strokeWidth}
          min={0.5}
          max={5}
          step={0.5}
          unit="px"
          onChange={(value) => updateSettings({ strokeWidth: value })}
        />
      </ControlSection>
    </div>
  )
}

type ControlSectionProps = {
  title: string
  children: React.ReactNode
}

const ControlSection = ({ title, children }: ControlSectionProps) => {
  return (
    <div className="rounded-lg bg-surface p-4">
      <h2 className="mb-4 font-mono text-sm uppercase text-text-muted">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  )
}

type TooltipIconProps = {
  text: string
}

const TooltipIcon = ({ text }: TooltipIconProps) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="ml-1.5 flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-text-muted/20 text-[10px] font-medium text-text-muted transition-colors hover:bg-accent/30 hover:text-accent">
        ?
      </span>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-md bg-background px-3 py-2 text-xs text-text shadow-lg ring-1 ring-text-muted/20">
          {text}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-background" />
        </div>
      )}
    </div>
  )
}

type SliderControlProps = {
  label: string
  tooltip: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
  disabled?: boolean
}

const SliderControl = ({ label, tooltip, value, min, max, step, unit, onChange, disabled = false }: SliderControlProps) => {
  return (
    <div className={`flex flex-col gap-2 transition-opacity ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center text-sm text-text">
          {label}
          <TooltipIcon text={tooltip} />
        </span>
        <span className="font-mono text-sm text-accent">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-background accent-accent disabled:cursor-not-allowed"
      />
    </div>
  )
}

type ToggleControlProps = {
  label: string
  tooltip: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

const ToggleControl = ({ label, tooltip, checked, onChange, disabled = false }: ToggleControlProps) => {
  return (
    <div className={`flex items-center justify-between transition-opacity ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <span className="flex items-center text-sm text-text">
        {label}
        <TooltipIcon text={tooltip} />
      </span>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-background"
        } disabled:cursor-not-allowed`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-text transition-transform ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  )
}
