# Q by Q Header Image Follow-ups

Issues identified during PR #12 review.

## 1. Make `isMobile` reactive on shared form pages

**File:** `src/components/layouts/QuestionByQuestionLayout.tsx:283`

Currently `isMobile` is computed once at render time via `window.innerWidth < 768` when `previewMode` is not provided (i.e. on the actual shared form page, not the creator studio). If a user resizes their browser, the layout won't update.

**Fix:** Add a `useEffect` + `resize` event listener that tracks viewport width and updates an `isMobile` state variable. The `previewMode` prop path (creator studio) is already correct and doesn't need changes.

```ts
const [isMobile, setIsMobile] = useState(() =>
  previewMode ? previewMode === 'mobile' : window.innerWidth < 768
);
useEffect(() => {
  if (previewMode) return; // creator studio controls this via prop
  const onResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, [previewMode]);
```

## 2. Extract shared `getIntegratedImageStyle` helper

**Files:**
- `src/components/layouts/QuestionByQuestionLayout.tsx:57-82`
- `src/components/layouts/StandardLayout.tsx:151-180`

The `getIntegratedImageStyle` function and `headerImgAspect` state+effect are duplicated across both layout components. If the crop math changes, both need updating independently.

**Fix:** Extract to a shared utility:

- Create `src/utils/headerImageStyles.ts`
- Export `getIntegratedImageStyle(crop, imgAspect): React.CSSProperties`
- Export a `useHeaderImageAspect(imageUrl): number` hook for the aspect ratio tracking
- Update both `StandardLayout` and `QuestionByQuestionLayout` to use the shared code
