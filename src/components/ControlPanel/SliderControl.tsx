import { Tooltip } from "./Tooltip"

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

export const SliderControl = ({ label, tooltip, value, min, max, step, unit, onChange, disabled = false }: SliderControlProps) => {
  return (
    <div className={`flex flex-col gap-2 transition-opacity ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="flex items-center text-sm text-text">
          {label}
          <Tooltip text={tooltip} />
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

