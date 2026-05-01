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

  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Skip API calls entirely — always go to network
  if (url.href.includes('/api/') ||
      url.href.includes('supabase.co') ||
      url.href.includes('onrender.com')) {
    return;
  }

  // For app navigation routes — always serve index.html from network/cache
  // This handles /dashboard, /settings, /database etc.
  if (url.origin === self.location.origin && !url.pathname.includes('.')) {
    e.respondWith(
      fetch('/index.html').catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For static assets — cache first, network fallback
  // For static assets — cache first, network fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        
        // ADDED FIX: Only cache successful responses that are HTTP/HTTPS!
        // This stops it from trying to cache 'chrome-extension://' URLs
        if (response.ok && e.request.url.startsWith('http')) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});