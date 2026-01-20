# Modern Forms - Theme System Requirements

## Overview

This document captures the requirements for the theme system enhancement to Modern Forms. The goal is to provide users with professional, customizable themes and a streamlined creator experience.

---

## Creator UI Layout

### Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  Modern Forms                                    [Create & Copy]│
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  LEFT        │   PREVIEW AREA                                   │
│  SIDEBAR     │                                                  │
│              │   ┌─────────────────────────────────────────┐   │
│ ┌──────────┐ │   │                                         │   │
│ │ Themes   │ │   │     Desktop OR Mobile Preview           │   │
│ │ (grid)   │ │   │     (one at a time, based on toggle)    │   │
│ └──────────┘ │   │                                         │   │
│              │   │     Fully interactive                   │   │
│ [Generate    │ │   │     (scrollable, clickable)            │   │
│  Theme]      │   │                                         │   │
│              │   └─────────────────────────────────────────┘   │
│ ┌──────────┐ │                                                  │
│ │ Colors   │ │   [Desktop] [Mobile] ← Toggle (one active)      │
│ │ (tweaks) │ │                                                  │
│ └──────────┘ │                                                  │
│              │                                                  │
│ Layout:      │                                                  │
│ ○ Standard   │                                                  │
│ ○ Q-by-Q     │                                                  │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Key UI Elements

| Element | Location | Description |
|---------|----------|-------------|
| Theme Grid | Left sidebar | Visual grid of 10 theme previews, click to apply |
| Generate Theme Button | Left sidebar | Fetches relevant image from Unsplash/Pexels |
| Color Customization | Left sidebar | Sliders/pickers to tweak colors after theme selection |
| Layout Toggle | Left sidebar | Radio buttons: Standard / Question-by-Question |
| Preview Toggle | Below preview | Buttons: Desktop / Mobile (one active at a time) |
| Preview Area | Center/right | Shows form with selected theme, fully interactive |
| Create & Copy | Top right | Generates shareable link and copies to clipboard |

---

## Pre-built Themes (10 Total)

| # | Theme Name | Description | Primary Colors |
|---|------------|-------------|----------------|
| 1 | Clean Slate | Minimal white/gray | White, light gray, dark text |
| 2 | Midnight | Dark mode, deep blues | Dark navy, blue accents, white text |
| 3 | Ocean Breeze | Soft teals and blues | Teal, sky blue, white |
| 4 | Sunset Glow | Warm oranges and pinks | Coral, orange, warm yellow |
| 5 | Forest | Earthy greens and browns | Forest green, tan, cream |
| 6 | Lavender Dreams | Soft purples | Lavender, violet, soft pink |
| 7 | Corporate | Professional blues and grays | Navy, steel blue, white |
| 8 | Bold & Bright | High contrast, vibrant | Bright blue, yellow, white |
| 9 | Monochrome | Black, white, grays only | Black, white, gray shades |
| 10 | Coral Reef | Coral with teal accents | Coral, teal, sand |

### Theme Properties

Each theme includes:
- `primaryColor` - Main accent color (buttons, links)
- `secondaryColor` - Secondary accent
- `backgroundColor` - Page background
- `surfaceColor` - Card/form background
- `textColor` - Primary text color
- `textSecondaryColor` - Secondary/muted text
- `borderRadius` - Card corner rounding (e.g., 8px, 16px, 24px)
- `fontFamily` - Typography style
- `headerImageUrl` - Optional banner image

---

## Generate Theme Feature

### Behavior
1. User clicks "Generate Theme"
2. System extracts keywords from form title and description
3. System searches Unsplash/Pexels API for relevant images
4. System auto-applies the first relevant result
5. System extracts dominant colors from image to create matching palette

### Image Search Logic
- Primary search: Form title keywords
- Fallback search: Form description keywords
- Generic fallback: "abstract professional background"

### Error Handling
- If no relevant images found: Show message "No relevant images found. Try again or select a preset theme."
- If API fails: Fall back to gradient-only background

### API Choice
- **Unsplash API** (primary) - Free tier: 50 requests/hour
- **Pexels API** (backup) - Free tier: 200 requests/hour

---

## Color Customization

### Editable Properties
After selecting a theme (preset or generated), users can tweak:
- Primary color (color picker)
- Background color (color picker)
- Text color (color picker)
- Surface/card color (color picker)

### UI Component
- Color swatches showing current colors
- Click to open color picker
- Live preview updates as colors change

---

## Layout Options

### Two Layout Modes
1. **Standard Layout** - All questions on single scrollable page
2. **Question-by-Question** - One question per screen with navigation

### Theme Per Layout
- Each layout can have a **different theme**
- Theme selection in sidebar applies to currently selected layout
- Switching layout shows that layout's theme

---

## Preview System

### Toggle Behavior
- Two buttons: [Desktop] [Mobile]
- One active at a time (not both)
- Clicking toggles the view

### Desktop Preview
- Full-width preview area
- Shows form as it would appear on desktop

### Mobile Preview
- Phone-sized frame (375px width)
- Centered in preview area
- Shows form as it would appear on mobile

### Interactivity
- Both previews are **fully interactive**
- User can scroll through the form
- User can click inputs, select options
- Live updates when theme/colors change

---

## Create & Copy Link

### Behavior
1. User clicks "Create & Copy" button
2. System saves form configuration to localStorage:
   - Parsed form data
   - Theme settings for Standard layout
   - Theme settings for Q-by-Q layout
   - Header image URL (if generated)
3. System generates unique shareable URL
4. System copies URL to clipboard
5. System shows success toast/notification

### URL Format
```
https://[domain]/?f=[unique-id]
```

### Saved Configuration
```typescript
interface FormConfig {
  formId: string;
  parsedForm: ParsedForm;
  standardTheme: ThemeConfig;
  questionByQuestionTheme: ThemeConfig;
  createdAt: number;
}
```

---

## Technical Implementation Notes

### New Files to Create
- `src/types/theme.ts` - Theme type definitions
- `src/data/themes.ts` - 10 pre-built theme configurations
- `src/utils/unsplash.ts` - Unsplash API integration
- `src/utils/colorExtractor.ts` - Extract colors from images
- `src/components/creator/CreatorStudio.tsx` - Main creator UI
- `src/components/creator/ThemeSelector.tsx` - Theme grid
- `src/components/creator/ColorCustomizer.tsx` - Color pickers
- `src/components/creator/PreviewFrame.tsx` - Interactive preview

### Files to Modify
- `src/App.tsx` - Update flow to use new CreatorStudio
- `src/components/layouts/StandardLayout.tsx` - Accept theme prop
- `src/components/layouts/QuestionByQuestionLayout.tsx` - Accept theme prop
- `src/types/form.ts` - Update FormConfig type
- `src/utils/storage.ts` - Update storage functions

### Dependencies to Add
- Color picker library (e.g., `react-colorful` - lightweight)

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Number of themes | 10 | Good variety without overwhelming |
| Image API | Unsplash/Pexels | Free, no API key for basic use |
| Generate Theme behavior | Auto-apply first result | Simpler UX, can re-evaluate |
| Color customization | Yes, after theme selection | Flexibility for users |
| Image search fallback | Show "try again" message | Clear feedback to user |
| Preview interactivity | Fully interactive | Better UX for testing |
| Preview toggle | One at a time | Cleaner UI, more preview space |
| Theme per layout | Different themes allowed | More customization |
| Link generation | On "Create & Copy" click | Explicit user action |

---

## Out of Scope (for this iteration)

- Theme import/export
- Custom font uploads
- Animation customization
- Saving multiple form configurations
- User accounts
- Theme sharing between users

---

*Document Version: 1.0*
*Created: January 2026*
