const CACHE_NAME = 'eventx-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
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

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
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