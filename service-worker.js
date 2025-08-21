
const CACHE_NAME = 'eventx-escape-room-v1.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  // Кэшируем основные ресурсы для offline работы
];

// Установка Service Worker
self.addEventListener('install', function(event) {
  console.log('EventX PWA: Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('EventX PWA: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        // Принудительно активируем новый SW
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', function(event) {
  console.log('EventX PWA: Service Worker activating');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('EventX PWA: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // Принудительно берем контроль над всеми клиентами
      return self.clients.claim();
    })
  );
});

// Перехват запросов (стратегия Cache First для статических ресурсов)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Возвращаем кэшированную версию если есть
        if (response) {
          return response;
        }

        // Клонируем запрос для безопасности
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(function(response) {
          // Проверяем валидность ответа
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Клонируем ответ для кэша
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function() {
          // Возвращаем offline страницу если доступно
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Обработка сообщений от основного приложения
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Уведомления (если понадобятся в будущем)
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
        url: data.url || '/'
      },
      actions: [
        {
          action: 'explore', 
          title: 'Öppna EventX',
          icon: '/icons/icon-96x96.svg'
        },
        {
          action: 'close', 
          title: 'Stäng'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
