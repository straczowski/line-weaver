# Phase 3: Simple Vectorization

> Convert pixel brightness directly to line patterns for quick visual feedback.

---

## Overview

This phase implements the MVP vectorization pipeline. The goal is to transform an uploaded image into an array of polylines that represent the image using line-based shading patterns.

**Core Philosophy**: Build a clean, testable architecture with one obvious entry point function. Each file exports a single, well-named function that matches the filename.

---

## Architecture

### Entry Point

The entire vectorization process is triggered by a single function:

```typescript
const polylines = vectorizeImage({ imageData, settings })
```

This is the **only function external code needs to know about**.

### Processing Flow

```
ImageData
    ↓
┌───────────────────────────────┐
│  vectorizeImage()             │  ← Entry point
│  └─> convertToGrayscale()     │
│  └─> sampleBrightness()       │
│  └─> generateLinePatterns()   │
└───────────────────────────────┘
    ↓
Polyline[]
```

### File Structure

```
src/core/
├── vectorize-image.ts          # Entry point: vectorizeImage()
├── vectorize-image.test.ts     # Tests for vectorizeImage
├── convert-to-grayscale.ts     # convertToGrayscale()
├── convert-to-grayscale.test.ts
├── sample-brightness.ts        # sampleBrightness()
├── sample-brightness.test.ts
├── generate-line-patterns.ts   # generateLinePatterns()
├── generate-line-patterns.test.ts
└── types.ts                    # Add new types
```

Each file follows the **"filename = function name"** convention for maximum clarity.

---

## Prerequisites

- Phase 2 complete (image upload, ImageData extraction)
- Existing types in `src/core/types.ts`
- Store with `setPolylines` action available

---

## Implementation Steps

### Step 1: Extend Type Definitions

**File**: `src/core/types.ts`

**Goal**: Add types required for the vectorization pipeline.

**Tasks**:

- [ ] Add `GrayscaleData` type for processed grayscale pixels
- [ ] Add `BrightnessGrid` type for sampled brightness values
- [ ] Add `LinePattern` type representing cell patterns
- [ ] Add `VectorizeImageInput` type for entry point parameters
- [ ] Add `VectorizeImageOutput` type for result

**New Types**:

```typescript
export type GrayscaleData = {
  width: number
  height: number
  pixels: Uint8Array
}

export type BrightnessGrid = {
  cols: number
  rows: number
  cellSize: number
  values: number[][]
}

export type LinePattern = "empty" | "diagonal-right" | "diagonal-left" | "cross" | "hatch"

export type VectorizeImageInput = {
  imageData: ImageData
  settings: ProcessingConfig
}

export type VectorizeImageOutput = {
  polylines: Polyline[]
  grid: BrightnessGrid
}
```

**Acceptance Criteria**:

- Types compile without errors
- Types express the domain clearly

---

### Step 2: Implement Grayscale Conversion

**File**: `src/core/convert-to-grayscale.ts`

**Goal**: Convert RGBA ImageData to grayscale values using luminosity method.

**Entry Point Function**:

```typescript
export const convertToGrayscale = (imageData: ImageData): GrayscaleData => { ... }
```

**Algorithm**:

```
gray = 0.299 × R + 0.587 × G + 0.114 × B
```

This is the standard luminosity formula that accounts for human color perception.

**Tasks**:

- [ ] Create `convertToGrayscale` function as the file's entry point
- [ ] Iterate through ImageData RGBA pixels (4 bytes per pixel)
- [ ] Apply luminosity formula for each pixel
- [ ] Return `GrayscaleData` with single-channel `Uint8Array`

**Implementation Structure** (top-down):

```typescript
export const convertToGrayscale = (imageData: ImageData): GrayscaleData => {
  const pixels = calculateGrayscalePixels(imageData.data, imageData.width * imageData.height)
  return createGrayscaleData(imageData.width, imageData.height, pixels)
}

const calculateGrayscalePixels = (rgba: Uint8ClampedArray, pixelCount: number): Uint8Array => {
  const grayscale = new Uint8Array(pixelCount)
  for (let i = 0; i < pixelCount; i++) {
    grayscale[i] = calculateLuminosity(rgba, i * 4)
  }
  return grayscale
}

const calculateLuminosity = (rgba: Uint8ClampedArray, offset: number): number => {
  const r = rgba[offset]
  const g = rgba[offset + 1]
  const b = rgba[offset + 2]
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b)
}

const createGrayscaleData = (width: number, height: number, pixels: Uint8Array): GrayscaleData => ({
  width,
  height,
  pixels,
})
```

**Acceptance Criteria**:

- Pure white (255, 255, 255) produces grayscale value of 255
- Pure black (0, 0, 0) produces grayscale value of 0
- Function is pure (no side effects)
- Output `Uint8Array` has exactly `width × height` elements

---

### Step 3: Implement Brightness Sampling

**File**: `src/core/sample-brightness.ts`

**Goal**: Divide image into grid cells and calculate average brightness per cell.

**Entry Point Function**:

```typescript
export const sampleBrightness = (params: {
  grayscaleData: GrayscaleData
  cellSize: number
}): BrightnessGrid => { ... }
```

**Tasks**:

- [ ] Create `sampleBrightness` function as the file's entry point
- [ ] Calculate grid dimensions (cols, rows) from image size and cell size
- [ ] For each cell, calculate average brightness of all pixels within
- [ ] Handle edge cells that may be smaller than `cellSize`
- [ ] Return `BrightnessGrid` with 2D array of brightness values (0-255)

**Implementation Structure** (top-down):

```typescript
export const sampleBrightness = (params: {
  grayscaleData: GrayscaleData
  cellSize: number
}): BrightnessGrid => {
  const { grayscaleData, cellSize } = params
  const { cols, rows } = calculateGridDimensions(grayscaleData.width, grayscaleData.height, cellSize)
  const values = calculateBrightnessValues({ grayscaleData, cellSize, cols, rows })
  return { cols, rows, cellSize, values }
}

const calculateGridDimensions = (width: number, height: number, cellSize: number) => ({
  cols: Math.ceil(width / cellSize),
  rows: Math.ceil(height / cellSize),
})

const calculateBrightnessValues = (params: {
  grayscaleData: GrayscaleData
  cellSize: number
  cols: number
  rows: number
}): number[][] => {
  const { grayscaleData, cellSize, cols, rows } = params
  const values: number[][] = []
  for (let row = 0; row < rows; row++) {
    values[row] = []
    for (let col = 0; col < cols; col++) {
      values[row][col] = calculateCellBrightness({ grayscaleData, cellSize, row, col })
    }
  }
  return values
}

const calculateCellBrightness = (params: {
  grayscaleData: GrayscaleData
  cellSize: number
  row: number
  col: number
}): number => {
  // Calculate average of all pixels in this cell
  // ...
}
```

**Acceptance Criteria**:

- Grid dimensions are correctly calculated (ceiling division)
- Edge cells are handled correctly
- Brightness values are in range 0-255
- Uniform image produces uniform grid values

---

### Step 4: Implement Line Pattern Generation

**File**: `src/core/generate-line-patterns.ts`

**Goal**: Convert brightness grid to polylines based on darkness thresholds.

**Entry Point Function**:

```typescript
export const generateLinePatterns = (params: {
  brightnessGrid: BrightnessGrid
  threshold: number
}): Polyline[] => { ... }
```

**Pattern Mapping** (based on brightness level):

| Brightness Range | Pattern          | Visual | Lines Generated      |
| ---------------- | ---------------- | ------ | -------------------- |
| 204-255 (80-100%)| `empty`          |        | None                 |
| 153-203 (60-80%) | `diagonal-right` | `/`    | 1 diagonal line      |
| 102-152 (40-60%) | `diagonal-left`  | `\`    | 1 diagonal line      |
| 51-101 (20-40%)  | `cross`          | `X`    | 2 diagonal lines     |
| 0-50 (0-20%)     | `hatch`          | `#`    | 4 lines (cross-hatch)|

**Tasks**:

- [ ] Create `generateLinePatterns` function as the file's entry point
- [ ] Map brightness values to `LinePattern` type
- [ ] Generate polylines for each pattern in each cell
- [ ] Calculate absolute coordinates based on cell position and size
- [ ] Collect all polylines into single array

**Implementation Structure** (top-down):

```typescript
export const generateLinePatterns = (params: {
  brightnessGrid: BrightnessGrid
  threshold: number
}): Polyline[] => {
  const { brightnessGrid, threshold } = params
  const polylines: Polyline[] = []
  
  for (let row = 0; row < brightnessGrid.rows; row++) {
    for (let col = 0; col < brightnessGrid.cols; col++) {
      const brightness = brightnessGrid.values[row][col]
      const pattern = determinePattern(brightness, threshold)
      const cellPolylines = generateCellPolylines({
        pattern,
        row,
        col,
        cellSize: brightnessGrid.cellSize,
      })
      polylines.push(...cellPolylines)
    }
  }
  
  return polylines
}

const determinePattern = (brightness: number, threshold: number): LinePattern => {
  // Map brightness to pattern using thresholds
  // Threshold parameter adjusts sensitivity
}

const generateCellPolylines = (params: {
  pattern: LinePattern
  row: number
  col: number
  cellSize: number
}): Polyline[] => {
  // Generate lines for specific pattern at specific position
}

const generateDiagonalRight = (x: number, y: number, size: number): Polyline => {
  return [
    { x: x, y: y + size },
    { x: x + size, y: y },
  ]
}

const generateDiagonalLeft = (x: number, y: number, size: number): Polyline => {
  return [
    { x: x, y: y },
    { x: x + size, y: y + size },
  ]
}

// ... other pattern generators
```

**Acceptance Criteria**:

- Empty cells produce no polylines
- Pattern lines are correctly positioned within cells
- All generated points are within image bounds
- Threshold parameter influences pattern selection

---

### Step 5: Implement Entry Point Function

**File**: `src/core/vectorize-image.ts`

**Goal**: Orchestrate the complete vectorization pipeline with a single, clear entry point.

**Entry Point Function**:

```typescript
export const vectorizeImage = (input: VectorizeImageInput): VectorizeImageOutput => { ... }
```

**Tasks**:

- [ ] Create `vectorizeImage` as the file's single export
- [ ] Compose the three processing steps in sequence
- [ ] Pass appropriate settings to each step
- [ ] Return structured output with polylines and grid metadata

**Implementation** (complete file):

```typescript
import { convertToGrayscale } from "./convert-to-grayscale"
import { generateLinePatterns } from "./generate-line-patterns"
import { sampleBrightness } from "./sample-brightness"
import type { VectorizeImageInput, VectorizeImageOutput } from "./types"

export const vectorizeImage = (input: VectorizeImageInput): VectorizeImageOutput => {
  const { imageData, settings } = input
  
  const grayscaleData = convertToGrayscale(imageData)
  
  const brightnessGrid = sampleBrightness({
    grayscaleData,
    cellSize: settings.gridSize,
  })
  
  const polylines = generateLinePatterns({
    brightnessGrid,
    threshold: settings.threshold,
  })
  
  return { polylines, grid: brightnessGrid }
}
```

**Acceptance Criteria**:

- Single export, single responsibility
- Pipeline is linear and readable
- Settings are correctly propagated
- Output contains both polylines and grid for debugging

---

### Step 6: Write Unit Tests for Grayscale Conversion

**File**: `src/core/convert-to-grayscale.test.ts`

**Test Cases**:

- [ ] Should convert pure white to 255
- [ ] Should convert pure black to 0
- [ ] Should convert pure red correctly (0.299 × 255 ≈ 76)
- [ ] Should convert pure green correctly (0.587 × 255 ≈ 150)
- [ ] Should convert pure blue correctly (0.114 × 255 ≈ 29)
- [ ] Should handle single pixel image
- [ ] Should preserve image dimensions in output
- [ ] Should produce correct array length

**Acceptance Criteria**:

- All tests pass
- Edge cases covered
- No external dependencies (pure function testing)

---

### Step 7: Write Unit Tests for Brightness Sampling

**File**: `src/core/sample-brightness.test.ts`

**Test Cases**:

- [ ] Should calculate correct grid dimensions for exact fit (32×32 image, 16px cells = 2×2 grid)
- [ ] Should calculate correct grid dimensions with remainder (30×30 image, 16px cells = 2×2 grid)
- [ ] Should calculate average brightness for uniform cell
- [ ] Should handle edge cells correctly
- [ ] Should return values in 0-255 range
- [ ] Should handle single cell image
- [ ] Should handle large cell size (larger than image)

**Acceptance Criteria**:

- Grid math is verified
- Edge cases are covered
- Brightness averaging is accurate

---

### Step 8: Write Unit Tests for Line Pattern Generation

**File**: `src/core/generate-line-patterns.test.ts`

**Test Cases**:

- [ ] Should generate no lines for bright cells (>204)
- [ ] Should generate single diagonal for medium-bright cells
- [ ] Should generate cross pattern for medium-dark cells
- [ ] Should generate hatch pattern for dark cells
- [ ] Should position lines correctly based on cell coordinates
- [ ] Should respect cell size for line length
- [ ] Should handle threshold parameter variations
- [ ] Should generate correct number of points per line

**Acceptance Criteria**:

- Pattern selection logic verified
- Coordinate calculations verified
- All pattern types tested

---

### Step 9: Write Integration Tests for Vectorize Image

**File**: `src/core/vectorize-image.test.ts`

**Test Cases**:

- [ ] Should return polylines array for valid input
- [ ] Should return empty array for all-white image
- [ ] Should generate lines for dark image
- [ ] Should respect gridSize setting
- [ ] Should respect threshold setting
- [ ] Should include grid metadata in output

**Acceptance Criteria**:

- End-to-end pipeline works
- Settings are correctly propagated
- Output structure is valid

---

### Step 10: Create Processing Hook

**File**: `src/hooks/use-vectorize.ts`

**Goal**: React hook to trigger vectorization and update store.

**Entry Point**:

```typescript
export const useVectorize = () => {
  return { vectorize, isProcessing }
}
```

**Tasks**:

- [ ] Create hook that reads imageData and settings from store
- [ ] Provide `vectorize` function that triggers processing
- [ ] Update processing status during vectorization
- [ ] Store resulting polylines in store
- [ ] Handle errors gracefully

**Implementation**:

```typescript
import { useCallback } from "react"
import { vectorizeImage } from "../core/vectorize-image"
import { useOutputActions, useProcessingActions } from "../store/actions"
import { useImageData, useSettings } from "../store/selectors"

export const useVectorize = () => {
  const imageData = useImageData()
  const settings = useSettings()
  const { setProcessingStatus, setProcessingError } = useProcessingActions()
  const { setPolylines } = useOutputActions()

  const vectorize = useCallback(() => {
    if (!imageData) return

    setProcessingStatus("processing")
    setProcessingError(null)

    try {
      const result = vectorizeImage({ imageData, settings })
      setPolylines(result.polylines)
      setProcessingStatus("complete")
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : "Vectorization failed")
      setProcessingStatus("error")
    }
  }, [imageData, settings, setProcessingStatus, setProcessingError, setPolylines])

  const isProcessing = false // Will be enhanced in later phases

  return { vectorize, isProcessing }
}
```

**Acceptance Criteria**:

- Hook is reusable across components
- Store is properly updated
- Errors are handled
- Dependencies are correctly managed

---

### Step 11: Wire Up Auto-Vectorization

**File**: `src/App.tsx` (or appropriate component)

**Goal**: Automatically trigger vectorization when image is uploaded.

**Tasks**:

- [ ] Use `useVectorize` hook
- [ ] Trigger `vectorize()` when `imageData` changes
- [ ] Show processing status in UI

**Implementation Approach**:

```typescript
import { useEffect } from "react"
import { useVectorize } from "./hooks/use-vectorize"
import { useImageData } from "./store/selectors"

// Inside component:
const imageData = useImageData()
const { vectorize } = useVectorize()

useEffect(() => {
  if (imageData) {
    vectorize()
  }
}, [imageData, vectorize])
```

**Acceptance Criteria**:

- Uploading image triggers vectorization
- Polylines are stored after processing
- UI reflects processing status

---

## File Summary

| File                                   | Action | Purpose                              |
| -------------------------------------- | ------ | ------------------------------------ |
| `src/core/types.ts`                    | Modify | Add vectorization types              |
| `src/core/vectorize-image.ts`          | Create | Entry point function                 |
| `src/core/vectorize-image.test.ts`     | Create | Integration tests                    |
| `src/core/convert-to-grayscale.ts`     | Create | RGB to grayscale                     |
| `src/core/convert-to-grayscale.test.ts`| Create | Unit tests                           |
| `src/core/sample-brightness.ts`        | Create | Grid brightness sampling             |
| `src/core/sample-brightness.test.ts`   | Create | Unit tests                           |
| `src/core/generate-line-patterns.ts`   | Create | Brightness to polylines              |
| `src/core/generate-line-patterns.test.ts` | Create | Unit tests                        |
| `src/hooks/use-vectorize.ts`           | Create | React hook for triggering            |
| `src/App.tsx`                          | Modify | Wire up auto-vectorization           |

---

## Dependencies Between Steps

```
Step 1 (Types)
    ↓
Step 2 (Grayscale) ──→ Step 6 (Grayscale Tests)
    ↓
Step 3 (Brightness) ──→ Step 7 (Brightness Tests)
    ↓
Step 4 (Patterns) ──→ Step 8 (Pattern Tests)
    ↓
Step 5 (Entry Point) ──→ Step 9 (Integration Tests)
    ↓
Step 10 (Hook)
    ↓
Step 11 (Wire Up)
```

---

## Key Design Decisions

### 1. Single Entry Point

External code only needs to know about `vectorizeImage()`. This creates a clean API boundary and makes the module easy to use.

### 2. Filename = Function Name

Every file exports a single function that matches its filename:
- `vectorize-image.ts` → `vectorizeImage()`
- `convert-to-grayscale.ts` → `convertToGrayscale()`

This makes the codebase navigable without reading any code.

### 3. Pure Functions

All processing functions are pure (no side effects). This enables:
- Easy testing with simple assertions
- Future Web Worker offloading
- Predictable behavior

### 4. RORO Pattern

Functions with multiple parameters use objects:
```typescript
sampleBrightness({ grayscaleData, cellSize })
```

This provides named parameters and future extensibility.

### 5. Top-Down File Structure

Each file places the entry point at the top, with helper functions below in call order. Reading top-to-bottom tells the story.

---

## Success Criteria

- [ ] `vectorizeImage` function works as single entry point
- [ ] Grayscale conversion produces correct values
- [ ] Brightness grid correctly samples image regions
- [ ] Line patterns visually represent image darkness
- [ ] All unit tests pass (aim for 10-15 per test file)
- [ ] Integration test confirms end-to-end pipeline
- [ ] Hook successfully triggers vectorization
- [ ] Polylines are stored in app store after upload
- [ ] Processing status is reflected in UI

---

_Created: December 13, 2025_

