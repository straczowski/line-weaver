# Line Weaver - Project Plan

> A browser-based tool for converting raster images (PNG/JPG) into vectorized line drawings (SVG), inspired by [linedraw](https://github.com/LingDong-/linedraw).

---

## 📂 Specification Index

This is the **master plan**. Detailed implementation specs are added incrementally:

| Spec  | File                             | Status      |
| ----- | -------------------------------- | ----------- |
| 00    | `00-overview.md`                 | ✅ Complete |
| 01    | `01-project-setup.md`            | ✅ Complete |
| 02    | `02-image-input.md`              | ✅ Complete |
| 02.01 | `02.01-acr-state-management.md`  | 🔲 Pending  |
| 03    | `03-simple-vectorization.md`     | ✅ Complete |
| 04    | `04-svg-generation.md`           | ✅ Complete |
| 04.01 | `04.01-display-svg.md`           | ✅ Complete |
| 04.02 | `04.02-control-panel-refactor.md`| ✅ Complete |
| 05    | `05-gcode-export.md`             | ✅ Complete |
| 05.01 | `05.01-optimize-gcode-output.md` | ✅ Complete |
| 06    | `06-advanced-processing.md`      | ✅ Complete |
| 06.01 | `06.01-filter-small-polylines.md`| ✅ Complete |
| 07    | `07-new-structure-of-core.md`     | ✅ Complete |
| 08    | `08-extend-hatch-option.md`       | 🔲 Pending  |

> 💡 Each spec is created just-in-time before implementation begins for that phase.

---

## 🎯 Project Goal

Build a performant, interactive web application that:

- Accepts PNG or JPG image input via drag-and-drop or file picker
- Processes pixel data entirely in TypeScript (no backend required)
- Converts images to vector graphics (SVG) using custom line-drawing algorithms
- Displays real-time preview of the vectorized result
- Exports downloadable SVG files with optimized stroke order

---

## 🏗️ Technical Architecture

### Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| UI Framework   | React 18+                           |
| Language       | TypeScript 5+                       |
| Build Tool     | Vite                                |
| Styling        | Tailwind CSS v4                     |
| Canvas API     | HTML5 Canvas for pixel manipulation |
| SVG Generation | Custom TypeScript implementation    |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React UI Layer                               │
├─────────────┬───────────────────┬─────────────────┬─────────────────┤
│ ImageUpload │   PreviewCanvas   │  ControlPanel   │ GcodeSettings   │
│  Component  │    Component      │   Component     │    Panel        │
└─────────────┴─────────┬─────────┴─────────────────┴─────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────────────┐
│                   Processing Pipeline                              │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│ ImageLoader │ EdgeDetect  │ Hatching    │ StrokeOptimizer         │
└─────────────┴─────────────┴─────────────┴─────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼                               ▼
┌───────────────────────┐       ┌───────────────────────────────────┐
│    SVG Generator      │       │      GCODE Generator              │
│  (Polyline → SVG)     │       │  (Scale → Optimize → Commands)   │
└───────────────────────┘       └───────────────────────────────────┘
```

---

## 🧠 Core Algorithm (Inspired by linedraw)

### Phase 1: Image Preprocessing

1. **Load image** into Canvas and extract ImageData
2. **Convert to grayscale** using luminosity method:
   ```
   gray = 0.299 * R + 0.587 * G + 0.114 * B
   ```
3. **Apply Gaussian blur** for noise reduction (optional, configurable)

### Phase 2: Contour Detection

1. **Edge detection** using Canny-like algorithm:
   - Compute gradient magnitude and direction (Sobel operators)
   - Non-maximum suppression
   - Hysteresis thresholding
2. **Trace contours** by following connected edge pixels
3. **Simplify polylines** using Ramer-Douglas-Peucker algorithm

### Phase 3: Hatching (Cross-hatch shading)

1. **Divide image into grid patches** (configurable size: 8, 16, 32px)
2. **Calculate average darkness** per patch
3. **Generate hatch lines** based on darkness level:
   - Light areas: no lines or sparse lines
   - Dark areas: dense cross-hatching
4. **Add Perlin noise** for organic, sketchy feel

### Phase 4: Stroke Optimization

1. **Sort strokes** for minimal pen-lift travel (TSP-like optimization)
2. **Merge nearby endpoints** to create continuous paths
3. **Reverse strokes** where beneficial for drawing order

### Phase 5: SVG Generation

1. Convert polylines to SVG `<path>` elements
2. Use `M` (moveto) and `L` (lineto) commands
3. Set stroke properties (width, color, linecap)
4. Assemble final SVG document

---

## 📁 File Structure

```
line-weaver/
├── spec/                         # 📋 Specifications (this folder)
│   ├── 00-overview.md            # Master plan (you are here)
│   ├── 01-project-setup.md       # Setup details
│   └── ...                       # Additional specs as needed
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── ImageUploader/
│   │   │   └── ImageUploader.tsx
│   │   ├── PreviewCanvas/
│   │   │   └── PreviewCanvas.tsx
│   │   ├── ControlPanel/
│   │   │   └── ControlPanel.tsx
│   │   ├── ExportButton/
│   │   │   └── ExportButton.tsx
│   │   ├── GcodeSettingsPanel/
│   │   │   └── GcodeSettingsPanel.tsx
│   │   └── ExportGcodeButton/
│   │       └── ExportGcodeButton.tsx
│   ├── core/
│   │   ├── types.ts              # Shared type definitions
│   │   ├── imageLoader.ts        # Load image → Canvas → ImageData
│   │   ├── grayscale.ts          # RGB → Grayscale conversion
│   │   ├── edgeDetection.ts      # Canny edge detection
│   │   ├── contourTracing.ts     # Edge → Polyline conversion
│   │   ├── lineSimplify.ts       # Douglas-Peucker algorithm
│   │   ├── hatching.ts           # Cross-hatch generation
│   │   ├── perlin.ts             # Perlin noise for sketchy effect
│   │   ├── strokeOptimizer.ts    # Stroke sorting/optimization
│   │   ├── svgGenerator.ts       # Polylines → SVG output
│   │   ├── generate-gcode.ts     # Entry point for GCODE generation
│   │   ├── scale-polylines.ts    # Scale polylines to fit sheet
│   │   ├── optimize-line-order.ts # Minimize pen lift operations
│   │   └── convert-to-gcode-commands.ts # Generate GCODE string
│   ├── hooks/
│   │   ├── useImageProcessor.ts  # Main processing hook
│   │   └── useDebounce.ts        # Debounce for slider controls
│   ├── utils/
│   │   └── downloadSvg.ts        # Trigger SVG file download
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🧩 Component Breakdown

### `<App />`

- Root component managing global state
- Orchestrates image upload → processing → preview → export flow

### `<ImageUploader />`

- Drag-and-drop zone with visual feedback
- File input fallback
- Validates file type (PNG/JPG only)
- Displays thumbnail preview of original image

### `<PreviewCanvas />`

- Dual-pane view: original image vs. vectorized result
- Canvas for rendering SVG preview in real-time
- Zoom and pan controls

### `<ControlPanel />`

- Sliders and toggles for algorithm parameters:
  - **Contour Simplification** (1-5 level)
  - **Hatch Size** (8, 16, 32, 64 px)
  - **Enable/Disable Contours**
  - **Enable/Disable Hatching**
  - **Noise Amount** (sketchy effect intensity)
  - **Stroke Width**

### `<ExportButton />`

- Generates final SVG file
- Triggers browser download

### `<GcodeSettingsPanel />`

- Expandable panel for GCODE configuration
- Command settings: Pen Up, Pen Down, Feed Rate, Pause
- Sheet settings: Target X/Y dimensions, Padding
- Persists settings in app state

### `<ExportGcodeButton />`

- Generates optimized GCODE from polylines
- Scales content to fit sheet with padding
- Optimizes line order to minimize pen lifts
- Triggers browser download of `.gcode` file

---

## 📅 Implementation Phases

> Each phase has a corresponding detailed spec file (created just-in-time).
>
> **Strategy**: Build a working end-to-end product first with simple algorithms, then enhance with advanced processing.

### Phase 1: Project Setup → `01-project-setup.md`

- [ ] Initialize Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS v4 (simple CSS import)
- [ ] Configure ESLint and Prettier
- [ ] Set up folder structure
- [ ] Create basic UI shell with placeholder components

### Phase 2: Image Input → `02-image-input.md`

- [ ] Implement `<ImageUploader />` with drag-and-drop
- [ ] Build `imageLoader.ts` for Canvas extraction
- [ ] Display original image preview

### Phase 3: Simple Vectorization → `03-simple-vectorization.md`

> MVP approach: Convert pixel brightness directly to line patterns for quick visual feedback.

- [ ] Implement grayscale conversion
- [ ] Build grid-based brightness sampling
- [ ] Generate line patterns based on darkness level:
  - Light: empty cell
  - Medium-light: single diagonal line (`/` or `\`)
  - Medium-dark: crossed lines (`X`)
  - Dark: cross-hatch square (`#`)
- [ ] Output array of line segments (polylines)

### Phase 4: SVG Generation → `04-svg-generation.md`

- [ ] Convert polylines to SVG path data
- [ ] Generate valid SVG document with proper headers
- [ ] Set stroke properties (width, color, linecap)

### Phase 5: GCODE Export → `05-gcode-export.md`

> Export vectorized polylines as optimized GCODE for pen plotters.

- [ ] Implement GCODE generation pipeline with scaling and optimization
- [ ] Create GCODE Settings panel with configurable commands:
  - Pen Up: `M5`
  - Pen Down: `M3 S1000`
  - Feed Rate: `G1 F3000`
  - Pause: `G4 P0.5`
- [ ] Add sheet dimension settings (DIN A4 default: 211×297mm, 20mm padding)
- [ ] Optimize line order to minimize pen lift operations
- [ ] Scale polylines to fit target sheet with 1:1 aspect ratio
- [ ] Add Download GCODE button

### Phase 6: Advanced Processing → `06-advanced-processing.md` ✅

> Enhance vectorization with linedraw-style algorithms for higher quality output.

- [x] Edge detection (Sobel + Canny-like thresholding)
- [x] Contour tracing algorithm
- [x] Line simplification (Douglas-Peucker)
- [x] Advanced hatching generator
- [x] Perlin noise for sketchy effect

---

## ⚙️ Key Configuration Options

### Vectorization Settings

| Parameter         | Type    | Default | Description                         |
| ----------------- | ------- | ------- | ----------------------------------- |
| `contourSimplify` | number  | 2       | Polyline simplification level (1-5) |
| `hatchSize`       | number  | 16      | Grid patch size for hatching        |
| `enableContours`  | boolean | true    | Draw edge contours                  |
| `enableHatching`  | boolean | true    | Draw cross-hatch shading            |
| `noiseAmount`     | number  | 0.5     | Perlin noise intensity (0-1)        |
| `strokeWidth`     | number  | 1       | Output SVG stroke width             |
| `threshold`       | number  | 128     | Edge detection threshold            |

### GCODE Settings

| Parameter         | Type   | Default       | Description                         |
| ----------------- | ------ | ------------- | ----------------------------------- |
| `penUp`           | string | `M5`          | Command to lift pen                 |
| `penDown`         | string | `M3 S1000`    | Command to lower pen                |
| `feedRate`        | string | `G1 F3000`    | Feed rate command                   |
| `pause`           | string | `G4 P0.5`     | Pause command after pen up/down     |
| `targetX`         | number | 211           | Sheet width in mm (DIN A4)          |
| `targetY`         | number | 297           | Sheet height in mm (DIN A4)         |
| `padding`         | number | 20            | Margin from sheet edge in mm        |

---

## 🚀 Performance Considerations

1. **Web Workers**: Offload heavy computation (edge detection, hatching) to prevent UI freeze
2. **Progressive Rendering**: Show intermediate results during processing
3. **Image Scaling**: Downsample large images before processing (max 2000px dimension)
4. **Memoization**: Cache intermediate results when only some parameters change
5. **RequestAnimationFrame**: Use for smooth canvas rendering

---

## 🎨 UI/UX Design Notes

### Color Palette

- Background: `#0a0a0f` (deep navy-black)
- Surface: `#14141f` (elevated panels)
- Accent: `#00d4aa` (vibrant teal)
- Secondary: `#ff6b6b` (coral for warnings/errors)
- Text: `#e0e0e8` (off-white)

### Typography

- Headers: **Space Mono** (monospace, technical feel)
- Body: **IBM Plex Sans** (clean, readable)

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  LINE WEAVER                              [GitHub] [?]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   ┌──────────────────┐    ┌──────────────────┐            │
│   │                  │    │                  │            │
│   │   ORIGINAL       │    │   VECTORIZED     │            │
│   │   IMAGE          │    │   OUTPUT         │            │
│   │                  │    │                  │            │
│   └──────────────────┘    └──────────────────┘            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  CONTROLS                                                  │
│  ├─ Contours ────── [ON] ──────────────── Simplify [===]  │
│  ├─ Hatching ────── [ON] ──────────────── Size [16px ▼]   │
│  ├─ Noise ────────────────────────────── Amount [===]     │
│  └─ Stroke Width ─────────────────────── [===]            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  GCODE SETTINGS                                            │
│  ├─ Commands: Pen Up [M5] Pen Down [M3 S1000]             │
│  │            Feed [G1 F3000] Pause [G4 P0.5]             │
│  └─ Sheet:    [211]×[297]mm  Padding [20]mm               │
│                                                            │
│     [ UPLOAD IMAGE ]  [ DOWNLOAD SVG ]  [ DOWNLOAD GCODE ] │
└────────────────────────────────────────────────────────────┘
```

---

## 📚 References

- [linedraw by LingDong-](https://github.com/LingDong-/linedraw) - Original Python implementation
- [Canny Edge Detection](https://en.wikipedia.org/wiki/Canny_edge_detector)
- [Douglas-Peucker Algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
- [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise)

---

## ✅ Success Criteria

1. User can upload PNG/JPG images up to 5MB
2. Processing completes in < 5 seconds for typical images (1920x1080)
3. Output SVG is valid and renders in all major browsers
4. UI is responsive and provides feedback during processing
5. Exported SVG has optimized stroke order for pen plotters
6. All algorithm parameters are adjustable in real-time
7. GCODE export scales correctly to DIN A4 with configurable padding
8. GCODE line order is optimized to minimize pen lift operations
9. GCODE settings (commands, sheet dimensions) are user-configurable

---

_Last Updated: December 13, 2025_
