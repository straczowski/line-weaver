# Phase 4: SVG Generation

> Convert polylines to valid SVG documents with configurable stroke properties.

---

## Overview

This phase transforms the polylines produced by the vectorization pipeline into a complete, valid SVG document ready for display and export.

**Core Philosophy**: Maintain the same architectural patterns from Phase 3 - single entry point, pure functions, filename = function name convention, and thorough test coverage.

---

## Architecture

### Entry Point

The entire SVG generation process is triggered by a single function:

```typescript
const svg = generateSvg({ polylines, dimensions, settings })
```

This is the **only function external code needs to know about**.

### Processing Flow

```
Polyline[]
    ↓
┌───────────────────────────────┐
│  generateSvg()                │  ← Entry point
│  └─> convertPolylineToPath()  │  (per polyline)
│  └─> generateSvgPaths()       │
│  └─> generateSvgDocument()    │
└───────────────────────────────┘
    ↓
string (SVG markup)
```

### File Structure

```
src/core/
├── generate-svg.ts              # Entry point: generateSvg()
├── generate-svg.test.ts         # Integration tests
├── convert-polyline-to-path.ts  # convertPolylineToPath()
├── convert-polyline-to-path.test.ts
├── generate-svg-paths.ts        # generateSvgPaths()
├── generate-svg-paths.test.ts
├── generate-svg-document.ts     # generateSvgDocument()
├── generate-svg-document.test.ts
└── types.ts                     # Add new types
```

---

## Prerequisites

- Phase 3 complete (polylines available from `vectorizeImage`)
- Existing types in `src/core/types.ts`
- Store with `setSvgOutput` action available

---

## Implementation Steps

### Step 1: Extend Type Definitions

**File**: `src/core/types.ts`

**Goal**: Add types required for the SVG generation pipeline.

**Tasks**:

- [ ] Add `SvgDimensions` type for viewport configuration
- [ ] Add `SvgStrokeConfig` type for stroke styling
- [ ] Add `GenerateSvgInput` type for entry point parameters

**New Types**:

```typescript
export type SvgDimensions = {
  width: number
  height: number
}

export type SvgStrokeConfig = {
  width: number
  color: string
  linecap: "butt" | "round" | "square"
  linejoin: "miter" | "round" | "bevel"
}

export type GenerateSvgInput = {
  polylines: Polyline[]
  dimensions: SvgDimensions
  strokeConfig: SvgStrokeConfig
}
```

**Acceptance Criteria**:

- Types compile without errors
- Types express the SVG domain clearly

---

### Step 2: Implement Polyline to Path Conversion

**File**: `src/core/convert-polyline-to-path.ts`

**Goal**: Convert a single polyline (array of points) to an SVG path `d` attribute string.

**Entry Point Function**:

```typescript
export const convertPolylineToPath = (polyline: Polyline): string => { ... }
```

**Algorithm**:

SVG path syntax uses:
- `M x,y` - Move to starting point
- `L x,y` - Draw line to point

A polyline `[{x: 0, y: 10}, {x: 20, y: 30}]` becomes `"M 0,10 L 20,30"`

**Tasks**:

- [ ] Create `convertPolylineToPath` function as the file's entry point
- [ ] Handle empty polyline (return empty string)
- [ ] Handle single point polyline (return just M command)
- [ ] Format coordinates without excessive decimal places (round to 2 decimals)
- [ ] Join path commands with spaces

**Implementation Structure** (top-down):

```typescript
export const convertPolylineToPath = (polyline: Polyline): string => {
  if (polyline.length === 0) return ""
  
  const moveCommand = createMoveCommand(polyline[0])
  const lineCommands = createLineCommands(polyline.slice(1))
  
  return joinPathCommands(moveCommand, lineCommands)
}

const createMoveCommand = (point: Point): string =>
  `M ${formatCoordinate(point.x)},${formatCoordinate(point.y)}`

const createLineCommands = (points: Point[]): string[] =>
  points.map((point) => `L ${formatCoordinate(point.x)},${formatCoordinate(point.y)}`)

const formatCoordinate = (value: number): string => {
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2)
}

const joinPathCommands = (moveCommand: string, lineCommands: string[]): string =>
  [moveCommand, ...lineCommands].join(" ")
```

**Acceptance Criteria**:

- Empty polyline returns empty string
- Single point returns `"M x,y"` format
- Two+ points return `"M x,y L x,y L x,y..."` format
- Coordinates are formatted cleanly (no unnecessary decimals)
- Function is pure (no side effects)

---

### Step 3: Implement SVG Paths Generation

**File**: `src/core/generate-svg-paths.ts`

**Goal**: Convert array of polylines into array of SVG `<path>` element strings.

**Entry Point Function**:

```typescript
export const generateSvgPaths = (params: {
  polylines: Polyline[]
  strokeConfig: SvgStrokeConfig
}): string[] => { ... }
```

**Tasks**:

- [ ] Create `generateSvgPaths` function as the file's entry point
- [ ] Apply stroke configuration to each path element
- [ ] Filter out empty polylines
- [ ] Return array of complete `<path>` element strings

**Implementation Structure** (top-down):

```typescript
export const generateSvgPaths = (params: {
  polylines: Polyline[]
  strokeConfig: SvgStrokeConfig
}): string[] => {
  const { polylines, strokeConfig } = params
  
  return polylines
    .filter(isNonEmptyPolyline)
    .map((polyline) => createPathElement(polyline, strokeConfig))
}

const isNonEmptyPolyline = (polyline: Polyline): boolean => polyline.length >= 2

const createPathElement = (polyline: Polyline, strokeConfig: SvgStrokeConfig): string => {
  const pathData = convertPolylineToPath(polyline)
  const strokeAttributes = createStrokeAttributes(strokeConfig)
  return `<path d="${pathData}" ${strokeAttributes} fill="none" />`
}

const createStrokeAttributes = (config: SvgStrokeConfig): string =>
  `stroke="${config.color}" stroke-width="${config.width}" stroke-linecap="${config.linecap}" stroke-linejoin="${config.linejoin}"`
```

**Acceptance Criteria**:

- Empty polylines are filtered out
- Single-point polylines are filtered out
- Each path has correct stroke attributes
- Paths have `fill="none"` for line-only rendering
- Returns array (not string) for flexibility

---

### Step 4: Implement SVG Document Assembly

**File**: `src/core/generate-svg-document.ts`

**Goal**: Assemble a complete, valid SVG document from path elements.

**Entry Point Function**:

```typescript
export const generateSvgDocument = (params: {
  pathElements: string[]
  dimensions: SvgDimensions
}): string => { ... }
```

**Tasks**:

- [ ] Create `generateSvgDocument` function as the file's entry point
- [ ] Generate proper SVG root element with namespace
- [ ] Set viewBox for correct scaling
- [ ] Include all path elements
- [ ] Output valid, well-formed XML

**Implementation Structure** (top-down):

```typescript
export const generateSvgDocument = (params: {
  pathElements: string[]
  dimensions: SvgDimensions
}): string => {
  const { pathElements, dimensions } = params
  
  const svgOpen = createSvgOpenTag(dimensions)
  const svgClose = "</svg>"
  const content = pathElements.join("\n  ")
  
  return assembleDocument(svgOpen, content, svgClose)
}

const createSvgOpenTag = (dimensions: SvgDimensions): string => {
  const { width, height } = dimensions
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`
}

const assembleDocument = (open: string, content: string, close: string): string => {
  if (content.length === 0) return `${open}${close}`
  return `${open}\n  ${content}\n${close}`
}
```

**Acceptance Criteria**:

- Valid XML with proper SVG namespace
- Correct viewBox matching dimensions
- Width and height attributes present
- Path elements properly indented
- Empty paths array produces valid empty SVG

---

### Step 5: Implement Entry Point Function

**File**: `src/core/generate-svg.ts`

**Goal**: Orchestrate the complete SVG generation pipeline with a single, clear entry point.

**Entry Point Function**:

```typescript
export const generateSvg = (input: GenerateSvgInput): string => { ... }
```

**Tasks**:

- [ ] Create `generateSvg` as the file's single export
- [ ] Compose the generation steps in sequence
- [ ] Return complete SVG document string

**Implementation** (complete file):

```typescript
import { generateSvgDocument } from "./generate-svg-document"
import { generateSvgPaths } from "./generate-svg-paths"
import type { GenerateSvgInput } from "./types"

export const generateSvg = (input: GenerateSvgInput): string => {
  const { polylines, dimensions, strokeConfig } = input

  const pathElements = generateSvgPaths({ polylines, strokeConfig })

  const svgDocument = generateSvgDocument({ pathElements, dimensions })

  return svgDocument
}
```

**Acceptance Criteria**:

- Single export, single responsibility
- Pipeline is linear and readable
- Input parameters are correctly propagated
- Output is valid SVG string

---

### Step 6: Write Unit Tests for Polyline to Path Conversion

**File**: `src/core/convert-polyline-to-path.test.ts`

**Test Cases**:

- [ ] Should return empty string for empty polyline
- [ ] Should return M command for single point
- [ ] Should return M and L commands for two points
- [ ] Should chain multiple L commands for longer polylines
- [ ] Should round coordinates to 2 decimal places
- [ ] Should omit unnecessary decimal places for integers
- [ ] Should handle negative coordinates
- [ ] Should handle zero coordinates

**Acceptance Criteria**:

- All tests pass
- Edge cases covered
- Pure function behavior verified

---

### Step 7: Write Unit Tests for SVG Paths Generation

**File**: `src/core/generate-svg-paths.test.ts`

**Test Cases**:

- [ ] Should return empty array for empty polylines array
- [ ] Should filter out empty polylines
- [ ] Should filter out single-point polylines
- [ ] Should generate path element with correct d attribute
- [ ] Should include stroke color in attributes
- [ ] Should include stroke width in attributes
- [ ] Should include stroke-linecap in attributes
- [ ] Should include stroke-linejoin in attributes
- [ ] Should set fill to none

**Acceptance Criteria**:

- Path elements are valid SVG
- Stroke configuration is correctly applied
- Filtering logic verified

---

### Step 8: Write Unit Tests for SVG Document Assembly

**File**: `src/core/generate-svg-document.test.ts`

**Test Cases**:

- [ ] Should generate valid SVG with namespace
- [ ] Should set correct viewBox from dimensions
- [ ] Should set width and height attributes
- [ ] Should include all path elements
- [ ] Should handle empty path elements array
- [ ] Should format output with proper indentation

**Acceptance Criteria**:

- SVG document is valid XML
- Dimensions are correctly applied
- Path elements are included

---

### Step 9: Write Integration Tests for Generate SVG

**File**: `src/core/generate-svg.test.ts`

**Test Cases**:

- [ ] Should return valid SVG for simple polylines
- [ ] Should return empty SVG for empty polylines
- [ ] Should respect stroke configuration
- [ ] Should set correct dimensions
- [ ] Should produce SVG that renders correctly (validate XML structure)

**Acceptance Criteria**:

- End-to-end pipeline works
- Settings are correctly propagated
- Output is valid SVG

---

### Step 10: Create SVG Generation Helper

**File**: `src/core/create-stroke-config.ts`

**Goal**: Create a helper to build stroke configuration from app settings.

**Entry Point Function**:

```typescript
export const createStrokeConfig = (settings: ProcessingConfig): SvgStrokeConfig => { ... }
```

**Tasks**:

- [ ] Map `settings.strokeWidth` to stroke config
- [ ] Set default color (black `#000000`)
- [ ] Set default linecap (`round` for smooth appearance)
- [ ] Set default linejoin (`round` for smooth corners)

**Implementation**:

```typescript
import type { ProcessingConfig, SvgStrokeConfig } from "./types"

export const createStrokeConfig = (settings: ProcessingConfig): SvgStrokeConfig => ({
  width: settings.strokeWidth,
  color: "#000000",
  linecap: "round",
  linejoin: "round",
})
```

**Acceptance Criteria**:

- Correctly maps stroke width from settings
- Defaults produce aesthetically pleasing output

---

### Step 11: Update useVectorize Hook

**File**: `src/hooks/use-vectorize.ts`

**Goal**: Integrate SVG generation into the vectorization pipeline.

**Tasks**:

- [ ] Import `generateSvg` and `createStrokeConfig`
- [ ] After generating polylines, generate SVG
- [ ] Get image dimensions from uploaded image or imageData
- [ ] Store SVG output using `setSvgOutput`

**Updated Implementation**:

```typescript
import { useCallback } from "react"
import { createStrokeConfig } from "../core/create-stroke-config"
import { generateSvg } from "../core/generate-svg"
import { vectorizeImage } from "../core/vectorize-image"
import { useOutputActions, useProcessingActions } from "../store/actions"
import { useImageData, useProcessingStatus, useSettings, useUploadedImage } from "../store/selectors"

export const useVectorize = () => {
  const imageData = useImageData()
  const uploadedImage = useUploadedImage()
  const settings = useSettings()
  const processingStatus = useProcessingStatus()
  const { setProcessingStatus, setProcessingError } = useProcessingActions()
  const { setPolylines, setSvgOutput } = useOutputActions()

  const vectorize = useCallback(() => {
    if (!imageData || !uploadedImage) return

    setProcessingStatus("processing")
    setProcessingError(null)

    try {
      const result = vectorizeImage({ imageData, settings })
      setPolylines(result.polylines)

      const svg = generateSvg({
        polylines: result.polylines,
        dimensions: { width: uploadedImage.width, height: uploadedImage.height },
        strokeConfig: createStrokeConfig(settings),
      })
      setSvgOutput(svg)

      setProcessingStatus("complete")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Vectorization failed"
      setProcessingError(message)
      setProcessingStatus("error")
    }
  }, [imageData, uploadedImage, settings, setProcessingStatus, setProcessingError, setPolylines, setSvgOutput])

  const isProcessing = processingStatus === "processing"

  return { vectorize, isProcessing }
}
```

**Acceptance Criteria**:

- SVG is generated after vectorization
- SVG dimensions match original image
- Stroke configuration is applied from settings
- SVG is stored in app state
- Error handling preserved

---

## File Summary

| File                                        | Action | Purpose                              |
| ------------------------------------------- | ------ | ------------------------------------ |
| `src/core/types.ts`                         | Modify | Add SVG types                        |
| `src/core/generate-svg.ts`                  | Create | Entry point function                 |
| `src/core/generate-svg.test.ts`             | Create | Integration tests                    |
| `src/core/convert-polyline-to-path.ts`      | Create | Polyline to path d attribute         |
| `src/core/convert-polyline-to-path.test.ts` | Create | Unit tests                           |
| `src/core/generate-svg-paths.ts`            | Create | Generate path elements               |
| `src/core/generate-svg-paths.test.ts`       | Create | Unit tests                           |
| `src/core/generate-svg-document.ts`         | Create | Assemble SVG document                |
| `src/core/generate-svg-document.test.ts`    | Create | Unit tests                           |
| `src/core/create-stroke-config.ts`          | Create | Settings to stroke config mapper     |
| `src/hooks/use-vectorize.ts`                | Modify | Add SVG generation step              |

---

## Dependencies Between Steps

```
Step 1 (Types)
    ↓
Step 2 (Polyline→Path) ──→ Step 6 (Path Tests)
    ↓
Step 3 (SVG Paths) ──→ Step 7 (Paths Tests)
    ↓
Step 4 (SVG Document) ──→ Step 8 (Document Tests)
    ↓
Step 5 (Entry Point) ──→ Step 9 (Integration Tests)
    ↓
Step 10 (Stroke Config)
    ↓
Step 11 (Hook Update)
```

---

## Key Design Decisions

### 1. Single Entry Point

External code only needs to know about `generateSvg()`. This creates a clean API boundary and makes the module easy to use.

### 2. Filename = Function Name

Every file exports a single function that matches its filename:
- `generate-svg.ts` → `generateSvg()`
- `convert-polyline-to-path.ts` → `convertPolylineToPath()`

### 3. Pure Functions

All SVG generation functions are pure (no side effects). This enables:
- Easy testing with string comparisons
- Deterministic output
- Future optimization opportunities

### 4. Coordinate Formatting

Coordinates are rounded to 2 decimal places to:
- Keep SVG file size reasonable
- Avoid floating-point precision issues
- Maintain visual accuracy (sub-pixel precision not visible)

### 5. Separation of Concerns

- Path conversion handles coordinate formatting
- Path generation handles SVG element structure
- Document assembly handles XML structure

### 6. Round Line Endings

Default to `stroke-linecap: round` and `stroke-linejoin: round` for:
- Smoother, more aesthetic appearance
- Better visual quality at line endpoints
- Closer match to hand-drawn aesthetics

---

## Success Criteria

- [ ] `generateSvg` function works as single entry point
- [ ] Polylines are correctly converted to SVG paths
- [ ] Path coordinates are properly formatted
- [ ] SVG document has valid XML structure
- [ ] SVG renders correctly in browsers
- [ ] Stroke configuration is applied
- [ ] All unit tests pass (aim for 8-10 per test file)
- [ ] Integration test confirms end-to-end pipeline
- [ ] Hook generates and stores SVG after vectorization
- [ ] Preview canvas displays vectorized output
- [ ] Export button downloads valid SVG file

---

_Created: December 13, 2025_

