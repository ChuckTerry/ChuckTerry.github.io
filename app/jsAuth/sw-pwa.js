const CACHE_ID = 'ct-jsauth-predev-0';

cacheContent = [
  'img/badge-48x48.png',
  'img/badge-144x144.png',
  'img/badge-192x192.png',
  'img/badge-512x512.png',
  'js/webapp.js',
  'index.html'
]

self.addEventListener('install', (event) => {
  console.log('[SW-PWA] Install');
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_ID);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(cacheContent);
  })());
});



self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const cachedResponse = await caches.match(event.request);
    console.info(`[SW-PWA] Fetch: ${event.request.url}`);
    if (cachedResponse) { return cachedResponse; }
    const response = await fetch(event.request);
    const cache = await caches.open(CACHE_ID);
    console.info(`[SW-PWA] Cache: ${event.request.url}`);
    cache.put(event.request, response.clone());
    return response;
  })());
});
