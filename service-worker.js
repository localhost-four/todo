const CACHE_NAME = 'my-site-cache-v2';
const urlsToCache = [
  '/TODO/index.html',
  '/TODO/index.html',
  '/TODO/styles.css',
  '/TODO/script.js',
  '/TODO/1img.gif'
];

// Устанавливаем сервис-воркер и кэшируем необходимые файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэширование файлов');
        return cache.addAll(urlsToCache);
      })
  );
});

// Обрабатываем запросы на кэшированные файлы
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Возвращаем кэшированный ответ, если он есть, иначе - с сервера
      return cachedResponse || fetch(event.request);
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

navigator.serviceWorker.register('service-worker.js')
