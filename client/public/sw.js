// Minimal service worker, exists only to satisfy Chrome's installability
// check (a registered SW with a fetch handler) for the "Add to Home Screen"
// prompt. No caching/offline behavior is implemented.
self.addEventListener('fetch', () => {});
