import { HATCHING_MODE } from "../../core/types"
import { useSettingsActions } from "../../store/actions-hooks"
import { useSettings } from "../../store/selectors"
import { ModeSelector } from "./ModeSelector"
import { SliderControl } from "./SliderControl"
import { ToggleControl } from "./ToggleControl"

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
        <ModeSelector
          label="Mode"
          tooltip="Sketch: Variable-density angled lines. Cross: Simple 3-level pattern (nothing → diagonal → cross). Grid: 5-level grid patterns optimized for pen plotters."
          value={settings.hatchingMode}
          onChange={(mode) => updateSettings({ hatchingMode: mode })}
          disabled={!settings.enableHatching}
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
        {settings.hatchingMode === HATCHING_MODE.SKETCH && (
          <>
            <SliderControl
              label="Angle"
              tooltip="Direction of hatch lines in degrees. 0° is horizontal, 90° is vertical."
              value={settings.hatchAngle}
              min={0}
              max={180}
              step={5}
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
          </>
        )}
        {settings.hatchingMode === HATCHING_MODE.CROSS && (
          <SliderControl
            label="Angle"
            tooltip="Direction of diagonal lines in degrees. 45° is standard, 0° is horizontal."
            value={settings.hatchAngle}
            min={0}
            max={180}
            step={5}
            unit="°"
            onChange={(value) => updateSettings({ hatchAngle: value })}
            disabled={!settings.enableHatching}
          />
        )}
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
          label="Min Line Length Filter"
          tooltip="Removes polylines shorter than this value. Helps clean up small artifacts and noise."
          value={settings.minLineLength}
          min={0}
          max={40}
          step={1}
          onChange={(value) => updateSettings({ minLineLength: value })}
        />
        <SliderControl
          label="Stroke Width SVG"
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

