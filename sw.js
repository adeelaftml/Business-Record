const CACHE = 'ticket-ledger-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // simple offline-first strategy for same-origin
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // cache html & same-origin GETs
        if (event.request.url.startsWith(self.location.origin)) {
          const respClone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, respClone));
        }
        return response;
      }).catch(()=> caches.match('/index.html'));
    })
  );
});
