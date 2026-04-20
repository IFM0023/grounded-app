/* Grounded — Service Worker
 *
 * Strategy:
 *  - On install: pre-cache the app shell (HTML, JS, icons, asset).
 *  - On fetch: try cache first for same-origin GETs (instant repeat loads),
 *    fall back to network. Network responses for new same-origin assets are
 *    added to the cache opportunistically.
 *  - On activate: nuke any old cache versions so deploys roll out cleanly.
 *
 * Bump CACHE_VERSION whenever you ship changes you want users to pick up
 * immediately. Old caches will be deleted on the next page load.
 */
const CACHE_VERSION = 'grounded-v10';
const APP_SHELL = [
  '/',
  '/index.html',
  '/bibleData.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/assets/cross-floral.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => {
        if (req.mode === 'navigate') return caches.match('/index.html');
      });
    })
  );
});
