const CACHE = 'vaulta-v1';

// Only cache actual static files, NOT app routes
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/pawn-ticket.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // Use individual try-catch so one failure doesn't break everything
      return Promise.allSettled(
        STATIC_FILES.map(url => c.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (e.request.method !== 'GET') return;

  // Skip API calls
  if (url.href.includes('/api/') ||
      url.href.includes('supabase.co') ||
      url.href.includes('onrender.com')) {
    return;
  }

  // Handle navigation routes
  if (url.origin === self.location.origin && !url.pathname.includes('.')) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // If response is a redirect, don't cache it
          if (response.redirected) {
            return response;
          }
          // Clone and cache only non-redirect responses
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets — cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        if (response.ok && e.request.url.startsWith('http')) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});   