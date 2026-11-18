const CACHE_NAME = 'najwa-planner-cache-v2';

// File inti yang wajib disimpan di memori HP lu.
// v1.1.0: URL flaticon yang tidak pernah dipakai aplikasi dihapus dari daftar —
// cache.addAll() gagal total bila SATU saja URL di daftar ini gagal di-fetch,
// jadi entri mati itu bisa menggagalkan seluruh instalasi service worker.
// Tailwind di-vendor lokal (./tailwind.js): fetch() ke cdn.tailwindcss.com
// gagal di sebagian jaringan/proxy, sehingga SW tidak bisa meng-install.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './logo.svg',
  './tailwind.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Install Service Worker & Cache File
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Bersihkan Cache lama kalau ada update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept Request: Kalau offline, ambil dari Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Balikin file dari cache kalau ada, kalau nggak ada baru request ke internet
        return response || fetch(event.request).catch(() => {
            // Kalau offline dan file nggak ada di cache, biarin aja fail gracefully
            console.log("Offline mode: Resource not found in cache.");
        });
      })
  );
});
