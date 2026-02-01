# Phase 8: Extend Hatch Option

> **Status**: Implemented. Three hatching modes (Sketch, Cross, Grid) are available; cross uses 3-threshold, grid uses 5-level patterns.

> Reintroduce the simple 3-threshold hatch algorithm (Nothing → "/" → "X") and rename current "cross" mode to "grid".

---

## 📋 Overview

The current implementation has two hatching modes:
- **"sketch"**: Variable-density hatching with adjustable angle and density
- **"cross"**: Grid-based patterns with 5 brightness levels (empty, horizontal, grid, grid-diagonal, grid-cross)

This phase reintroduces a simpler 3-threshold hatch algorithm that was part of the original design:
- **Nothing** (empty) - for light areas
- **"/"** (single diagonal) - for medium-dark areas  
- **"X"** (cross) - for dark areas

Additionally, we'll rename the current "cross" mode to "grid" for clarity, and make the new simple algorithm the "cross" mode.

### Visual Pattern Examples

```
Empty (light):     Diagonal (medium):    Cross (dark):
┌─────────┐        ┌─────────┐          ┌─────────┐
│         │        │       ╱ │          │  ╲   ╱  │
│         │        │     ╱   │          │    ×    │
│         │        │   ╱     │          │  ╱   ╲  │
└─────────┘        └─────────┘          └─────────┘
   (no lines)         (1 line)            (2 lines)
```

---

## 🎯 Goals

1. Add new "cross" hatching mode with 3-threshold system (Nothing → "/" → "X")
2. Rename current "cross" mode to "grid" 
3. Support angle adjustment for the new "cross" mode (optional, via degrees)
4. Update all references throughout the codebase
5. Maintain backward compatibility where possible

---

## 🏗️ Current Architecture

### Current Hatching Modes

```typescript
type HatchingMode = "sketch" | "cross"

// In vectorize-image.ts:
if (settings.hatchingMode === "cross") {
  return generateLinePatterns({ brightnessGrid, threshold })
}
return generateAdvancedHatching({ brightnessGrid, hatchAngle, maxDensity, threshold })
```

### Current "cross" Mode Implementation

The current "cross" mode uses `generateLinePatterns()` which creates 5 patterns:
- `empty` (≥204 brightness)
- `horizontal` (153-203)
- `grid` (102-152) 
- `grid-diagonal` (51-101)
- `grid-cross` (0-50)

---

## 📦 Implementation Steps

Each step is isolated and can be implemented/tested independently.

---

### Step 8.1: Update Type Definitions

**Goal**: Extend `HatchingMode` type to include "grid" and ensure "cross" refers to the new simple algorithm.

**File**: `src/core/types.ts`

**Changes**:
```typescript
// Before:
export type HatchingMode = "sketch" | "cross"

// After:
export type HatchingMode = "sketch" | "cross" | "grid"
```

**Tasks**:
- [ ] Update `HatchingMode` type to include "grid"
- [ ] Verify all type references compile

**Acceptance Criteria**:
- TypeScript compiles without errors
- Type includes all three modes: "sketch", "cross", "grid"

---

### Step 8.2: Create Simple Cross Hatch Generator

**Goal**: Implement the new 3-threshold hatch algorithm (Nothing → "/" → "X").

**New File**: `src/core/hatching/generate-cross-hatch.ts`

**Input/Output**:
```typescript
type GenerateCrossHatchInput = {
  brightnessGrid: BrightnessGrid
  threshold: number
  angle?: number  // Optional: angle in degrees (default: 45)
}

type GenerateCrossHatchOutput = Polyline[]
```

**Algorithm**:
1. For each grid cell, determine brightness level
2. Apply threshold adjustment
3. Map to one of three patterns:
   - **Light** (brightness ≥ threshold + offset): `empty` - no lines
   - **Medium** (threshold - offset ≤ brightness < threshold + offset): `diagonal` - single diagonal line "/"
   - **Dark** (brightness < threshold - offset): `cross` - two diagonal lines forming "X"
4. Generate polylines for each pattern
5. If angle is provided, rotate lines accordingly

**Pattern Mapping**:
```typescript
const determineCrossPattern = (brightness: number, threshold: number): "empty" | "diagonal" | "cross" => {
  const offset = 85  // Creates three roughly equal ranges: ~85, ~85, ~85
  // With threshold=128: empty (≥213), diagonal (43-212), cross (<43)
  const adjustedBrightness = applyThreshold(brightness, threshold)
  
  if (adjustedBrightness >= threshold + offset) return "empty"
  if (adjustedBrightness >= threshold - offset) return "diagonal"
  return "cross"
}

// Reuse existing applyThreshold from generate-line-patterns.ts:
// const applyThreshold = (brightness: number, threshold: number): number => {
//   const adjustment = (threshold - 128) / 2
//   return Math.max(0, Math.min(255, brightness + adjustment))
// }
```

**Pattern Generation Details**:
- **Diagonal "/"**: Line from bottom-left to top-right: `(x, y+size) → (x+size, y)`
- **Cross "X"**: Two diagonals: "/" + "\" (from top-left to bottom-right: `(x, y) → (x+size, y+size)`)
- **Angle rotation**: If angle is provided, rotate both endpoints around cell center using rotation matrix:
  ```typescript
  const rotatePoint = (x: number, y: number, centerX: number, centerY: number, angleDeg: number): Point => {
    const angleRad = (angleDeg * Math.PI) / 180
    const cos = Math.cos(angleRad)
    const sin = Math.sin(angleRad)
    const dx = x - centerX
    const dy = y - centerY
    return {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos,
    }
  }
  ```

**Tasks**:
- [ ] Create `generateCrossHatch` function
- [ ] Import `applyThreshold` from `generate-line-patterns.ts` or copy the implementation
- [ ] Implement brightness-to-pattern mapping with 3 thresholds (offset = 85)
- [ ] Generate diagonal line "/" for medium darkness: `(x, y+size) → (x+size, y)`
- [ ] Generate cross "X" pattern for dark areas: both "/" and "\" diagonals
- [ ] Support optional angle parameter for line rotation (rotate around cell center)
- [ ] Handle edge cases (all white, all black, uniform gray, threshold boundaries)
- [ ] Ensure all generated points are within cell boundaries

**Implementation Structure** (top-down):
```typescript
export const generateCrossHatch = (params: GenerateCrossHatchInput): Polyline[] => {
  const { brightnessGrid, threshold, angle = 45 } = params
  const polylines: Polyline[] = []

  for (let row = 0; row < brightnessGrid.rows; row++) {
    for (let col = 0; col < brightnessGrid.cols; col++) {
      const brightness = brightnessGrid.values[row][col]
      const pattern = determineCrossPattern(brightness, threshold)
      const cellPolylines = generateCrossCellPolylines({
        pattern,
        row,
        col,
        cellSize: brightnessGrid.cellSize,
        angle,
      })
      polylines.push(...cellPolylines)
    }
  }

  return polylines
}
```

**Acceptance Criteria**:
- Light cells generate no lines
- Medium cells generate single diagonal line
- Dark cells generate cross pattern (two diagonals)
- Angle parameter rotates lines correctly (if implemented)
- All generated points are within cell boundaries

---

### Step 8.3: Write Tests for Cross Hatch Generator

**File**: `src/core/hatching/generate-cross-hatch.test.ts`

**Test Cases**:
- [ ] Should generate no lines for bright cells (brightness ≥ threshold + 85)
- [ ] Should generate single diagonal line for medium brightness (threshold - 85 ≤ brightness < threshold + 85)
- [ ] Should generate cross pattern (2 lines) for dark cells (brightness < threshold - 85)
- [ ] Should position lines correctly within cells (endpoints at cell corners/edges)
- [ ] Should respect cell size for line length (diagonal length = √(size² + size²))
- [ ] Should handle threshold parameter variations (test with threshold=64, 128, 192)
- [ ] Should handle edge cells correctly (cells at image boundaries)
- [ ] Should generate correct number of polylines per pattern (0, 1, or 2)
- [ ] Should work with angle parameter (test 0°, 45°, 90°, 135°)
- [ ] Should handle boundary cases (brightness exactly at threshold ± offset)
- [ ] Should handle all-white image (all cells empty)
- [ ] Should handle all-black image (all cells cross)
- [ ] Should handle uniform gray image (all cells same pattern)

**Acceptance Criteria**:
- All tests pass
- Pattern selection logic verified
- Coordinate calculations verified
- Edge cases covered

---

### Step 8.4: Update Vectorize Image Pipeline

**Goal**: Integrate new "cross" mode and rename current "cross" to "grid" in the main vectorization flow.

**File**: `src/core/vectorize-image.ts`

**Current Code**:
```typescript
const generateHatching = (brightnessGrid: BrightnessGrid, settings: ProcessingConfig): Polyline[] => {
  if (settings.hatchingMode === "cross") {
    return generateLinePatterns({
      brightnessGrid,
      threshold: settings.threshold,
    })
  }

  return generateAdvancedHatching({
    brightnessGrid,
    hatchAngle: settings.hatchAngle,
    maxDensity: settings.hatchDensity,
    threshold: settings.threshold,
  })
}
```

**Updated Code**:
```typescript
const generateHatching = (brightnessGrid: BrightnessGrid, settings: ProcessingConfig): Polyline[] => {
  if (settings.hatchingMode === "cross") {
    return generateCrossHatch({
      brightnessGrid,
      threshold: settings.threshold,
      angle: settings.hatchAngle,  // Optional: allow angle adjustment
    })
  }

  if (settings.hatchingMode === "grid") {
    return generateLinePatterns({
      brightnessGrid,
      threshold: settings.threshold,
    })
  }

  return generateAdvancedHatching({
    brightnessGrid,
    hatchAngle: settings.hatchAngle,
    maxDensity: settings.hatchDensity,
    threshold: settings.threshold,
  })
}
```

**Tasks**:
- [ ] Import `generateCrossHatch` from `./hatching/generate-cross-hatch.ts`
- [ ] Add condition for "cross" mode to use new generator (first check)
- [ ] Rename existing "cross" condition to "grid" (second check)
- [ ] Pass appropriate parameters to each generator
- [ ] Ensure "sketch" mode still uses `generateAdvancedHatching` (default/fallback)
- [ ] Add error handling for invalid mode (TypeScript should catch, but runtime safety check)

**Import Statement**:
```typescript
import { generateCrossHatch } from "./hatching/generate-cross-hatch.ts"
```

**Acceptance Criteria**:
- All three modes work correctly
- No breaking changes to existing functionality
- Settings are correctly propagated

---

### Step 8.5: Update Store Default Settings and Add Migration

**Goal**: Update default hatching mode and add migration logic for existing users with saved "cross" mode.

**Files**: 
- `src/store/default-settings.ts`
- `src/store/store.ts` (for migration logic)

**Current Code** (`default-settings.ts`):
```typescript
hatchingMode: "sketch",
```

**Considerations**:
- Keep default as "sketch" (no breaking change)
- Add migration logic to convert old "cross" mode to "grid" mode
- Migration should run once when store initializes with legacy data

**Migration Implementation** (`store.ts`):
```typescript
// In createStore function, before returning the store:
const migrateLegacyHatchingMode = (settings: ProcessingConfig): ProcessingConfig => {
  // If settings have old "cross" mode, migrate to "grid"
  // This handles cases where user has saved settings with old mode name
  if (settings.hatchingMode === "cross" && !isNewMode) {
    // Check if this is legacy "cross" (5-pattern grid) vs new "cross" (3-threshold)
    // Since we can't distinguish, we assume old "cross" → "grid"
    return { ...settings, hatchingMode: "grid" }
  }
  return settings
}

// Apply migration when loading settings (if loading from localStorage/backend)
```

**Tasks**:
- [ ] Keep default as "sketch" (recommended)
- [ ] Add migration function in `store.ts` (optional - only if loading persisted settings)
- [ ] Verify default settings compile with new type
- [ ] Test migration with legacy settings (if applicable)

**Acceptance Criteria**:
- Default settings are valid
- All modes are accessible
- Migration works (if implemented)

---

### Step 8.6: Update Mode Selector Component

**Goal**: Update UI to show three modes: "Sketch", "Cross", "Grid" and rename labels appropriately.

**File**: `src/components/ControlPanel/ModeSelector.tsx`

**Current Code**:
```typescript
const label = mode === "sketch" ? "Sketch" : "Cross"
```

**Updated Code**:
```typescript
const getLabel = (mode: HatchingMode): string => {
  if (mode === "sketch") return "Sketch"
  if (mode === "cross") return "Cross"
  return "Grid"
}
```

**Tasks**:
- [ ] Update button labels to handle three modes
- [ ] Add third button for "grid" mode
- [ ] Update tooltip text if needed
- [ ] Ensure all modes are visually distinct

**Acceptance Criteria**:
- Three mode buttons display correctly
- Labels are clear and descriptive
- Clicking buttons updates mode correctly

---

### Step 8.7: Update Control Panel

**Goal**: Show appropriate controls for each hatching mode, including optional angle control for "cross" mode.

**File**: `src/components/ControlPanel/ControlPanel.tsx`

**Current Code**:
```typescript
{settings.hatchingMode === "sketch" && (
  <>
    <SliderControl label="Angle" ... />
    <SliderControl label="Density" ... />
  </>
)}
```

**Updated Code**:
```typescript
{settings.hatchingMode === "sketch" && (
  <>
    <SliderControl label="Angle" ... />
    <SliderControl label="Density" ... />
  </>
)}

{settings.hatchingMode === "cross" && (
  <SliderControl
    label="Angle"
    tooltip="Direction of diagonal lines in degrees. 45° is standard, 0° is horizontal."
    value={settings.hatchAngle}
    min={0}
    max={180}
    step={15}
    unit="°"
    onChange={(value) => updateSettings({ hatchAngle: value })}
    disabled={!settings.enableHatching}
  />
)}
```

**Tasks**:
- [ ] Add conditional controls for "cross" mode
- [ ] Show angle slider for "cross" mode (optional feature)
- [ ] Update tooltips to reflect mode differences
- [ ] Ensure "grid" mode shows only threshold control

**Acceptance Criteria**:
- Controls are shown/hidden based on selected mode
- Tooltips accurately describe each mode
- All settings are accessible

---

### Step 8.8: Update Tests

**Goal**: Update existing tests to reflect mode name changes and add tests for new "cross" mode.

**Files to Update** (use `grep -r "cross" src/ --include="*.test.ts"` to find all):
- `src/core/vectorize-image.test.ts` - Update mode references, add "cross" mode tests
- `src/core/hatching/generate-line-patterns.test.ts` - May reference "cross" mode in comments
- Any other test files that import or reference hatching modes

**Specific Updates Needed**:

1. **`vectorize-image.test.ts`**:
   - Update `createSettings()` helper if it has hardcoded mode
   - Add test: `"should use cross mode for 3-threshold hatching"`
   - Add test: `"should use grid mode for 5-level grid patterns"`
   - Update any tests that explicitly set `hatchingMode: "cross"` to use `"grid"` instead

2. **Search for all "cross" references**:
   ```bash
   grep -r "cross" src/ --include="*.ts" --include="*.tsx"
   ```

**Tasks**:
- [ ] Search codebase for all "cross" mode references: `grep -r '"cross"' src/`
- [ ] Update test cases that use `hatchingMode: "cross"` to use `"grid"` instead
- [ ] Add test cases for new "cross" mode in `vectorize-image.test.ts`
- [ ] Add test: verify "cross" mode generates 3-threshold patterns
- [ ] Add test: verify "grid" mode generates 5-level patterns
- [ ] Verify all tests pass: `npm test` or equivalent
- [ ] Add integration test: mode switching works in UI (if UI tests exist)

**Acceptance Criteria**:
- All existing tests pass (with updated mode names)
- New "cross" mode is tested with specific test cases
- "grid" mode is verified to work (same as old "cross")
- No test failures

---

### Step 8.9: Update Documentation/Comments

**Goal**: Update any documentation, comments, or tooltips that reference the old "cross" mode.

**Files to Check**:
- Component tooltips
- Code comments
- README or other docs (if any)

**Tasks**:
- [ ] Update tooltip in `ControlPanel.tsx` for ModeSelector
- [ ] Update any code comments referencing modes
- [ ] Verify tooltips are accurate

**Acceptance Criteria**:
- All documentation is accurate
- Tooltips reflect current behavior

---

## 📊 Settings Summary

### Updated Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `hatchingMode` | `"sketch" \| "cross" \| "grid"` | `"sketch"` | Hatching algorithm mode |
| `threshold` | `number` | `128` | Brightness threshold (used by all modes) |
| `hatchAngle` | `number` | `45` | Line angle in degrees (used by "sketch" and optionally "cross") |
| `hatchDensity` | `number` | `4` | Max lines per cell (used by "sketch" only) |

### Mode Behavior

| Mode | Algorithm | Patterns | Angle Support | Density Support |
|------|-----------|----------|---------------|-----------------|
| `sketch` | Variable-density hatching | Continuous lines with variable spacing | ✅ Yes | ✅ Yes |
| `cross` | 3-threshold hatch | Nothing → "/" → "X" | ✅ Optional | ❌ No |
| `grid` | 5-level grid patterns | empty → horizontal → grid → grid-diagonal → grid-cross | ❌ No | ❌ No |

---

## 🔄 Migration Path

### For Existing Users

1. **Existing "cross" mode users**: Their settings will automatically use "grid" mode (same behavior)
2. **New default**: Remains "sketch" (no breaking change)
3. **New "cross" mode**: Available as a new option

### Backward Compatibility

**Problem**: Existing saved settings may have `hatchingMode: "cross"` which previously meant the 5-level grid patterns. Now "cross" means the 3-threshold algorithm.

**Solution Options**:

1. **Migration on Load** (Recommended if using localStorage/persisted state):
   ```typescript
   // In store.ts, when loading persisted settings
   const migrateSettings = (settings: ProcessingConfig): ProcessingConfig => {
     // If we detect legacy "cross" mode, migrate to "grid"
     // Note: This assumes old "cross" → new "grid"
     // New "cross" mode will be selected explicitly by user
     if (settings.hatchingMode === "cross") {
       // Check if this is from before the change (e.g., check version or timestamp)
       // For simplicity, migrate all "cross" to "grid" on first load after update
       return { ...settings, hatchingMode: "grid" }
     }
     return settings
   }
   ```

2. **Version-based Migration** (More robust):
   ```typescript
   // Add version field to settings or store metadata
   const STORE_VERSION = 2  // Increment when breaking changes occur
   if (loadedVersion < STORE_VERSION && settings.hatchingMode === "cross") {
     settings.hatchingMode = "grid"
   }
   ```

3. **No Migration** (If not using persisted state):
   - Default settings always use "sketch"
   - Users will need to manually select their preferred mode
   - No breaking changes for fresh installs

**Recommendation**: 
- If the app persists settings (localStorage, backend), implement option 1 or 2
- If settings are not persisted, no migration needed (default is "sketch")

---

## 🧪 Testing Strategy

### Unit Tests
- Test each hatching mode generator independently
- Test pattern selection logic
- Test edge cases (all white, all black, uniform gray)

### Integration Tests
- Test mode switching in UI
- Test that settings persist correctly
- Test that vectorization works with all three modes

### Visual Testing
- Compare output of all three modes on same image
- Verify "cross" mode produces expected 3-level pattern
- Verify "grid" mode produces expected 5-level pattern

---

## 📅 Suggested Implementation Order

| Order | Step | Est. Complexity | Dependencies |
|-------|------|-----------------|--------------|
| 1 | 8.1 | Low | None |
| 2 | 8.2 | Medium | 8.1 |
| 3 | 8.3 | Low | 8.2 |
| 4 | 8.4 | Low | 8.2, 8.3 |
| 5 | 8.5 | Low | 8.1 |
| 6 | 8.6 | Low | 8.1 |
| 7 | 8.7 | Low | 8.6 |
| 8 | 8.8 | Medium | 8.4 |
| 9 | 8.9 | Low | All above |

**Rationale**:
- Start with types (8.1) - foundation for everything
- Implement core algorithm (8.2, 8.3) - test in isolation
- Integrate into pipeline (8.4) - connect to existing code
- Update UI (8.5-8.7) - make it accessible
- Update tests (8.8) - ensure everything works
- Polish docs (8.9) - final touches

---

## 🎨 UI/UX Considerations

### Mode Selector Layout

The `ModeSelector` component currently shows 2 buttons. With 3 modes, consider:
- Keep 2-button layout and add third button
- Or: Use dropdown/select for better scalability
- Current approach (buttons) is fine for 3 options

### Tooltip Updates

Update tooltip in `ControlPanel.tsx`:
```typescript
tooltip="Sketch: Variable-density angled lines. Cross: Simple 3-level pattern (nothing → diagonal → cross). Grid: 5-level grid patterns optimized for pen plotters."
```

---

## 🔗 Related Files

### Files to Modify

**Core Files**:
- `src/core/types.ts` - Update `HatchingMode` type
- `src/core/vectorize-image.ts` - Update `generateHatching` function
- `src/core/hatching/generate-line-patterns.ts` - No changes (used by "grid" mode)
- `src/core/hatching/generate-advanced-hatching.ts` - No changes (used by "sketch" mode)
- `src/core/hatching/generate-cross-hatch.ts` - **NEW FILE** - "cross" mode implementation
- `src/core/hatching/generate-cross-hatch.test.ts` - **NEW FILE** - Tests for "cross" mode

**UI Files**:
- `src/components/ControlPanel/ModeSelector.tsx` - Add third button, update labels
- `src/components/ControlPanel/ControlPanel.tsx` - Add conditional controls for "cross" mode

**Store Files**:
- `src/store/store.ts` - Add migration logic (optional, if loading persisted settings)
- `src/store/default-settings.ts` - Verify default mode (no change needed)

**Test Files**:
- `src/core/vectorize-image.test.ts` - Update mode references, add "cross" tests
- Any other test files found via: `grep -r "cross" src/ --include="*.test.ts"`

### Files to Search/Review

Use these commands to find all references:
```bash
# Find all "cross" mode references
grep -r '"cross"' src/ --include="*.ts" --include="*.tsx"

# Find all HatchingMode type usages
grep -r "HatchingMode" src/ --include="*.ts" --include="*.tsx"

# Find all hatchingMode property usages
grep -r "hatchingMode" src/ --include="*.ts" --include="*.tsx"
```

---

## ✅ Success Criteria

### Functional Requirements
- [ ] Three hatching modes are available: "sketch", "cross", "grid"
- [ ] New "cross" mode generates 3-threshold patterns (Nothing → "/" → "X")
- [ ] Old "cross" mode is renamed to "grid" and works identically (5-level patterns)
- [ ] Mode selector shows all three options with clear labels ("Sketch", "Cross", "Grid")
- [ ] Controls are shown/hidden appropriately for each mode
- [ ] Angle adjustment works for "cross" mode (rotates diagonal lines)
- [ ] All generated polylines are valid (points within image bounds)

### Code Quality
- [ ] TypeScript compiles without errors
- [ ] All tests pass (unit + integration)
- [ ] No linter errors
- [ ] Code follows project conventions (see `.cursor/rules/common.mdc`)

### User Experience
- [ ] No breaking changes for existing users (with migration if needed)
- [ ] Default mode remains "sketch" (no behavior change)
- [ ] Tooltips accurately describe each mode
- [ ] Mode switching works smoothly in UI

### Testing
- [ ] Unit tests for `generateCrossHatch` cover all patterns
- [ ] Integration tests verify all three modes work in pipeline
- [ ] Edge cases tested (all white, all black, boundaries)
- [ ] Visual verification: compare outputs of all three modes on same image

---

## 📝 Notes

### Optional Enhancements (Future)

1. **Configurable Thresholds**: Allow users to adjust the three threshold boundaries for "cross" mode
2. **Pattern Variations**: Support different diagonal directions (e.g., "\" vs "/")
3. **Blending**: Allow mixing modes (e.g., "cross" for dark areas, "sketch" for medium)
4. **Visual Preview**: Show pattern previews in mode selector

### Design Decisions

1. **Angle Support**: Making angle optional for "cross" mode allows flexibility while keeping it simple. Default 45° provides standard diagonal hatching.

2. **Default Mode**: Keeping "sketch" as default maintains current behavior and avoids breaking changes.

3. **Migration**: One-time migration ensures backward compatibility for users with saved settings.

4. **Threshold Offset (85)**: Creates three roughly equal brightness ranges:
   - With threshold=128: empty (≥213), diagonal (43-212), cross (<43)
   - This provides clear visual distinction between patterns
   - Could be made configurable in future, but 85 works well for most images

5. **Pattern Direction**: 
   - Diagonal "/" goes from bottom-left to top-right (standard)
   - Cross "X" uses both "/" and "\" for maximum coverage
   - Angle rotation allows customization while maintaining pattern structure

6. **Error Handling**: TypeScript union types prevent invalid modes at compile time. Runtime checks are optional but recommended for robustness:
   ```typescript
   if (!["sketch", "cross", "grid"].includes(settings.hatchingMode)) {
     console.warn(`Invalid hatching mode: ${settings.hatchingMode}, defaulting to "sketch"`)
     settings.hatchingMode = "sketch"
   }
   ```

---

## ⚠️ Common Pitfalls & Troubleshooting

### Pitfall 1: Forgetting to Update Type
**Symptom**: TypeScript errors about `HatchingMode` not including "grid"
**Solution**: Ensure Step 8.1 is completed before other steps

### Pitfall 2: Wrong Mode Routing
**Symptom**: "cross" mode produces 5-level patterns instead of 3-threshold
**Solution**: Check order of conditions in `generateHatching` - "cross" must come before "grid"

### Pitfall 3: Missing Import
**Symptom**: `generateCrossHatch is not defined`
**Solution**: Add import: `import { generateCrossHatch } from "./hatching/generate-cross-hatch.ts"`

### Pitfall 4: Test Failures After Rename
**Symptom**: Tests fail because they expect "cross" to be 5-level patterns
**Solution**: Update all test cases to use "grid" for 5-level patterns, "cross" for 3-threshold

### Pitfall 5: UI Shows Wrong Number of Buttons
**Symptom**: Only 2 buttons shown instead of 3
**Solution**: Update `ModeSelector.tsx` to render third button for "grid" mode

### Pitfall 6: Angle Not Working
**Symptom**: Angle slider doesn't affect "cross" mode output
**Solution**: Verify angle parameter is passed to `generateCrossHatch` and rotation math is correct

---

## 📋 Quick Reference Checklist

Before starting implementation, verify you have:
- [ ] Read this entire spec document
- [ ] Understand the three modes: sketch, cross (new), grid (renamed)
- [ ] Know which files need modification (see "Related Files" section)
- [ ] Have access to run tests: `npm test` or equivalent

During implementation:
- [ ] Follow steps in order (8.1 → 8.2 → ... → 8.9)
- [ ] Run tests after each step
- [ ] Use grep to find all "cross" references before making changes
- [ ] Test all three modes visually after Step 8.4

Before considering complete:
- [ ] All TypeScript compiles without errors
- [ ] All tests pass
- [ ] All three modes work in UI
- [ ] Visual comparison shows correct patterns for each mode
- [ ] No console errors or warnings

---

## 🔍 Verification Commands

Use these commands to verify implementation:

```bash
# Check TypeScript compilation
npm run type-check  # or: tsc --noEmit

# Run all tests
npm test

# Find all "cross" references (should show updated code)
grep -r '"cross"' src/ --include="*.ts" --include="*.tsx"

# Find all hatchingMode usages
grep -r "hatchingMode" src/ --include="*.ts" --include="*.tsx"

# Verify new file exists
ls src/core/hatching/generate-cross-hatch.ts
ls src/core/hatching/generate-cross-hatch.test.ts
```

---

_Last Updated: January 26, 2026_
