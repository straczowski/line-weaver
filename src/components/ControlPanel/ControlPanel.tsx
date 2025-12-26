import { useSettingsActions } from "../../store/actions-hooks"
import { useSettings } from "../../store/selectors"

export const ControlPanel = () => {
  const settings = useSettings()
  const { updateSettings } = useSettingsActions()

  return (
    <div className="space-y-6">
      <ControlSection title="General">
        <SliderControl
          label="Grid Size"
          value={settings.gridSize}
          min={8}
          max={64}
          step={8}
          unit="px"
          onChange={(value) => updateSettings({ gridSize: value })}
        />
        <SliderControl
          label="Stroke Width"
          value={settings.strokeWidth}
          min={0.5}
          max={5}
          step={0.5}
          unit="px"
          onChange={(value) => updateSettings({ strokeWidth: value })}
        />
        <SliderControl
          label="Blur Radius"
          value={settings.blurRadius}
          min={0}
          max={5}
          step={1}
          unit="px"
          onChange={(value) => updateSettings({ blurRadius: value })}
        />
        <SliderControl
          label="Noise Amount"
          value={settings.noiseAmount}
          min={0}
          max={10}
          step={0.5}
          unit="px"
          onChange={(value) => updateSettings({ noiseAmount: value })}
        />
        <SliderControl
          label="Min Line Length"
          value={settings.minLineLength}
          min={0}
          max={20}
          step={1}
          onChange={(value) => updateSettings({ minLineLength: value })}
        />
      </ControlSection>

      <ControlSection title="Contours (Edge Detection)">
        <ToggleControl
          label="Enable Contours"
          checked={settings.enableContours}
          onChange={(checked) => updateSettings({ enableContours: checked })}
        />
        <SliderControl
          label="Edge Low Threshold"
          value={settings.edgeLowThreshold}
          min={0}
          max={255}
          step={5}
          onChange={(value) => updateSettings({ edgeLowThreshold: value })}
        />
        <SliderControl
          label="Edge High Threshold"
          value={settings.edgeHighThreshold}
          min={0}
          max={255}
          step={5}
          onChange={(value) => updateSettings({ edgeHighThreshold: value })}
        />
        <SliderControl
          label="Contour Simplify"
          value={settings.contourSimplify}
          min={1}
          max={5}
          step={1}
          onChange={(value) => updateSettings({ contourSimplify: value })}
        />
      </ControlSection>

      <ControlSection title="Hatching">
        <ToggleControl
          label="Enable Hatching"
          checked={settings.enableHatching}
          onChange={(checked) => updateSettings({ enableHatching: checked })}
        />
        <SliderControl
          label="Hatch Angle"
          value={settings.hatchAngle}
          min={0}
          max={180}
          step={15}
          unit="°"
          onChange={(value) => updateSettings({ hatchAngle: value })}
        />
        <SliderControl
          label="Hatch Density"
          value={settings.hatchDensity}
          min={1}
          max={8}
          step={1}
          onChange={(value) => updateSettings({ hatchDensity: value })}
        />
        <ToggleControl
          label="Cross-Hatch"
          checked={settings.enableCrossHatch}
          onChange={(checked) => updateSettings({ enableCrossHatch: checked })}
        />
        <SliderControl
          label="Threshold"
          value={settings.threshold}
          min={0}
          max={255}
          step={1}
          onChange={(value) => updateSettings({ threshold: value })}
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

type SliderControlProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}

const SliderControl = ({ label, value, min, max, step, unit, onChange }: SliderControlProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text">{label}</span>
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
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-background accent-accent"
      />
    </div>
  )
}

type ToggleControlProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const ToggleControl = ({ label, checked, onChange }: ToggleControlProps) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-background"
        }`}
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
