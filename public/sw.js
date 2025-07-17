const CACHE_NAME = 'footprints-across-ocean-v1';
const STATIC_CACHE_NAME = 'footprints-static-v1';
const DYNAMIC_CACHE_NAME = 'footprints-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Artwork images to cache
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

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Pre-caching artwork images');
        return cache.addAll(ARTWORK_IMAGES);
      })
    ])
  );
  
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
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Firebase and external API calls
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log('Service Worker: Serving from cache:', request.url);
        return cachedResponse;
      }
      
      // Otherwise fetch from network
      return fetch(request).then((response) => {
        // Don't cache if response is not successful
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response as it can only be consumed once
        const responseToCache = response.clone();
        
        // Determine which cache to use
        let cacheName = DYNAMIC_CACHE_NAME;
        
        // Use static cache for HTML, CSS, JS
        if (request.url.includes('.html') || 
            request.url.includes('.css') || 
            request.url.includes('.js') ||
            request.url.endsWith('/')) {
          cacheName = STATIC_CACHE_NAME;
        }
        
        // Cache the response
        caches.open(cacheName).then((cache) => {
          console.log('Service Worker: Caching new resource:', request.url);
          cache.put(request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Network failed, try to serve offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
        
        // For images, return a placeholder
        if (request.destination === 'image') {
          return new Response(
            '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Image unavailable offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});

// Background sync for offline comment submission
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-comments') {
    console.log('Service Worker: Background sync for comments');
    event.waitUntil(syncOfflineComments());
  }
});

// Handle offline comment synchronization
async function syncOfflineComments() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const offlineComments = await cache.match('/offline-comments');
    
    if (offlineComments) {
      const comments = await offlineComments.json();
      
      // Attempt to sync each comment
      for (const comment of comments) {
        try {
          await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(comment)
          });
          console.log('Service Worker: Synced offline comment:', comment.id);
        } catch (error) {
          console.error('Service Worker: Failed to sync comment:', error);
        }
      }
      
      // Clear offline comments after successful sync
      await cache.delete('/offline-comments');
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// Push notifications for real-time updates
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New activity on Footprints Across the Ocean',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'footprints-notification',
    actions: [
      {
        action: 'open',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Footprints Across the Ocean', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ARTWORK') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.add(event.data.url);
      })
    );
  }
});

// Periodic background sync for updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    console.log('Service Worker: Periodic sync - checking for updates');
    
    // Check for new comments or artwork updates
    const response = await fetch('/api/sync-check');
    const updates = await response.json();
    
    if (updates.hasNewComments) {
      // Notify all clients about new comments
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'NEW_COMMENTS',
          count: updates.newCommentCount
        });
      });
    }
  } catch (error) {
    console.error('Service Worker: Periodic sync failed:', error);
  }
}