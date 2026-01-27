# Immersive Layout Requirements

## Overview

Add a new "Immersive" style option under the Question-by-Question (Q by Q) layout. This creates a split-screen experience with a contextual image panel, providing a more visually engaging form experience.

---

## Layout Structure

### Q by Q Layout Options

When user selects "Q by Q" layout, show two style options:

| Style | Description |
|-------|-------------|
| **Classic** | Current centered card layout (existing behavior) |
| **Immersive** | Split-screen layout with contextual image |

---

## Immersive Layout - Desktop View

```
┌────────────────────────────────┬────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│                                            │
│░░░░░░░░ (background gradient) ░│                                            │
│░░                            ░░│    ┌────────────────────────────────────┐  │
│░░  ┌──────────────────────┐  ░░│    │                                    │  │
│░░  │                      │  ░░│    │                                    │  │
│░░  │  What is your        │  ░░│    │                                    │  │
│░░  │  preferred work      │  ░░│    │        CONTEXTUAL IMAGE            │  │
│░░  │  environment?        │  ░░│    │                                    │  │
│░░  │                      │  ░░│    │       (AI-generated or             │  │
│░░  │  ○ Remote            │  ░░│    │        curated visual)             │  │
│░░  │  ○ Office            │  ░░│    │                                    │  │
│░░  │  ○ Hybrid            │  ░░│    │                                    │  │
│░░  │  ○ No preference     │  ░░│    │                                    │  │
│░░  │                      │  ░░│    │                                    │  │
│░░  │  ┌──────┐ ┌────────┐ │  ░░│    │                                    │  │
│░░  │  │ Back │ │ Next → │ │  ░░│    └────────────────────────────────────┘  │
│░░  │  └──────┘ └────────┘ │  ░░│                                            │
│░░  └──────────────────────┘  ░░│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│░░                            ░░│    Progress bar                            │
│░░  ━━━━━━━━  Question 3/10   ░░│                                            │
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│                                            │
└────────────────────────────────┴────────────────────────────────────────────┘
        LEFT PANEL (50%)                      RIGHT PANEL (50%)
```

### Left Panel (50% width)
- Background: Gradient or background effect (from theme)
- Content: Question card with:
  - Question text
  - Answer options
  - Navigation buttons (Back / Next)
- Footer: Progress bar + question count (e.g., "Question 3/10")

### Right Panel (50% width)
- Full-bleed contextual image
- Image covers entire panel height
- Progress bar at bottom

---

## Immersive Layout - Mobile View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Progress bar (30%)                                    Question 3 of 10     │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░                                                                      ░░ │
│  ░░  ┌─────────────────────────────────────────────────────────────────┐ ░░ │
│  ░░  │                                                                 │ ░░ │
│  ░░  │  What is your preferred work environment?                       │ ░░ │
│  ░░  │                                                                 │ ░░ │
│  ░░  │  ○ Remote / Work from home                                      │ ░░ │
│  ░░  │  ○ Office / In-person                                           │ ░░ │
│  ░░  │  ○ Hybrid                                                       │ ░░ │
│  ░░  │  ○ No preference                                                │ ░░ │
│  ░░  │                                                                 │ ░░ │
│  ░░  │  ┌─────────────┐           ┌─────────────┐                      │ ░░ │
│  ░░  │  │   ← Back    │           │   Next →    │                      │ ░░ │
│  ░░  │  └─────────────┘           └─────────────┘                      │ ░░ │
│  ░░  └─────────────────────────────────────────────────────────────────┘ ░░ │
│  ░░                                                                      ░░ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────────────────────────────────────────────┘
                        (No contextual image on mobile)
```

### Mobile Behavior
- **No contextual image** - only shown on desktop
- Progress bar fixed at top with question count
- Question card centered with gradient/effect background
- Same experience as Classic layout on mobile

---

## Creator Studio UI Changes

### Layout Selector

```
┌───────────────────────────────────────────────────────────────────────┐
│  Layout                                                               │
│  ┌───────────────────────────┐  ┌───────────────────────────────┐     │
│  │        Standard           │  │           Q by Q              │     │
│  └───────────────────────────┘  └───────────────────────────────┘     │
│                                              │                        │
│                                              ▼                        │
│                                 ┌─────────────────────────────┐       │
│                                 │  Style                      │       │
│                                 │  ┌─────────┐  ┌───────────┐ │       │
│                                 │  │ Classic │  │ Immersive │ │       │
│                                 │  └─────────┘  └───────────┘ │       │
│                                 └─────────────────────────────┘       │
└───────────────────────────────────────────────────────────────────────┘
```

- Style sub-options only appear when "Q by Q" is selected
- Default style: Classic

### Contextual Image Picker

```
┌───────────────────────────────────────────────────────────────────────┐
│  Contextual Image                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ [Current contextual image preview]                    [Remove]  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ ✨ Generate with AI                                             │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐                                    │
│  │    Browse    │ │    Upload    │                                    │
│  └──────────────┘ └──────────────┘                                    │
│  [Gallery grid / Upload dropzone based on active tab]                 │
└───────────────────────────────────────────────────────────────────────┘
```

- **Only visible when**: Q by Q layout + Immersive style is selected
- **Features** (same as Background Image Picker):
  - Generate with AI button
  - Browse tab: Gallery of curated images
  - Upload tab: Drag & drop or click to upload
  - Preview of current selection
  - Remove button

---

## Data Model Changes

### Theme Config

Add new field to `ThemeConfig`:

```typescript
interface ThemeConfig {
  // ... existing fields
  contextualImageUrl?: string;  // NEW: URL for immersive layout contextual image
}
```

### Layout Mode

Update `LayoutMode` type or add sub-type:

```typescript
type LayoutMode = 'standard' | 'question-by-question';

type QbyQStyle = 'classic' | 'immersive';  // NEW
```

### URL Sharing

Update `ShareableFormConfig` to include:

```typescript
interface ShareableFormConfig {
  // ... existing fields
  t: {
    // ... existing theme fields
    ci?: string;  // NEW: contextual image URL
  };
  qs?: 'c' | 'i';  // NEW: Q-by-Q style (classic/immersive)
}
```

---

## Implementation Checklist

### Phase 1: Core Layout
- [ ] Create `ImmersiveQuestionLayout.tsx` component
- [ ] Implement desktop split-screen view
- [ ] Implement mobile fallback (no contextual image)
- [ ] Add progress bar to both panels
- [ ] Add slide animations between questions

### Phase 2: Creator Studio UI
- [ ] Add Q-by-Q style toggle (Classic / Immersive)
- [ ] Create `ContextualImagePicker.tsx` component
- [ ] Show/hide contextual image picker based on layout selection
- [ ] Integrate AI image generation for contextual images

### Phase 3: Data & Sharing
- [ ] Update `ThemeConfig` type with `contextualImageUrl`
- [ ] Update URL encoding/decoding for contextual image
- [ ] Update URL encoding/decoding for Q-by-Q style
- [ ] Handle Vercel Blob upload for AI-generated contextual images

### Phase 4: Polish
- [ ] Add smooth transitions between Classic and Immersive preview
- [ ] Ensure proper responsive breakpoints
- [ ] Test all question types in immersive layout
- [ ] Update tests for new layout option

---

## Notes

- Contextual image is **desktop-only** to maintain mobile usability
- Reuse existing `BackgroundImagePicker` logic for contextual image picker
- AI generation for contextual images uses same API as background images
- Consider adding subtle parallax or fade effects to contextual image on scroll
