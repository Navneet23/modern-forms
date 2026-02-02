# Abort blob upload on component unmount

## Problem

In `HeaderImagePicker.tsx` and `BackgroundImagePicker.tsx`, if the user navigates away while a blob upload is in-flight, the async callback will attempt to call `onImageChange` / `setIsUploading` on an unmounted component. This can cause React state-update-on-unmounted warnings.

## Fix

Use an `AbortController` to cancel the fetch on unmount, and check a mounted ref before calling state setters.

Example for `HeaderImagePicker.tsx`:

```tsx
const abortRef = useRef<AbortController | null>(null);

useEffect(() => {
  return () => {
    abortRef.current?.abort();
  };
}, []);

// In handleFileUpload:
abortRef.current = new AbortController();
const response = await fetch('/api/upload-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: base64Url }),
  signal: abortRef.current.signal,
});
```

## Files

- `src/components/creator/HeaderImagePicker.tsx` — `handleFileUpload` function
- `src/components/creator/BackgroundImagePicker.tsx` — `handleFileUpload` function
