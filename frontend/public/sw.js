const CACHE_NAME = 'blog-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/offline.html' // Create a simple fallback page
];

// Install Event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Fetch Event: Intercept network requests
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version immediately if found
      const networkFetch = fetch(event.request).then((networkResponse) => {
        // Update the cache with the fresh version for next time
        if (networkResponse.ok) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback if network fails and nothing in cache
        return caches.match('/offline.html');
      });

      return cachedResponse || networkFetch;
    })
  );
});