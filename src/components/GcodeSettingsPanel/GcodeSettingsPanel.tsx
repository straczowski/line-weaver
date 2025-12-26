import { useState } from "react"
import { useGcodeSettingsActions } from "../../store/actions-hooks"
import { useGcodeSettings } from "../../store/selectors"

export const GcodeSettingsPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const gcodeSettings = useGcodeSettings()
  const { updateGcodeCommands, updateGcodeSheet } = useGcodeSettingsActions()

  return (
    <div className="rounded-lg bg-surface p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between"
      >
        <h2 className="font-mono text-sm uppercase text-text-muted">GCODE Settings</h2>
        <span className="text-text-muted">{isExpanded ? "▲" : "▼"}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-6">
          <CommandsSection
            commands={gcodeSettings.commands}
            onUpdate={updateGcodeCommands}
          />
          <SheetSection
            sheet={gcodeSettings.sheet}
            onUpdate={updateGcodeSheet}
          />
        </div>
      )}
    </div>
  )
}

type CommandsSectionProps = {
  commands: {
    penUp: string
    penDown: string
    feedRate: string
    pause: string
  }
  onUpdate: (partial: Partial<CommandsSectionProps["commands"]>) => void
}

const CommandsSection = ({ commands, onUpdate }: CommandsSectionProps) => {
  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase text-text-muted">Commands</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Pen Up"
          value={commands.penUp}
          onChange={(value) => onUpdate({ penUp: value })}
        />
        <TextInput
          label="Pen Down"
          value={commands.penDown}
          onChange={(value) => onUpdate({ penDown: value })}
        />
        <TextInput
          label="Feed Rate"
          value={commands.feedRate}
          onChange={(value) => onUpdate({ feedRate: value })}
        />
        <TextInput
          label="Pause"
          value={commands.pause}
          onChange={(value) => onUpdate({ pause: value })}
        />
      </div>
    </div>
  )
}

type SheetSectionProps = {
  sheet: {
    targetX: number
    targetY: number
    padding: number
  }
  onUpdate: (partial: Partial<SheetSectionProps["sheet"]>) => void
}

const SheetSection = ({ sheet, onUpdate }: SheetSectionProps) => {
  return (
    <div>
      <h3 className="mb-3 text-xs font-medium uppercase text-text-muted">Sheet (DIN A4)</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberInput
          label="Target X"
          value={sheet.targetX}
          unit="mm"
          onChange={(value) => onUpdate({ targetX: value })}
        />
        <NumberInput
          label="Target Y"
          value={sheet.targetY}
          unit="mm"
          onChange={(value) => onUpdate({ targetY: value })}
        />
        <NumberInput
          label="Padding"
          value={sheet.padding}
          unit="mm"
          onChange={(value) => onUpdate({ padding: value })}
        />
      </div>
    </div>
  )
}

type TextInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

const TextInput = ({ label, value, onChange }: TextInputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-background bg-background px-3 py-2 font-mono text-sm text-text focus:border-accent focus:outline-none"
      />
    </div>
  )
}

type NumberInputProps = {
  label: string
  value: number
  unit: string
  onChange: (value: number) => void
}

const NumberInput = ({ label, value, unit, onChange }: NumberInputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-text">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-md border border-background bg-background px-3 py-2 font-mono text-sm text-text focus:border-accent focus:outline-none"
        />
        <span className="text-sm text-text-muted">{unit}</span>
      </div>
    </div>
  )
}

