# Phase 2: Image Input

> Implement drag-and-drop image upload, file validation, Canvas extraction, and original image preview.

---

## Overview

This phase focuses on building a complete image input pipeline:

1. User uploads an image via drag-and-drop or file picker
2. System validates file type and size
3. Image is loaded into an HTML Canvas for pixel extraction
4. Original image thumbnail is displayed in the preview pane
5. ImageData (pixel array) is made available for processing pipeline

---

## Prerequisites

- Phase 1 complete (project setup, UI shell, placeholder components)
- Existing types in `src/core/types.ts`

---

## Implementation Steps

### Step 1: Define Image Upload Types

**File**: `src/core/types.ts`

**Goal**: Add type definitions for the image upload flow.

**Tasks**:

- [ ] Add `OriginalImageMetadata` type containing:
  - `file: File` - Original file reference
  - `dataUrl: string` - Base64 data URL for preview
  - `width: number` - Image width in pixels
  - `height: number` - Image height in pixels
- [ ] Add `ImageUploaderProps` type with callback:
  - `onImageUpload: (image: OriginalImageMetadata) => void`

**Acceptance Criteria**:

- Types are exported and can be imported by components
- Types follow project conventions (no interfaces, use type aliases)

---

### Step 2: Create File Validation Utility

**File**: `src/core/validate-image-file.ts`

**Goal**: Validate uploaded files meet requirements before processing.

**Tasks**:

- [ ] Create `validateImageFile` function that receives a `File`
- [ ] Validate file type is `image/png` or `image/jpeg`
- [ ] Validate file size is under 20MB (20 * 1024 * 1024 bytes)
- [ ] Return validation result object with `isValid: boolean` and `error?: string`
- [ ] Define Zod schema for validation result

**Validation Rules**:

| Rule          | Constraint              | Error Message                          |
| ------------- | ----------------------- | -------------------------------------- |
| File Type     | `image/png`, `image/jpeg` | "Only PNG and JPG images are allowed" |
| File Size     | ≤  20MB                   | "Image must be smaller than 20MB"     |

**Acceptance Criteria**:

- Function returns structured result (not throws)
- Invalid files produce descriptive error messages
- Valid files return `{ isValid: true }`

---

### Step 3: Create Image Loader Utility

**File**: `src/core/load-image.ts`

**Goal**: Load image file into an HTMLImageElement and extract dimensions.

**Tasks**:

- [ ] Create `loadImage` function that receives a `File`
- [ ] Convert File to data URL using `FileReader`
- [ ] Load data URL into `HTMLImageElement`
- [ ] Return Promise resolving to `OriginalImageMetadata` type
- [ ] Handle loading errors with descriptive messages

**Implementation Notes**:

- Use Promise-based approach wrapping FileReader and Image.onload
- Fail early if FileReader encounters error
- Return happy path (OriginalImageMetadata) at the end

**Acceptance Criteria**:

- Function returns Promise that resolves to `OriginalImageMetadata`
- Errors are caught and re-thrown with clear messages
- Works with both PNG and JPG files

---

### Step 4: Create Scale Image and Extract ImageData Utility

**File**: `src/core/image/scale-image.ts`

**Goal**: Scale image to a maximum dimension (for performance) and extract raw pixel data for the processing pipeline.

**Tasks**:

- [ ] Create `scaleImage` function that receives `OriginalImageMetadata` (from loadImage)
- [ ] Calculate scaled dimensions (cap at MAX_DIMENSION, e.g. 2000px) preserving aspect ratio
- [ ] Create off-screen canvas with scaled dimensions
- [ ] Draw image onto canvas and extract ImageData using `getImageData()`
- [ ] Return the canvas ImageData object (Promise, since image load is async)

**Implementation Notes**:

- Canvas is created dynamically (not attached to DOM)
- Maximum dimension scaling (e.g. 2000px) for performance
- Use `document.createElement('canvas')` for off-screen canvas
- Called from `use-file-upload` after `loadImage`; result is stored as scaledImageData in the store

**Acceptance Criteria**:

- Returns standard `ImageData` object with `width`, `height`, and `data` (Uint8ClampedArray)
- Large images are scaled down proportionally
- Original aspect ratio is preserved when scaling

---

### Step 5: Implement Drag-and-Drop Zone UI

**File**: `src/components/ImageUploader/ImageUploader.tsx`

**Goal**: Build interactive drag-and-drop zone with visual feedback.

**Tasks**:

- [ ] Accept `ImageUploaderProps` with `onImageUpload` callback
- [ ] Add hidden file input element (`<input type="file" accept="image/png,image/jpeg" />`)
- [ ] Implement click handler to trigger file input
- [ ] Add `onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop` handlers
- [ ] Track `isDragging` state for visual feedback
- [ ] Apply visual styles when dragging (border color change, background highlight)
- [ ] Prevent default browser behavior for drag events

**Visual States**:

| State    | Border Color | Background         | Text                           |
| -------- | ------------ | ------------------ | ------------------------------ |
| Default  | `border-text-muted` | `bg-surface`  | "Drop image here or click to upload" |
| Dragging | `border-accent`     | `bg-accent/10` | "Drop to upload"               |

**Acceptance Criteria**:

- Clicking anywhere on the zone opens file picker
- Dragging file over zone shows visual feedback
- Dropping file triggers upload flow
- Only accepts PNG/JPG files

---

### Step 6: Implement Upload Flow in ImageUploader

**File**: `src/components/ImageUploader/ImageUploader.tsx`

**Goal**: Wire up file selection to validation and loading pipeline.

**Tasks**:

- [ ] Create `handleFileSelect` function for file input change event
- [ ] Create `handleDrop` function for drop event
- [ ] Extract file from event (input.files or dataTransfer.files)
- [ ] Call `validateImageFile` and handle validation errors
- [ ] Call `loadImage` to load valid files
- [ ] Call `onImageUpload` callback with loaded image
- [ ] Display validation errors inline (temporary error state)

**Error Handling**:

- Show error message below drop zone for 3 seconds
- Clear error when user attempts new upload
- Use `text-error` color for error messages

**Acceptance Criteria**:

- Valid files trigger `onImageUpload` callback
- Invalid files show error message
- Error message auto-clears after 3 seconds
- Multiple rapid uploads work correctly

---

### Step 7: Add Image Thumbnail Preview to Uploader

**File**: `src/components/ImageUploader/ImageUploader.tsx`

**Goal**: Show uploaded image thumbnail within the uploader component.

**Tasks**:

- [ ] Track `uploadedImage` state (OriginalImageMetadata | null)
- [ ] After successful upload, store image in state
- [ ] Render thumbnail when image is present
- [ ] Add "Remove" or "Change" button to clear/replace image
- [ ] Maintain drag-and-drop functionality to replace image

**Layout**:

```
┌──────────────────────────────────────────────────┐
│  ┌─────────┐                                     │
│  │ [thumb] │  filename.jpg                       │
│  │         │  1920 × 1080 • 2.3 MB               │
│  └─────────┘                     [Change Image]  │
└──────────────────────────────────────────────────┘
```

**Acceptance Criteria**:

- Thumbnail displays after upload
- Image dimensions and file size are shown
- User can replace image with new upload
- Drop zone remains functional for replacement

---

### Step 8: Lift Image State to App Component

**File**: `src/App.tsx`

**Goal**: Manage uploaded image state at app level for sharing with preview components.

**Tasks**:

- [ ] Add `uploadedImage` state (or use store: originalImage in Zustand store)
- [ ] Create `handleImageUpload` callback function
- [ ] Pass callback to `<ImageUploader onImageUpload={handleImageUpload} />`
- [ ] Pass `uploadedImage` to `<PreviewCanvas />` for original image display

**State Flow**:

```
ImageUploader → Store (originalImage) → OriginalImage (preview)
                                      → use-file-upload → scaleImage → scaledImageData → vectorize
```

**Acceptance Criteria**:

- App holds single source of truth for uploaded image
- Image state is accessible by sibling components
- State updates trigger re-renders in dependent components

---

### Step 9: Display Original Image in Preview

**File**: `src/components/Preview/OriginalImage.tsx` (and `PreviewPanel.tsx`)

**Goal**: Render the original uploaded image in the left preview pane.

**Tasks**:

- [ ] Use store (e.g. `useOriginalImage`) to get uploaded image
- [ ] Render image when provided using `<img>` element
- [ ] Style image to fit within panel bounds (contain, centered)
- [ ] Show placeholder when no image is uploaded
- [ ] Maintain aspect ratio of original image
- [ ] `PreviewPanel` wraps content with title ("Original" / "Vectorized")

**Visual States**:

| State     | Display                                    |
| --------- | ------------------------------------------ |
| No Image  | Placeholder text "No image uploaded"       |
| Has Image | Image scaled to fit, centered, aspect-kept |

**Acceptance Criteria**:

- Original image displays immediately after upload
- Image is properly scaled and centered
- Placeholder shows when no image present

---

### Step 10: Add Loading State During Image Processing

**File**: `src/components/ImageUploader/ImageUploader.tsx`

**Goal**: Show loading indicator while image is being loaded.

**Tasks**:

- [ ] Track `isLoading` state
- [ ] Set loading true when file processing begins
- [ ] Set loading false when complete or on error
- [ ] Display loading spinner or text during load
- [ ] Disable drop zone interaction while loading

**Visual States**:

| State   | Display                          |
| ------- | -------------------------------- |
| Loading | Spinner + "Loading image..."     |
| Ready   | Normal drop zone or thumbnail    |

**Acceptance Criteria**:

- User sees feedback during file loading
- Cannot initiate new upload while loading
- Loading state clears on success or error

---

### Step 11: Write Unit Tests for Validation Utility

**File**: `src/core/validate-image-file.test.ts`

**Goal**: Ensure file validation works correctly for all edge cases.

**Test Cases**:

- [ ] Should accept valid PNG file
- [ ] Should accept valid JPG file
- [ ] Should accept valid JPEG file (mime type variation)
- [ ] Should reject GIF file with appropriate error
- [ ] Should reject WebP file with appropriate error
- [ ] Should reject file larger than 20MB
- [ ] Should reject file exactly at 20MB boundary (edge case decision)
- [ ] Should accept file just under 20MB

**Acceptance Criteria**:

- All test cases pass
- Tests cover happy path and error cases
- Tests are isolated and don't depend on each other

---

### Step 12: Write Unit Tests for Image Loader

**File**: `src/core/load-image.test.ts`

**Goal**: Test image loading functionality.

**Test Cases**:

- [ ] Should load PNG image and return OriginalImageMetadata
- [ ] Should load JPG image and return OriginalImageMetadata
- [ ] Should extract correct dimensions from image
- [ ] Should generate valid data URL
- [ ] Should reject with error for corrupted file

**Note**: May need to use mock File objects for testing.

**Acceptance Criteria**:

- Tests verify correct OriginalImageMetadata structure
- Error handling is tested
- Tests don't require real file system access

---

## File Summary

| File                                    | Action | Purpose                          |
| --------------------------------------- | ------ | -------------------------------- |
| `src/core/types.ts`                     | Modify | Add OriginalImageMetadata type   |
| `src/core/image/validate-image-file.ts`| Create | File validation utility          |
| `src/core/image/load-image.ts`         | Create | Image loading utility            |
| `src/core/image/scale-image.ts`        | Create | Scale image and extract ImageData |
| `src/components/ImageUploader/ImageUploader.tsx` | Modify | Full implementation     |
| `src/components/Preview/OriginalImage.tsx`       | Modify | Display original image  |
| `src/components/Preview/PreviewPanel.tsx`        | Modify | Panel wrapper with title |
| `src/App.tsx`                           | Modify | Lift state, wire components      |
| `src/core/image/validate-image-file.test.ts` | Create | Validation tests         |
| `src/core/image/load-image.test.ts`         | Create | Loader tests             |

---

## Dependencies Between Steps

```
Step 1 (Types)
    ↓
Step 2 (Validation) ──────────────────┐
    ↓                                 │
Step 3 (Image Loader) ────────────────┤
    ↓                                 │
Step 4 (Canvas Extraction)            │
                                      ↓
Step 5 (Drop Zone UI) ──→ Step 6 (Upload Flow)
                                      ↓
                          Step 7 (Thumbnail Preview)
                                      ↓
                          Step 8 (Lift State to App)
                                      ↓
                          Step 9 (Preview Display)
                                      ↓
                          Step 10 (Loading State)
                                      ↓
              Step 11 (Validation Tests) ←── Step 12 (Loader Tests)
```

---

## Success Criteria

- [ ] User can upload PNG/JPG images via drag-and-drop
- [ ] User can upload images via file picker (click to upload)
- [ ] Invalid files show clear error messages
- [ ] Files over 20MB are rejected with error
- [ ] Uploaded image thumbnail appears in uploader
- [ ] Original image appears in left preview canvas
- [ ] Image dimensions and size are displayed
- [ ] User can replace uploaded image
- [ ] Loading state shows during file processing
- [ ] All unit tests pass

---

_Created: December 10, 2025. Updated: February 2026 (scale-image, Preview/OriginalImage, 20MB, store flow)._
