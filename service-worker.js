const CACHE_NAME = 'gbzin-group-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/index.css',
    '/assets/js/index.js',
    '/pages/servicos/index.html',
    '/pages/store/index.html',
    '/pages/ferramentas/discord/index.html',
    '/pages/ferramentas/toshirobot/index.html',
    '/pages/conteudo/wiki/index.html',
    '/pages/suporte/contato/index.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});