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
const CACHE_VERSION = 'grounded-v188';
/* Resolve shell URLs from this script’s folder so the app works in a subpath. */
const SW_DIR = new URL('./', self.location.href);
function shellUrl(path) {
  return new URL(path, SW_DIR).href;
}
const INDEX_HTML = shellUrl('index.html');
const APP_SHELL = [
  SW_DIR.href,
  INDEX_HTML,
  shellUrl('widget.html'),
  shellUrl('bibleData.js'),
  shellUrl('js/store.js'),
  shellUrl('js/app-themes.js'),
  shellUrl('js/onboarding.js'),
  shellUrl('js/grounded-home-weekly-themes-data.js'),
  shellUrl('js/grounded-home-weekly-theme-meta.js'),
  shellUrl('js/study-data.js'),
  shellUrl('js/study-app.js'),
  shellUrl('css/onboarding.css'),
  shellUrl('manifest.json'),
  shellUrl('icon-192.png'),
  shellUrl('icon-512.png'),
  shellUrl('assets/cross-floral.png'),
  shellUrl('assets/images/prayer-bg.png'),
  shellUrl('assets/images/prayer-hero.png'),
  shellUrl('assets/images/word.jpg'),
  shellUrl('assets/images/reflect.jpg'),
  shellUrl('assets/images/study-hero.png'),
  shellUrl('assets/images/today-banner.jpg'),
  shellUrl('assets/images/reset-hero.png')
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

function isSpaLegalPath(pathname) {
  const p = (pathname || '/').replace(/\/$/, '') || '/';
  return p === '/privacy' || p === '/terms' || p === '/contact';
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* Never cache or short-circuit serverless AI routes — always hit the network. */
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(req));
    return;
  }
  if (req.method !== 'GET') return;

  /* HTML (navigations + explicit *.html fetches): network-first so updated
     index.html is never stuck behind a stale cache-first hit. Offline falls
     back to the precached shell. */
  const accept = req.headers.get('accept') || '';
  const looksLikeHtml =
    req.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    (accept.includes('text/html') && !accept.includes('application/json'));
  if (looksLikeHtml) {
    const isLegalNav = req.mode === 'navigate' && isSpaLegalPath(url.pathname);
    event.respondWith(
      fetch(req)
        .then((res) => {
          /* Some hosts return 404 for /privacy etc. even though the app is a SPA.
             Fall back to index.html so client routing + legal shell can run. */
          if (isLegalNav && res && !res.ok) {
            return fetch(INDEX_HTML, { credentials: 'same-origin' }).then((shellRes) => {
              if (shellRes && shellRes.ok) return shellRes;
              return caches.match(INDEX_HTML).then((c) => c || res);
            });
          }
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((c) => c || caches.match(INDEX_HTML))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => {
        const p = url.pathname || '';
        if (/\.(png|jpe?g|webp|gif|ico|svg|woff2?|mp3|m4a|ogg)$/i.test(p)) {
          return new Response('', { status: 503, statusText: 'Offline' });
        }
        return caches.match(INDEX_HTML);
      });
    })
  );
});
