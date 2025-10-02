const CACHE_NAME = 'jengabiz-v3';
const CACHE_VERSION = 'v3';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/jenga-biz-logo.png'
];

// List of API endpoints that should not be cached
const API_ENDPOINTS = [
  '/api/',
  'supabase.co',
  'stripe.com',
  'jengabiz.africa/api'
];

// List of file types to cache
const CACHEABLE_TYPES = [
  'image', 'script', 'style', 'document', 'font'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => 
        key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()
      ))
    ).then(() => self.clients.claim())
  );
});

// Listen for messages from clients (like the skip waiting message)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip API requests and external resources
  const isApiRequest = API_ENDPOINTS.some(api => url.href.includes(api));
  const isExternal = url.origin !== location.origin;
  
  // Only cache same-origin resources and specific file types
  if (isApiRequest || isExternal) {
    event.respondWith(networkOnly(request));
    return;
  }

  // For static assets and pages, use cache-first strategy
  if (url.pathname.startsWith('/assets/') || CORE_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else {
    // For other same-origin requests, use network-first strategy
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      // Only cache responses with cacheable content types
      const contentType = networkResponse.headers.get('content-type') || '';
      const shouldCache = CACHEABLE_TYPES.some(type => contentType.includes(type));
      
      if (shouldCache) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first fetch failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses for same-origin requests
    if (networkResponse && networkResponse.ok && request.url.startsWith(location.origin)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network first fetch failed, trying cache:', error);
    
    // Only try cache for same-origin requests
    if (request.url.startsWith(location.origin)) {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // If we get here, both network and cache failed
    return new Response('Network error and no cache available', { 
      status: 408, 
      statusText: 'Network Error' 
    });
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Network only fetch failed:', error);
    return new Response('Network error', { 
      status: 408,
      statusText: 'Network Error'
    });
  }
}
