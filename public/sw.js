const VERSION = 'v3'; // Incrementa esto en cada despliegue mayor
const CACHE_NAME = `rdm-site-${VERSION}`;

// Rutas que SIEMPRE deben intentar ir a red primero
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza la instalación inmediata
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', (event) => {
  // Borra cachés antiguas de versiones anteriores (v1, v2...)
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. ESTRATEGIA PARA API: Network Only (o Network First)
  // Nunca cacheamos peticiones /api/ para evitar servir datos obsoletos post-despliegue
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(JSON.stringify({ error: "Offline" }), { status: 503 }))
    );
    return;
  }

  // 2. ESTRATEGIA PARA NAVEGACIÓN: Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. ESTRATEGIA PARA ASSETS (CSS, JS, IMÁGENES): Cache First, revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
