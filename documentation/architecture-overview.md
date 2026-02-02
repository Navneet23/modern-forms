# Modern Forms — Architecture Overview

## Project Structure

```
src/
  types/          — TypeScript type definitions
  utils/          — Shared utilities (parsing, URL sharing, image search, AI generation)
  data/           — Static data (theme presets)
  components/
    creator/      — Creator Studio UI (sidebar pickers, preview)
    layouts/      — Form layout renderers (Standard, Question by Question)
    questions/    — Question type renderers
    common/       — Shared components (BackgroundEffectRenderer)
api/              — Vercel serverless API routes
todo/             — Tracked improvement items
documentation/    — This folder
```

## Core Data Flow

1. User pastes a Google Form URL
2. `formParser.ts` fetches and parses the form HTML into a `ParsedForm`
3. `CreatorStudio` renders the sidebar (theme pickers) and preview area
4. Theme state (`ThemeConfig`) flows from CreatorStudio down to the layout components
5. "Create & Copy Link" encodes form URL + theme + layout into a compressed URL via `urlSharing.ts`
6. Shared links decode the config and render the themed form directly

## Key Types

### `ThemeConfig` (`src/types/theme.ts`)

Central theme object containing:
- `colors: ThemeColors` — 9 color slots (primary, secondary, background, surface, text, textSecondary, border, error, success)
- `borderRadius` — none/sm/md/lg/xl/full
- `fontFamily` — Google Fonts string
- `headerImageUrl?` — header image source
- `headerStyle?` — `'banner'` | `'integrated'` | `'half-card'`
- `headerImageShape?` — `'cloud'` | `'circle'` (for integrated style)
- `headerImageCrop?` — `{ x, y, scale }` focal point + zoom
- `backgroundImageUrl?` — background image source
- `backgroundEffect?` — `'solid'` | `'textured'` | `'shapes'` | `'gradient'`

### `LayoutMode` (`src/types/form.ts`)

`'standard'` | `'question-by-question'`

### `ShareableFormConfig` (`src/utils/urlSharing.ts`)

Compressed representation of form + theme for URL sharing. Uses short keys (`p`, `s`, `bg`, etc.) and lz-string compression.

## Layouts

### Standard Layout (`StandardLayout.tsx`)
- Single scrollable page with all questions
- Header image: banner (full-width) or integrated (shaped — cloud/circle)
- Responsive: narrow (stacked) and wide (side-by-side header) breakpoints

### Question by Question Layout (`QuestionByQuestionLayout.tsx`)
- 4 view states: welcome → questions → review → success
- Welcome screen supports 3 header styles:
  - **Banner** — full-width strip (max 30vh) at top, centered content below
  - **Circle** — split layout: text left, circle-clipped image right (desktop); circle on top (mobile)
  - **Half Card** — split layout: text left, full-height rectangular image right (desktop); image hidden on mobile
- Questions show one at a time with slide animations
- Auto-advance on single-select questions
- Mobile detection via `previewMode` prop (creator studio) or `window.innerWidth` (shared page)

## Image System

### Sources
1. **Picsum Gallery** — curated image IDs in `HEADER_GALLERY` and `BACKGROUND_GALLERY` (`src/utils/imageSearch.ts`). No API key needed.
2. **File Upload** — uploads to Vercel Blob via `api/upload-image.js`, falls back to base64 data URL
3. **AI Generation** — Google Gemini 2.5 Flash via `api/generate-image.js`, supports 6 styles (abstract, professional, artistic, animated, watercolor, cyberpunk)

### Crop System
- `HeaderImageCrop { x, y, scale }` — focal point (0-100 percentages) + zoom (1-3x)
- `getIntegratedImageStyle()` computes absolute positioning to fill a shaped container while respecting the crop point
- `HeaderCropDialog` provides interactive drag + zoom with shape-aware clip-path preview
- Supports circle, cloud (polygon), and rectangle (inset) clip paths

### Header Shape Clip Paths
Exported from `HeaderImagePicker.tsx` as `HEADER_SHAPE_CLIP_PATHS`:
- `circle`: `circle(45% at 50% 50%)`
- `cloud`: complex polygon with ~75 points

## Creator Studio

### Sidebar Pickers (left panel)
Order from top to bottom:
1. Layout toggle (Standard / Q by Q)
2. Theme selector (preset themes)
3. Background image picker (gallery + AI generation + upload)
4. Color customizer (9 color slots)
5. Background effect picker (solid/textured/shapes/gradient)
6. Title font picker (sans-serif, serif, display, handwritten families)
7. Header image picker (gallery + upload, layout-aware style controls)

### Preview (right panel)
- Desktop and mobile toggle
- Mobile preview renders in a 375x700px container with phone frame styling
- `previewMode` prop is passed through to layouts so they can make layout decisions independent of CSS viewport breakpoints

## URL Sharing (`src/utils/urlSharing.ts`)

- Encodes: Google Form URL + layout mode + full theme config
- Compression: JSON → lz-string → URL-safe string in `?d=` parameter
- Base64 data URLs (uploaded images) are excluded from shared links (too large)
- 7-day expiry check on decode
- Short keys minimize JSON size before compression

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GOOGLE_AI_STUDIO_KEY` | Gemini API for AI image generation |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage (implicit from Vercel) |

## Development Notes

### Preview Mobile vs Real Mobile
The creator studio mobile preview is a 375px container inside a desktop viewport. Tailwind `md:` breakpoints check viewport width, not container width, so they don't work for the preview. The solution is passing `previewMode` as a prop and using JS conditional rendering (`isMobile ? ... : ...`) instead of CSS breakpoints for layout-critical decisions.

### Image Crop Math
The `getIntegratedImageStyle` function uses a "coverage scale" algorithm: it computes the minimum scale factor needed so the image completely fills the container regardless of how off-center the crop point is. This is duplicated in StandardLayout and QuestionByQuestionLayout (tracked in TODO for extraction).
