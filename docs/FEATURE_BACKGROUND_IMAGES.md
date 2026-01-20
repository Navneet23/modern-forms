# Feature: Background Images

## Overview
Enhance the theme experience by adding support for background images that appear behind form cards, with proper accessibility and customization options.

## Requirements

### 1. Background Image Placement
- Background image appears **behind form cards** (full page background)
- Form cards maintain solid `surface` color for readability (a11y)
- Background does NOT cover or overlay the form cards
- Works identically for both Standard and Question-by-Question layouts

### 2. Background Image Treatment (Readability)
- **No overlay or blur**: Raw background image for vibrant visuals
- Form cards maintain solid `surface` color for content readability
- Background image uses `background-size: cover` for proper scaling

```css
/* Implementation approach */
.background-image-container {
  background-image: url(...);
  background-size: cover;
  background-position: center;
}
/* Form cards provide contrast */
.form-card {
  background-color: var(--surface-color);
}
```

### 3. User Customization Options
Users should be able to:
- **Browse images**: See curated gallery of background options
- **Upload their own**: Upload custom background image
- **Remove background**: Option to use solid color only (no image)

### 4. Preset Themes with Backgrounds
Add 4 new preset themes that include background images:
1. **Mountain Vista** - Nature/mountain landscape
2. **City Lights** - Urban nighttime cityscape
3. **Ocean Waves** - Beach/ocean scene
4. **Abstract Gradient** - Colorful abstract pattern

Total themes: 10 (existing) + 4 (new with backgrounds) = 14

### 5. Mobile Behavior
- Same background image behavior on mobile as desktop
- Background image scales appropriately (`background-size: cover`)
- Blur and overlay effects remain consistent

## Technical Implementation

### Files to Modify

1. **`src/types/theme.ts`**
   - Already has `backgroundImageUrl?: string` - no changes needed

2. **`src/data/themes.ts`**
   - Add 4 new preset themes with `backgroundImageUrl`

3. **`src/components/layouts/StandardLayout.tsx`**
   - Render background image with overlay + blur
   - Ensure cards have solid `surface` background

4. **`src/components/layouts/QuestionByQuestionLayout.tsx`**
   - Same background implementation as StandardLayout

5. **`src/components/creator/CreatorStudio.tsx`**
   - Add background image customization UI in sidebar

6. **`src/components/creator/BackgroundImagePicker.tsx`** (NEW)
   - Search functionality
   - Browse gallery
   - Upload option
   - Remove/clear option

7. **`src/utils/imageSearch.ts`**
   - Add function to search background images by keyword
   - Add curated gallery of background image IDs

### UI Mockup - Creator Studio Sidebar

```
┌─────────────────────────┐
│ Layout                  │
│ [Standard] [Q by Q]     │
├─────────────────────────┤
│ Themes                  │
│ ┌─────┐ ┌─────┐        │
│ │     │ │     │ ...    │
│ └─────┘ └─────┘        │
├─────────────────────────┤
│ Background Image        │  ← NEW SECTION
│ ┌─────────────────────┐ │
│ │  [Current image     │ │
│ │   preview]          │ │
│ └─────────────────────┘ │
│ [Search] [Browse] [Upload] │
│ [✕ Remove Background]  │
├─────────────────────────┤
│ Generate Theme          │
│ [✨ Generate Theme]     │
├─────────────────────────┤
│ Customize Colors        │
│ • Primary    [██] #xxx │
│ • Secondary  [██] #xxx │
│ ...                     │
└─────────────────────────┘
```

### Background Image Rendering

```tsx
// Pseudo-code for layout background
<div className="min-h-screen relative">
  {/* Background Layer */}
  {theme.backgroundImageUrl && (
    <>
      {/* Blurred image */}
      <div
        className="fixed inset-0 bg-cover bg-center blur-sm"
        style={{ backgroundImage: `url(${theme.backgroundImageUrl})` }}
      />
      {/* Color overlay */}
      <div
        className="fixed inset-0"
        style={{ backgroundColor: `${theme.colors.background}B3` }} // B3 = 70% opacity
      />
    </>
  )}

  {/* Content Layer */}
  <div className="relative z-10">
    {/* Form cards with solid surface background */}
    <div style={{ backgroundColor: theme.colors.surface }}>
      ...
    </div>
  </div>
</div>
```

## Acceptance Criteria

- [x] Background images render behind form cards in Standard layout
- [x] Background images render behind form cards in Q-by-Q layout
- [x] Form cards have solid background (not transparent)
- [x] 4 new preset themes with background images added
- [x] Users can browse curated background gallery
- [x] Users can upload custom background image
- [x] Users can remove background image (solid color only)
- [x] Background works consistently on mobile and desktop
- [x] Preview in Creator Studio shows background correctly
