# Phase 1: Project Setup

> Detailed implementation spec for initializing the Line Weaver project foundation.

---

## 🎯 Phase Goal

Establish a fully configured development environment with a working UI shell that displays placeholder components. At the end of this phase, you should be able to run the dev server and see a basic layout matching the design mockup.

---

## 📋 Prerequisites

- Node.js 20+ installed
- npm or pnpm available
- Terminal access

---

## 🔧 Implementation Steps

### Step 1: Initialize Vite Project

Create a new Vite project with React and TypeScript template.

**Commands:**

```bash
npm create vite@latest . -- --template react-ts
npm install
```

**Verification:**

- [ ] `package.json` exists with React and TypeScript dependencies
- [ ] `vite.config.ts` exists
- [ ] `tsconfig.json` exists
- [ ] Running `npm run dev` starts the dev server

---

### Step 2: Install Tailwind CSS v4

Install Tailwind CSS v4 with the Vite plugin for seamless integration.

**Commands:**

```bash
npm install tailwindcss @tailwindcss/vite
```

**File Changes:**

1. Update `vite.config.ts`:

```typescript
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

2. Replace contents of `src/index.css`:

```css
@import "tailwindcss";
```

3. Delete `src/App.css` (we'll use Tailwind utilities)

**Verification:**

- [ ] Tailwind classes work in components (e.g., `className="text-red-500"`)
- [ ] No CSS compilation errors in terminal

---

### Step 3: Configure Custom Theme

Add the Line Weaver color palette and typography to Tailwind.

**File Changes:**

Update `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: #0a0a0f;
  --color-surface: #14141f;
  --color-accent: #00d4aa;
  --color-warning: #ff6b6b;
  --color-text: #e0e0e8;
  --color-text-muted: #8888a0;

  --font-mono: "Space Mono", monospace;
  --font-sans: "IBM Plex Sans", sans-serif;
}
```

**Verification:**

- [ ] Colors available as `bg-background`, `text-accent`, etc.
- [ ] Custom fonts applied when loaded

---

### Step 4: Add Web Fonts

Load Space Mono and IBM Plex Sans from Google Fonts.

**File Changes:**

Update `index.html` to include font links in `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

**Verification:**

- [ ] Fonts load without console errors
- [ ] Applying `font-mono` shows Space Mono
- [ ] Applying `font-sans` shows IBM Plex Sans

---

### Step 5: Configure ESLint

Set up ESLint for TypeScript and React with strict rules.

**Commands:**

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

**File Changes:**

Create `eslint.config.js`:

```javascript
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      semi: ["error", "never"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  }
);
```

**Verification:**

- [ ] `npm run lint` runs without errors
- [ ] Semicolons are flagged as errors
- [ ] Unused variables are flagged

---

### Step 6: Configure Prettier

Set up Prettier for consistent code formatting.

**Commands:**

```bash
npm install -D prettier
```

**File Changes:**

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Create `.prettierignore`:

```
dist
node_modules
*.md
```

Add script to `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

**Verification:**

- [ ] `npm run format` formats all source files
- [ ] Semicolons are removed after formatting

---

### Step 7: Create Folder Structure

Set up the project directories as defined in the overview spec.

**Commands:**

```bash
mkdir -p src/components/ImageUploader
mkdir -p src/components/PreviewCanvas
mkdir -p src/components/ControlPanel
mkdir -p src/components/ExportButton
mkdir -p src/core
mkdir -p src/hooks
mkdir -p src/utils
```

**Verification:**

- [ ] All directories exist under `src/`
- [ ] Structure matches the file tree from `00-overview.md`

---

### Step 8: Create Shared Types

Define core TypeScript types used across the application.

**File Changes:**

Create `src/core/types.ts`:

```typescript
export type Point = {
  x: number;
  y: number;
};

export type Polyline = Point[];

export type ProcessingConfig = {
  gridSize: number;
  strokeWidth: number;
  enableContours: boolean;
  enableHatching: boolean;
  noiseAmount: number;
  contourSimplify: number;
  threshold: number;
};

export type ProcessingState = {
  status: "idle" | "loading" | "processing" | "complete" | "error";
  progress: number;
  errorMessage?: string;
};

export type ImageData = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};
```

**Verification:**

- [ ] File compiles without TypeScript errors
- [ ] Types can be imported in other files

---

### Step 9: Create Placeholder Components

Build empty shell components for the UI layout.

**File Changes:**

1. Create `src/components/ImageUploader/ImageUploader.tsx`:

```typescript
export const ImageUploader = () => {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-text-muted bg-surface">
      <p className="text-text-muted">Drop image here or click to upload</p>
    </div>
  );
};
```

2. Create `src/components/PreviewCanvas/PreviewCanvas.tsx`:

```typescript
type PreviewCanvasProps = {
  title: string;
};

export const PreviewCanvas = ({ title }: PreviewCanvasProps) => {
  return (
    <div className="flex h-80 flex-col rounded-lg bg-surface">
      <h2 className="border-b border-text-muted/20 px-4 py-2 font-mono text-sm uppercase text-text-muted">
        {title}
      </h2>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-text-muted">No image loaded</p>
      </div>
    </div>
  );
};
```

3. Create `src/components/ControlPanel/ControlPanel.tsx`:

```typescript
export const ControlPanel = () => {
  return (
    <div className="rounded-lg bg-surface p-4">
      <h2 className="mb-4 font-mono text-sm uppercase text-text-muted">
        Controls
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-text">Grid Size</span>
          <span className="text-accent">16px</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text">Stroke Width</span>
          <span className="text-accent">1px</span>
        </div>
      </div>
    </div>
  );
};
```

4. Create `src/components/ExportButton/ExportButton.tsx`:

```typescript
type ExportButtonProps = {
  isDisabled: boolean;
};

export const ExportButton = ({ isDisabled }: ExportButtonProps) => {
  return (
    <button
      disabled={isDisabled}
      className="rounded-lg bg-accent px-6 py-3 font-mono text-sm font-bold uppercase text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Download SVG
    </button>
  );
};
```

**Verification:**

- [ ] All components compile without errors
- [ ] Components can be imported in `App.tsx`

---

### Step 10: Build App Shell Layout

Assemble the main application layout with all placeholder components.

**File Changes:**

Replace `src/App.tsx`:

```typescript
import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import { ExportButton } from "./components/ExportButton/ExportButton";
import { ImageUploader } from "./components/ImageUploader/ImageUploader";
import { PreviewCanvas } from "./components/PreviewCanvas/PreviewCanvas";

export const App = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-text">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <CanvasSection />
        <ControlSection />
        <ActionSection />
      </main>
    </div>
  );
};

const Header = () => {
  return (
    <header className="border-b border-surface px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h1 className="font-mono text-xl font-bold tracking-wider text-accent">
          LINE WEAVER
        </h1>
        <nav className="flex gap-4">
          <a
            href="#"
            className="text-text-muted transition-colors hover:text-text"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-text-muted transition-colors hover:text-text"
          >
            Help
          </a>
        </nav>
      </div>
    </header>
  );
};

const CanvasSection = () => {
  return (
    <section className="mb-8">
      <ImageUploader />
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <PreviewCanvas title="Original" />
        <PreviewCanvas title="Vectorized" />
      </div>
    </section>
  );
};

const ControlSection = () => {
  return (
    <section className="mb-8">
      <ControlPanel />
    </section>
  );
};

const ActionSection = () => {
  return (
    <section className="flex justify-center gap-4">
      <button className="rounded-lg border border-accent bg-transparent px-6 py-3 font-mono text-sm font-bold uppercase text-accent transition-colors hover:bg-accent/10">
        Upload Image
      </button>
      <ExportButton isDisabled={true} />
    </section>
  );
};
```

Update `src/main.tsx`:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Verification:**

- [ ] `npm run dev` shows the complete layout
- [ ] Header displays "LINE WEAVER" in accent color
- [ ] Two preview canvases side-by-side on desktop
- [ ] Control panel visible with placeholder values
- [ ] Action buttons visible at bottom

---

### Step 11: Update HTML Title and Favicon

Set proper page title and add a simple SVG favicon.

**File Changes:**

1. Update `index.html` title:

```html
<title>Line Weaver - Image to Vector Converter</title>
```

2. Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="4" fill="#0a0a0f"/>
  <path d="M6 26 L16 6 L26 26" stroke="#00d4aa" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="10" y1="18" x2="22" y2="18" stroke="#00d4aa" stroke-width="2" stroke-linecap="round"/>
</svg>
```

**Verification:**

- [ ] Browser tab shows "Line Weaver" title
- [ ] Favicon displays in browser tab

---

### Step 12: Clean Up Generated Files

Remove Vite starter files that are no longer needed.

**Files to Delete:**

- `src/assets/react.svg`
- `public/vite.svg` (replaced by our favicon)

**Verification:**

- [ ] No unused files in `src/assets/`
- [ ] Application still runs without errors

---

## ✅ Phase 1 Completion Checklist

Run through all verifications:

| Check                                         | Status |
| --------------------------------------------- | ------ |
| `npm run dev` starts without errors           | 🔲     |
| `npm run lint` passes                         | 🔲     |
| `npm run build` produces valid dist folder    | 🔲     |
| Tailwind classes apply correctly              | 🔲     |
| Custom colors (accent, background, etc.) work | 🔲     |
| Custom fonts load and display                 | 🔲     |
| All placeholder components render             | 🔲     |
| Layout matches design mockup from overview    | 🔲     |
| TypeScript compiles without errors            | 🔲     |
| Folder structure matches spec                 | 🔲     |

---

## 📸 Expected Result

After completing Phase 1, the application should display:

```
┌────────────────────────────────────────────────────────────┐
│  LINE WEAVER                              [GitHub] [Help]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │       Drop image here or click to upload          │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│   ┌────────────────────┐    ┌────────────────────┐        │
│   │   ORIGINAL         │    │   VECTORIZED       │        │
│   │   No image loaded  │    │   No image loaded  │        │
│   └────────────────────┘    └────────────────────┘        │
│                                                            │
│   ┌──────────────────────────────────────────────────┐    │
│   │  CONTROLS                                         │    │
│   │  Grid Size ............................ 16px     │    │
│   │  Stroke Width ......................... 1px      │    │
│   └──────────────────────────────────────────────────┘    │
│                                                            │
│              [ UPLOAD IMAGE ]   [ DOWNLOAD SVG ]           │
└────────────────────────────────────────────────────────────┘
```

---

## ➡️ Next Phase

Proceed to **Phase 2: Image Input** (`02-image-input.md`) to implement the actual image upload functionality.

---

_Created: December 10, 2025_
