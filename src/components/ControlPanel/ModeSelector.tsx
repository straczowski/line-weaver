import { Tooltip } from "./Tooltip"
import { HATCHING_MODE } from "../../core/types"
import type { HatchingMode } from "../../core/types"

type ModeSelectorProps = {
  label: string
  tooltip: string
  value: HatchingMode
  onChange: (mode: HatchingMode) => void
  disabled?: boolean
}

export const ModeSelector = ({ label, tooltip, value, onChange, disabled = false }: ModeSelectorProps) => {
  return (
    <div className={`flex items-center justify-between transition-opacity ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <span className="flex items-center text-sm text-text">
        {label}
        <Tooltip text={tooltip} />
      </span>
      <div className="flex gap-1 rounded-lg bg-background p-1">
        <ModeButton
          mode={HATCHING_MODE.SKETCH}
          currentMode={value}
          onClick={onChange}
          disabled={disabled}
        />
        <ModeButton
          mode={HATCHING_MODE.CROSS}
          currentMode={value}
          onClick={onChange}
          disabled={disabled}
        />
        <ModeButton
          mode={HATCHING_MODE.GRID}
          currentMode={value}
          onClick={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

type ModeButtonProps = {
  mode: HatchingMode
  currentMode: HatchingMode
  onClick: (mode: HatchingMode) => void
  disabled?: boolean
}

const getLabel = (mode: HatchingMode): string => {
  if (mode === HATCHING_MODE.SKETCH) return "Sketch"
  if (mode === HATCHING_MODE.CROSS) return "Cross"
  return "Grid"
}

const ModeButton = ({ mode, currentMode, onClick, disabled }: ModeButtonProps) => {
  const isActive = mode === currentMode
  const label = getLabel(mode)

  return (
    <button
      onClick={() => onClick(mode)}
      disabled={disabled}
      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
        isActive
          ? "bg-accent text-background"
          : "text-text-muted hover:text-text"
      } disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  )
}

