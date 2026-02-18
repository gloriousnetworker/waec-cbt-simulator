const CACHE_NAME = 'waec-cbt-v3';

console.log('SW: Script loaded');

self.addEventListener('install', (event) => {
  console.log('SW: Install event');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching offline page');
        return cache.addAll(['/offline', '/']);
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
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('SW: Serving offline page');
          return caches.match('/offline');
        })
    );
    return;
  }

  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});