import { Tooltip } from "./Tooltip"

type ToggleControlProps = {
  label: string
  tooltip: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const ToggleControl = ({ label, tooltip, checked, onChange, disabled = false }: ToggleControlProps) => {
  return (
    <div className={`flex items-center justify-between transition-opacity ${disabled ? "pointer-events-none opacity-40" : ""}`}>
      <span className="flex items-center text-sm text-text">
        {label}
        <Tooltip text={tooltip} />
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

