# Phase 5: GCODE Export

> Export vectorized polylines as optimized GCODE for pen plotters with configurable commands and sheet dimensions.

---

## Overview

This phase adds GCODE export functionality with a dedicated settings panel. The export optimizes line order to minimize pen lift operations, making it ideal for pen plotters.

**Core Philosophy**: Maintain the same architectural patterns - single entry point, pure functions, filename = function name convention, and thorough test coverage.

---

## Architecture

### Entry Point

The entire GCODE generation process is triggered by a single function:

```typescript
const gcode = generateGcode({ polylines, gcodeSettings })
```

This is the **only function external code needs to know about**.

### Processing Flow

```
Polyline[]
    ↓
┌───────────────────────────────────┐
│  generateGcode()                  │  ← Entry point
│  └─> scalePolylines()             │  Scale to fit target sheet
│  └─> optimizeLineOrder()          │  Minimize pen up operations
│  └─> convertToGcodeCommands()     │  Generate GCODE instructions
└───────────────────────────────────┘
    ↓
string (GCODE content)
```

### File Structure

```
src/core/
├── generate-gcode.ts                 # Entry point: generateGcode()
├── generate-gcode.test.ts            # Integration tests
├── scale-polylines.ts                # scalePolylines()
├── scale-polylines.test.ts
├── optimize-line-order.ts            # optimizeLineOrder()
├── optimize-line-order.test.ts
├── convert-to-gcode-commands.ts      # convertToGcodeCommands()
├── convert-to-gcode-commands.test.ts
└── types.ts                          # Add GCODE types

src/components/
├── GcodeSettingsPanel/
│   └── GcodeSettingsPanel.tsx        # GCODE settings UI
└── ExportGcodeButton/
    └── ExportGcodeButton.tsx         # Download button

src/store/
├── types.ts                          # Add GcodeSettings type
└── default-settings.ts               # Add default GCODE settings
```

---

## Prerequisites

- Phase 4 complete (polylines available from vectorization)
- Existing types in `src/core/types.ts`
- Store with settings management

---

## Implementation Steps

### Step 1: Extend Type Definitions

**File**: `src/core/types.ts`

**Goal**: Add types required for GCODE generation.

**Tasks**:

- [ ] Add `GcodeCommandSettings` type for plotter commands
- [ ] Add `GcodeSheetSettings` type for sheet dimensions
- [ ] Add `GcodeSettings` type combining both
- [ ] Add `GenerateGcodeInput` type for entry point parameters

**New Types**:

```typescript
export type GcodeCommandSettings = {
  penUp: string
  penDown: string
  feedRate: string
  pause: string
}

export type GcodeSheetSettings = {
  targetX: number
  targetY: number
  padding: number
}

export type GcodeSettings = {
  commands: GcodeCommandSettings
  sheet: GcodeSheetSettings
}

export type GenerateGcodeInput = {
  polylines: Polyline[]
  dimensions: SvgDimensions
  gcodeSettings: GcodeSettings
}
```

**Acceptance Criteria**:

- Types compile without errors
- Types express the GCODE domain clearly

---

### Step 2: Add Default GCODE Settings

**File**: `src/store/default-settings.ts`

**Goal**: Define default values for GCODE settings.

**Default Values**:

```typescript
export const defaultGcodeSettings: GcodeSettings = {
  commands: {
    penUp: "M5",
    penDown: "M3 S1000",
    feedRate: "G1 F3000",
    pause: "G4 P0.5",
  },
  sheet: {
    targetX: 211,
    targetY: 297,
    padding: 20,
  },
}
```

**Acceptance Criteria**:

- Default values match DIN A4 dimensions (211mm × 297mm)
- Command defaults are correct for typical CNC/plotter

---

### Step 3: Implement Scale Polylines

**File**: `src/core/scale-polylines.ts`

**Goal**: Scale polylines to fit within the target sheet area with padding, maintaining 1:1 aspect ratio.

**Entry Point Function**:

```typescript
export const scalePolylines = (params: {
  polylines: Polyline[]
  sourceDimensions: SvgDimensions
  sheetSettings: GcodeSheetSettings
}): Polyline[] => { ... }
```

**Algorithm**:

1. Calculate drawable area: `(targetX - 2*padding)` × `(targetY - 2*padding)`
2. Calculate scale factor to fit source dimensions inside drawable area (1:1 ratio, use minimum scale)
3. Calculate offset to center content within drawable area
4. Transform all points: `x' = x * scale + offsetX + padding`, `y' = y * scale + offsetY + padding`

**Tasks**:

- [ ] Create `scalePolylines` function as entry point
- [ ] Calculate drawable area from sheet settings
- [ ] Calculate uniform scale factor (maintain 1:1 aspect ratio)
- [ ] Center content within drawable area
- [ ] Apply transformation to all polyline points
- [ ] Handle edge cases (empty polylines, zero dimensions)

**Implementation Structure** (top-down):

```typescript
export const scalePolylines = (params: {
  polylines: Polyline[]
  sourceDimensions: SvgDimensions
  sheetSettings: GcodeSheetSettings
}): Polyline[] => {
  const { polylines, sourceDimensions, sheetSettings } = params

  if (polylines.length === 0) return []

  const transformation = calculateTransformation(sourceDimensions, sheetSettings)

  return polylines.map((polyline) =>
    polyline.map((point) => applyTransformation(point, transformation))
  )
}

type Transformation = {
  scale: number
  offsetX: number
  offsetY: number
}

const calculateTransformation = (
  source: SvgDimensions,
  sheet: GcodeSheetSettings
): Transformation => {
  const drawableWidth = sheet.targetX - 2 * sheet.padding
  const drawableHeight = sheet.targetY - 2 * sheet.padding

  const scaleX = drawableWidth / source.width
  const scaleY = drawableHeight / source.height
  const scale = Math.min(scaleX, scaleY)

  const scaledWidth = source.width * scale
  const scaledHeight = source.height * scale

  const offsetX = sheet.padding + (drawableWidth - scaledWidth) / 2
  const offsetY = sheet.padding + (drawableHeight - scaledHeight) / 2

  return { scale, offsetX, offsetY }
}

const applyTransformation = (point: Point, transform: Transformation): Point => ({
  x: point.x * transform.scale + transform.offsetX,
  y: point.y * transform.scale + transform.offsetY,
})
```

**Acceptance Criteria**:

- Scaled content fits within drawable area
- Aspect ratio is maintained (1:1 scaling)
- Content is centered with proper padding
- Handles empty input gracefully

---

### Step 4: Implement Line Order Optimization

**File**: `src/core/optimize-line-order.ts`

**Goal**: Reorder polylines to minimize pen lift operations using a nearest-neighbor algorithm.

**Entry Point Function**:

```typescript
export const optimizeLineOrder = (polylines: Polyline[]): Polyline[] => { ... }
```

**Algorithm** (Greedy Nearest-Neighbor):

1. Start at origin (0, 0) with pen up
2. Find the polyline whose start OR end point is closest to current position
3. If end is closer, reverse the polyline
4. Add polyline to result, update current position to polyline's end
5. Mark polyline as used, repeat until all polylines are processed

**Tasks**:

- [ ] Create `optimizeLineOrder` function as entry point
- [ ] Implement nearest-neighbor selection
- [ ] Support polyline reversal when end is closer than start
- [ ] Track current pen position throughout optimization
- [ ] Handle edge cases (empty polylines, single polyline)

**Implementation Structure** (top-down):

```typescript
export const optimizeLineOrder = (polylines: Polyline[]): Polyline[] => {
  if (polylines.length <= 1) return polylines

  const validPolylines = polylines.filter((p) => p.length >= 2)
  if (validPolylines.length === 0) return []

  return buildOptimizedOrder(validPolylines)
}

const buildOptimizedOrder = (polylines: Polyline[]): Polyline[] => {
  const remaining = new Set(polylines.map((_, i) => i))
  const result: Polyline[] = []
  let currentPosition: Point = { x: 0, y: 0 }

  while (remaining.size > 0) {
    const { index, reversed } = findNearestPolyline(
      polylines,
      remaining,
      currentPosition
    )
    remaining.delete(index)

    const polyline = reversed
      ? [...polylines[index]].reverse()
      : polylines[index]

    result.push(polyline)
    currentPosition = polyline[polyline.length - 1]
  }

  return result
}

const findNearestPolyline = (
  polylines: Polyline[],
  remaining: Set<number>,
  from: Point
): { index: number; reversed: boolean } => {
  let nearestIndex = -1
  let nearestDistance = Infinity
  let shouldReverse = false

  for (const index of remaining) {
    const polyline = polylines[index]
    const startPoint = polyline[0]
    const endPoint = polyline[polyline.length - 1]

    const distanceToStart = calculateDistance(from, startPoint)
    const distanceToEnd = calculateDistance(from, endPoint)

    const minDistance = Math.min(distanceToStart, distanceToEnd)
    if (minDistance < nearestDistance) {
      nearestDistance = minDistance
      nearestIndex = index
      shouldReverse = distanceToEnd < distanceToStart
    }
  }

  return { index: nearestIndex, reversed: shouldReverse }
}

const calculateDistance = (a: Point, b: Point): number => {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}
```

**Acceptance Criteria**:

- Output contains all input polylines (no loss)
- Order minimizes total pen travel distance
- Polylines may be reversed when beneficial
- Empty input returns empty array
- Single polyline returns unchanged

---

### Step 5: Implement GCODE Command Generation

**File**: `src/core/convert-to-gcode-commands.ts`

**Goal**: Convert optimized polylines to GCODE string with proper pen up/down commands and pauses.

**Entry Point Function**:

```typescript
export const convertToGcodeCommands = (params: {
  polylines: Polyline[]
  commands: GcodeCommandSettings
}): string => { ... }
```

**GCODE Structure**:

```gcode
; Generated by Line Weaver
M5           ; Pen up (initial state)
G4 P0.5      ; Pause
G1 F3000     ; Set feed rate
G0 X10 Y20   ; Rapid move to first line start
M3 S1000     ; Pen down
G4 P0.5      ; Pause
G1 X30 Y40   ; Draw to next point
G1 X50 Y60   ; Continue drawing...
M5           ; Pen up
G4 P0.5      ; Pause
G0 X70 Y80   ; Rapid move to next line start
M3 S1000     ; Pen down
G4 P0.5      ; Pause
...
M5           ; Final pen up
G0 X0 Y0     ; Return to origin
```

**Tasks**:

- [ ] Create `convertToGcodeCommands` function as entry point
- [ ] Generate header with initial pen up + pause + feed rate
- [ ] For each polyline: rapid move, pen down + pause, draw lines, pen up + pause
- [ ] Generate footer with final pen up and return to origin
- [ ] Format coordinates with 2 decimal places

**Implementation Structure** (top-down):

```typescript
export const convertToGcodeCommands = (params: {
  polylines: Polyline[]
  commands: GcodeCommandSettings
}): string => {
  const { polylines, commands } = params

  const lines: string[] = []

  lines.push(...generateHeader(commands))
  lines.push(...generatePolylineCommands(polylines, commands))
  lines.push(...generateFooter(commands))

  return lines.join("\n")
}

const generateHeader = (commands: GcodeCommandSettings): string[] => [
  "; Generated by Line Weaver",
  commands.penUp,
  commands.pause,
  commands.feedRate,
]

const generatePolylineCommands = (
  polylines: Polyline[],
  commands: GcodeCommandSettings
): string[] => {
  const lines: string[] = []

  for (const polyline of polylines) {
    if (polyline.length < 2) continue

    lines.push(...generateSinglePolyline(polyline, commands))
  }

  return lines
}

const generateSinglePolyline = (
  polyline: Polyline,
  commands: GcodeCommandSettings
): string[] => {
  const lines: string[] = []
  const startPoint = polyline[0]

  lines.push(formatRapidMove(startPoint))
  lines.push(commands.penDown)
  lines.push(commands.pause)

  for (let i = 1; i < polyline.length; i++) {
    lines.push(formatLinearMove(polyline[i]))
  }

  lines.push(commands.penUp)
  lines.push(commands.pause)

  return lines
}

const generateFooter = (commands: GcodeCommandSettings): string[] => [
  "G0 X0 Y0",
]

const formatRapidMove = (point: Point): string =>
  `G0 X${formatCoord(point.x)} Y${formatCoord(point.y)}`

const formatLinearMove = (point: Point): string =>
  `G1 X${formatCoord(point.x)} Y${formatCoord(point.y)}`

const formatCoord = (value: number): string => {
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2)
}
```

**Acceptance Criteria**:

- Output starts with pen up + pause
- Each polyline has: rapid move → pen down + pause → draw → pen up + pause
- Feed rate is set once at beginning
- Coordinates are properly formatted
- Returns to origin at end
- Empty polylines are skipped

---

### Step 6: Implement Entry Point Function

**File**: `src/core/generate-gcode.ts`

**Goal**: Orchestrate the complete GCODE generation pipeline with a single entry point.

**Entry Point Function**:

```typescript
export const generateGcode = (input: GenerateGcodeInput): string => { ... }
```

**Tasks**:

- [ ] Create `generateGcode` as the file's single export
- [ ] Scale polylines to fit sheet
- [ ] Optimize line order
- [ ] Generate GCODE commands
- [ ] Return complete GCODE string

**Implementation** (complete file):

```typescript
import { convertToGcodeCommands } from "./convert-to-gcode-commands"
import { optimizeLineOrder } from "./optimize-line-order"
import { scalePolylines } from "./scale-polylines"
import type { GenerateGcodeInput } from "./types"

export const generateGcode = (input: GenerateGcodeInput): string => {
  const { polylines, dimensions, gcodeSettings } = input

  const scaledPolylines = scalePolylines({
    polylines,
    sourceDimensions: dimensions,
    sheetSettings: gcodeSettings.sheet,
  })

  const optimizedPolylines = optimizeLineOrder(scaledPolylines)

  const gcode = convertToGcodeCommands({
    polylines: optimizedPolylines,
    commands: gcodeSettings.commands,
  })

  return gcode
}
```

**Acceptance Criteria**:

- Single export, single responsibility
- Pipeline is linear and readable
- Input parameters are correctly propagated
- Output is valid GCODE string

---

### Step 7: Write Unit Tests for Scale Polylines

**File**: `src/core/scale-polylines.test.ts`

**Test Cases**:

- [ ] Should return empty array for empty polylines
- [ ] Should scale polylines to fit within drawable area
- [ ] Should maintain 1:1 aspect ratio
- [ ] Should center content when aspect ratios differ
- [ ] Should apply padding correctly
- [ ] Should handle single point polylines
- [ ] Should work with DIN A4 default settings

**Acceptance Criteria**:

- All tests pass
- Edge cases covered

---

### Step 8: Write Unit Tests for Line Order Optimization

**File**: `src/core/optimize-line-order.test.ts`

**Test Cases**:

- [ ] Should return empty array for empty input
- [ ] Should return single polyline unchanged
- [ ] Should order polylines by nearest neighbor
- [ ] Should reverse polyline when end is closer
- [ ] Should start from origin (0, 0)
- [ ] Should preserve all polylines (no loss)
- [ ] Should filter out invalid polylines (< 2 points)

**Acceptance Criteria**:

- All tests pass
- Optimization reduces travel distance

---

### Step 9: Write Unit Tests for GCODE Command Generation

**File**: `src/core/convert-to-gcode-commands.test.ts`

**Test Cases**:

- [ ] Should include header with pen up, pause, and feed rate
- [ ] Should generate rapid move to first point
- [ ] Should include pen down and pause before drawing
- [ ] Should generate linear moves for polyline points
- [ ] Should include pen up and pause after each polyline
- [ ] Should return to origin at end
- [ ] Should format coordinates with 2 decimal places
- [ ] Should use custom command settings
- [ ] Should handle empty polylines

**Acceptance Criteria**:

- Output is valid GCODE
- Commands are in correct sequence

---

### Step 10: Write Integration Tests for Generate GCODE

**File**: `src/core/generate-gcode.test.ts`

**Test Cases**:

- [ ] Should return valid GCODE for simple polylines
- [ ] Should scale to fit DIN A4 sheet
- [ ] Should optimize line order
- [ ] Should use custom command settings
- [ ] Should handle empty polylines

**Acceptance Criteria**:

- End-to-end pipeline works
- Settings are correctly propagated

---

### Step 11: Create GCODE Settings Panel Component

**File**: `src/components/GcodeSettingsPanel/GcodeSettingsPanel.tsx`

**Goal**: Provide UI for configuring GCODE export settings.

**Layout**:

```
┌─ GCODE SETTINGS ────────────────────────────────┐
│                                                 │
│  COMMANDS                                       │
│  ├─ Pen Up:      [M5           ]               │
│  ├─ Pen Down:    [M3 S1000     ]               │
│  ├─ Feed Rate:   [G1 F3000     ]               │
│  └─ Pause:       [G4 P0.5      ]               │
│                                                 │
│  SHEET (DIN A4)                                 │
│  ├─ Target X:    [211    ] mm                  │
│  ├─ Target Y:    [297    ] mm                  │
│  └─ Padding:     [20     ] mm                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Tasks**:

- [ ] Create expandable settings panel
- [ ] Add text inputs for command settings
- [ ] Add number inputs for sheet settings
- [ ] Integrate with store for persistence
- [ ] Match existing UI styling (Control Panel)

**Acceptance Criteria**:

- All settings are configurable
- Values persist in store
- UI matches project aesthetic

---

### Step 12: Create Export GCODE Button Component

**File**: `src/components/ExportGcodeButton/ExportGcodeButton.tsx`

**Goal**: Trigger GCODE generation and download with filename matching the input image.

**Tasks**:

- [ ] Create download button matching ExportButton styling
- [ ] Generate GCODE on click using `generateGcode`
- [ ] Extract filename from uploaded image (without extension)
- [ ] Trigger browser download as `{original-filename}.gcode`
- [ ] Show disabled state when no polylines available

**Implementation**:

```typescript
import { generateGcode } from "../../core/generate-gcode.ts"
import { useGcodeSettings, usePolylines, useProcessingStatus, useUploadedImage } from "../../store/selectors"

export const ExportGcodeButton = () => {
  const polylines = usePolylines()
  const uploadedImage = useUploadedImage()
  const processingStatus = useProcessingStatus()
  const gcodeSettings = useGcodeSettings()

  const isDisabled = !polylines || polylines.length === 0 || processingStatus === "processing"

  const handleExport = () => {
    if (!polylines || !uploadedImage) return

    const gcode = generateGcode({
      polylines,
      dimensions: { width: uploadedImage.width, height: uploadedImage.height },
      gcodeSettings,
    })

    const filename = extractFilenameWithoutExtension(uploadedImage.file.name)
    downloadGcode(gcode, `${filename}.gcode`)
  }

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled}
      className="rounded-lg bg-secondary px-6 py-3 font-mono text-sm font-bold uppercase text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Download GCODE
    </button>
  )
}

const extractFilenameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".")
  return lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename
}

const downloadGcode = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

**Acceptance Criteria**:

- Button is disabled when no polylines or during processing
- Click generates and downloads GCODE file
- Downloaded file is named `{original-image-name}.gcode` (e.g., `photo.png` → `photo.gcode`)
- File has `.gcode` extension

---

### Step 13: Update Store for GCODE Settings

**File**: `src/store/types.ts` and `src/store/app-store.ts`

**Goal**: Add GCODE settings to application state.

**Tasks**:

- [ ] Add `gcodeSettings` to store type
- [ ] Add `setGcodeSettings` action
- [ ] Initialize with default settings
- [ ] Add selector for GCODE settings

**Acceptance Criteria**:

- GCODE settings persist in store
- Settings can be updated via action
- Selector provides current settings

---

### Step 14: Integrate Components

**File**: `src/App.tsx` and related

**Goal**: Add GCODE settings panel and export button to the UI.

**Tasks**:

- [ ] Add `<GcodeSettingsPanel />` below `<ControlPanel />`
- [ ] Add `<ExportGcodeButton />` next to existing export button
- [ ] Ensure consistent layout and styling

**Acceptance Criteria**:

- GCODE settings panel is visible
- Export GCODE button is accessible
- UI remains balanced and usable

---

## File Summary

| File                                             | Action | Purpose                         |
| ------------------------------------------------ | ------ | ------------------------------- |
| `src/core/types.ts`                              | Modify | Add GCODE types                 |
| `src/core/generate-gcode.ts`                     | Create | Entry point function            |
| `src/core/generate-gcode.test.ts`                | Create | Integration tests               |
| `src/core/scale-polylines.ts`                    | Create | Scale to fit sheet              |
| `src/core/scale-polylines.test.ts`               | Create | Unit tests                      |
| `src/core/optimize-line-order.ts`                | Create | Minimize pen lifts              |
| `src/core/optimize-line-order.test.ts`           | Create | Unit tests                      |
| `src/core/convert-to-gcode-commands.ts`          | Create | Generate GCODE string           |
| `src/core/convert-to-gcode-commands.test.ts`     | Create | Unit tests                      |
| `src/store/default-settings.ts`                  | Modify | Add default GCODE settings      |
| `src/store/types.ts`                             | Modify | Add GCODE settings type         |
| `src/store/app-store.ts`                         | Modify | Add GCODE state management      |
| `src/components/GcodeSettingsPanel/`             | Create | Settings UI component           |
| `src/components/ExportGcodeButton/`              | Create | Download button component       |
| `src/App.tsx`                                    | Modify | Integrate new components        |

---

## Dependencies Between Steps

```
Step 1 (Types)
    ↓
Step 2 (Defaults)
    ↓
Step 3 (Scale) ──→ Step 7 (Scale Tests)
    ↓
Step 4 (Optimize) ──→ Step 8 (Optimize Tests)
    ↓
Step 5 (Commands) ──→ Step 9 (Commands Tests)
    ↓
Step 6 (Entry Point) ──→ Step 10 (Integration Tests)
    ↓
Step 11-13 (UI & Store)
    ↓
Step 14 (Integration)
```

---

## Key Design Decisions

### 1. Greedy Nearest-Neighbor Optimization

A simple but effective algorithm that provides good results for typical drawings. More sophisticated algorithms (like 2-opt or simulated annealing) could be added later if needed.

### 2. 1:1 Scaling

Preserves aspect ratio and fits content within the drawable area. Content is centered both horizontally and vertically within the padded bounds.

### 3. Pause After Pen Commands

Adding a pause after pen up/down ensures the mechanical action completes before movement begins. This is configurable via the settings.

### 4. Coordinate Formatting

Coordinates are rounded to 2 decimal places for:
- Clean, readable GCODE output
- Sufficient precision for plotters
- Smaller file sizes

### 5. Return to Origin

The plotter returns to (0, 0) after completing all lines, making it easy to remove the finished piece and prepare for the next job.

### 6. Configurable Commands

All GCODE commands are user-configurable to support different plotter/CNC configurations.

---

## GCODE Output Example

For a simple image with two diagonal lines:

```gcode
; Generated by Line Weaver
M5
G4 P0.5
G1 F3000
G0 X20 Y20
M3 S1000
G4 P0.5
G1 X100 Y100
M5
G4 P0.5
G0 X100 Y20
M3 S1000
G4 P0.5
G1 X20 Y100
M5
G4 P0.5
G0 X0 Y0
```

---

## Success Criteria

- [ ] `generateGcode` function works as single entry point
- [ ] Polylines are correctly scaled to fit sheet with padding
- [ ] Line order is optimized to minimize pen lifts
- [ ] GCODE commands are properly sequenced
- [ ] Pause commands follow pen up/down
- [ ] GCODE settings panel is functional
- [ ] Export button downloads valid GCODE file
- [ ] All unit tests pass (aim for 8-10 per test file)
- [ ] Integration test confirms end-to-end pipeline
- [ ] Output is compatible with typical pen plotters

---

_Created: December 13, 2025_

