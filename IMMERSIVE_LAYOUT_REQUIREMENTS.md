# Immersive Layout Feature

## Overview

The Immersive Layout is a new style option under the Question-by-Question (Q by Q) layout that creates a split-screen experience with a contextual image panel, providing a more visually engaging form experience.

---

## Feature Summary

When users select the "Q by Q" layout in Creator Studio, they can choose between two styles:

| Style | Description |
|-------|-------------|
| **Classic** | Original centered card layout |
| **Immersive** | Split-screen with contextual image on the right |

---

## Implementation Details

### Files Created

| File | Purpose |
|------|---------|
| `src/components/layouts/ImmersiveQuestionLayout.tsx` | Main split-screen layout component |
| `src/components/creator/ContextualImagePicker.tsx` | Image picker for contextual images with crop shape selection |
| `src/components/creator/ImageCropDialog.tsx` | Modal dialog for adjusting crop area position and size |
| `src/utils/contextualImageGeneration.ts` | AI generation logic with brand-focused styles |
| `api/generate-contextual-image.js` | API endpoint for contextual image generation |

### Files Modified

| File | Changes |
|------|---------|
| `src/types/theme.ts` | Added `contextualImageUrl`, `contextualImageCrop`, `ContextualImageCropShape`, `ContextualImageCropSettings` |
| `src/types/form.ts` | Added `QbyQStyle` type (`'classic' \| 'immersive'`) |
| `src/components/creator/CreatorStudio.tsx` | Added style toggle, accordion animation, contextual image picker integration, crop settings handler, mobile preview prop |
| `src/components/layouts/index.ts` | Export `ImmersiveQuestionLayout` |
| `src/components/creator/index.ts` | Export `ContextualImagePicker`, `ImageCropDialog` |
| `src/utils/urlSharing.ts` | Added support for `contextualImageUrl`, `qbyqStyle`, and `contextualImageCrop` in URL encoding/decoding |
| `src/App.tsx` | Added routing logic for immersive layout |
| `src/components/creator/BackgroundImagePicker.tsx` | Renamed "Try Again" to "Generate image" |

---

## Layout Structure

### Desktop View (Split-Screen)

```
┌────────────────────────────────┬────────────────────────────────────────────┐
│                                │                                            │
│   Continuous background        │         Continuous background              │
│   (gradient/effect/image)      │         (same as left panel)               │
│                                │                                            │
│   ┌──────────────────────┐     │         ┌──────────────┐                   │
│   │                      │     │         │  Shape crop  │                   │
│   │   Question Card      │     │         │  (oval/      │                   │
│   │   + Answer Options   │     │         │   circle/    │                   │
│   │   + Navigation       │     │         │   blob)      │                   │
│   │                      │     │         └──────────────┘                   │
│   └──────────────────────┘     │                                            │
│                                │   Background flows continuously            │
│   Progress: Question 3/10      │   from left to right panel                 │
│                                │         Progress bar                       │
└────────────────────────────────┴────────────────────────────────────────────┘
        LEFT PANEL (50%)                      RIGHT PANEL (50%)
```

**Background Continuity**: The background (gradient, effects, or image) is rendered once at the outer container level, spanning both panels. This creates a seamless, continuous visual flow rather than two separate backgrounds.

### Mobile View (No Split-Screen)

- Progress bar at top
- Question card centered
- Background gradient/effect
- **No contextual image** (hidden on mobile for usability)
- Mobile preview in Creator Studio also hides contextual image via `isMobilePreview` prop

---

## Contextual Image Styles

Unlike background images which use abstract/artistic styles, contextual images use brand-focused styles:

| Style | Description | Use Case |
|-------|-------------|----------|
| **Brand / Hero** | Professional brand imagery with abstract elements, corporate feel | Company forms, professional surveys |
| **Topic Illustration** | Illustrative imagery related to the form subject matter | Job applications, feedback forms |
| **Lifestyle** | People-focused, aspirational imagery that evokes emotion | Customer surveys, engagement forms |

### AI Prompt Generation

The API endpoint (`/api/generate-contextual-image`) uses a two-step process:

1. **Text model (Gemini 2.5 Flash)** generates a detailed image prompt:
   - Analyzes form title and description to understand the domain/topic
   - Identifies visual concepts that represent the form's purpose
   - Incorporates theme hex colors (primary + secondary) prominently
   - Applies style guidance (brand-hero, topic-illustration, lifestyle) as visual treatment
   - The instruction focuses on creating a **hero image** that captures the form's purpose

2. **Image model (Gemini 2.5 Flash Image)** generates the actual image from the prompt

Each style generates different prompts:

- **Brand/Hero**: Premium corporate aesthetics, glass-morphism, geometric elements using brand colors
- **Topic Illustration**: Subject-relevant illustrations with brand color palette
- **Lifestyle**: Warm, human-centered imagery with brand color accents

---

## Image Cropping

### Crop Shapes

Users can optionally crop the contextual image into a shape, with the theme background showing behind the shape:

| Shape | Description | Clip Path | Layout Position |
|-------|-------------|-----------|-----------------|
| **None** | Full-bleed image (default) | — | Full panel |
| **Oval** | Ellipse crop | `ellipse(50% 40% at 50% 50%)` | Centered with 5% padding |
| **Circle** | Perfect round crop | `circle(45% at 50% 50%)` | Centered with 5% padding |
| **Blob** | Organic rounded shape | SVG path | Full panel |

### Crop Dialog (`ImageCropDialog`) — WYSIWYG

The crop dialog uses **identical CSS** as the layout for rendering, guaranteeing what-you-see-is-what-you-get:

When a user selects a crop shape:
1. A modal dialog opens showing a **WYSIWYG preview** of the shape with the image
2. The preview uses the same clip path, layout position, and CSS rendering as the final layout
3. User can **drag** on the preview to reposition the image focal point
4. User can **zoom** via a slider (1 = cover fit, up to 3 = zoomed in)
5. A "Drag to reposition" hint appears when not actively dragging
6. **Closing the dialog:**
   - Click the **X** button (top-right corner)
   - Click **Cancel** button
   - Click **outside the dialog** (backdrop)
   - Press **Escape** key
7. Click **Select** to apply the crop settings

### Shared Constants

Clip paths and layout positions are defined once in `ImageCropDialog.tsx` and exported for use by both the dialog and `ImmersiveQuestionLayout.tsx`:
- `SHAPE_CLIP_PATHS` — CSS clip-path values per shape
- `SHAPE_LAYOUT_POSITIONS` — Fixed inset positions per shape (top, left, right, bottom)

### Cropped Display in Layout

When a crop shape is applied:
- The theme background (gradient, effects, or image) flows continuously behind both panels
- The selected shape displays the image using CSS `clip-path`
- Image rendering uses `object-fit: cover` + `object-position` + `transform: scale()` — same as the dialog
- Shape position in the layout is fixed per shape type

---

## Creator Studio UX

### Style Selection Animation

When user selects "Q by Q" layout:
1. Style options (Classic/Immersive) unfold with **500ms accordion animation**
2. Uses `max-height` and `opacity` CSS transitions
3. Smooth, non-jarring experience

### Contextual Image Picker

Only visible when **Q by Q + Immersive** is selected:
- "Generate with AI" button with style selector
- Browse gallery tab
- Upload custom image tab
- Preview of current selection
- Editable AI-generated prompt with "Generate image" button
- **Image Shape** selector (None, Oval, Circle, Blob)
- "Adjust crop position" link to re-open the crop dialog

---

## Data Model

### ThemeConfig Additions

```typescript
type ContextualImageCropShape = 'none' | 'oval' | 'circle' | 'blob';

interface ContextualImageCropSettings {
  shape: ContextualImageCropShape;
  position: { x: number; y: number }; // CSS object-position percentage 0-100 (50,50 = center)
  scale: number;                       // Zoom level: 1 = cover (no zoom), up to 3 = zoomed in
}

interface ThemeConfig {
  // ... existing fields
  contextualImageUrl?: string;
  contextualImageCrop?: ContextualImageCropSettings;
}
```

### QbyQStyle Type

```typescript
type QbyQStyle = 'classic' | 'immersive';
```

### URL Sharing Format

```typescript
interface ShareableFormConfig {
  // ... existing fields
  qs?: 'c' | 'i';  // Q-by-Q style: 'c' = classic, 'i' = immersive
  t: {
    // ... existing theme fields
    ci?: string;   // Contextual image URL
    cc?: {         // Contextual image crop settings
      sh: ContextualImageCropShape;
      px: number;  // position x (%)
      py: number;  // position y (%)
      sc: number;  // scale
    };
  };
}
```

---

## API Endpoints

### `/api/generate-contextual-image`

**Method:** POST

**Request Body:**
```json
{
  "title": "Form Title",
  "description": "Form description",
  "colors": {
    "primary": "#4F46E5",
    "secondary": "#7C3AED",
    "surface": "#FFFFFF"
  },
  "styleContext": "...",
  "style": "brand-hero"
}
```

**Response:**
```json
{
  "imageUrl": "https://blob.vercel-storage.com/...",
  "generatedPrompt": "..."
}
```

The API instruction to the text model prioritizes form context:
- Form title and description are the **primary focus** for image generation
- The AI analyzes the form's domain/topic to create relevant visual concepts
- Theme hex colors are passed for prominent inclusion
- Style guidance is applied as secondary visual treatment
- The image is framed as a "hero image" that should be a major visual attraction

---

## Key Implementation Notes

1. **Height Fix**: Immersive layout uses `min-h-full h-full` in preview mode to fill the container
2. **PreviewContent Wrapper**: Added `h-full` class when displaying immersive layout
3. **Mobile Preview**: `isMobilePreview` prop hides contextual image in Creator Studio mobile preview (CSS breakpoints alone don't work since viewport is still desktop-sized)
4. **Fallback Panel**: When no contextual image is set, right panel shows a gradient based on theme colors
5. **Progress Bar**: Shown on both panels (left panel full progress, right panel minimal white bar)
6. **Responsive**: Uses `lg:` breakpoint for split-screen (hidden on mobile)
7. **Crop Rendering (WYSIWYG)**: Uses `object-fit: cover` + `object-position` + `transform: scale()` in both the crop dialog and the layout, ensuring what the user sees in the dialog matches the final output
8. **Shared Crop Constants**: `SHAPE_CLIP_PATHS` and `SHAPE_LAYOUT_POSITIONS` exported from `ImageCropDialog.tsx`, imported by `ImmersiveQuestionLayout.tsx` — single source of truth
9. **Continuous Background**: `BackgroundLayers` rendered at the outer container level (not inside each panel), so background effects flow seamlessly across both the left and right panels
10. **Reusable Panel**: `ContextualImagePanel` sub-component handles all right panel rendering (cropped, uncropped, with/without progress)
11. **Rename**: "Try Again" button renamed to "Generate image" in both BackgroundImagePicker and ContextualImagePicker

---

## Testing

All 88 existing tests pass. The feature doesn't break any existing functionality.

---

## Commits

1. **Initial Implementation** (`541f3f3`)
   - Created ImmersiveQuestionLayout component
   - Added Q-by-Q style toggle
   - Created ContextualImagePicker
   - Updated URL sharing

2. **Fixes and Improvements** (`d0a139a`)
   - Fixed 100% height issue in preview
   - Added separate contextual image styles (Brand/Hero, Topic, Lifestyle)
   - Created dedicated API endpoint for contextual images
   - Added 500ms accordion animation for style options

3. **Mobile Preview and UX Fixes** (`371c138`)
   - Hide contextual image in mobile preview mode via `isMobilePreview` prop
   - Renamed "Try Again" to "Generate image" in both image pickers
   - Added theme hex colors to contextual image prompts

4. **Form-Focused Hero Image Generation** (`915a6a6`)
   - Restructured API text model instruction to prioritize form content
   - Form title/description now primary subject for image generation
   - Style guidance applied as secondary visual treatment

5. **Contextual Image Cropping** (`3f95630`)
   - Added crop shapes: none, oval, hexagon, arch, blob
   - Created ImageCropDialog with draggable/resizable crop area
   - Shape selection UI in ContextualImagePicker
   - CSS clip-path rendering in ImmersiveQuestionLayout
   - Theme gradient background behind cropped shapes
   - Crop settings persisted in URL sharing

6. **Crop Dialog UX Fix** (`caf7d4f`)
   - Added X close button to crop dialog header
   - Click outside dialog to close
   - Escape key to close
   - Renamed CTA from "Apply Crop" to "Select"
   - Fixed dialog sizing to ensure buttons always visible (`max-h-[90vh]`, flex layout)

7. **Theme Background Behind Cropped Image** (`fc72280`)
   - Replaced hardcoded primary-to-secondary gradient with `BackgroundLayers` component
   - Right panel now shows matching background effects, gradient, or image behind cropped shapes

8. **Continuous Background Across Panels** (`bf53d3e`)
   - Moved `BackgroundLayers` from inside each panel to the outer flex container
   - Background effect/gradient/image now flows continuously across both left and right panels
   - Eliminates visible seam between panels

9. **Fix Crop Mismatch and Simplify Shapes** (`68a681e`)
   - Rewrote crop rendering to use identical CSS in both dialog and layout (`object-fit: cover` + `object-position` + `transform: scale()`) for WYSIWYG
   - Removed hexagon and arch shapes, added circle (perfect round)
   - Final shapes: None, Oval, Circle, Blob
   - Exported shared constants (`SHAPE_CLIP_PATHS`, `SHAPE_LAYOUT_POSITIONS`) from `ImageCropDialog`
   - Changed zoom slider from size (0.3–2) to zoom (1–3, where 1 = cover)
