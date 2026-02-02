# Restrict CORS on /api/upload-image

## Problem

`api/upload-image.js` sets `Access-Control-Allow-Origin: '*'`, meaning any website can POST images to this endpoint. This also applies to `api/generate-image.js`. Both endpoints should restrict access to the app's own origin or add rate limiting.

## Fix

Replace the wildcard CORS header with the app's actual origin. In Vercel, the deployment URL can be used:

```js
const allowedOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:5173';

res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
```

Alternatively, add rate limiting via Vercel's edge middleware or a simple in-memory counter per IP.

## Files

- `api/upload-image.js` — line 6, replace `'*'` with restricted origin
- `api/generate-image.js` — line 6, same change for consistency
