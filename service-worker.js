//service-worker.js
const CACHE_NAME = 'my-site-cache-v2';
const urlsToCache = [
  'index.html',
  'styles.css',
  'script.js',
  'notifications.js',
  '1img.gif', 
  '/todo/index.html',
  '/todo/index.html',
  '/todo/styles.css',
  '/todo/script.js',
  '/todo/1img.gif',
  '/todo/notifications.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
      caches.open(CACHE_NAME)
          .then((cache) => {
              console.log('File Caching');
              return Promise.all(urlsToCache.map(url => {
                  return fetch(url).then(response => {
                      if (!response.ok) {
                          throw new Error(`Network response was not ok for ${url} (status: ${response.status})`);
                      }
                      return cache.put(url, response);
                  }).catch(error => {
                      console.error(`Failed to fetch ${url}:`, error);
                  });
              }));
          })
          .catch(error => {
              console.error('Error caching:', error);
          })
  );
});

// Обновляем кэш, если он изменился
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Удаляем старые кэши
          }
        })
      );
    })
  );
});

// Извлекаем данные из события push
self.addEventListener('push', function(event) {
  const data = event.data.json(); 

  const title = data.title || 'Notification';
  const options = {
      body: data.body || 'New notice from TODO',
      icon: '/todo/1img.gif', // Укажите путь к иконке уведомления
      badge: '/todo/1img.gif' // Укажите путь к значку уведомления (необязательно)
  };

  event.waitUntil(
      self.registration.showNotification(title, options)
  );
});

// Обработка кликов по уведомлению
self.addEventListener('notificationclick', event => {
    event.notification.close(); // Закрываем уведомление

    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clients => {
        // Проверяем, есть ли уже открытое окно приложения
        const client = clients.find(c => c.url === '/todo/index.html' && 'focus' in c);
        if (client) {
            return client.focus(); // Если есть, фокусируемся на нем
        } else {
            return clients.openWindow('/todo/index.html'); // Иначе открываем новое окно
        }
      })
    );

});

// Регистрация сервис-воркера
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
      .then((registration) => {
          console.log('Service Worker open:', registration.scope);
      })
      .catch((error) => {
          console.error('Error Service Worker:', error);
      });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(function(error) {
          console.error('Service Worker registration failed:', error);
      });
}

// Обрабатываем запросы на кэшированные файлы
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Возвращаем кэшированный ответ, если он есть, иначе - с сервера
      return cachedResponse || fetch(event.request);
    })
  );
});