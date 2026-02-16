# Specification

## Summary
**Goal:** Complete PWA enablement so the app is installable and works offline, while preserving all existing functionality.

**Planned changes:**
- Update the Vite build so it compiles `frontend/public/service-worker.ts` into JavaScript and outputs it at exactly `/service-worker.js` to match the existing registration in `frontend/src/App.tsx`.
- Add/update `vite.config.*` to support bundling the service worker and required PWA asset handling, without changing existing React runtime behavior or immutable hook/component files.
- Fix `frontend/public/manifest.json` icon entries by adding proper PNG icons at required sizes (at least 192x192 and 512x512) and referencing them with correct `sizes` values, while keeping the existing 32x32 favicon working.
- Ensure offline behavior is coherent by precaching the app shell (at minimum `/`, `/index.html`, and `manifest.json`), providing a navigation fallback when offline, and keeping canister/API calls network-only; include cache versioning/cleanup on activate.

**User-visible outcome:** The app can be installed as a PWA, the service worker registers successfully in production, and the app loads an offline app shell/fallback when the network is unavailable (without caching API/canister requests).
