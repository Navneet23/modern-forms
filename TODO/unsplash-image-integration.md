# Unsplash Image Integration

Add Unsplash as a browsable image source for both Header Image and Background Image pickers.

## Prerequisites

- Register an app at https://unsplash.com/developers
- Store `UNSPLASH_ACCESS_KEY` in `.env.local`
- Free tier: 50 requests/hour (demo), 5000/hour (production approval)

## API Endpoint

### `api/unsplash-search.js`

Server-side proxy to keep the API key secret (never expose it client-side).

- `GET /api/unsplash-search?query=nature&page=1&per_page=12`
- Calls `https://api.unsplash.com/search/photos` with `Authorization: Client-ID <key>`
- Returns `{ results: [{ id, urls: { small, regular, full }, user: { name, links } }], total_pages }`
- Fallback: return empty results if key is missing (graceful degradation)

## Utility

### `src/utils/unsplashSearch.ts`

- `searchUnsplash(query: string, page?: number): Promise<UnsplashResult>`
- `triggerUnsplashDownload(downloadUrl: string)`: POST to Unsplash download endpoint (required by their API guidelines to track downloads)
- Types: `UnsplashPhoto`, `UnsplashResult`

## UI Changes

### `src/components/creator/HeaderImagePicker.tsx`

- Add a "Search" tab/toggle alongside the existing gallery grid
- Search input with debounced query (300ms)
- Results grid matching existing gallery grid style (3 columns)
- "Load more" button for pagination
- Attribution line under each image: "Photo by {name} on Unsplash"
- On select: use `urls.regular` (1080px wide) for the header image

### `src/components/creator/BackgroundImagePicker.tsx`

- Same search UI added to the gallery section
- On select: use `urls.full` for background images (higher resolution needed)

## Attribution Requirements (Unsplash ToS)

- Display "Photo by [Author Name] on Unsplash" when showing search results
- Link author name to their Unsplash profile
- Link "Unsplash" to unsplash.com
- Call the download tracking endpoint when a user selects an image
- No need to show attribution in the final rendered form (only in the picker UI)

## Rate Limiting Considerations

- Debounce search input (300ms minimum)
- Cache results client-side for the session (avoid re-fetching same queries)
- Show a message if rate limited: "Too many searches, please wait a moment"
- For production: apply for production approval (5000 req/hr) at https://unsplash.com/documentation#registering-your-application

## Files to Create/Modify

| File | Action |
|------|--------|
| `.env.local` | Add `UNSPLASH_ACCESS_KEY` |
| `api/unsplash-search.js` | Create — server-side proxy |
| `src/utils/unsplashSearch.ts` | Create — client-side fetch + types |
| `src/components/creator/HeaderImagePicker.tsx` | Add search tab with Unsplash grid |
| `src/components/creator/BackgroundImagePicker.tsx` | Add search tab with Unsplash grid |
