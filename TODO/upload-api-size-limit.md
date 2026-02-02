# Add server-side file size limit to /api/upload-image

## Problem

The `/api/upload-image.js` endpoint accepts any base64 payload without checking its size. The client-side 5MB check in `HeaderImagePicker.tsx` and `BackgroundImagePicker.tsx` is easily bypassed. A large image could exhaust serverless function memory.

## Fix

Add a server-side size check on `imageBuffer.length` after decoding the base64 data in `api/upload-image.js`.

```js
const imageBuffer = Buffer.from(base64Data, 'base64');

// Reject images larger than 5MB
if (imageBuffer.length > 5 * 1024 * 1024) {
  return res.status(400).json({ error: 'Image too large. Maximum size is 5MB.' });
}
```

## Files

- `api/upload-image.js` — add size check after line 37 (`Buffer.from`)
