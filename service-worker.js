const CACHE_NAME = 'eventx-escape-room-v2';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './install-prompt.js',
    './icons/icon-192x192.svg',
    './icons/icon-512x512.svg'
];

// Установка Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Skip waiting');
                return self.skipWaiting();
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Claiming clients');
            return self.clients.claim();
        })
    );
});

// Обработка запросов (Cache First стратегия)
self.addEventListener('fetch', event => {
    // Пропускаем non-GET запросы
    if (event.request.method !== 'GET') {
        return;
    }

    // Пропускаем внешние домены
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Возвращаем из кэша если есть
                if (response) {
                    console.log('[SW] Found in cache:', event.request.url);
                    return response;
                }

                // Иначе загружаем из сети и кэшируем
                console.log('[SW] Fetching:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Проверяем что ответ валидный
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Клонируем ответ так как он может быть использован только один раз
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                console.log('[SW] Caching new resource:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.log('[SW] Fetch failed:', error);

                        // Возвращаем fallback для HTML страниц
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('./index.html');
                        }

                        throw error;
                    });
            })
    );
});

// Обработка push уведомлений
self.addEventListener('push', event => {
    console.log('[SW] Push received');

    const options = {
        body: 'Your EventX booking confirmation!',
        icon: './icons/icon-192x192.svg',
        badge: './icons/icon-72x72.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View booking',
                icon: './icons/icon-192x192.svg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './icons/icon-192x192.svg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('EventX Escape Room', options)
    );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification click received.');

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync для offline бронирований
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('[SW] Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('[SW] Performing background sync...');
    // Здесь можно добавить логику для отправки offline бронирований
    // когда появится интернет-соединение
}

// Обработка ошибок
self.addEventListener('error', event => {
    console.error('[SW] Error:', event.error);
});

console.log('[SW] Service Worker loaded');