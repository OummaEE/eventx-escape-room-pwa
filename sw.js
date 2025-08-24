const CACHE_NAME = 'eventx-v3.0.1';
const urlsToCache = [
  '/app.js',
  '/manifest.json',
  '/components/',
  '/utils/',
  '/screens/',
  'https://resource.trickle.so/vendor_lib/unpkg/react@18/umd/react.production.min.js',
  'https://resource.trickle.so/vendor_lib/unpkg/react-dom@18/umd/react-dom.production.min.js',
  'https://cdn.tailwindcss.com',
  'https://resource.trickle.so/vendor_lib/unpkg/lucide-static@0.516.0/font/lucide.css'
];

// Install event - cache resources and skip waiting
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker installed, skipping waiting...');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Delete ALL old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Clear all existing cache entries for current cache
      caches.open(CACHE_NAME).then((cache) => {
        return cache.keys().then((requests) => {
          return Promise.all(
            requests.map((request) => {
              console.log('Clearing cache entry:', request.url);
              return cache.delete(request);
            })
          );
        });
      })
    ]).then(() => {
      console.log('Service Worker activated, claiming clients...');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - always network first for all requests
self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  
  // Force bypass HTTP cache for navigations
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'reload' })
        .then((resp) => resp)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  // Always try network first, fallback to cache only if network fails
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        console.log('Network response for:', event.request.url);
        // If network request succeeds, update cache and return response
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch((error) => {
        console.log('Network failed for:', event.request.url, 'trying cache...');
        // If network fails, try to serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Serving from cache:', event.request.url);
            return cachedResponse;
          }
          // If not in cache either, return a basic error response
          return new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'У вас новое уведомление от EventX',
    icon: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=96&h=96&fit=crop&crop=center',
    badge: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=96&h=96&fit=crop&crop=center',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть приложение',
        icon: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=96&h=96&fit=crop&crop=center'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=96&h=96&fit=crop&crop=center'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('EventX', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});