# Material Design 3 (M3) Conversion - Checkpoint

**Branch:** `feature/material-design-3`
**Last Updated:** January 25, 2026
**Status:** In Progress

---

## Overview

This document tracks the progress of converting the Modern Forms UI to Material Design 3 (Google's GM3 design system). The goal is to create a consistent, modern UI that follows M3 guidelines for typography, color, shape, motion, and components.

---

## Completed Tasks

### 1. M3 Design System Foundation (src/index.css)

Added comprehensive M3 CSS design system including:

- **Shape System:** Corner radii tokens (none, extra-small 4px, small 8px, medium 12px, large 16px, extra-large 28px, full)
- **Elevation System:** 5 levels of box shadows matching M3 specs
- **Motion Tokens:** Duration values (short1-4, medium1-4, long1-2) and easing curves (standard, emphasized, decelerate, accelerate)
- **State Layers:** Hover (8%), focus (12%), pressed (12%) opacity values
- **Component Classes:**
  - `.md-filled-button` - M3 Filled button with state layers
  - `.md-outlined-button` - M3 Outlined button
  - `.md-tonal-button` - M3 Filled tonal button
  - `.md-text-button` - M3 Text button
  - `.md-fab` / `.md-fab-small` - Floating action buttons
  - `.md-card-elevated` / `.md-card-outlined` / `.md-card-filled` - Card variants
  - `.md-chip` - Input/filter chip
  - `.md-segmented-button-container` / `.md-segmented-button` - Segmented buttons
  - `.md-list-item` - List item with ripple states
  - `.md-select` - Outlined select wrapper
- **Utility Classes:**
  - Shape utilities: `.shape-small`, `.shape-medium`, `.shape-large`, etc.
  - Elevation utilities: `.elevation-1` through `.elevation-5`
  - Typography utilities: `.text-display-lg`, `.text-headline-md`, `.text-title-sm`, `.text-body-md`, `.text-label-lg`, etc.
- **Animations:**
  - `.shimmer-line` - For loading states
  - `.shimmer-overlay` - For regeneration overlays

### 2. Tailwind Configuration (tailwind.config.js)

Updated Tailwind with M3 design tokens:

- **Colors:**
  - `primary` - Purple/Violet palette (matching Lavender Dreams theme)
  - `secondary` - Neutral purple palette
  - `tertiary` - Pink/rose palette
  - `error` - Red palette
  - `surface` - Surface colors with container variants (lowest, low, default, high, highest)
  - `outline` - Border colors with variant
  - `on` - On-color text colors (on-primary, on-secondary, on-surface, etc.)
- **Typography:** Full M3 typography scale (display, headline, title, body, label - each with lg/md/sm)
- **Box Shadows:** Elevation levels 0-5
- **Border Radius:** M3 shape scale
- **Transition Timing:** M3 motion curves and durations
- **Touch Targets:** min-height/min-width of 48px for accessibility

### 3. BackgroundImagePicker Component (src/components/creator/BackgroundImagePicker.tsx)

Fully converted to M3 styling:

- **Section Header:** Uses `text-title-sm` typography
- **Remove Button:** Uses `md-text-button` with error color
- **Current Image Preview:** M3 card with `shape-medium` and outline variant border
- **Generate with AI Button:** Uses `md-tonal-button` with primary-100 background
- **Style Selector:** M3 outlined select with proper focus states
- **Error Display:** M3 error container with appropriate colors
- **Shimmer Animation:** Custom `PromptShimmer` component for AI generation loading
- **Editable Prompt:** M3 card-outlined with textarea using M3 input styling
- **Try Again Button:** Uses `md-filled-button` with secondary color
- **Recent Generated Images:** M3 list items with selection states
- **Tab Buttons:** M3 segmented button container
- **Image Gallery:** Grid with M3 shape and selection states
- **Upload Area:** M3 dashed border with hover states
- **FAB for Delete:** Uses `md-fab-small`

---

## Remaining Tasks

### High Priority - Core Layout Components

#### 1. CreatorStudio.tsx
**Location:** `src/components/creator/CreatorStudio.tsx`
**Current State:** Uses custom Tailwind classes, not M3
**Conversion Needed:**
- Header bar → M3 surface with elevation
- Back button → `md-text-button` or `md-outlined-button`
- Create & Copy Link button → `md-filled-button`
- Sidebar → M3 surface container
- Layout toggle buttons → `md-segmented-button-container`
- Preview toggle (Desktop/Mobile) → `md-segmented-button-container`
- Preview frame styling
- Section headings → M3 typography

#### 2. StandardLayout.tsx
**Location:** `src/components/layouts/StandardLayout.tsx`
**Conversion Needed:**
- Form container → M3 card styling
- Submit button → `md-filled-button`
- Background handling
- Spacing and typography

#### 3. QuestionByQuestionLayout.tsx
**Location:** `src/components/layouts/QuestionByQuestionLayout.tsx`
**Conversion Needed:**
- Question cards → M3 elevated or filled cards
- Navigation buttons → M3 buttons (Next, Previous, Submit)
- Progress indicator
- Slide transitions using M3 motion tokens

### Medium Priority - Creator Panel Components

#### 4. ThemeSelector.tsx
**Location:** `src/components/creator/ThemeSelector.tsx`
**Conversion Needed:**
- Section header → M3 typography
- Theme cards → M3 card-outlined with selection state
- Selected indicator → M3 primary color with checkmark

#### 5. ColorCustomizer.tsx
**Location:** `src/components/creator/ColorCustomizer.tsx`
**Conversion Needed:**
- Section header → M3 typography
- Color picker buttons → M3 styling
- Labels → M3 label typography

#### 6. BackgroundEffectPicker.tsx
**Location:** `src/components/creator/BackgroundEffectPicker.tsx`
**Conversion Needed:**
- Section header → M3 typography
- Effect option buttons → M3 segmented buttons or chips
- Preview indicators
- Disabled state styling

### Lower Priority - Question Components

All question components need M3 conversion:

| Component | File | Key Elements to Convert |
|-----------|------|------------------------|
| ShortAnswer | `src/components/questions/ShortAnswer.tsx` | Text input → M3 outlined text field |
| Paragraph | `src/components/questions/Paragraph.tsx` | Textarea → M3 outlined text field (multiline) |
| MultipleChoice | `src/components/questions/MultipleChoice.tsx` | Radio buttons → M3 radio selection |
| Checkboxes | `src/components/questions/Checkboxes.tsx` | Checkboxes → M3 checkbox |
| Dropdown | `src/components/questions/Dropdown.tsx` | Select → M3 outlined select menu |
| LinearScale | `src/components/questions/LinearScale.tsx` | Scale buttons → M3 segmented or chips |
| DateInput | `src/components/questions/DateInput.tsx` | Date picker → M3 date picker styling |
| TimeInput | `src/components/questions/TimeInput.tsx` | Time picker → M3 time picker styling |

### Other Components

| Component | File | Priority |
|-----------|------|----------|
| FormUrlInput | `src/components/creator/FormUrlInput.tsx` | Medium |
| FormShare | `src/components/creator/FormShare.tsx` | Low |
| FormConfigurator | `src/components/creator/FormConfigurator.tsx` | Low |
| BackgroundEffectRenderer | `src/components/common/BackgroundEffectRenderer.tsx` | Low (visual only) |

---

## M3 Design Tokens Reference

### Colors (from tailwind.config.js)
```
Primary: #6750A4 (with 50-900 scale)
Secondary: #625B71 (with 50-900 scale)
Tertiary: #7D5260 (with 50-900 scale)
Error: #B3261E (with 50-900 scale)
Surface: #FFFBFE
On-Surface: #1C1B1F
Outline: #79747E
Outline-Variant: #CAC4D0
```

### Typography Scale
```
Display: Large (57px), Medium (45px), Small (36px)
Headline: Large (32px), Medium (28px), Small (24px)
Title: Large (22px), Medium (16px), Small (14px)
Body: Large (16px), Medium (14px), Small (12px)
Label: Large (14px), Medium (12px), Small (11px)
```

### Shape (Border Radius)
```
Extra Small: 4px
Small: 8px
Medium: 12px
Large: 16px
Extra Large: 28px
Full: 9999px
```

### Elevation (Box Shadows)
```
Level 1: Subtle shadow for cards, menus
Level 2: Raised cards, FABs at rest
Level 3: Navigation drawers, modals
Level 4: Floating elements
Level 5: Dialogs, popovers
```

### Motion
```
Duration Short: 50ms, 100ms, 150ms, 200ms
Duration Medium: 250ms, 300ms, 350ms, 400ms
Duration Long: 450ms, 500ms
Easing Standard: cubic-bezier(0.2, 0, 0, 1)
Easing Emphasized: cubic-bezier(0.2, 0, 0, 1)
```

---

## How to Continue

1. **Start with CreatorStudio.tsx** - This is the main shell and will establish patterns for other components
2. **Then do layouts** (StandardLayout, QuestionByQuestionLayout) - These affect the form display
3. **Then creator panel components** (ThemeSelector, ColorCustomizer, BackgroundEffectPicker)
4. **Finally question components** - These are more isolated and can be done incrementally

### Conversion Pattern

For each component:
1. Replace button classes with `md-filled-button`, `md-outlined-button`, `md-tonal-button`, or `md-text-button`
2. Replace card/container classes with `md-card-elevated`, `md-card-outlined`, or `md-card-filled`
3. Replace typography classes with M3 equivalents (`text-title-sm`, `text-body-md`, `text-label-lg`, etc.)
4. Replace custom colors with M3 color tokens (`primary`, `secondary`, `surface`, `on-surface`, etc.)
5. Replace border-radius with shape utilities (`shape-small`, `shape-medium`, etc.)
6. Add proper focus and hover states using M3 state layer patterns
7. Update transitions to use M3 motion tokens

---

## Testing

After completing M3 conversion, test:
- [ ] All buttons have proper hover/focus/active states
- [ ] Cards have correct elevation and shape
- [ ] Typography is consistent across components
- [ ] Colors are accessible (contrast ratios)
- [ ] Touch targets are at least 48x48px
- [ ] Animations feel smooth and intentional
- [ ] Mobile responsiveness is maintained
- [ ] Theme switching still works correctly

---

## Preview Deployment

Current preview: https://modern-forms-6vvhk88dr-navneetjha23-3517s-projects.vercel.app

To deploy new preview after changes:
```bash
git add .
git commit -m "Continue M3 conversion: [component name]"
git push
# Vercel will auto-deploy preview
```
