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
| `src/components/creator/ContextualImagePicker.tsx` | Image picker for contextual images |
| `src/utils/contextualImageGeneration.ts` | AI generation logic with brand-focused styles |
| `api/generate-contextual-image.js` | API endpoint for contextual image generation |

### Files Modified

| File | Changes |
|------|---------|
| `src/types/theme.ts` | Added `contextualImageUrl` field to `ThemeConfig` |
| `src/types/form.ts` | Added `QbyQStyle` type (`'classic' \| 'immersive'`) |
| `src/components/creator/CreatorStudio.tsx` | Added style toggle, accordion animation, contextual image picker integration |
| `src/components/layouts/index.ts` | Export `ImmersiveQuestionLayout` |
| `src/components/creator/index.ts` | Export `ContextualImagePicker` |
| `src/utils/urlSharing.ts` | Added support for `contextualImageUrl` and `qbyqStyle` in URL encoding/decoding |
| `src/App.tsx` | Added routing logic for immersive layout |

---

## Layout Structure

### Desktop View (Split-Screen)

```
┌────────────────────────────────┬────────────────────────────────────────────┐
│                                │                                            │
│   Background gradient/image    │         Contextual Image                   │
│                                │         (full-bleed)                       │
│   ┌──────────────────────┐     │                                            │
│   │                      │     │                                            │
│   │   Question Card      │     │                                            │
│   │   + Answer Options   │     │                                            │
│   │   + Navigation       │     │                                            │
│   │                      │     │                                            │
│   └──────────────────────┘     │                                            │
│                                │                                            │
│   Progress: Question 3/10      │         Progress bar                       │
│                                │                                            │
└────────────────────────────────┴────────────────────────────────────────────┘
        LEFT PANEL (50%)                      RIGHT PANEL (50%)
```

### Mobile View (No Split-Screen)

- Progress bar at top
- Question card centered
- Background gradient/effect
- **No contextual image** (hidden on mobile for usability)

---

## Contextual Image Styles

Unlike background images which use abstract/artistic styles, contextual images use brand-focused styles:

| Style | Description | Use Case |
|-------|-------------|----------|
| **Brand / Hero** | Professional brand imagery with abstract elements, corporate feel | Company forms, professional surveys |
| **Topic Illustration** | Illustrative imagery related to the form subject matter | Job applications, feedback forms |
| **Lifestyle** | People-focused, aspirational imagery that evokes emotion | Customer surveys, engagement forms |

### AI Prompt Generation

Each style generates different prompts:

- **Brand/Hero**: Focuses on premium corporate aesthetics, glass-morphism, geometric elements
- **Topic Illustration**: Creates subject-relevant illustrations (e.g., office for job forms)
- **Lifestyle**: Generates warm, human-centered imagery with silhouettes and gestures

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
- Editable AI-generated prompt with "Try Again" option

---

## Data Model

### ThemeConfig Addition

```typescript
interface ThemeConfig {
  // ... existing fields
  contextualImageUrl?: string;  // URL for immersive layout contextual image
}
```

### New Type

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
  "styleContext": "...",  // Generated prompt context
  "style": "brand-hero"   // brand-hero | topic-illustration | lifestyle
}
```

**Response:**
```json
{
  "imageUrl": "https://blob.vercel-storage.com/...",
  "generatedPrompt": "..."
}
```

---

## Key Implementation Notes

1. **Height Fix**: Immersive layout uses `min-h-full h-full` in preview mode to fill the container
2. **PreviewContent Wrapper**: Added `h-full` class when displaying immersive layout
3. **Fallback Panel**: When no contextual image is set, right panel shows a gradient based on theme colors
4. **Progress Bar**: Shown on both panels (left panel full progress, right panel minimal white bar)
5. **Responsive**: Uses `lg:` breakpoint for split-screen (hidden on mobile)

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
