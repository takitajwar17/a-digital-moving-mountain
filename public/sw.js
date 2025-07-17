const CACHE_NAME = 'footprints-across-ocean-v1';
const STATIC_CACHE_NAME = 'footprints-static-v1';
const DYNAMIC_CACHE_NAME = 'footprints-dynamic-v1';
const ARTWORK_CACHE_NAME = 'footprints-artwork-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Artwork images to cache with high priority
const ARTWORK_IMAGES = [
  '/images/A Moving Mountain %231.jpg',
  '/images/A Moving Mountain %232.jpg',
  '/images/A Moving Mountain %233.jpg',
  '/images/A Moving Mountain %234.jpg',
  '/images/A Moving Mountain %235.jpg',
  '/images/A Moving Mountain %236.jpg',
  '/images/A Moving Mountain %237.jpg',
  '/images/A Moving Mountain %238.jpg',
  '/images/A Moving Mountain %239.jpg',
  '/images/A Moving Mountain %2310.jpg',
  '/images/A Moving Mountain Dow Jones°Ø first Decade of the 21st Century.jpg'
];

// Install event - cache static assets and artwork images
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache artwork images with high priority
      caches.open(ARTWORK_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Pre-caching artwork images');
        return Promise.all(
          ARTWORK_IMAGES.map(async (imageUrl) => {
            try {
              const response = await fetch(imageUrl);
              if (response.ok) {
                await cache.put(imageUrl, response);
                console.log(`✅ Cached: ${imageUrl}`);
              } else {
                console.warn(`⚠️ Failed to cache: ${imageUrl} (${response.status})`);
              }
            } catch (error) {
              console.warn(`⚠️ Error caching: ${imageUrl}`, error);
            }
          })
        );
      })
    ])
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== ARTWORK_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - serve from cache with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Firebase and external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    (async () => {
      // Strategy 1: Cache First for artwork images (instant loading)
      if (ARTWORK_IMAGES.some(image => request.url.includes(image))) {
        console.log('🖼️ Serving artwork image from cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, fetch and cache
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(ARTWORK_CACHE_NAME);
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          console.error('Failed to fetch artwork image:', error);
          return new Response('Image not available', { status: 404 });
        }
      }
      
      // Strategy 2: Cache First for static assets
      if (STATIC_ASSETS.some(asset => request.url.endsWith(asset))) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          return cachedResponse || new Response('Offline', { status: 503 });
        }
      }
      
      // Strategy 3: Network First for dynamic content
      try {
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.ok && response.status < 400) {
          const cache = await caches.open(DYNAMIC_CACHE_NAME);
          cache.put(request, response.clone());
        }
        
        return response;
      } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Ultimate fallback
        if (request.destination === 'image') {
          return new Response('Image not available', { status: 404 });
        }
        
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});

// Background sync for offline comments (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // TODO: Implement offline comment sync
      console.log('Background sync triggered')
    );
  }
});

// Push notification handler (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'comment-notification',
        renotify: true,
        actions: [
          {
            action: 'view',
            title: 'View Comment',
            icon: '/icon-192x192.png'
          }
        ]
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Cache cleanup - remove old entries periodically
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
        const keys = await dynamicCache.keys();
        
        // Remove entries older than 7 days
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        await Promise.all(
          keys.map(async (request) => {
            const response = await dynamicCache.match(request);
            if (response) {
              const dateHeader = response.headers.get('date');
              if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
                await dynamicCache.delete(request);
              }
            }
          })
        );
        
        console.log('Cache cleanup completed');
      })()
    );
  }
});

console.log('Service Worker: Loaded and ready for artwork caching! 🎨');