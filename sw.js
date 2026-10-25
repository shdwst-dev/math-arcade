const CACHE_NAME = 'math-arcade-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './js/config.js',
    './js/app.js',
    './js/storage.js',
    './js/cloud.js',
    './js/data/subtemas.js',
    './js/data/fundamentos.js',
    './js/data/diferencial.js',
    './js/data/integral.js',
    './js/games/memory.js',
    './js/games/bomb.js',
    './js/games/race.js',
    'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto:wght@400;700&display=swap'
];

// Instalación del Service Worker: cachear archivos locales
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activación: eliminar caches antiguos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar peticiones (estrategia Cache First)
self.addEventListener('fetch', (event) => {
    // Las llamadas a la API de Supabase (auth, base de datos) siempre van a la red
    if (event.request.method !== 'GET' || event.request.url.includes('.supabase.co')) {
        return;
    }

    // Si es una petición a MathJax, Tailwind o el SDK de Supabase, intentamos la red y luego cache
    if (event.request.url.includes('cdn.tailwindcss.com') || event.request.url.includes('mathjax') || event.request.url.includes('supabase-js')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                    return networkResponse;
                }).catch(() => cachedResponse);
                
                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // Para archivos locales, Cache First
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(
                function(response) {
                    if(!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    var responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                }
            );
        })
    );
});
