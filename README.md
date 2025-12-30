# Line Weaver

Convert images to vectorized line drawings optimized for pen plotters. Pure browser-based processing—no backend, no API calls, just TypeScript and Canvas.

👉 [Live Demo](https://straczowski.github.io/line-weaver/) · [Tutorial](https://straczowski.github.io/line-weaver/tutorial)

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and drop an image.

## Stack

- **React 19** + **TypeScript 5** + **Vite**
- **Zustand** for state management
- **Tailwind CSS v4** for styling
- **Node.js native test** framework

## Architecture

Pure functional pipeline: image → grayscale → edge detection → contour tracing → hatching → polyline optimization → SVG/GCode export.

All processing happens in the browser using Canvas API. The core algorithms live in `src/core/`—edge detection, Perlin noise, Douglas-Peucker simplification, and stroke optimization are implemented from scratch.

## What's Inside

- **Edge detection**: Canny-like algorithm with Sobel operators
- **Hatching**: Grid-based brightness sampling with cross-hatch patterns
- **Contour tracing**: Connected component analysis for edge following
- **Line simplification**: Ramer-Douglas-Peucker algorithm
- **GCode generation**: Optimized for pen plotters with configurable commands
- **Stroke optimization**: Minimizes pen lifts using TSP-like ordering

See `spec/00-overview.md` for the full implementation plan.
