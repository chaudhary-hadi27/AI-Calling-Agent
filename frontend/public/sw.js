/**
 * ✅ Service Worker for Offline Support
 * Caches static assets and API responses for offline functionality
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `smartkode-ai-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/login',
  '/register',
  '/offline',
  '/_next/static/css/',
  '/_next/static/chunks/',
];

// API responses to cache (GET only)
const CACHEABLE_APIS = [
  '/api/auth/me',
  '/api/calls',
  '/api/agents',
];

// Cache duration for different types
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
  api: 5 * 60 * 1000, // 5 minutes
  images: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Service worker installed');
      return self.skipWaiting();
    })
  );
});

/**
 * Activate Event - Clean old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch Event - Network-first with cache fallback
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different resource types
  if (shouldCacheAPI(url)) {
    event.respondWith(networkFirstWithCache(request));
  } else if (shouldCacheStatic(url)) {
    event.respondWith(cacheFirstWithNetwork(request));
  } else {
    event.respondWith(networkOnly(request));
  }
});

/**
 * Check if URL should be cached (API)
 */
function shouldCacheAPI(url) {
  return CACHEABLE_APIS.some(api => url.pathname.startsWith(api));
}

/**
 * Check if URL should be cached (Static)
 */
function shouldCacheStatic(url) {
  return (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  );
}

/**
 * Strategy 1: Network-first with cache fallback (for API)
 */
async function networkFirstWithCache(request) {
  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed, using cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // No cache, return offline page
    return caches.match('/offline');
  }
}

/**
 * Strategy 2: Cache-first with network fallback (for static assets)
 */
async function cacheFirstWithNetwork(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Return cached version
      // Update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response);
          });
        }
      }).catch(() => {});

      return cachedResponse;
    }

    // Not in cache, fetch from network
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Cache and network failed:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Strategy 3: Network-only (no cache)
 */
async function networkOnly(request) {
  return fetch(request);
}

/**
 * Message handler for cache control
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded');