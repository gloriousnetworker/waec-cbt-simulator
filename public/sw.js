const CACHE_NAME = 'waec-cbt-v4';

console.log('SW: Script loaded');

self.addEventListener('install', (event) => {
  console.log('SW: Install event started');
  
  // Only cache files that definitely exist
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Attempting to cache files');
        // Only cache the offline page and manifest
        return cache.addAll([
          '/offline',
          '/manifest.json'
        ]).catch(err => {
          console.log('SW: Cache addAll failed:', err);
          // Still continue installation even if caching fails
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('SW: Install completed');
        self.skipWaiting();
      })
      .catch(err => {
        console.log('SW: Install failed:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activate event');
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => {
            console.log('SW: Deleting old cache', key);
            return caches.delete(key);
          })
        );
      }),
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Activated successfully');
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('SW: Serving offline page');
          return caches.match('/offline').then(response => {
            if (!response) {
              console.log('SW: Offline page not found in cache');
              return new Response('Offline - Please check your connection', {
                status: 503,
                headers: new Headers({ 'Content-Type': 'text/plain' })
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // For other requests, just try network, don't cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});