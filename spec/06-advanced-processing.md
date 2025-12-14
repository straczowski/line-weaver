# Phase 6: Advanced Processing

> Enhance vectorization with linedraw-style algorithms for higher quality output.

---

## 📋 Overview

The current implementation uses a simple grid-based approach that samples brightness and generates fixed line patterns (empty, diagonal, cross, hatch). This phase adds advanced image processing techniques to create more artistic, linedraw-style output:

1. **Edge Detection** - Extract contours/outlines from the image
2. **Contour Tracing** - Convert edge pixels into continuous polylines
3. **Line Simplification** - Reduce polyline complexity while preserving shape
4. **Advanced Hatching** - Variable-density hatching based on darkness
5. **Perlin Noise** - Add organic, hand-drawn feel to lines

---

## 🏗️ Current Architecture

```
vectorizeImage()
├── convertToGrayscale()      ✅ Exists
├── sampleBrightness()        ✅ Exists (grid-based brightness)
└── generateLinePatterns()    ✅ Exists (simple pattern generation)
```

### Target Architecture

```
vectorizeImage()
├── convertToGrayscale()           ✅ Exists
├── [NEW BRANCH: Contours]
│   ├── detectEdges()              🆕 Sobel gradient + Canny thresholding
│   ├── traceContours()            🆕 Edge pixels → polylines
│   └── simplifyPolylines()        🆕 Douglas-Peucker algorithm
├── [NEW BRANCH: Hatching]
│   ├── sampleBrightness()         ✅ Exists
│   ├── generateAdvancedHatching() 🆕 Variable density hatching
│   └── applyPerlinNoise()         🆕 Organic line displacement
└── combinePolylines()             🆕 Merge contours + hatching
```

---

## 📦 Implementation Steps

Each step is isolated and can be implemented/tested independently.

---

### Step 6.1: Gaussian Blur (Preprocessing)

**Goal**: Reduce noise before edge detection to avoid detecting texture as edges.

**New File**: `src/core/apply-gaussian-blur.ts`

**Input/Output**:
```typescript
type ApplyGaussianBlurInput = {
  grayscaleData: GrayscaleData
  radius: number  // 0-5, default: 1
}

type ApplyGaussianBlurOutput = GrayscaleData
```

**Algorithm**:
1. Generate Gaussian kernel based on radius
2. Convolve kernel with each pixel
3. Handle edge pixels (clamp or mirror)

**Tests**:
- Blur with radius 0 returns identical data
- Blur smooths out pixel variations
- Edge pixels are handled correctly

**Settings Integration**: Add `blurRadius` to `ProcessingConfig`

---

### Step 6.2: Sobel Edge Detection

**Goal**: Detect edges by computing gradient magnitude at each pixel.

**New File**: `src/core/detect-edges.ts`

**Input/Output**:
```typescript
type DetectEdgesInput = {
  grayscaleData: GrayscaleData
  lowThreshold: number   // 0-255, default: 50
  highThreshold: number  // 0-255, default: 150
}

type EdgeData = {
  width: number
  height: number
  edges: Uint8Array  // 0 = no edge, 255 = strong edge
}
```

**Algorithm**:
1. Apply Sobel operators (3x3 kernels for Gx and Gy)
2. Calculate gradient magnitude: `sqrt(Gx² + Gy²)`
3. Apply non-maximum suppression
4. Apply hysteresis thresholding (Canny-style)

**Tests**:
- Detects vertical edges
- Detects horizontal edges
- Detects diagonal edges
- Thresholds filter weak edges

**Settings Integration**: Add `edgeLowThreshold`, `edgeHighThreshold` to `ProcessingConfig`

---

### Step 6.3: Contour Tracing

**Goal**: Convert edge pixel map into connected polylines.

**New File**: `src/core/trace-contours.ts`

**Input/Output**:
```typescript
type TraceContoursInput = {
  edgeData: EdgeData
}

type TraceContoursOutput = {
  polylines: Polyline[]
}
```

**Algorithm**:
1. Scan image for unvisited edge pixels
2. When found, follow connected edge pixels (8-connectivity)
3. Mark visited pixels to avoid duplicates
4. Store path as polyline
5. Continue until no unvisited edges remain

**Tests**:
- Traces straight horizontal line
- Traces straight vertical line
- Traces diagonal line
- Handles branching points
- Returns empty for no edges

---

### Step 6.4: Douglas-Peucker Line Simplification

**Goal**: Reduce polyline point count while preserving shape.

**New File**: `src/core/simplify-polyline.ts`

**Input/Output**:
```typescript
type SimplifyPolylineInput = {
  polyline: Polyline
  epsilon: number  // tolerance, higher = more simplification
}

type SimplifyPolylineOutput = Polyline
```

**Algorithm** (Ramer-Douglas-Peucker):
1. Find point with maximum perpendicular distance from line (start→end)
2. If max distance > epsilon, recursively simplify both segments
3. If max distance ≤ epsilon, keep only endpoints

**Tests**:
- Straight line keeps only endpoints
- Complex curve retains key points
- Epsilon 0 returns original polyline
- High epsilon returns only endpoints

**Settings Integration**: Map `contourSimplify` (1-5) to epsilon values

---

### Step 6.5: Perlin Noise Generator

**Goal**: Generate coherent noise for organic line displacement.

**New File**: `src/core/generate-perlin-noise.ts`

**Input/Output**:
```typescript
type GeneratePerlinNoiseInput = {
  x: number
  y: number
  scale: number     // frequency, default: 0.1
  octaves: number   // detail levels, default: 2
}

type GeneratePerlinNoiseOutput = number  // -1 to 1
```

**Algorithm**:
1. Use permutation table for pseudo-random gradients
2. Compute contribution from surrounding grid points
3. Blend using smoothstep/fade function
4. Layer multiple octaves for detail

**Tests**:
- Same input returns same output (deterministic)
- Output range is -1 to 1
- Adjacent values are similar (coherent)
- Multiple octaves add detail

---

### Step 6.6: Apply Noise to Polylines

**Goal**: Displace polyline points using Perlin noise for sketchy effect.

**New File**: `src/core/apply-noise-to-polylines.ts`

**Input/Output**:
```typescript
type ApplyNoiseToPolylinesInput = {
  polylines: Polyline[]
  noiseAmount: number  // 0-1, 0 = no effect
  noiseScale: number   // frequency, default: 0.05
}

type ApplyNoiseToPolylinesOutput = Polyline[]
```

**Algorithm**:
1. For each point in each polyline
2. Generate noise value at that position
3. Calculate perpendicular direction to line
4. Displace point perpendicular to path by (noise × amount)

**Tests**:
- noiseAmount 0 returns original polylines
- Higher noiseAmount creates more displacement
- Noise is coherent (adjacent points move similarly)

**Settings Integration**: Uses existing `noiseAmount` from `ProcessingConfig`

---

### Step 6.7: Advanced Hatching Generator

**Goal**: Generate variable-density hatching lines based on local darkness.

**New File**: `src/core/generate-advanced-hatching.ts`

**Input/Output**:
```typescript
type GenerateAdvancedHatchingInput = {
  brightnessGrid: BrightnessGrid
  hatchAngle: number      // degrees, default: 45
  maxDensity: number      // lines per cell at darkest, default: 4
  crossHatch: boolean     // add perpendicular lines, default: true
}

type GenerateAdvancedHatchingOutput = Polyline[]
```

**Algorithm**:
1. For each grid cell, determine darkness level (0-1)
2. Calculate number of hatch lines based on darkness
3. Generate parallel lines at specified angle
4. If crossHatch, add perpendicular lines for darker areas
5. Clip lines to cell boundaries

**Tests**:
- Light cells generate no lines
- Dark cells generate max density lines
- Lines are parallel at specified angle
- Cross-hatch adds perpendicular lines

**Settings Integration**: Add `hatchAngle`, `hatchDensity`, `enableCrossHatch` to `ProcessingConfig`

---

### Step 6.8: Combine Contours and Hatching

**Goal**: Merge contour polylines and hatching into final output.

**New File**: `src/core/combine-polylines.ts`

**Input/Output**:
```typescript
type CombinePolylinesInput = {
  contourPolylines: Polyline[]
  hatchingPolylines: Polyline[]
  enableContours: boolean
  enableHatching: boolean
}

type CombinePolylinesOutput = Polyline[]
```

**Algorithm**:
1. Start with empty result
2. If enableContours, add contour polylines
3. If enableHatching, add hatching polylines
4. Return combined array

**Settings Integration**: Uses existing `enableContours`, `enableHatching` from `ProcessingConfig`

---

### Step 6.9: Update Vectorize Image Pipeline

**Goal**: Integrate all new modules into the main vectorization flow.

**Update File**: `src/core/vectorize-image.ts`

**Changes**:
1. Add optional Gaussian blur preprocessing
2. Branch into contour detection path (steps 6.2-6.4)
3. Branch into hatching path (step 6.7)
4. Apply noise to all polylines (step 6.6)
5. Combine results (step 6.8)

**New Flow**:
```typescript
const vectorizeImage = (input: VectorizeImageInput): VectorizeImageOutput => {
  const { imageData, settings } = input

  const grayscaleData = convertToGrayscale(imageData)
  
  const blurredData = settings.blurRadius > 0
    ? applyGaussianBlur({ grayscaleData, radius: settings.blurRadius })
    : grayscaleData

  const contourPolylines = settings.enableContours
    ? processContours(blurredData, settings)
    : []

  const brightnessGrid = sampleBrightness({ grayscaleData: blurredData, cellSize: settings.gridSize })
  
  const hatchingPolylines = settings.enableHatching
    ? generateAdvancedHatching({ brightnessGrid, ...settings })
    : []

  const combinedPolylines = combinePolylines({
    contourPolylines,
    hatchingPolylines,
    enableContours: settings.enableContours,
    enableHatching: settings.enableHatching,
  })

  const noisyPolylines = settings.noiseAmount > 0
    ? applyNoiseToPolylines({ polylines: combinedPolylines, noiseAmount: settings.noiseAmount })
    : combinedPolylines

  return { polylines: noisyPolylines, grid: brightnessGrid }
}

const processContours = (grayscaleData: GrayscaleData, settings: ProcessingConfig): Polyline[] => {
  const edgeData = detectEdges({
    grayscaleData,
    lowThreshold: settings.edgeLowThreshold,
    highThreshold: settings.edgeHighThreshold,
  })

  const { polylines } = traceContours({ edgeData })

  const simplified = polylines.map(polyline =>
    simplifyPolyline({ polyline, epsilon: mapSimplifyLevelToEpsilon(settings.contourSimplify) })
  )

  return simplified
}
```

---

### Step 6.10: Update Control Panel UI

**Goal**: Add UI controls for new settings.

**Update File**: `src/components/ControlPanel/ControlPanel.tsx`

**New Controls**:
- Blur Radius slider (0-5)
- Edge Detection section:
  - Low Threshold slider (0-255)
  - High Threshold slider (0-255)
- Hatching section:
  - Angle slider (0-180°)
  - Density slider (1-8)
  - Cross-hatch toggle

---

## 📊 Settings Summary

### New Settings to Add to `ProcessingConfig`

| Setting            | Type    | Default | Description                      |
| ------------------ | ------- | ------- | -------------------------------- |
| `blurRadius`       | number  | 1       | Gaussian blur radius (0-5)       |
| `edgeLowThreshold` | number  | 50      | Canny low threshold (0-255)      |
| `edgeHighThreshold`| number  | 150     | Canny high threshold (0-255)     |
| `hatchAngle`       | number  | 45      | Hatching line angle in degrees   |
| `hatchDensity`     | number  | 4       | Max lines per cell at darkest    |
| `enableCrossHatch` | boolean | true    | Add perpendicular hatch lines    |

### Existing Settings (Now Active)

| Setting           | Type    | Current Use                        |
| ----------------- | ------- | ---------------------------------- |
| `enableContours`  | boolean | Will enable edge detection path    |
| `enableHatching`  | boolean | Will enable advanced hatching path |
| `noiseAmount`     | number  | Will apply Perlin noise            |
| `contourSimplify` | number  | Will control Douglas-Peucker epsilon |

---

## 🧪 Testing Strategy

Each step has isolated unit tests. Integration testing:

1. **Visual Regression**: Compare output images before/after changes
2. **Performance**: Ensure processing stays under 5 seconds for 1920×1080
3. **Edge Cases**: 
   - All-white image
   - All-black image
   - Very small images (< 100px)
   - Very large images (> 4000px)

---

## 📅 Suggested Implementation Order

| Order | Step | Est. Complexity | Dependencies |
| ----- | ---- | --------------- | ------------ |
| 1     | 6.5  | Medium          | None         |
| 2     | 6.6  | Low             | 6.5          |
| 3     | 6.1  | Medium          | None         |
| 4     | 6.2  | High            | 6.1          |
| 5     | 6.3  | High            | 6.2          |
| 6     | 6.4  | Medium          | None         |
| 7     | 6.7  | Medium          | None         |
| 8     | 6.8  | Low             | None         |
| 9     | 6.9  | Medium          | 6.1-6.8      |
| 10    | 6.10 | Low             | 6.9          |

**Rationale**: 
- Start with Perlin noise (6.5, 6.6) - quick win, visible improvement
- Then preprocessing + edge detection (6.1-6.3) - core feature
- Simplification (6.4) and hatching (6.7) can be parallel
- Integration (6.9) and UI (6.10) come last

---

## 🔗 References

- [Canny Edge Detection](https://en.wikipedia.org/wiki/Canny_edge_detector)
- [Sobel Operator](https://en.wikipedia.org/wiki/Sobel_operator)
- [Douglas-Peucker Algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
- [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise)
- [linedraw (original Python)](https://github.com/LingDong-/linedraw)

---

_Last Updated: December 13, 2025_

