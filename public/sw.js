// Service Worker with timestamp to force update
const CACHE_NAME = 'sw-cache-' + Date.now();

console.log('Service Worker script loaded at:', new Date().toISOString());

self.addEventListener('install', (event) => {
    console.log('✅ SW Install event at:', new Date().toISOString());
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ SW Activate event at:', new Date().toISOString());
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Just pass through
    event.respondWith(fetch(event.request));
});