# Proposed new structure of `core` folder

```
src/core/
├── types.ts                          # Shared types (stays at root)
├── vectorize-image.ts                # Main entry point
├── vectorize-image.test.ts
│
├── image/                            # Image loading & preprocessing
│   ├── load-image.ts
│   ├── load-image.test.ts
│   ├── validate-image-file.ts
│   ├── validate-image-file.test.ts
│   ├── extract-image-data.ts
│   ├── convert-to-grayscale.ts
│   ├── convert-to-grayscale.test.ts
│   ├── apply-gaussian-blur.ts
│   └── apply-gaussian-blur.test.ts
│
├── detection/                        # Edge detection & contour tracing
│   ├── detect-edges.ts
│   ├── detect-edges.test.ts
│   ├── trace-contours.ts
│   ├── trace-contours.test.ts
│   ├── sample-brightness.ts
│   └── sample-brightness.test.ts
│
├── hatching/                         # Pattern generation
│   ├── generate-line-patterns.ts
│   ├── generate-line-patterns.test.ts
│   ├── generate-advanced-hatching.ts
│   ├── generate-advanced-hatching.test.ts
│   ├── generate-perlin-noise.ts
│   └── generate-perlin-noise.test.ts
│
├── polyline/                         # Polyline manipulation
│   ├── simplify-polyline.ts
│   ├── simplify-polyline.test.ts
│   ├── combine-polylines.ts
│   ├── combine-polylines.test.ts
│   ├── filter-small-polylines.ts
│   ├── filter-small-polylines.test.ts
│   ├── calculate-polyline-length.ts
│   ├── calculate-polyline-length.test.ts
│   ├── apply-noise-to-polylines.ts
│   └── apply-noise-to-polylines.test.ts
│
├── svg/                              # SVG generation
│   ├── generate-svg.ts
│   ├── generate-svg.test.ts
│   ├── generate-svg-document.ts
│   ├── generate-svg-document.test.ts
│   ├── generate-svg-paths.ts
│   ├── generate-svg-paths.test.ts
│   ├── convert-polyline-to-path.ts
│   ├── convert-polyline-to-path.test.ts
│   └── create-stroke-config.ts
│
└── gcode/                            # GCODE generation
    ├── generate-gcode.ts
    ├── generate-gcode.test.ts
    ├── scale-polylines.ts
    ├── scale-polylines.test.ts
    ├── flip-polylines-x.ts
    ├── flip-polylines-x.test.ts
    ├── merge-connected-polylines.ts
    ├── merge-connected-polylines.test.ts
    ├── optimize-line-order.ts
    ├── optimize-line-order.test.ts
    ├── convert-to-gcode-commands.ts
    └── convert-to-gcode-commands.test.ts
```
